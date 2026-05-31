import { useState, useEffect, useRef } from 'react';

/**
 * Persiste mensajes de chat en sessionStorage.
 * Se mantiene al refrescar; se borra al cerrar la pestaña.
 *
 * @param {string} key         - Clave única de sessionStorage
 * @param {Array}  initialMsgs - Mensajes iniciales si no hay historial guardado
 */
const MAX_STORED_MESSAGES = 100;

export function useSessionMessages(key, initialMsgs) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed
          .filter(m => !m.typing)
          // Asignar IDs a mensajes anteriores que no los tengan
          .map(m => m.id ? m : { ...m, id: crypto.randomUUID() });
      }
    } catch { /* sessionStorage bloqueado o JSON inválido */ }
    return initialMsgs;
  });

  const isMounted = useRef(false);

  useEffect(() => {
    // Evitar sobreescribir el estado inicial en el primer render
    if (!isMounted.current) { isMounted.current = true; return; }
    try {
      const toSave = messages.filter(m => !m.typing).slice(-MAX_STORED_MESSAGES);
      sessionStorage.setItem(key, JSON.stringify(toSave));
    } catch { /* quota exceeded, ignorar */ }
  }, [messages, key]);

  return [messages, setMessages];
}
