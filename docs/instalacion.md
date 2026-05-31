# Guía de Instalación

## Requisitos previos

| Herramienta | Versión mínima | Descarga |
|-------------|---------------|---------|
| Node.js | 18.x LTS | https://nodejs.org |
| pnpm | 8+ | `npm install -g pnpm` |
| Python 3 | 3.8+ | https://python.org |
| pdfminer.six | latest | `pip install pdfminer.six` |

> Al menos una API key es obligatoria: **Groq** (gratuita) o **Anthropic** (de pago).

---

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/eTordecilla/Chatbot.git
cd Chatbot
```

### 2. Instalar dependencias Python

```bash
pip install pdfminer.six
```

Verificar que funciona:

```bash
python3 -c "from pdfminer.high_level import extract_text; print('OK')"
```

### 3. Instalar dependencias Node.js

```bash
pnpm install
```

Esto instala las dependencias del servidor (`server/`) y del cliente (`client/`) en un solo comando gracias a pnpm workspaces.

### 4. Configurar variables de entorno

Crea el archivo `server/.env`:

```env
# Groq (gratuita — preferida)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Anthropic (de pago — opcional)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxx

# Puerto del backend (opcional, default: 3001)
PORT=3001
```

> El sistema usa **Groq si está disponible** (`GROQ_API_KEY`), y cae a Anthropic si no. Con solo una de las dos funciona correctamente.

**Obtener clave de Groq (gratuita):**
1. Regístrate en https://console.groq.com
2. Ve a "API Keys" → "Create API Key"
3. Copia la clave al `.env`

**Obtener clave de Anthropic:**
1. Regístrate en https://console.anthropic.com
2. Ve a "API Keys" → "Create Key"

### 5. Iniciar la aplicación

```bash
pnpm dev
```

El comando inicia ambos procesos en paralelo:
- **Frontend** → http://localhost:3000
- **Backend** → http://localhost:3001

---

## Instalación en Windows

### PowerShell / CMD

```powershell
# 1. Verificar Node.js (debe mostrar v18+)
node --version

# 2. Instalar pnpm
npm install -g pnpm

# 3. Instalar Python (si no está instalado)
# Descargar desde https://python.org → marcar "Add to PATH"

# 4. Instalar pdfminer
pip install pdfminer.six

# 5. Clonar e instalar
git clone https://github.com/eTordecilla/Chatbot.git
cd Chatbot
pnpm install

# 6. Crear server\.env con las API keys

# 7. Iniciar
pnpm dev
```

---

## Verificar que todo funciona

1. Abre http://localhost:3000 — debe cargar la interfaz Yamaha
2. Escribe "cómo inicio sesión" en el chat de Soporte — debe responder con info del banco de preguntas
3. Ve a "Manuales y Procedimientos" — debe mostrar el estado del índice

Si el chat responde pero el panel dice "Índice local no disponible", el servidor está funcionando pero aún no hay documentos indexados en manuales — esto es normal.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia servidor y cliente en desarrollo (hot reload) |
| `pnpm start` | Inicia servidor en producción + cliente en dev |
| `pnpm install` | Instala todas las dependencias del workspace |

---

## Solución de problemas comunes

### `python3: command not found`
- **Linux/Mac:** `sudo apt install python3` / `brew install python3`
- **Windows:** reinstalar Python marcando "Add to PATH"

### `ModuleNotFoundError: pdfminer`
```bash
pip install pdfminer.six
# o si hay múltiples versiones de Python:
pip3 install pdfminer.six
```

### `Error: No se encontró GROQ_API_KEY ni ANTHROPIC_API_KEY`
Verificar que `server/.env` existe y tiene al menos una clave válida.

### Puerto 3001 en uso
Cambiar el puerto en `server/.env`:
```env
PORT=3002
```
Y actualizar el proxy en `client/vite.config.js`:
```js
proxy: { '/api': 'http://localhost:3002' }
```

### El banco de preguntas no carga al iniciar
Verificar que `knowledge/BancoDePreguntasPortalYPedidos.txt` existe. El servidor lo indexa automáticamente en la colección `soporte` al arrancar si el índice está vacío.
