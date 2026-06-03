import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ragRouter from "./routes/rag.js";
import manualsRouter from "./routes/manuals.js";
import { tokenize } from "./utils/normalize.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/rag", ragRouter);
app.use("/api", manualsRouter);

const KNOWLEDGE_FILE_PATH = path.resolve(
  __dirname,
  "../knowledge/BancoDePreguntasPortalYPedidos.txt",
);

// ── Parseo de base.txt ──────────────────────────────────────────────────────
// Extrae bloques { question, answer } de pares PROBLEMA/SOLUCIÓN y PREGUNTA/RESPUESTA
function parseKnowledgeBase(text) {
  const blocks = [];
  const lines = text.split("\n");
  let question = null;
  let answerLines = [];
  let collecting = false;

  const flush = () => {
    if (question && answerLines.length) {
      blocks.push({ question, answer: answerLines.join("\n").trim() });
    }
    question = null;
    answerLines = [];
    collecting = false;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("PROBLEMA:") || line.startsWith("PREGUNTA:")) {
      flush();
      question = line.replace(/^(PROBLEMA|PREGUNTA):\s*/, "");
      collecting = false;
    } else if (line.startsWith("SOLUCIÓN:") || line.startsWith("RESPUESTA:")) {
      const inline = line.replace(/^(SOLUCIÓN|RESPUESTA):\s*/, "");
      if (inline) answerLines.push(inline);
      collecting = true;
    } else if (collecting) {
      if (line === "" && answerLines.length) {
        // blank line ends the block
        flush();
      } else if (line && !line.startsWith("===") && !line.startsWith("#")) {
        answerLines.push(line);
      }
    }
  }
  flush();
  return blocks;
}

// ── Búsqueda por score de palabras compartidas ──────────────────────────────
// Usa wordSet pre-computado en la caché para lookups O(1) en lugar de O(n)
function findBestMatch(query, blocks) {
  const queryWords = new Set(tokenize(query));
  if (!queryWords.size) return null;

  let best = null;
  let bestScore = 0;

  for (const block of blocks) {
    let matches = 0;
    for (const w of queryWords) {
      if (block.wordSet.has(w)) matches++;
    }
    const score = matches / queryWords.size;
    if (score > bestScore) {
      bestScore = score;
      best = { question: block.question, answer: block.answer, score };
    }
  }
  return bestScore >= 0.3 ? best : null;
}

// ── Formateo de respuestas con JSON ─────────────────────────────────────────
function formatResponseWithJson(text) {
  // Detectar bloques que parecen JSON (objetos o arrays)
  const jsonRegex = /(\{[\s\S]*?\}|\[[\s\S]*?\])/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = jsonRegex.exec(text)) !== null) {
    // Agregar texto antes del JSON
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }

    // Intentar parsear como JSON válido
    try {
      const parsed = JSON.parse(match[0]);
      parts.push({ type: "json", content: JSON.stringify(parsed, null, 2) });
    } catch {
      // No es JSON válido, tratarlo como texto
      parts.push({ type: "text", content: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Agregar texto restante
  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text }];
}

// ── Caché de base de conocimiento (evita leer disco en cada request) ─────────
let _knowledgeCache = null;
let _knowledgeCacheTime = 0;
const KNOWLEDGE_CACHE_TTL = 60_000; // 1 minuto

function loadKnowledge() {
  const now = Date.now();
  if (_knowledgeCache && now - _knowledgeCacheTime < KNOWLEDGE_CACHE_TTL) {
    return _knowledgeCache;
  }
  try {
    if (!fs.existsSync(KNOWLEDGE_FILE_PATH)) {
      console.warn(`⚠️  Archivo no encontrado: ${KNOWLEDGE_FILE_PATH}`);
      return null;
    }
    const text = fs.readFileSync(KNOWLEDGE_FILE_PATH, "utf-8");
    const blocks = parseKnowledgeBase(text);
    // Pre-normalizar bloques una sola vez; findBestMatch usa Set para lookups O(1)
    const normalizedBlocks = blocks.map((b) => ({
      question: b.question,
      answer: b.answer,
      wordSet: new Set(tokenize(b.question + " " + b.answer)),
    }));
    console.log(
      `✅ Base de conocimiento cargada (${text.length} caracteres, ${blocks.length} entradas)`,
    );
    _knowledgeCache = { text, blocks: normalizedBlocks };
    _knowledgeCacheTime = now;
    return _knowledgeCache;
  } catch (err) {
    console.error("Error leyendo base de conocimiento:", err.message);
    return null;
  }
}

// ── Endpoints ───────────────────────────────────────────────────────────────
app.get("/api/knowledge-status", (req, res) => {
  try {
    const exists = fs.existsSync(KNOWLEDGE_FILE_PATH);
    if (!exists) return res.json({ exists: false, path: KNOWLEDGE_FILE_PATH });
    const stats = fs.statSync(KNOWLEDGE_FILE_PATH);
    const content = fs.readFileSync(KNOWLEDGE_FILE_PATH, "utf-8");
    const lines = content.split("\n").filter((l) => l.trim()).length;
    res.json({
      exists: true,
      path: KNOWLEDGE_FILE_PATH,
      sizeKB: (stats.size / 1024).toFixed(1),
      lines,
      lastModified: stats.mtime,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/chat", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Mensaje requerido" });

  const knowledge = loadKnowledge();

  if (!knowledge) {
    return res.json({
      reply:
        "Lo siento, la base de conocimiento no está disponible en este momento. Por favor contacta al equipo de soporte.",
      replyParts: [
        {
          type: "text",
          content:
            "Lo siento, la base de conocimiento no está disponible en este momento. Por favor contacta al equipo de soporte.",
        },
      ],
      knowledgeLoaded: false,
    });
  }

  const match = findBestMatch(message, knowledge.blocks);

  const reply = match
    ? match.answer
    : "No encontré información específica sobre tu consulta en la base de conocimiento. Te recomiendo contactar al equipo de soporte técnico de Yamaha para obtener ayuda personalizada.";

  const replyParts = formatResponseWithJson(reply);

  res.json({ reply, replyParts, knowledgeLoaded: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(
    `\n🚀 Servidor Yamaha Chatbot corriendo en http://localhost:${PORT}`,
  );
  // Auto-indexar el banco de preguntas en la colección 'soporte' si está vacío
  await ingestSoporteTxt();
});

// ── Auto-ingestión del banco de preguntas de soporte ─────────────────────────
async function ingestSoporteTxt() {
  const { addDocuments, getStats } = await import("./services/vectorStore.js");
  const stats = await getStats("soporte");
  if (stats.chunks > 0) return; // ya indexado

  if (!fs.existsSync(KNOWLEDGE_FILE_PATH)) return;

  const text = fs.readFileSync(KNOWLEDGE_FILE_PATH, "utf-8");
  const chunks = parseSoporteTxt(text);
  if (!chunks.length) return;

  await addDocuments(chunks, "soporte");
  console.log(`✅ Banco de preguntas indexado en colección 'soporte' (${chunks.length} fragmentos)`);
}

// Convierte el archivo Q&A a chunks: cada par PROBLEMA/SOLUCIÓN o PREGUNTA/RESPUESTA es un chunk
function parseSoporteTxt(text) {
  const chunks = [];
  const lines = text.split("\n");
  let question = null;
  let answerLines = [];
  let chunkIndex = 0;

  const flush = () => {
    if (question && answerLines.length) {
      const chunkText = `${question}\n${answerLines.join("\n").trim()}`;
      chunks.push({ text: chunkText, source: "BancoDePreguntasPortalYPedidos.txt", chunkIndex: chunkIndex++ });
    }
    question = null;
    answerLines = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("PROBLEMA:") || line.startsWith("PREGUNTA:")) {
      flush();
      question = line;
    } else if (line.startsWith("SOLUCIÓN:") || line.startsWith("RESPUESTA:")) {
      answerLines = [line];
    } else if (answerLines.length && line && !line.startsWith("===") && !line.startsWith("#")) {
      answerLines.push(line);
    } else if (line === "" && answerLines.length) {
      flush();
    }
  }
  flush();
  return chunks;
}
