# Guía de Desarrollo

## Configuración del entorno

```bash
git clone https://github.com/eTordecilla/Chatbot.git
cd Chatbot
pnpm install
# Crear server/.env con las API keys
pnpm dev
```

El servidor usa `node --watch`, por lo que reinicia automáticamente al guardar cambios en `server/`.
El cliente usa Vite HMR para recarga instantánea en el navegador.

---

## Motor de búsqueda BM25

### Descripción

`server/services/vectorStore.js` implementa BM25 sin dependencias externas. Los índices se guardan como JSON en disco y se cargan en memoria al arrancar el servidor.

### Parámetros BM25

```js
const K1 = 1.5;  // Factor de saturación de frecuencia de término
const B  = 0.75; // Factor de normalización por longitud de documento
```

### Clase `BM25Index`

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `docs` | `Array` | Documentos con `{ text, source, chunkIndex, tokens, tf }` |
| `df` | `Object` | Frecuencia de documento por término |
| `avgdl` | `number` | Longitud promedio de documentos |
| `totalDocLength` | `number` | Suma de longitudes para calcular `avgdl` |
| `sourceHashes` | `Object` | Hash MD5 por fuente para deduplicación |

**`tf` pre-computado:** al indexar cada chunk, `addChunks()` calcula la frecuencia de término una sola vez. Las búsquedas posteriores usan `doc.tf[term]` directamente sin recalcular.

**DF incremental:** `addChunks()` actualiza `df` y `totalDocLength` solo con los nuevos documentos, sin recorrer todo el índice. `removeBySource()` necesita recalcular completo porque elimina docs del medio.

**Retrocompatibilidad:** `fromJSON()` reconstruye `tf` automáticamente en índices guardados antes de esta optimización.

### Tokenizador

`server/utils/normalize.js` — compartido por `vectorStore.js` e `index.js`.

```js
tokenize("¿Cómo inicio sesión en Portal Yamaha?")
// → ["inicio", "sesion", "portal", "yamaha"]
```

La lista de stopwords cubre 45+ palabras del español. Los tokens resultantes son palabras de más de 2 caracteres, en minúsculas y sin tildes.

### Colecciones

El sistema soporta múltiples colecciones aisladas. Cada colección tiene:
- Su propio índice en memoria: `_indexes[collection]`
- Su propio archivo JSON: `rag-index-{collection}.json`
- Su propia carpeta de archivos: `knowledge/{collection}/`

Para agregar una nueva colección, simplemente se usa `?collection=nueva-coleccion` en los endpoints — se crea automáticamente.

---

## Servicio RAG

`server/services/ragChain.js`

```
pregunta → queryDocuments(query, 5, collection)
                    ↓
         5 fragmentos BM25 más relevantes
                    ↓
         contexto = fragmentos concatenados con número y fuente
                    ↓
         LLM(system_prompt, contexto + pregunta)
                    ↓
         { answer, sources, chunksUsed }
```

### Selección de proveedor LLM

El sistema elige el proveedor en tiempo de ejecución según las variables de entorno:

```js
function getProvider() {
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  throw new Error("...");
}
```

**Prioridad:** Groq > Anthropic. Para forzar Anthropic, basta con no definir `GROQ_API_KEY`.

### Cambiar el modelo LLM

```js
// server/services/ragChain.js
const MODELS = {
  anthropic: "claude-sonnet-4-6",   // Cambiar aquí
  groq: "llama-3.3-70b-versatile",  // Cambiar aquí
};
```

### Cambiar el número de fragmentos recuperados

```js
// server/services/ragChain.js
const chunks = await queryDocuments(question, 5, collection);
//                                             ^ cambiar este número
```

### Modificar el system prompt

```js
// server/services/ragChain.js
const SYSTEM_PROMPT = `Eres un asistente técnico especializado...`;
```

---

## Parseo de documentos

`server/services/documentParser.js`

### PDF

Usa `unpdf`, una librería JavaScript pura que envuelve PDF.js (Mozilla). No requiere Python ni dependencias externas al entorno Node.js.

```js
import { extractText } from "unpdf";

const buffer = fs.readFileSync(filePath);
const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
```

`mergePages: true` concatena el texto de todas las páginas en un único string. Sin esta opción, `text` sería un array de strings (una entrada por página).

> **Nota sobre `UnknownErrorException: standardFontDataUrl`:** esta advertencia puede aparecer en consola para PDFs con fuentes embebidas no estándar. Es inofensiva — la extracción de texto funciona correctamente.

### DOCX

Usa `mammoth` de forma asíncrona:

```js
const { default: mammoth } = await import("mammoth");
const result = await mammoth.extractRawText({ path: filePath });
```

### Chunking

Los textos se dividen en fragmentos de **800 caracteres** con **150 de overlap** para que el contexto no se corte abruptamente entre fragmentos. Los fragmentos de menos de 80 caracteres se descartan (encabezados, páginas vacías, etc.).

---

## Frontend

### Gestión de estado

No hay Redux ni Context API global. Cada panel maneja su propio estado local con `useState`. La persistencia entre recargas usa `useSessionChat.js` con `sessionStorage`.

```js
const [messages, setMessages] = useSessionMessages('yamaha_chat_messages', INITIAL_MSG);
```

- **Límite:** 100 mensajes almacenados (los más recientes)
- **IDs estables:** cada mensaje tiene un `id` generado con `crypto.randomUUID()` para evitar re-renders innecesarios al usar `key={m.id}`
- **Hydration:** al cargar desde sessionStorage, los mensajes sin `id` (guardados antes de la optimización) reciben uno automáticamente

### Lazy loading

`ManualesPanel` (el panel más pesado, 444 líneas) se carga solo cuando el usuario navega a esa pestaña:

```js
// App.jsx
const ManualesPanel = lazy(() => import("./components/ManualesPanel.jsx"));

// En render:
<Suspense fallback={<Spinner />}>
  <ManualesPanel />
</Suspense>
```

### Notificación de archivo duplicado (DuplicateToast)

`ManualesPanel` muestra un popup ámbar cuando el servidor retorna `status: "skipped"` para uno o más archivos (mismo contenido ya indexado).

```
Backend retorna status: "skipped"
          │
          ▼
handleUpload / handleIngestFolder detecta resultados skipped
          │
          ▼
showToast(files[]) → setToast(files)
          │
          ▼
<DuplicateToast> renderiza sobre el panel (absolute, z-50)
  - Título singular/plural según cantidad
  - Lista de nombres de archivos omitidos
  - Botón × para cerrar manualmente
  - Barra de progreso que se vacía en 4.5 segundos
  - Auto-cierre tras TOAST_DURATION (4500 ms)
```

Si en el mismo upload hay archivos nuevos (`ok`) y duplicados (`skipped`), el chat muestra el mensaje de los indexados y el toast aparece solo para los duplicados — sin mezclar ambas cosas.

### Tema visual

El diseño usa la paleta corporativa Yamaha:
- `#0a2d82` — Azul Yamaha Racing
- `#ff0000` — Rojo Yamaha
- Variables CSS custom en `index.css` para modo claro

---

## Agregar un nuevo módulo

1. Crear el componente en `client/src/components/NuevoPanel.jsx`
2. Agregarlo como lazy import en `App.jsx`:
   ```js
   const NuevoPanel = lazy(() => import("./components/NuevoPanel.jsx"));
   ```
3. Agregar el ítem de navegación en `Sidebar.jsx`:
   ```js
   { id: "nuevo-modulo", label: "Nombre del módulo", renderIcon: () => <Icono /> }
   ```
4. Renderizar condicionalmente en `App.jsx`:
   ```jsx
   {activeNav === "nuevo-modulo" && (
     <Suspense fallback={<Spinner />}>
       <NuevoPanel />
     </Suspense>
   )}
   ```

---

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `GROQ_API_KEY` | Una de las dos | API key de Groq (gratis) |
| `ANTHROPIC_API_KEY` | Una de las dos | API key de Anthropic (de pago) |
| `PORT` | No (default: 3001) | Puerto del servidor Express |

---

## Ramas y flujo de trabajo

| Rama | Propósito |
|------|-----------|
| `main` | Código estable en producción |
| `develop` | Desarrollo activo, merges a main vía PR |

Flujo recomendado:
```bash
git checkout develop
git pull origin develop
# hacer cambios
git add .
git commit -m "feat: descripción del cambio"
git push origin develop
# abrir PR de develop → main en GitHub
```
