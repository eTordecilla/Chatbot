import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;

function chunkText(text, source) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < clean.length) {
    const end = Math.min(start + CHUNK_SIZE, clean.length);
    let cutAt = end;
    if (end < clean.length) {
      const lastSpace = clean.lastIndexOf(" ", end);
      if (lastSpace > start + CHUNK_SIZE * 0.7) cutAt = lastSpace;
    }
    const chunk = clean.slice(start, cutAt).trim();
    if (chunk.length > 80) {
      chunks.push({ text: chunk, source, chunkIndex: chunkIndex++ });
    }
    if (cutAt >= clean.length) break; // evita loop infinito en el último tramo
    start = cutAt - CHUNK_OVERLAP;
  }
  return chunks;
}

// Usa spawnSync + archivo temporal para evitar el callback async que causa OOM
// en Node.js v24 con módulos ESM importados
function extractPdfTextSync(filePath) {
  const tmpFile = path.join(os.tmpdir(), `ym_pdf_${Date.now()}.txt`);
  const script = [
    "import sys",
    "from pdfminer.high_level import extract_text",
    "text = extract_text(sys.argv[1])",
    "open(sys.argv[2], 'w', encoding='utf-8').write(text)",
  ].join("\n");

  const result = spawnSync("python3", ["-c", script, filePath, tmpFile], {
    timeout: 30_000,
    encoding: "utf-8",
  });

  if (result.error)
    throw new Error(`No se pudo lanzar python3: ${result.error.message}`);
  if (result.status !== 0)
    throw new Error(`pdfminer falló: ${(result.stderr || "").slice(0, 300)}`);
  if (!fs.existsSync(tmpFile)) throw new Error("pdfminer no generó salida");

  const text = fs.readFileSync(tmpFile, "utf-8");
  try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  return text;
}

export async function parseDocument(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);

  if (ext === ".pdf") {
    const text = extractPdfTextSync(filePath);
    return chunkText(text, filename);
  }

  if (ext === ".docx") {
    const { default: mammoth } = await import("mammoth");
    const result = await mammoth.extractRawText({ path: filePath });
    return chunkText(result.value, filename);
  }

  throw new Error(`Formato no soportado: ${ext}. Soportados: .pdf, .docx`);
}
