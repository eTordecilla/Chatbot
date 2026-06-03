# Guía de Uso

## Interfaz general

Al abrir la aplicación en http://localhost:3000 se muestra una interfaz con tres secciones:

```
┌────────────┬──────────────────────────────┬─────────────┐
│  Sidebar   │       Panel central          │ Panel der.  │
│            │                              │             │
│ • Soporte  │  Chat o manuales según       │ Estado base │
│   Pedidos  │  la pestaña activa           │ conocimiento│
│   y Portal │                              │             │
│            │                              │ Frase del   │
│ • Manuales │                              │ día         │
│   y Proce- │                              │             │
│   dimientos│                              │ Clima       │
│            │                              │             │
└────────────┴──────────────────────────────┴─────────────┘
```

---

## Módulo 1 — Soporte Pedidos y Portal Yamaha

### ¿Para qué sirve?

Responde preguntas frecuentes sobre **Portal Yamaha** y **Pedidos Yamaha** usando el banco de preguntas indexado. Ideal para consultar procedimientos de soporte técnico rápidamente.

### Cómo usarlo

1. Haz clic en **"Soporte Pedidos y Portal Yamaha"** en la barra lateral.
2. Escribe tu pregunta en el campo de texto inferior.
3. Presiona **Enter** o el botón de enviar (flecha roja).
4. El asistente busca en el banco de preguntas y responde.

### Ejemplos de preguntas

- `¿Por qué una referencia no se visualiza en Pedidos Yamaha?`
- `Un coordinador no puede ver las tiendas asignadas`
- `Cómo sincronizo un pedido a NAV manualmente`
- `Usuario no aparece en el filtro de búsqueda del portal`
- `Qué hago si una devolución tiene fechas de garantía vencidas`

### Chips rápidos

Debajo del área de mensajes hay cinco botones de acceso rápido:
- ¿Cómo inicio sesión?
- Error al crear pedido
- ¿Cómo consulto el stock?
- Problemas de sincronización
- ¿Cómo recupero mi contraseña?

### Comportamiento del historial

Los mensajes **se conservan al refrescar la página** (sessionStorage) pero se borran al cerrar la pestaña del navegador. Se almacenan un máximo de 100 mensajes.

---

## Módulo 2 — Manuales y Procedimientos Portal

### ¿Para qué sirve?

Permite **subir documentos internos** (PDFs, DOCX) y consultarlos en lenguaje natural. El sistema indexa el contenido, recupera los fragmentos más relevantes y los envía al LLM para generar una respuesta precisa con la fuente citada.

### Subir documentos

1. Haz clic en **"Subir documentos"** (botón esquina superior derecha del panel).
2. Arrastra los archivos al área de carga, o haz clic para seleccionarlos.
3. Formatos soportados: `.pdf` y `.docx` (máximo 50 MB por archivo).
4. El sistema parsea e indexa automáticamente. Al terminar muestra un mensaje en el chat con el número de fragmentos indexados.

**Archivo ya indexado:** si subes un archivo cuyo contenido no ha cambiado, el sistema lo detecta por su hash MD5 y lo omite sin reprocesar. Aparece un **aviso naranja** en la parte superior del panel indicando el nombre del archivo(s) duplicado(s). El aviso se cierra automáticamente a los 4.5 segundos o manualmente con el botón ×.

### Indexar carpeta completa

Si ya tienes documentos en la carpeta `knowledge/manuales/` del servidor, haz clic en **"Indexar carpeta"** en la barra de estado. Útil para cargas masivas o al migrar el sistema.

### Consultar documentos

1. Escribe tu pregunta en lenguaje natural.
2. El sistema busca en los documentos indexados y genera una respuesta.
3. Cada respuesta incluye la(s) fuente(s) citadas (nombre del archivo).

### Limpiar el índice

El botón **"Limpiar índice"** (visible cuando hay documentos indexados) borra completamente el índice BM25. Los archivos físicos en `knowledge/manuales/` no se eliminan; se pueden re-indexar con "Indexar carpeta".

### Ejemplos de preguntas

- `¿Cuáles son los pasos del proceso de garantía?`
- `¿Cómo se realiza la apertura de un caso?`
- `¿Qué documentos se requieren para el proceso?`
- `¿Cuáles son los tiempos de respuesta?`

---

## Panel lateral derecho

### Base de Conocimiento

Muestra si el archivo `BancoDePreguntasPortalYPedidos.txt` está disponible:
- **Punto verde:** archivo encontrado y cargado
- **Punto rojo:** archivo no encontrado

También muestra el tamaño en KB y el número de líneas.

### Frase del día

Cita motivacional con botón de "me gusta" (corazón). El estado del botón persiste solo durante la sesión.

### Clima

Muestra el clima en tiempo real usando tu ubicación:
- Temperatura actual, condición y emoji meteorológico
- Humedad y velocidad del viento
- Pronóstico de los próximos 4 días con precipitación

> El widget solicita permiso de ubicación al navegador. Si se deniega, usa Medellín como ubicación por defecto.

---

## Base de conocimiento de soporte

### Dónde está

`knowledge/BancoDePreguntasPortalYPedidos.txt`

### Cómo agregar preguntas

El archivo usa un formato estructurado con bloques `PROBLEMA/SOLUCIÓN` y `PREGUNTA/RESPUESTA`:

```
=== NOMBRE DE SECCIÓN ===

PROBLEMA: Descripción breve del problema
SOLUCIÓN:
CAUSA: Explicación de la causa.
1. Primer paso de solución.
2. Segundo paso.
NOTA: Información adicional relevante.

PREGUNTA: ¿Cómo se hace algo específico?
RESPUESTA: Explicación directa de cómo hacerlo.
```

### Re-indexación automática

El servidor detecta automáticamente el archivo al arrancar. Si el índice de la colección `soporte` está vacío, lo indexa automáticamente. Para forzar una re-indexación después de modificar el archivo:

```bash
# Opción 1: Reiniciar el servidor (borra el índice en memoria)
# Ctrl+C y luego:
pnpm dev

# Opción 2: Llamar al endpoint de reset y luego ingest-folder
curl -X DELETE "http://localhost:3001/api/rag/index?collection=soporte"
curl -X POST "http://localhost:3001/api/rag/ingest-folder?collection=soporte"
```
