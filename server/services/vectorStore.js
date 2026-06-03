import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { tokenize } from "../utils/normalize.js";
import { LocalIndex } from "vectra";
import { pipeline }   from "@xenova/transformers";

const __dirname     = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = path.resolve(__dirname, "../../knowledge");
const VECTOR_DIR    = path.resolve(__dirname, "../../data/vector-index");

// ── Embedder singleton ───────────────────────────────────────────────────────
let _embedder = null;

async function getEmbedder() {
  if (!_embedder) {
    console.log("🔄 Cargando modelo de embeddings (Xenova/all-MiniLM-L6-v2)…");
    _embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", { quantized: true });
    console.log("✅ Modelo de embeddings listo.");
  }
  return _embedder;
}

export async function embed(text) {
  const fn  = await getEmbedder();
  const out = await fn(text, { pooling: "mean", normalize: true });
  return Array.from(out.data);
}

export async function warmUpEmbedder() {
  await embed("warm up");
}

// ── Vectra store ─────────────────────────────────────────────────────────────
let _vectra = null;

async function getVectraIndex() {
  if (!_vectra) {
    _vectra = new LocalIndex(VECTOR_DIR);
    if (!(await _vectra.isIndexCreated())) {
      await _vectra.createIndex();
      console.log("✅ Índice vectorial creado en", VECTOR_DIR);
    }
  }
  return _vectra;
}

export async function addVectraChunk(text, source, chunkIndex) {
  const idx    = await getVectraIndex();
  const vector = await embed(text);
  await idx.insertItem({ vector, metadata: { text, source, chunkIndex } });
}

export async function searchVectra(queryText, k = 5) {
  const idx    = await getVectraIndex();
  const vector = await embed(queryText);
  const results = await idx.queryItems(vector, k);
  return results.map((r) => ({
    text:   r.item.metadata.text,
    source: r.item.metadata.source,
    score:  r.score,
  }));
}

export async function getAllVectraItems() {
  const idx = await getVectraIndex();
  return idx.listItems();
}

function indexPath(collection) {
  return path.resolve(KNOWLEDGE_DIR, `rag-index-${collection}.json`);
}

// ── Implementación BM25 ──────────────────────────────────────────────────────
const K1 = 1.5;
const B = 0.75;

class BM25Index {
  constructor() {
    this.docs = [];          // { text, source, chunkIndex, tokens, tf }
    this.df = {};            // document frequency por término
    this.avgdl = 0;
    this.totalDocLength = 0;
    this.sourceHashes = {};  // { source: md5hash } para deduplicación
  }

  // Actualización incremental: no recalcula todo el índice en cada ingestión
  addChunks(chunks) {
    for (const c of chunks) {
      const tokens = tokenize(c.text);
      // TF pre-computado al indexar, no en cada búsqueda
      const tf = {};
      for (const t of tokens) tf[t] = (tf[t] || 0) + 1;

      this.docs.push({ text: c.text, source: c.source, chunkIndex: c.chunkIndex, tokens, tf });

      for (const t of new Set(tokens)) {
        this.df[t] = (this.df[t] || 0) + 1;
      }
      this.totalDocLength += tokens.length;
    }
    this.avgdl = this.docs.length ? this.totalDocLength / this.docs.length : 0;
  }

  // Necesita recompute completo porque elimina docs del medio
  removeBySource(source) {
    this.docs = this.docs.filter((d) => d.source !== source);
    delete this.sourceHashes[source];
    this._recomputeStats();
  }

  getSourceHash(source) {
    return this.sourceHashes[source] ?? null;
  }

  setSourceHash(source, hash) {
    this.sourceHashes[source] = hash;
  }

  _recomputeStats() {
    this.df = {};
    this.totalDocLength = 0;
    for (const doc of this.docs) {
      for (const t of new Set(doc.tokens)) {
        this.df[t] = (this.df[t] || 0) + 1;
      }
      this.totalDocLength += doc.tokens.length;
    }
    this.avgdl = this.docs.length ? this.totalDocLength / this.docs.length : 0;
  }

  search(query, k = 5) {
    const qTokens = tokenize(query);
    if (!qTokens.length || !this.docs.length) return [];

    const N = this.docs.length;
    const scored = this.docs.map((doc) => {
      let score = 0;
      for (const qt of qTokens) {
        if (!(qt in this.df)) continue;
        const idf = Math.log((N - this.df[qt] + 0.5) / (this.df[qt] + 0.5) + 1);
        // Usa TF pre-computado en lugar de recalcular por búsqueda
        const f = doc.tf?.[qt] || 0;
        const len = doc.tokens.length;
        const tfn = (f * (K1 + 1)) / (f + K1 * (1 - B + (B * len) / this.avgdl));
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
    return {
      docs: this.docs,
      df: this.df,
      avgdl: this.avgdl,
      totalDocLength: this.totalDocLength,
      sourceHashes: this.sourceHashes,
    };
  }

  static fromJSON(obj) {
    const idx = new BM25Index();
    idx.docs = obj.docs || [];
    idx.df = obj.df || {};
    idx.avgdl = obj.avgdl || 0;
    idx.sourceHashes = obj.sourceHashes || {};
    idx.totalDocLength =
      obj.totalDocLength ??
      idx.docs.reduce((s, d) => s + (d.tokens?.length || 0), 0);
    // Retrocompatibilidad: reconstruir TF para índices anteriores sin él
    for (const doc of idx.docs) {
      if (!doc.tf) {
        doc.tf = {};
        for (const t of doc.tokens) doc.tf[t] = (doc.tf[t] || 0) + 1;
      }
    }
    return idx;
  }
}

// ── Persistencia multi-colección ─────────────────────────────────────────────
const _indexes = {};

function loadIndex(collection = "manuales") {
  if (_indexes[collection]) return _indexes[collection];
  const fp = indexPath(collection);
  if (fs.existsSync(fp)) {
    try {
      _indexes[collection] = BM25Index.fromJSON(JSON.parse(fs.readFileSync(fp, "utf-8")));
      console.log(`✅ Índice [${collection}] cargado (${_indexes[collection].docs.length} fragmentos)`);
    } catch {
      _indexes[collection] = new BM25Index();
    }
  } else {
    _indexes[collection] = new BM25Index();
  }
  return _indexes[collection];
}

function saveIndex(collection = "manuales") {
  fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
  fs.writeFileSync(indexPath(collection), JSON.stringify(loadIndex(collection).toJSON()), "utf-8");
}

// ── API pública ───────────────────────────────────────────────────────────────

export async function addDocuments(chunks, collection = "manuales", sourceHash = null) {
  if (!chunks.length) return 0;
  const idx = loadIndex(collection);
  idx.addChunks(chunks);
  if (sourceHash && chunks.length > 0) {
    idx.setSourceHash(chunks[0].source, sourceHash);
  }
  saveIndex(collection);
  return chunks.length;
}

export async function queryDocuments(queryText, nResults = 5, collection = "manuales") {
  return loadIndex(collection).search(queryText, nResults);
}

export async function deleteDocumentBySource(source, collection = "manuales") {
  const idx = loadIndex(collection);
  idx.removeBySource(source);
  saveIndex(collection);
}

export async function getStats(collection = "manuales") {
  try {
    const idx = loadIndex(collection);
    return { connected: true, chunks: idx.docs.length };
  } catch (err) {
    return { connected: false, chunks: 0, error: err.message };
  }
}

export async function resetCollection(collection = "manuales") {
  _indexes[collection] = new BM25Index();
  const fp = indexPath(collection);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
}

// Devuelve el hash MD5 almacenado para una fuente, o null si no existe
export function getDocumentHash(source, collection = "manuales") {
  return loadIndex(collection).getSourceHash(source);
}
