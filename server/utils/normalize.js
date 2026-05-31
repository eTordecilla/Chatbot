const STOPWORDS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas",
  "de", "del", "al", "en", "con", "por", "para",
  "que", "qué", "cómo", "como", "cuando", "cuándo",
  "es", "son", "está", "están", "se", "mi", "me", "no", "si", "sí",
  "y", "o", "a", "e", "i", "u",
  "hay", "puedo", "puede", "tengo", "tiene", "hacer",
  "ha", "han", "he", "hemos",
  "debe", "deben", "ser", "sus",
  "este", "esta", "estos", "estas", "ese", "esa", "su",
  "más", "sin", "sobre", "hasta", "desde", "entre",
  "cada", "todo", "todos",
]);

export function tokenize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}
