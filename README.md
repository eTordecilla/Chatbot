# Yamaha Chatbot — Asistente de Soporte Interno

Sistema de soporte técnico interno con interfaz web moderna para Yamaha. Cuenta con dos módulos: un chatbot de soporte que responde preguntas frecuentes del Portal y Pedidos Yamaha, y un asistente de manuales y procedimientos basado en RAG (Retrieval-Augmented Generation) sobre documentos PDF y DOCX.

## Arquitectura

```
yamaha-chatbot/
├── server/                      ← Backend Express (Node.js ESM)
│   ├── index.js                 ← Entry point + endpoint /api/chat
│   ├── routes/
│   │   └── rag.js               ← Endpoints RAG (ingest, query, status, delete)
│   ├── services/
│   │   ├── vectorStore.js       ← Motor BM25 con persistencia JSON
│   │   ├── ragChain.js          ← Orquestador RAG + LLM (Anthropic / Groq)
│   │   └── documentParser.js   ← Parseo de PDF (unpdf/PDF.js) y DOCX (mammoth)
│   └── utils/
│       └── normalize.js         ← Tokenizador español compartido
├── client/                      ← Frontend React 18 + Vite + Tailwind CSS 4
│   └── src/
│       ├── App.jsx              ← Raíz + navegación entre módulos
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   ├── ChatPanel.jsx    ← Módulo 1: Soporte Q&A
│       │   ├── ManualesPanel.jsx← Módulo 2: Manuales RAG
│       │   └── RightPanel.jsx  ← Panel lateral (estado, clima)
│       └── hooks/
│           └── useSessionChat.js← Persistencia de historial en sessionStorage
├── knowledge/
│   ├── BancoDePreguntasPortalYPedidos.txt ← Base de conocimiento soporte
│   ├── rag-index-soporte.json   ← Índice BM25 colección soporte (auto-generado)
│   ├── rag-index-manuales.json  ← Índice BM25 colección manuales (auto-generado)
│   ├── soporte/                 ← Documentos indexados de soporte
│   └── manuales/                ← Documentos indexados de manuales
├── pnpm-workspace.yaml
└── package.json
```

## Módulos

### Módulo 1 — Soporte Q&A
Responde preguntas sobre el Portal Yamaha y Pedidos Yamaha usando el archivo `BancoDePreguntasPortalYPedidos.txt`. La búsqueda combina un índice BM25 local con un LLM para generar respuestas contextuales.

### Módulo 2 — Manuales y Procedimientos
Permite subir documentos PDF y DOCX, indexarlos automáticamente con BM25, y consultarlos en lenguaje natural. El sistema recupera los fragmentos más relevantes y los envía al LLM para generar la respuesta.

## Requisitos

- [Node.js 18+](https://nodejs.org)
- [pnpm](https://pnpm.io)
- API key de [Anthropic](https://console.anthropic.com) o [Groq](https://console.groq.com) (Groq es gratuita)

> No se requiere Python. El parseo de PDFs usa [unpdf](https://github.com/unjs/unpdf), una librería JavaScript pura basada en PDF.js.

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/eTordecilla/Chatbot.git
cd Chatbot
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crea el archivo `server/.env`:

```env
# Al menos una de las dos es requerida
ANTHROPIC_API_KEY=sk-ant-api03-...
GROQ_API_KEY=gsk_...

PORT=3001
```

> Groq ofrece una capa gratuita con el modelo `llama-3.3-70b-versatile`. Si no tienes clave de Anthropic, solo con la de Groq funciona.

### 4. Iniciar la aplicación

```bash
pnpm dev
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Inicia servidor y cliente en modo desarrollo |
| `pnpm install` | Instala todas las dependencias del workspace |

## API REST

### Soporte

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/knowledge-status` | Estado del archivo de conocimiento |
| `POST` | `/api/chat` | Consulta directa al banco de preguntas |

### RAG

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/rag/status?collection=<col>` | Estado del índice BM25 |
| `POST` | `/api/rag/ingest?collection=<col>` | Sube e indexa PDFs/DOCX |
| `POST` | `/api/rag/ingest-folder?collection=<col>` | Indexa toda la carpeta local |
| `POST` | `/api/rag/query?collection=<col>` | Consulta con RAG + LLM |
| `DELETE` | `/api/rag/index?collection=<col>` | Limpia el índice |

Colecciones disponibles: `soporte` (default: `manuales`)

## Base de conocimiento

El archivo de Q&A está en `knowledge/BancoDePreguntasPortalYPedidos.txt`. Se indexa automáticamente en la colección `soporte` al iniciar el servidor si el índice está vacío.

### Formato del archivo

```
=== NOMBRE DE SECCIÓN ===

PROBLEMA: Descripción del problema
SOLUCIÓN:
1. Paso uno
2. Paso dos

PREGUNTA: ¿Cómo hago algo?
RESPUESTA: Explicación de cómo hacerlo.
```

## Motor de búsqueda BM25

El sistema usa una implementación propia de BM25 (sin dependencias externas de vector store):

- Índices persistidos como JSON en `knowledge/`
- Tokenización española con lista de stopwords
- TF pre-computado al momento de indexar (no en cada búsqueda)
- Actualización incremental de frecuencias de documento
- Deduplicación por hash MD5 — archivos sin cambios no se re-indexan
- Dos colecciones independientes: `soporte` y `manuales`

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | React 18, Vite 5, Tailwind CSS 4 |
| Backend | Node.js (ESM), Express 4 |
| LLM principal | Anthropic Claude (claude-sonnet-4-6) |
| LLM alternativo | Groq (llama-3.3-70b-versatile) |
| Búsqueda | BM25 local con persistencia JSON |
| Parseo PDF | unpdf (PDF.js, JavaScript puro) |
| Parseo DOCX | mammoth |
| Gestión de paquetes | pnpm workspaces |
