import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { parseDocument } from "../services/documentParser.js";
import {
  addDocuments,
  getStats,
  resetCollection,
  deleteDocumentBySource,
  getDocumentHash,
} from "../services/vectorStore.js";
import { answerQuestion } from "../services/ragChain.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = path.resolve(__dirname, "../../knowledge");

// Directorios por colección
function docsDir(collection) {
  const dir = path.join(KNOWLEDGE_DIR, collection === "soporte" ? "soporte" : "manuales");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function makeUpload(collection) {
  return multer({
    storage: multer.diskStorage({
      destination: docsDir(collection),
      filename: (_req, file, cb) => {
        cb(null, Buffer.from(file.originalname, "latin1").toString("utf8"));
      },
    }),
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      [".pdf", ".docx"].includes(ext) ? cb(null, true) : cb(new Error("Solo .pdf y .docx"));
    },
    limits: { fileSize: 50 * 1024 * 1024 },
  });
}

const router = Router();

// Extrae la colección del query string (default: manuales)
function col(req) {
  return req.query.collection === "soporte" ? "soporte" : "manuales";
}

// GET /api/rag/status?collection=soporte
router.get("/status", async (req, res) => {
  const c = col(req);
  const stats = await getStats(c);
  const dir = docsDir(c);
  const files = fs.readdirSync(dir).filter((f) => /\.(pdf|docx)$/i.test(f));
  res.json({ ...stats, files, collection: c });
});

// POST /api/rag/ingest?collection=soporte — sube archivos y los indexa
router.post("/ingest", (req, res, next) => {
  const c = col(req);
  makeUpload(c).array("files", 20)(req, res, next);
}, async (req, res) => {
  const c = col(req);
  if (!req.files?.length)
    return res.status(400).json({ error: "No se recibieron archivos" });

  const results = [];
  for (const file of req.files) {
    try {
      const fileContent = fs.readFileSync(file.path);
      const hash = createHash("md5").update(fileContent).digest("hex");
      const existingHash = getDocumentHash(file.filename, c);

      if (existingHash === hash) {
        results.push({ file: file.filename, status: "skipped", reason: "Sin cambios (mismo contenido)" });
        console.log(`⏭️  [${c}] Sin cambios: ${file.filename}`);
        continue;
      }

      await deleteDocumentBySource(file.filename, c);
      const chunks = await parseDocument(file.path);
      const added = await addDocuments(chunks, c, hash);
      results.push({ file: file.filename, chunks: added, status: "ok" });
      console.log(`✅ [${c}] Indexado: ${file.filename} (${added} fragmentos)`);
    } catch (err) {
      results.push({ file: file.filename, error: err.message, status: "error" });
      console.error(`❌ [${c}] Error indexando ${file.filename}:`, err.message);
    }
  }
  res.json({ results });
});

// POST /api/rag/ingest-folder?collection=soporte
router.post("/ingest-folder", async (req, res) => {
  const c = col(req);
  const dir = docsDir(c);
  const files = fs.readdirSync(dir).filter((f) => /\.(pdf|docx)$/i.test(f));
  if (!files.length)
    return res.json({ message: "No hay documentos en la carpeta", results: [] });

  const results = [];
  for (const file of files) {
    try {
      const filePath = path.join(dir, file);
      const fileContent = fs.readFileSync(filePath);
      const hash = createHash("md5").update(fileContent).digest("hex");
      const existingHash = getDocumentHash(file, c);

      if (existingHash === hash) {
        results.push({ file, status: "skipped", reason: "Sin cambios (mismo contenido)" });
        continue;
      }

      await deleteDocumentBySource(file, c);
      const chunks = await parseDocument(filePath);
      const added = await addDocuments(chunks, c, hash);
      results.push({ file, chunks: added, status: "ok" });
      console.log(`✅ [${c}] Indexado: ${file} (${added} fragmentos)`);
    } catch (err) {
      results.push({ file, error: err.message, status: "error" });
    }
  }
  res.json({ results });
});

// POST /api/rag/query?collection=soporte
router.post("/query", async (req, res) => {
  const c = col(req);
  const { question } = req.body;
  if (!question?.trim())
    return res.status(400).json({ error: "La pregunta es requerida" });

  try {
    const result = await answerQuestion(question.trim(), c);
    res.json(result);
  } catch (err) {
    console.error(`Error en RAG query [${c}]:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/rag/index?collection=soporte
router.delete("/index", async (req, res) => {
  const c = col(req);
  await resetCollection(c);
  res.json({ message: `Índice [${c}] eliminado correctamente` });
});

export default router;
