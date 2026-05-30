import { useState, useEffect, useRef } from 'react';

/**
 * Persiste mensajes de chat en sessionStorage.
 * Se mantiene al refrescar; se borra al cerrar la pestaña.
 *
 * @param {string} key         - Clave única de sessionStorage
 * @param {Array}  initialMsgs - Mensajes iniciales si no hay historial guardado
 */
export function useSessionMessages(key, initialMsgs) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Descartar mensajes de "typing" que quedaron por un crash anterior
        return parsed.filter(m => !m.typing);
      }
    } catch { /* sessionStorage bloqueado o JSON inválido */ }
    return initialMsgs;
  });

  const isMounted = useRef(false);

  useEffect(() => {
    // Evitar sobreescribir el estado inicial en el primer render
    if (!isMounted.current) { isMounted.current = true; return; }
    try {
      sessionStorage.setItem(key, JSON.stringify(messages.filter(m => !m.typing)));
    } catch { /* quota exceeded, ignorar */ }
  }, [messages, key]);

  return [messages, setMessages];
}
