import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = path.resolve(__dirname, "../../knowledge/rag-index.json");

// ── Tokenización española ────────────────────────────────────────────────────
const STOPWORDS = new Set([
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "unos",
  "unas",
  "de",
  "del",
  "al",
  "en",
  "con",
  "por",
  "para",
  "que",
  "qué",
  "cómo",
  "como",
  "cuando",
  "es",
  "son",
  "está",
  "están",
  "se",
  "no",
  "si",
  "sí",
  "y",
  "o",
  "a",
  "e",
  "hay",
  "puede",
  "tiene",
  "hacer",
  "ha",
  "han",
  "debe",
  "deben",
  "ser",
  "sus",
  "este",
  "esta",
  "estos",
  "estas",
  "ese",
  "esa",
  "su",
  "más",
  "sin",
  "sobre",
  "hasta",
  "desde",
  "entre",
  "cada",
  "todo",
  "todos",
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// ── Implementación BM25 ──────────────────────────────────────────────────────
const K1 = 1.5;
const B = 0.75;

class BM25Index {
  constructor() {
    this.docs = []; // { text, source, chunkIndex, tokens }
    this.df = {}; // frecuencia de documento por término
    this.avgdl = 0;
  }

  _recomputeStats() {
    this.df = {};
    for (const doc of this.docs) {
      for (const t of new Set(doc.tokens)) {
        this.df[t] = (this.df[t] || 0) + 1;
      }
    }
    this.avgdl = this.docs.length
      ? this.docs.reduce((s, d) => s + d.tokens.length, 0) / this.docs.length
      : 0;
  }

  addChunks(chunks) {
    for (const c of chunks) {
      this.docs.push({
        text: c.text,
        source: c.source,
        chunkIndex: c.chunkIndex,
        tokens: tokenize(c.text),
      });
    }
    this._recomputeStats();
  }

  removeBySource(source) {
    this.docs = this.docs.filter((d) => d.source !== source);
    this._recomputeStats();
  }

  search(query, k = 5) {
    const qTokens = tokenize(query);
    if (!qTokens.length || !this.docs.length) return [];

    const N = this.docs.length;
    const scored = this.docs.map((doc) => {
      const tf = {};
      for (const t of doc.tokens) tf[t] = (tf[t] || 0) + 1;

      let score = 0;
      for (const qt of qTokens) {
        if (!(qt in this.df)) continue;
        const idf = Math.log((N - this.df[qt] + 0.5) / (this.df[qt] + 0.5) + 1);
        const f = tf[qt] || 0;
        const len = doc.tokens.length;
        const tfn =
          (f * (K1 + 1)) / (f + K1 * (1 - B + (B * len) / this.avgdl));
        score += idf * tfn;
      }
      return score;
    });

    return scored
      .map((score, i) => ({ score, i }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((x) => ({
        text: this.docs[x.i].text,
        source: this.docs[x.i].source,
        score: x.score,
      }));
  }

  toJSON() {
    return { docs: this.docs, df: this.df, avgdl: this.avgdl };
  }

  static fromJSON(obj) {
    const idx = new BM25Index();
    idx.docs = obj.docs || [];
    idx.df = obj.df || {};
    idx.avgdl = obj.avgdl || 0;
    return idx;
  }
}

// ── Persistencia ─────────────────────────────────────────────────────────────
let _index = null;

function loadIndex() {
  if (_index) return _index;
  if (fs.existsSync(INDEX_PATH)) {
    try {
      _index = BM25Index.fromJSON(
        JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8")),
      );
      console.log(`✅ Índice BM25 cargado (${_index.docs.length} fragmentos)`);
    } catch {
      _index = new BM25Index();
    }
  } else {
    _index = new BM25Index();
  }
  return _index;
}

function saveIndex() {
  fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
  fs.writeFileSync(INDEX_PATH, JSON.stringify(loadIndex().toJSON()), "utf-8");
}

// ── API pública (misma interfaz que antes) ───────────────────────────────────

export async function addDocuments(chunks) {
  if (!chunks.length) return 0;
  const idx = loadIndex();
  idx.addChunks(chunks);
  saveIndex();
  return chunks.length;
}

export async function queryDocuments(queryText, nResults = 5) {
  return loadIndex().search(queryText, nResults);
}

export async function deleteDocumentBySource(source) {
  const idx = loadIndex();
  idx.removeBySource(source);
  saveIndex();
}

export async function getStats() {
  try {
    const idx = loadIndex();
    return { connected: true, chunks: idx.docs.length };
  } catch (err) {
    return { connected: false, chunks: 0, error: err.message };
  }
}

export async function resetCollection() {
  _index = new BM25Index();
  if (fs.existsSync(INDEX_PATH)) fs.unlinkSync(INDEX_PATH);
}
