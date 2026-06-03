import { Router }  from 'express';
import multer       from 'multer';
import mammoth      from 'mammoth';
import Groq         from 'groq-sdk';
import Anthropic    from '@anthropic-ai/sdk';
import {
  queryDocuments,
  addVectraChunk,
  searchVectra,
  getAllVectraItems,
} from '../services/vectorStore.js';

const { extractText } = await import('unpdf');

const router    = Router();
const upload    = multer({ storage: multer.memoryStorage() });
const groq      = new Groq({ apiKey: process.env.GROQ_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Chunking ──────────────────────────────────────────────────────────────────
function chunkText(text, size = 800, overlap = 100) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size - overlap;
  }
  return chunks.filter(c => c.trim().length > 0);
}

// ── Duplicate checker ─────────────────────────────────────────────────────────
async function checkDuplicate(chunks) {
  const all = await getAllVectraItems();
  if (!all.length) return { status: 'NEW', maxSimilarity: 0, matchedSource: null };

  const samples = [
    chunks[0],
    chunks[Math.floor(chunks.length / 2)],
    chunks[chunks.length - 1],
  ].filter(Boolean);

  let maxSim = 0, matchedSource = null;
  for (const sample of samples) {
    const results = await searchVectra(sample, 1);
    if (results.length && results[0].score > maxSim) {
      maxSim = results[0].score;
      matchedSource = results[0].source;
    }
  }

  const status = maxSim >= 0.92 ? 'DUPLICATE' : maxSim >= 0.60 ? 'PARTIAL_MATCH' : 'NEW';
  return { status, maxSimilarity: maxSim, matchedSource };
}

// ── Ingestor ──────────────────────────────────────────────────────────────────
async function ingestDocument(plainText, filename, force = false) {
  const chunks = chunkText(plainText);
  const dup    = await checkDuplicate(chunks);

  if (!force && (dup.status === 'DUPLICATE' || dup.status === 'PARTIAL_MATCH')) {
    return { ...dup, chunksIndexed: 0 };
  }

  for (let i = 0; i < chunks.length; i++) {
    await addVectraChunk(chunks[i], filename, i);
  }
  return { status: 'INDEXED', chunksIndexed: chunks.length, maxSimilarity: dup.maxSimilarity, matchedSource: dup.matchedSource };
}

// ── Hybrid search (BM25 + Vectra via RRF) ────────────────────────────────────
async function hybridSearch(query, bm25SearchFn, topK = 5) {
  const RRF_K = 60;
  const fetchK = topK * 3;

  const [bm25Results, vectraResults] = await Promise.all([
    Promise.resolve(bm25SearchFn(query, fetchK)),
    searchVectra(query, fetchK),
  ]);

  const acc = {}, store = {};
  const addRank = (list) => list.forEach((r, rank) => {
    const key = `${r.source}::${r.text.slice(0, 50)}`;
    acc[key]   = (acc[key] || 0) + 1 / (RRF_K + rank + 1);
    store[key] = store[key] || r;
  });

  addRank(bm25Results);
  addRank(vectraResults);

  return Object.entries(acc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([key]) => store[key]);
}

// ── RAG query (Groq → fallback Anthropic) ────────────────────────────────────
async function ragQuery(question, bm25SearchFn) {
  const hits    = await hybridSearch(question, bm25SearchFn);
  const context = hits.map((h, i) => `[${i + 1}] (${h.source})\n${h.text}`).join('\n\n');
  const sources = [...new Set(hits.map(h => h.source).filter(Boolean))];

  const systemPrompt = 'Eres un asistente técnico. Responde SOLO con la información del contexto. Si no encuentras la respuesta, indícalo claramente. Responde en español.';
  const userPrompt   = `Contexto:\n${context}\n\nPregunta: ${question}`;

  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.2, max_tokens: 1024,
    });
    return { answer: res.choices[0].message.content.trim(), sources };
  } catch (err) {
    console.warn('Groq falló, usando Anthropic:', err.message);
  }

  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-6', max_tokens: 1024, system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });
  return { answer: res.content[0].text.trim(), sources };
}

// ── POST /api/upload-manual ──────────────────────────────────────────────────
router.post('/upload-manual', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo.' });

    const { originalname, buffer, mimetype } = req.file;
    const force = req.body?.force === 'true' || req.body?.force === true;

    // ── Text extraction ────────────────────────────────────────────────────
    let plainText = '';
    const ext = originalname.split('.').pop().toLowerCase();

    if (ext === 'pdf' || mimetype === 'application/pdf') {
      // unpdf expects a Uint8Array
      const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
      plainText = text;
    } else if (ext === 'docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      plainText = result.value;
    } else {
      return res.status(400).json({ error: `Formato no soportado: .${ext}. Usa PDF o DOCX.` });
    }

    if (!plainText.trim()) {
      return res.status(422).json({ error: 'No se pudo extraer texto del documento.' });
    }

    // ── Ingest ────────────────────────────────────────────────────────────
    const result = await ingestDocument(plainText, originalname, force);

    const httpStatus = result.status === 'DUPLICATE' ? 409
                     : result.status === 'PARTIAL_MATCH' ? 200
                     : 201;

    return res.status(httpStatus).json({
      status:        result.status,          // INDEXED | DUPLICATE | PARTIAL_MATCH
      chunksIndexed: result.chunksIndexed,
      maxSimilarity: result.maxSimilarity,
      matchedSource: result.matchedSource,
      filename:      originalname,
    });
  } catch (err) {
    console.error('Error en /upload-manual:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /api/rag/status (montado bajo /api, queda en /api/rag/status) ────────
router.get('/rag/status', async (req, res) => {
  try {
    const items = await getAllVectraItems();
    return res.json({ status: 'ok', chunks: items.length, model: 'Xenova/all-MiniLM-L6-v2' });
  } catch (err) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
});

// ── POST /api/rag/ingest-folder ──────────────────────────────────────────────
router.post('/rag/ingest-folder', async (req, res) => {
  try {
    const { folder = 'manuales' } = req.body ?? {};
    const fs   = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const __dirname   = path.dirname(fileURLToPath(import.meta.url));
    const folderPath  = path.resolve(__dirname, '../../knowledge', folder);

    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: `Carpeta no encontrada: ${folderPath}` });
    }

    const files = fs.readdirSync(folderPath).filter(f => /\.(pdf|docx)$/i.test(f));
    if (!files.length) {
      return res.status(200).json({ message: 'No se encontraron archivos PDF o DOCX.', results: [] });
    }

    const results = [];
    for (const file of files) {
      try {
        const buffer   = fs.readFileSync(path.join(folderPath, file));
        const ext      = file.split('.').pop().toLowerCase();
        let plainText  = '';

        if (ext === 'pdf') {
          const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
          plainText = text;
        } else if (ext === 'docx') {
          plainText = (await mammoth.extractRawText({ buffer })).value;
        }

        if (!plainText.trim()) {
          results.push({ file, status: 'SKIPPED', reason: 'Sin texto extraíble' });
          continue;
        }

        const result = await ingestDocument(plainText, file, false);
        results.push({ file, ...result });
      } catch (err) {
        results.push({ file, status: 'ERROR', reason: err.message });
      }
    }

    return res.json({ folder, total: files.length, results });
  } catch (err) {
    console.error('Error en /rag/ingest-folder:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/consulta-manual ────────────────────────────────────────────────
router.post('/consulta-manual', async (req, res) => {
  try {
    const { pregunta } = req.body ?? {};
    if (!pregunta?.trim()) {
      return res.status(400).json({ error: 'El campo "pregunta" es requerido.' });
    }

    // Pass the BM25 search function as a parameter (no coupling with internals)
    const bm25SearchFn = (query, k) => queryDocuments(query, k, 'manuales');

    const { answer, sources } = await ragQuery(pregunta, bm25SearchFn);

    return res.json({ respuesta: answer, fuentes: sources });
  } catch (err) {
    console.error('Error en /consulta-manual:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
