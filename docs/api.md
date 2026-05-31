# Referencia de API

Base URL: `http://localhost:3001`

Todos los endpoints retornan JSON. El frontend en desarrollo usa proxy automático desde `http://localhost:3000/api/*`.

---

## Conocimiento

### `GET /api/knowledge-status`

Retorna el estado del archivo de base de conocimiento de soporte.

**Respuesta exitosa:**
```json
{
  "exists": true,
  "path": "/ruta/absoluta/BancoDePreguntasPortalYPedidos.txt",
  "sizeKB": "7.4",
  "lines": 98,
  "lastModified": "2025-05-20T14:30:00.000Z"
}
```

**Si el archivo no existe:**
```json
{
  "exists": false,
  "path": "/ruta/absoluta/BancoDePreguntasPortalYPedidos.txt"
}
```

---

### `POST /api/chat`

Búsqueda directa en el banco de preguntas usando coincidencia por palabras clave (sin LLM). Se usa como fallback o para consultas simples.

**Body:**
```json
{
  "message": "cómo sincronizo una referencia en Pedidos Yamaha"
}
```

**Respuesta:**
```json
{
  "reply": "Texto de la respuesta encontrada...",
  "replyParts": [
    { "type": "text", "content": "Texto normal" },
    { "type": "json", "content": "{ ... }" }
  ],
  "knowledgeLoaded": true
}
```

**Si no encuentra coincidencia:**
```json
{
  "reply": "No encontré información específica...",
  "replyParts": [{ "type": "text", "content": "..." }],
  "knowledgeLoaded": true
}
```

---

## RAG

Todos los endpoints RAG aceptan el parámetro de query `?collection=<nombre>`.

| Colección | Descripción |
|-----------|-------------|
| `manuales` | Colección de manuales y procedimientos (default) |
| `soporte` | Colección del banco de preguntas de soporte |

---

### `GET /api/rag/status`

Retorna estadísticas del índice BM25 de una colección.

**Query params:** `?collection=manuales`

**Respuesta:**
```json
{
  "connected": true,
  "chunks": 142,
  "files": ["manual-garantias.pdf", "proceso-devoluciones.docx"],
  "collection": "manuales"
}
```

---

### `POST /api/rag/ingest`

Sube uno o más archivos PDF/DOCX, los parsea y los indexa en BM25.

**Query params:** `?collection=manuales`

**Body:** `multipart/form-data`
- Campo `files`: uno o múltiples archivos `.pdf` o `.docx`
- Límite: 20 archivos, 50 MB por archivo

**Respuesta:**
```json
{
  "results": [
    {
      "file": "manual-garantias.pdf",
      "chunks": 47,
      "status": "ok"
    },
    {
      "file": "proceso-devoluciones.docx",
      "status": "skipped",
      "reason": "Sin cambios (mismo contenido)"
    },
    {
      "file": "archivo-corrupto.pdf",
      "status": "error",
      "error": "pdfminer falló: ..."
    }
  ]
}
```

> Los archivos con el mismo contenido (mismo hash MD5) se omiten automáticamente sin reprocesar.

---

### `POST /api/rag/ingest-folder`

Indexa todos los archivos PDF/DOCX presentes en la carpeta local `knowledge/<collection>/`.

**Query params:** `?collection=manuales`

**Body:** vacío

**Respuesta:** igual a `/ingest`

```json
{
  "results": [
    { "file": "manual-garantias.pdf", "chunks": 47, "status": "ok" },
    { "file": "guia-pedidos.pdf", "status": "skipped", "reason": "Sin cambios (mismo contenido)" }
  ]
}
```

---

### `POST /api/rag/query`

Busca en el índice BM25, recupera los 5 fragmentos más relevantes y genera una respuesta con el LLM.

**Query params:** `?collection=manuales`

**Body:**
```json
{
  "question": "¿Cuáles son los pasos para el proceso de garantía?"
}
```

**Respuesta exitosa:**
```json
{
  "answer": "Según el manual de garantías, el proceso consta de los siguientes pasos:\n\n1. ...\n2. ...\n\n(Fuente: manual-garantias.pdf)",
  "sources": ["manual-garantias.pdf"],
  "chunksUsed": 5
}
```

**Si no hay fragmentos relevantes:**
```json
{
  "answer": "No encontré información relevante en los manuales indexados. Verifica que los documentos hayan sido cargados correctamente.",
  "sources": [],
  "chunksUsed": 0
}
```

**Errores:**
```json
{
  "error": "La pregunta es requerida"
}
```
```json
{
  "error": "No se encontró GROQ_API_KEY ni ANTHROPIC_API_KEY en las variables de entorno."
}
```

---

### `DELETE /api/rag/index`

Elimina completamente el índice BM25 de una colección. Los archivos físicos en disco NO se eliminan.

**Query params:** `?collection=manuales`

**Respuesta:**
```json
{
  "message": "Índice [manuales] eliminado correctamente"
}
```

---

## Códigos de estado HTTP

| Código | Situación |
|--------|-----------|
| `200` | Operación exitosa |
| `400` | Parámetros faltantes o inválidos (ej: no hay archivos, pregunta vacía) |
| `500` | Error interno del servidor (LLM, parseo de archivo, etc.) |
