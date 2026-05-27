# Chatbot de Soporte Técnico

Sistema de soporte técnico interno con interfaz web moderna. Permite a los usuarios consultar soluciones a problemas frecuentes mediante un chatbot que busca respuestas en una base de conocimiento local, sin depender de servicios externos.

## Estructura del proyecto

```
chatbot/
├── server/              ← Backend Express (Node.js)
│   ├── index.js
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
│   └── base.txt         ← Base de conocimiento (editable)
├── pnpm-workspace.yaml
└── package.json
```

## Requisitos

- [Node.js 18+](https://nodejs.org) — descargar el instalador LTS para Windows
- [pnpm](https://pnpm.io) — se instala con un solo comando después de Node.js

## Instalación en Windows

### 1. Instalar Node.js
Descarga e instala la versión LTS desde https://nodejs.org. Marca la opción **"Add to PATH"** durante la instalación.

### 2. Instalar pnpm
Abre **PowerShell** o **CMD** y ejecuta:
```powershell
npm install -g pnpm
```

Verifica que quedó instalado:
```powershell
pnpm --version
```

### 3. Clonar o descargar el proyecto
```powershell
git clone https://github.com/eTordecilla/Chatbot.git
cd Chatbot
```

O descarga el ZIP desde GitHub y descomprímelo. Luego abre la terminal dentro de la carpeta del proyecto.

### 4. Instalar dependencias
```powershell
pnpm install
```

Esto instala automáticamente las dependencias del servidor y del cliente.

### 5. Iniciar la aplicación
```powershell
pnpm dev
```

Abre tu navegador en **http://localhost:5173**

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Inicia servidor y cliente en modo desarrollo |
| `pnpm start` | Inicia en modo producción |
| `pnpm install` | Instala todas las dependencias |

## Puertos

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |

## Base de conocimiento

El archivo de conocimiento está en: **`knowledge/base.txt`**

- Abre el archivo y agrega más contenido al final.
- **No necesitas reiniciar** el servidor — el archivo se lee en cada consulta.

### Formato del archivo:

```
=== NOMBRE DE SECCIÓN ===

PROBLEMA: Descripción del problema
SOLUCIÓN:
1. Paso uno
2. Paso dos

PREGUNTA: ¿Cómo hago algo?
RESPUESTA: Explicación de cómo hacerlo.
```
