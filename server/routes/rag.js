import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { parseDocument } from "../services/documentParser.js";
import {
  addDocuments,
  getStats,
  resetCollection,
  deleteDocumentBySource,
} from "../services/vectorStore.js";
import { answerQuestion } from "../services/ragChain.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANUALES_DIR = path.resolve(__dirname, "../../knowledge/manuales");

if (!fs.existsSync(MANUALES_DIR))
  fs.mkdirSync(MANUALES_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: MANUALES_DIR,
  filename: (_req, file, cb) => {
    // Preservar nombre original decodificando correctamente
    const name = Buffer.from(file.originalname, "latin1").toString("utf8");
    cb(null, name);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".pdf", ".docx"].includes(ext)) cb(null, true);
    else cb(new Error(`Solo se aceptan archivos .pdf y .docx`), false);
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB por archivo
});

const router = Router();

// GET /api/rag/status — estado del sistema
router.get("/status", async (_req, res) => {
  const stats = await getStats();
  const files = fs
    .readdirSync(MANUALES_DIR)
    .filter((f) => /\.(pdf|docx)$/i.test(f));
  res.json({ ...stats, files });
});

// POST /api/rag/ingest — sube archivos y los indexa
router.post("/ingest", upload.array("files", 20), async (req, res) => {
  if (!req.files?.length)
    return res.status(400).json({ error: "No se recibieron archivos" });

  const results = [];
  for (const file of req.files) {
    try {
      // Eliminar chunks anteriores del mismo archivo (re-ingestión limpia)
      await deleteDocumentBySource(file.filename);
      const chunks = await parseDocument(file.path);
      const added = await addDocuments(chunks);
      results.push({ file: file.filename, chunks: added, status: "ok" });
      console.log(`✅ Indexado: ${file.filename} (${added} fragmentos)`);
    } catch (err) {
      results.push({
        file: file.filename,
        error: err.message,
        status: "error",
      });
      console.error(`❌ Error indexando ${file.filename}:`, err.message);
    }
  }
  res.json({ results });
});

// POST /api/rag/ingest-folder — indexa todos los archivos de la carpeta manuales
router.post("/ingest-folder", async (_req, res) => {
  const files = fs
    .readdirSync(MANUALES_DIR)
    .filter((f) => /\.(pdf|docx)$/i.test(f));
  if (!files.length)
    return res.json({
      message: "No hay documentos en la carpeta manuales",
      results: [],
    });

  const results = [];
  for (const file of files) {
    try {
      await deleteDocumentBySource(file);
      const chunks = await parseDocument(path.join(MANUALES_DIR, file));
      const added = await addDocuments(chunks);
      results.push({ file, chunks: added, status: "ok" });
      console.log(`✅ Indexado: ${file} (${added} fragmentos)`);
    } catch (err) {
      results.push({ file, error: err.message, status: "error" });
    }
  }
  res.json({ results });
});

// POST /api/rag/query — consulta RAG
router.post("/query", async (req, res) => {
  const { question } = req.body;
  if (!question?.trim())
    return res.status(400).json({ error: "La pregunta es requerida" });

  try {
    const result = await answerQuestion(question.trim());
    res.json(result);
  } catch (err) {
    console.error("Error en RAG query:", err.message);
    if (err.message?.includes("ANTHROPIC_API_KEY")) {
      return res
        .status(500)
        .json({ error: "ANTHROPIC_API_KEY no configurada en el servidor." });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/rag/index — limpia el índice vectorial
router.delete("/index", async (_req, res) => {
  await resetCollection();
  res.json({ message: "Índice vectorial eliminado correctamente" });
});

export default router;
