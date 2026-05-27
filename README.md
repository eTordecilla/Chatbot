# 🎵 Asistente Yamaha — Chatbot de Soporte

Chatbot de soporte técnico para **Portal Yamaha** y **Pedidos Yamaha**, construido con React + Node.js 24.

## Estructura del proyecto

```
yamaha-chatbot/
├── server/              ← Backend Express (Node.js)
│   ├── index.js         ← Servidor API
│   ├── .env             ← Variables de entorno (API key)
│   └── package.json
├── client/              ← Frontend React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   └── RightPanel.jsx
│   │   └── index.css
│   └── package.json
├── knowledge/
│   └── base.txt         ← ★ ARCHIVO DE BASE DE CONOCIMIENTO
└── package.json
```

## Requisitos

- Node.js 24+
- API Key de Anthropic (https://console.anthropic.com)

## Instalación

```bash
# 1. Clonar / descomprimir el proyecto
cd yamaha-chatbot

# 2. Instalar dependencias (raíz + server + client)
npm install
npm run install:all

# 3. Configurar la API Key
#    Edita server/.env y reemplaza tu_api_key_aqui con tu clave real:
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx...

# 4. Iniciar la aplicación (servidor + cliente en paralelo)
npm run dev
```

Abre http://localhost:3000 en tu navegador.

## Base de conocimiento — ★ Lo más importante

El archivo de conocimiento está en: **`knowledge/base.txt`**

**Para actualizar el banco de preguntas:**
- Simplemente **abre el archivo `base.txt`** y agrega más contenido al final.
- **No necesitas reiniciar** el servidor — el archivo se lee en cada consulta.
- Puedes usar cualquier formato: preguntas y respuestas, párrafos, listas.

### Formato recomendado para `base.txt`:

```
PROBLEMA: Descripción del problema
SOLUCIÓN:
1. Paso uno
2. Paso dos
3. Paso tres

PREGUNTA: ¿Cómo hago algo?
RESPUESTA: Explicación de cómo hacerlo...

=== SECCIÓN NUEVA ===

Puedes también escribir texto libre sin formato especial.
El asistente entenderá el contenido de cualquier forma.
```

## Cambiar la ruta del archivo de conocimiento

Si quieres que el archivo `.txt` esté en otra ubicación, edita la línea en `server/index.js`:

```js
const KNOWLEDGE_FILE_PATH = path.resolve(
  __dirname,
  '../knowledge/base.txt'  // ← cambia esto a la ruta que prefieras
);
```

Ejemplos:
```js
// Ruta absoluta en Windows
'C:/Yamaha/DocumentosSoporte/preguntas.txt'

// Ruta absoluta en Linux/Mac
'/home/usuario/yamaha/conocimiento.txt'

// Relativa al servidor
'../mi-carpeta/base.txt'
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia servidor y cliente en modo desarrollo |
| `npm run install:all` | Instala todas las dependencias |

## Puertos

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
