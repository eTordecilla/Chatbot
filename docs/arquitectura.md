# Arquitectura del Sistema

## Visión general

El Yamaha Chatbot es una aplicación monorepo con separación clara entre frontend y backend. Expone dos módulos funcionales al usuario: un chatbot de soporte Q&A y un asistente de manuales basado en RAG.

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENTE (React)                           │
│                                                                  │
│  ┌─────────┐   ┌─────────────┐   ┌───────────────┐              │
│  │ Sidebar │   │  ChatPanel  │   │ ManualesPanel │              │
│  │         │   │ (Soporte)   │   │  (RAG)        │              │
│  └─────────┘   └──────┬──────┘   └──────┬────────┘              │
│                       │                 │                        │
└───────────────────────┼─────────────────┼────────────────────────┘
                        │  HTTP/JSON      │
              ┌─────────▼─────────────────▼──────────┐
              │           BACKEND (Express)           │
              │                                       │
              │  /api/chat        /api/rag/*          │
              │  ┌─────────┐   ┌──────────────────┐  │
              │  │ index.js│   │    rag.js (router)│  │
              │  └────┬────┘   └────────┬─────────┘  │
              │       │                 │             │
              │  ┌────▼─────────────────▼──────────┐  │
              │  │         vectorStore.js           │  │
              │  │        (Motor BM25)              │  │
              │  └────────────────┬────────────────┘  │
              │                   │                   │
              │  ┌────────────────▼────────────────┐  │
              │  │          ragChain.js             │  │
              │  │    (BM25 → contexto → LLM)       │  │
              │  └────────────────┬────────────────┘  │
              └───────────────────┼────────────────────┘
                                  │
              ┌───────────────────▼────────────────────┐
              │           SERVICIOS EXTERNOS           │
              │                                        │
              │  Anthropic API     Groq API            │
              │  (claude-sonnet)   (llama-3.3-70b)     │
              └────────────────────────────────────────┘
                                  │
              ┌───────────────────▼────────────────────┐
              │           ALMACENAMIENTO LOCAL         │
              │                                        │
              │  knowledge/BancoDePreguntasPortal.txt  │
              │  knowledge/rag-index-soporte.json      │
              │  knowledge/rag-index-manuales.json     │
              │  knowledge/soporte/   (PDFs/DOCX)      │
              │  knowledge/manuales/  (PDFs/DOCX)      │
              └────────────────────────────────────────┘
```

---

## Estructura de carpetas

```
yamaha-chatbot/
├── server/                       ← Backend Node.js (ESM puro)
│   ├── index.js                  ← Entry point, /api/chat, /api/knowledge-status
│   ├── routes/
│   │   └── rag.js                ← Rutas /api/rag/* (ingest, query, status, delete)
│   ├── services/
│   │   ├── vectorStore.js        ← Motor BM25 con persistencia en JSON
│   │   ├── ragChain.js           ← Orquestador RAG → LLM
│   │   └── documentParser.js    ← Parseo de PDF (pdfminer) y DOCX (mammoth)
│   ├── utils/
│   │   └── normalize.js          ← Tokenizador español compartido
│   └── package.json
│
├── client/                       ← Frontend React 18 + Vite + Tailwind v4
│   └── src/
│       ├── App.jsx               ← Raíz, lazy loading, navegación
│       ├── components/
│       │   ├── Sidebar.jsx       ← Navegación lateral
│       │   ├── ChatPanel.jsx     ← Módulo 1: chat de soporte
│       │   ├── ManualesPanel.jsx ← Módulo 2: manuales RAG (lazy loaded)
│       │   └── RightPanel.jsx   ← Panel info: estado, frase, clima
│       ├── hooks/
│       │   └── useSessionChat.js ← Persistencia de mensajes en sessionStorage
│       └── assets/
│           └── incolmotos.svg    ← Logo Yamaha/Incolmotos
│
├── knowledge/                    ← Base de datos local
│   ├── BancoDePreguntasPortalYPedidos.txt ← Q&A soporte
│   ├── rag-index-soporte.json    ← Índice BM25 colección soporte (auto-generado)
│   ├── rag-index-manuales.json   ← Índice BM25 colección manuales (auto-generado)
│   ├── soporte/                  ← PDFs/DOCX de soporte técnico
│   └── manuales/                 ← PDFs/DOCX de manuales y procedimientos
│
├── docs/                         ← Documentación técnica
├── pnpm-workspace.yaml
└── package.json                  ← Scripts raíz (dev, start)
```

---

## Flujo de datos

### Módulo 1 — Soporte Q&A

```
Usuario escribe pregunta
        │
        ▼
POST /api/rag/query?collection=soporte
        │
        ▼
vectorStore.search(query, k=5)    ← BM25 sobre banco de preguntas
        │
        ▼
5 fragmentos más relevantes
        │
        ▼
ragChain.answerQuestion()         ← Arma contexto y llama al LLM
        │
        ▼
LLM genera respuesta              ← Groq (preferido) o Anthropic
        │
        ▼
{ answer, sources, chunksUsed }
        │
        ▼
ChatPanel renderiza respuesta
```

### Módulo 2 — Manuales RAG (ingestión)

```
Usuario sube PDF/DOCX
        │
        ▼
POST /api/rag/ingest?collection=manuales
        │
        ▼
Hash MD5 del archivo
        │ (si hash igual al indexado → skip)
        ▼
documentParser.parseDocument()
  ├── PDF → python3 pdfminer → texto
  └── DOCX → mammoth → texto
        │
        ▼
chunkText(texto, 800 chars, overlap 150)
        │
        ▼
vectorStore.addDocuments(chunks)
  ├── tokenize() por chunk
  ├── Calcula TF por chunk (pre-indexado)
  ├── Actualiza DF incremental
  └── Guarda sourceHash
        │
        ▼
saveIndex() → rag-index-manuales.json
```

---

## Tecnologías

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| Frontend | React | 18.3.1 | UI de componentes |
| Frontend | Vite | 5.4.10 | Build y dev server |
| Frontend | Tailwind CSS | 4.3.0 | Estilos utilitarios |
| Frontend | lucide-react | 0.460.0 | Iconografía |
| Frontend | @fortawesome | 7.2.0 | Iconos de nav |
| Backend | Node.js | 18+ | Runtime (ESM puro) |
| Backend | Express | 4.21.0 | HTTP server |
| Backend | multer | 2.1.1 | Upload de archivos |
| Backend | mammoth | 1.12.0 | Parseo DOCX |
| Backend | pdfminer.six | latest | Parseo PDF (Python) |
| LLM | Groq API | llama-3.3-70b | LLM principal (gratis) |
| LLM | Anthropic API | claude-sonnet-4-6 | LLM alternativo |
| Búsqueda | BM25 propio | — | Sin dependencias externas |
| Gestión | pnpm workspaces | 10.33.0 | Monorepo |
