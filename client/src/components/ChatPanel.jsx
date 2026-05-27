import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Volume2, MoreHorizontal } from 'lucide-react';

const QUICK_CHIPS = [
  '¿Cómo inicio sesión?',
  'Error al crear pedido',
  '¿Cómo consulto el stock?',
  'Problemas de sincronización',
  '¿Cómo recupero mi contraseña?',
];

function TypingDots() {
  return (
    <div style={styles.typingWrap}>
      {[0,1,2].map(i => (
        <span
          key={i}
          style={{ ...styles.dot, animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  const text = msg.content;

  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^(\d+)\. (.+)$/gm, '<div style="margin:4px 0;"><span style="color:var(--accent);font-weight:600;">$1.</span> $2</div>')
    .replace(/^[-•] (.+)$/gm, '<div style="margin:3px 0;">• $1</div>')
    .replace(/\n/g, '<br/>');

  return (
    <div style={{ ...styles.msgWrap, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && (
        <div style={styles.botAvatar}>
          <span style={styles.eye}/><span style={styles.eye}/>
        </div>
      )}
      <div style={{ maxWidth: '75%' }}>
        <div style={isUser ? styles.userBubble : styles.botBubble}>
          {msg.typing
            ? <TypingDots />
            : <span dangerouslySetInnerHTML={{ __html: formatted }} />}
        </div>
        {!msg.typing && (
          <div style={{ ...styles.timestamp, textAlign: isUser ? 'right' : 'left' }}>
            {msg.time}{isUser && ' ✓✓'}
          </div>
        )}
      </div>
      {isUser && (
        <div style={styles.userAvatar}>YA</div>
      )}
    </div>
  );
}

export default function ChatPanel() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de soporte de **Portal Yamaha** y **Pedidos Yamaha**. ¿En qué puedo ayudarte hoy?',
      time: formatTime(new Date()),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function formatTime(d) {
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  async function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    if (textareaRef.current) { textareaRef.current.style.height = '44px'; }

    const userMsg = { role: 'user', content: msg, time: formatTime(new Date()) };
    setMessages(prev => [...prev, userMsg]);

    const typingMsg = { role: 'assistant', content: '', typing: true, time: '' };
    setMessages(prev => [...prev, typingMsg]);
    setLoading(true);

    const newHistory = [...history, { role: 'user', content: msg }];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history })
      });
      const data = await res.json();
      const reply = data.reply || 'Lo siento, no pude procesar tu consulta.';

      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: reply,
          time: formatTime(new Date())
        };
        return next;
      });

      setHistory([...newHistory, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: '⚠️ No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en el puerto 3001.',
          time: formatTime(new Date())
        };
        return next;
      });
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function autoResize(e) {
    e.target.style.height = '44px';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  return (
    <div style={styles.chat}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.botAvatar2}>
          <span style={styles.eye}/><span style={styles.eye}/>
        </div>
        <div>
          <div style={styles.headerName}>¡Hola! Soy tu asistente Yamaha ✨</div>
          <div style={styles.headerSub}>¿En qué puedo ayudarte hoy?</div>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.iconBtn}><Volume2 size={16} /></button>
          <button style={styles.iconBtn}><MoreHorizontal size={16} /></button>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      <div style={styles.chips}>
        {QUICK_CHIPS.map(c => (
          <button key={c} style={styles.chip} onClick={() => sendMessage(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={styles.inputBar}>
        <button style={styles.iconBtn}><Paperclip size={18} /></button>
        <textarea
          ref={textareaRef}
          style={styles.textarea}
          value={input}
          onChange={e => setInput(e.target.value)}
          onInput={autoResize}
          onKeyDown={handleKey}
          placeholder="Escribe tu mensaje..."
          rows={1}
          disabled={loading}
        />
        <button
          style={{ ...styles.sendBtn, opacity: (!input.trim() || loading) ? 0.5 : 1 }}
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  chat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: 'rgba(11,13,26,0.6)',
    backdropFilter: 'blur(20px)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 20px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-card)',
    flexShrink: 0,
  },
  botAvatar: {
    width: 34, height: 34, borderRadius: '50%',
    border: '1.5px solid var(--accent)',
    boxShadow: '0 0 10px var(--accent-glow)',
    background: 'radial-gradient(circle at 40% 35%, rgba(124,92,255,0.3), rgba(79,126,255,0.1))',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    flexShrink: 0,
  },
  botAvatar2: {
    width: 42, height: 42, borderRadius: '50%',
    border: '2px solid var(--accent)',
    boxShadow: '0 0 16px var(--accent-glow)',
    background: 'radial-gradient(circle at 40% 35%, rgba(124,92,255,0.3), rgba(79,126,255,0.1))',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    flexShrink: 0,
  },
  eye: {
    display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
    background: 'var(--accent)', boxShadow: '0 0 5px var(--accent)',
  },
  userAvatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f7eff, #7c5cff)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  headerName: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
  headerSub:  { fontSize: 12, color: 'var(--text-secondary)' },
  headerActions: { marginLeft: 'auto', display: 'flex', gap: 4 },
  iconBtn: {
    width: 32, height: 32, borderRadius: 8,
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'background 0.15s',
  },
  messages: {
    flex: 1, overflowY: 'auto',
    padding: '20px 20px 12px',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  msgWrap: { display: 'flex', gap: 10, alignItems: 'flex-end' },
  botBubble: {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--border)',
    borderRadius: '16px 16px 16px 4px',
    padding: '10px 14px',
    fontSize: 14, lineHeight: 1.65,
    color: 'var(--text-primary)',
    maxWidth: '100%',
  },
  userBubble: {
    background: 'linear-gradient(135deg, #4f7eff, #7c5cff)',
    borderRadius: '16px 16px 4px 16px',
    padding: '10px 14px',
    fontSize: 14, lineHeight: 1.65, color: '#fff',
  },
  timestamp: { fontSize: 11, color: 'var(--text-muted)', marginTop: 4, paddingInline: 4 },
  typingWrap: { display: 'flex', gap: 5, padding: '4px 2px', alignItems: 'center' },
  dot: {
    display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
    background: 'var(--accent)',
    animation: 'bounce 1.2s infinite ease-in-out',
  },
  chips: {
    padding: '8px 20px',
    display: 'flex', gap: 6, flexWrap: 'wrap',
    borderTop: '1px solid var(--border)',
    flexShrink: 0,
  },
  chip: {
    fontSize: 12, padding: '5px 12px',
    borderRadius: 20,
    background: 'var(--bg-input)',
    border: '1px solid var(--border-accent)',
    color: 'var(--text-secondary)',
    cursor: 'pointer', transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  inputBar: {
    display: 'flex', alignItems: 'flex-end', gap: 8,
    padding: '12px 16px',
    background: 'var(--bg-card)',
    borderTop: '1px solid var(--border)',
    flexShrink: 0,
  },
  textarea: {
    flex: 1,
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 24,
    padding: '11px 18px',
    fontSize: 14,
    color: 'var(--text-primary)',
    resize: 'none',
    outline: 'none',
    height: 44,
    maxHeight: 120,
    lineHeight: 1.4,
    transition: 'border-color 0.15s',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f7eff, #7c5cff)',
    boxShadow: '0 4px 15px rgba(79,126,255,0.4)',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', flexShrink: 0, transition: 'opacity 0.15s',
  },
};
