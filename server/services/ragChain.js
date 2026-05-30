import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import { queryDocuments } from "./vectorStore.js";

// Modelos por proveedor
const MODELS = {
  anthropic: "claude-sonnet-4-6",
  groq: "llama-3.3-70b-versatile",
};

function getProvider() {
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  throw new Error(
    "No se encontró GROQ_API_KEY ni ANTHROPIC_API_KEY en las variables de entorno."
  );
}

let _anthropic = null;
let _groq = null;

function getAnthropicClient() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

function getGroqClient() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

const SYSTEM_PROMPT = `Eres un asistente técnico especializado de Yamaha Colombia (Incolmotos Yamaha).
Tu función es responder preguntas sobre procedimientos internos, manuales operativos y guías de procesos.

Reglas:
- Responde ÚNICAMENTE con información de los fragmentos proporcionados.
- Si la respuesta no está en los fragmentos, dilo claramente: "No encontré esa información en los manuales disponibles."
- Sé claro, preciso y estructurado. Usa listas numeradas para pasos de procedimientos.
- Cita el documento fuente entre paréntesis cuando sea relevante: (Fuente: nombre_del_documento.pdf)
- No inventes información ni completes con conocimiento general.`;

async function callLLM(provider, context, question) {
  const userContent = `Fragmentos de los manuales:\n\n${context}\n\n---\n\nPregunta: ${question}`;

  if (provider === "anthropic") {
    const msg = await getAnthropicClient().messages.create({
      model: MODELS.anthropic,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });
    return msg.content[0].text;
  }

  // Groq — API compatible con OpenAI chat completions
  const completion = await getGroqClient().chat.completions.create({
    model: MODELS.groq,
    max_tokens: 1500,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });
  return completion.choices[0].message.content;
}

export async function answerQuestion(question) {
  const chunks = await queryDocuments(question, 5);

  if (!chunks.length) {
    return {
      answer: "No encontré información relevante en los manuales indexados. Verifica que los documentos hayan sido cargados correctamente.",
      sources: [],
      chunksUsed: 0,
    };
  }

  const context = chunks
    .map((c, i) => `[Fragmento ${i + 1} — ${c.source}]\n${c.text}`)
    .join("\n\n---\n\n");

  const sources = [...new Set(chunks.map((c) => c.source))];
  const provider = getProvider();

  const answer = await callLLM(provider, context, question);
  console.log(`  [RAG] proveedor: ${provider} | fragmentos: ${chunks.length}`);

  return { answer, sources, chunksUsed: chunks.length };
}
