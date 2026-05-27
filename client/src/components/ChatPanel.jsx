import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Volume2, MoreHorizontal } from 'lucide-react';

const QUICK_CHIPS = [
  '¿Cómo inicio sesión?',
  'Error al crear pedido',
  '¿Cómo consulto el stock?',
  'Problemas de sincronización',
  '¿Cómo recupero mi contraseña?',
];

function BotAvatar({ size = 34 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size, height: size,
        background: '#0a2d82',
        border: `${size < 40 ? '1.5px' : '2px'} solid rgba(10,45,130,0.4)`,
        boxShadow: '0 0 10px rgba(10,45,130,0.25)',
      }}
    >
      <span style={{ color: '#fff', fontWeight: 700, fontSize: size < 40 ? 11 : 13 }}>YA</span>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1.25 py-1 items-center">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="inline-block w-1.75 h-1.75 rounded-full"
          style={{
            background: '#0a2d82',
            animation: 'bounce 1.2s infinite ease-in-out',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  const formatted = msg.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^(\d+)\. (.+)$/gm, '<div style="margin:4px 0;"><span style="color:#0a2d82;font-weight:600;">$1.</span> $2</div>')
    .replace(/^[-•] (.+)$/gm, '<div style="margin:3px 0;">• $1</div>')
    .replace(/\n/g, '<br/>');

  return (
    <div className={`flex gap-2.5 items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <BotAvatar size={34} />}
      <div className="max-w-[75%]">
        {isUser ? (
          <div
            className="rounded-[16px_16px_4px_16px] px-3.5 py-2.5 text-sm leading-[1.65] text-white"
            style={{ background: '#0a2d82' }}
          >
            {msg.typing ? <TypingDots /> : <span dangerouslySetInnerHTML={{ __html: formatted }} />}
          </div>
        ) : (
          <div className="bg-(--bg-card) backdrop-blur-md border border-(--border) rounded-[16px_16px_16px_4px] px-3.5 py-2.5 text-sm leading-[1.65] text-(--text-primary)">
            {msg.typing ? <TypingDots /> : <span dangerouslySetInnerHTML={{ __html: formatted }} />}
          </div>
        )}
        {!msg.typing && (
          <div className={`text-[11px] text-(--text-muted) mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {msg.time}{isUser && ' ✓✓'}
          </div>
        )}
      </div>
      {isUser && (
        <div
          className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
          style={{ background: '#ff0000' }}
        >
          YA
        </div>
      )}
    </div>
  );
}

function formatTime(d) {
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPanel() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: '¡Hola! Soy tu asistente de soporte de **Portal Yamaha** y **Pedidos Yamaha**. ¿En qué puedo ayudarte hoy?',
    time: formatTime(new Date()),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '44px';

    setMessages(prev => [...prev, { role: 'user', content: msg, time: formatTime(new Date()) }]);
    setMessages(prev => [...prev, { role: 'assistant', content: '', typing: true, time: '' }]);
    setLoading(true);

    const newHistory = [...history, { role: 'user', content: msg }];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      const reply = data.reply || 'Lo siento, no pude procesar tu consulta.';
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'assistant', content: reply, time: formatTime(new Date()) };
        return next;
      });
      setHistory([...newHistory, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: '⚠️ No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en el puerto 3001.',
          time: formatTime(new Date()),
        };
        return next;
      });
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function autoResize(e) {
    e.target.style.height = '44px';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-(--bg-deep)">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-(--border) bg-(--bg-panel) shrink-0">
        <BotAvatar size={42} />
        <div>
          <div className="text-sm font-semibold text-(--text-primary)">¡Hola! Soy tu asistente Yamaha ✨</div>
          <div className="text-xs text-(--text-secondary)">¿En qué puedo ayudarte hoy?</div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-3 flex flex-col gap-3.5">
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      <div className="px-5 py-2 flex gap-1.5 flex-wrap border-t border-(--border) bg-(--bg-panel) shrink-0">
        {QUICK_CHIPS.map(c => (
          <button
            key={c}
            onClick={() => sendMessage(c)}
            className="text-xs py-1.25 px-3 rounded-[20px] border cursor-pointer whitespace-nowrap transition-all duration-150"
            style={{
              background: '#fff',
              border: '1px solid #e0e2e4',
              color: '#616365',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff0000'; e.currentTarget.style.color = '#ff0000'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e2e4'; e.currentTarget.style.color = '#616365'; }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 p-3 px-4 bg-(--bg-panel) border-t border-(--border) shrink-0">
        <button className="w-8 h-8 rounded-lg bg-(--bg-input) border border-(--border) text-(--text-secondary) flex items-center justify-center cursor-pointer">
          <Paperclip size={18} />
        </button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onInput={autoResize}
          onKeyDown={handleKey}
          placeholder="Escribe tu mensaje..."
          rows={1}
          disabled={loading}
          className="flex-1 border border-(--border) rounded-3xl py-2.75 px-4.5 text-sm text-(--text-primary) resize-none outline-none leading-[1.4] placeholder:text-(--text-muted)"
          style={{ height: 44, maxHeight: 120, background: '#f2f5f7' }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 cursor-pointer disabled:opacity-50 transition-opacity duration-150"
          style={{ background: '#ff0000' }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
