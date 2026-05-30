import Anthropic from "@anthropic-ai/sdk";
import { queryDocuments } from "./vectorStore.js";

let _client = null;
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

const SYSTEM_PROMPT = `Eres un asistente técnico especializado de Yamaha Colombia (Incolmotos Yamaha).
Tu función es responder preguntas sobre procedimientos internos, manuales operativos y guías de procesos.

Reglas:
- Responde ÚNICAMENTE con información de los fragmentos proporcionados.
- Si la respuesta no está en los fragmentos, dilo claramente: "No encontré esa información en los manuales disponibles."
- Sé claro, preciso y estructurado. Usa listas numeradas para pasos de procedimientos.
- Cita el documento fuente entre paréntesis cuando sea relevante: (Fuente: nombre_del_documento.pdf)
- No inventes información ni completes con conocimiento general.`;

export async function answerQuestion(question) {
  const chunks = await queryDocuments(question, 5);

  if (!chunks.length) {
    return {
      answer:
        "No encontré información relevante en los manuales indexados. Verifica que los documentos hayan sido cargados correctamente.",
      sources: [],
      chunksUsed: 0,
    };
  }

  // BM25: score > 0 ya indica relevancia; chunks viene preordenado
  const relevant = chunks;

  const context = relevant
    .map((c, i) => `[Fragmento ${i + 1} — ${c.source}]\n${c.text}`)
    .join("\n\n---\n\n");

  const sources = [...new Set(relevant.map((c) => c.source))];

  const message = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Fragmentos de los manuales:\n\n${context}\n\n---\n\nPregunta: ${question}`,
      },
    ],
  });

  return {
    answer: message.content[0].text,
    sources,
    chunksUsed: relevant.length,
  };
}
