import fs from "fs";
import path from "path";
import { extractText } from "unpdf";

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
    if (cutAt >= clean.length) break;
    start = cutAt - CHUNK_OVERLAP;
  }
  return chunks;
}

async function extractPdfText(filePath) {
  const buffer = fs.readFileSync(filePath);
  const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
  return text;
}

export async function parseDocument(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);

  if (ext === ".pdf") {
    const text = await extractPdfText(filePath);
    return chunkText(text, filename);
  }

  if (ext === ".docx") {
    const { default: mammoth } = await import("mammoth");
    const result = await mammoth.extractRawText({ path: filePath });
    return chunkText(result.value, filename);
  }

  throw new Error(`Formato no soportado: ${ext}. Soportados: .pdf, .docx`);
}
