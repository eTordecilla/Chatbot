import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Upload, Trash2, FileText, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

function BotAvatar({ size = 34 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg, #0a2d82 0%, #1a4db8 100%)',
        border: `${size < 40 ? '1.5px' : '2px'} solid rgba(10,45,130,0.4)`,
        boxShadow: '0 0 10px rgba(10,45,130,0.25)',
      }}
    >
      <span style={{ color: '#fff', fontWeight: 700, fontSize: size < 40 ? 10 : 12 }}>MP</span>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1.5 py-1 items-center">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full"
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

function SourceBadge({ source }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border mt-1.5"
      style={{ background: 'rgba(10,45,130,0.06)', borderColor: 'rgba(10,45,130,0.2)', color: '#0a2d82' }}
    >
      <FileText size={9} />
      {source}
    </span>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  const formatted = (msg.content || '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^(\d+)\. (.+)$/gm, '<div style="margin:4px 0;"><span style="color:#0a2d82;font-weight:600;">$1.</span> $2</div>')
    .replace(/^[-•] (.+)$/gm, '<div style="margin:3px 0;">• $1</div>')
    .replace(/\n/g, '<br/>');

  return (
    <div className={`flex gap-2.5 items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <BotAvatar size={34} />}
      <div className="max-w-[78%]">
        {isUser ? (
          <div
            className="rounded-[16px_16px_4px_16px] px-3.5 py-2.5 text-sm leading-[1.65] text-white"
            style={{ background: '#0a2d82' }}
          >
            <span dangerouslySetInnerHTML={{ __html: formatted }} />
          </div>
        ) : (
          <div className="bg-(--bg-card) backdrop-blur-md border border-(--border) rounded-[16px_16px_16px_4px] px-3.5 py-2.5 text-sm leading-[1.65] text-(--text-primary)">
            {msg.typing ? <TypingDots /> : <span dangerouslySetInnerHTML={{ __html: formatted }} />}
            {msg.sources?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-(--border)">
                {msg.sources.map(s => <SourceBadge key={s} source={s} />)}
              </div>
            )}
          </div>
        )}
        {!msg.typing && (
          <div className={`text-[11px] text-(--text-muted) mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {msg.time}
          </div>
        )}
      </div>
      {isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
          style={{ background: '#ff0000' }}
        >
          YA
        </div>
      )}
    </div>
  );
}

function StatusBar({ status, onIngestFolder, onReset, loading }) {
  if (!status) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 text-xs border-b border-(--border) shrink-0 flex-wrap"
      style={{ background: 'rgba(10,45,130,0.04)' }}
    >
      <div className="flex items-center gap-1.5">
        {status.connected
          ? <CheckCircle2 size={13} className="text-green-600" />
          : <AlertCircle size={13} className="text-red-500" />}
        <span className={status.connected ? 'text-green-700' : 'text-red-600'}>
          Índice local {status.connected ? 'activo' : 'no disponible'}
        </span>
      </div>
      {status.connected && (
        <span className="text-(--text-secondary)">
          {status.chunks} fragmentos · {status.files?.length ?? 0} documento{status.files?.length !== 1 ? 's' : ''}
        </span>
      )}
      <div className="flex gap-1.5 ml-auto">
        <button
          onClick={onIngestFolder}
          disabled={loading}
          title="Indexar todos los documentos de la carpeta /knowledge/manuales"
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border cursor-pointer disabled:opacity-50 transition-colors"
          style={{ borderColor: '#0a2d82', color: '#0a2d82', background: 'white' }}
        >
          {loading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
          Indexar carpeta
        </button>
        {status.chunks > 0 && (
          <button
            onClick={onReset}
            disabled={loading}
            title="Limpiar el índice vectorial"
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border cursor-pointer disabled:opacity-50 transition-colors"
            style={{ borderColor: '#cc0000', color: '#cc0000', background: 'white' }}
          >
            <Trash2 size={11} />
            Limpiar índice
          </button>
        )}
      </div>
    </div>
  );
}

function DropZone({ onUpload, uploading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => /\.(pdf|docx)$/i.test(f.name));
    if (files.length) onUpload(files);
  }

  function handleChange(e) {
    const files = Array.from(e.target.files);
    if (files.length) onUpload(files);
    e.target.value = '';
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-2 py-5 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150 text-center"
      style={{
        borderColor: dragging ? '#0a2d82' : '#c8d0dc',
        background: dragging ? 'rgba(10,45,130,0.04)' : 'transparent',
      }}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      {uploading
        ? <Loader2 size={24} className="animate-spin" style={{ color: '#0a2d82' }} />
        : <Upload size={24} style={{ color: '#0a2d82', opacity: 0.7 }} />}
      <p className="text-sm text-(--text-secondary)">
        {uploading ? 'Indexando documentos...' : 'Arrastra PDFs o DOCX aquí, o haz clic para seleccionar'}
      </p>
      <p className="text-xs text-(--text-muted)">Máximo 50 MB por archivo</p>
      <input ref={inputRef} type="file" multiple accept=".pdf,.docx" className="hidden" onChange={handleChange} />
    </div>
  );
}

function formatTime(d) {
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

const QUICK_CHIPS = [
  '¿Cuáles son los pasos del proceso de garantía?',
  '¿Cómo se realiza la apertura de un caso?',
  '¿Qué documentos se requieren para el proceso?',
  '¿Cuáles son los tiempos de respuesta?',
];

export default function ManualesPanel() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: '¡Hola! Soy tu asistente de **Manuales y Procedimientos**. Puedo responder preguntas sobre los documentos indexados. Sube tus PDFs o DOCX para comenzar.',
    time: formatTime(new Date()),
    sources: [],
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/rag/status');
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ connected: false, chunks: 0, files: [] });
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleUpload(files) {
    setUploading(true);
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    try {
      const res = await fetch('/api/rag/ingest', { method: 'POST', body: form });
      const data = await res.json();
      const ok = data.results?.filter(r => r.status === 'ok') ?? [];
      const err = data.results?.filter(r => r.status === 'error') ?? [];
      const summary = ok.length
        ? `✅ ${ok.length} documento${ok.length > 1 ? 's' : ''} indexado${ok.length > 1 ? 's' : ''} correctamente (${ok.reduce((a, r) => a + r.chunks, 0)} fragmentos).`
        : '';
      const errMsg = err.length ? ` ⚠️ ${err.length} error${err.length > 1 ? 'es' : ''}: ${err.map(e => e.error).join(', ')}` : '';
      appendBotMsg(summary + errMsg, []);
      await fetchStatus();
      setShowUpload(false);
    } catch {
      appendBotMsg('⚠️ Error al subir los archivos. Revisa la conexión con el servidor.', []);
    }
    setUploading(false);
  }

  async function handleIngestFolder() {
    setIndexing(true);
    try {
      const res = await fetch('/api/rag/ingest-folder', { method: 'POST' });
      const data = await res.json();
      const ok = data.results?.filter(r => r.status === 'ok') ?? [];
      appendBotMsg(
        ok.length
          ? `✅ Se indexaron ${ok.length} documento${ok.length > 1 ? 's' : ''} de la carpeta manuales.`
          : data.message || 'No se encontraron documentos en la carpeta.',
        []
      );
      await fetchStatus();
    } catch {
      appendBotMsg('⚠️ Error al indexar la carpeta.', []);
    }
    setIndexing(false);
  }

  async function handleReset() {
    if (!confirm('¿Seguro que deseas limpiar todo el índice vectorial?')) return;
    await fetch('/api/rag/index', { method: 'DELETE' });
    appendBotMsg('🗑️ Índice vectorial limpiado. Sube o indexa documentos para continuar.', []);
    await fetchStatus();
  }

  function appendBotMsg(content, sources = []) {
    setMessages(prev => [...prev, { role: 'assistant', content, sources, time: formatTime(new Date()) }]);
  }

  async function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '44px';

    setMessages(prev => [...prev,
      { role: 'user', content: msg, time: formatTime(new Date()) },
      { role: 'assistant', content: '', typing: true, time: '', sources: [] },
    ]);
    setLoading(true);

    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: msg }),
      });
      const data = await res.json();
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: data.error ? `⚠️ ${data.error}` : (data.answer || 'Sin respuesta'),
          sources: data.sources || [],
          time: formatTime(new Date()),
        };
        return next;
      });
    } catch {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: '⚠️ No se pudo conectar con el servidor. Verifica que el backend esté corriendo en el puerto 3001.',
          sources: [],
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
        <div className="flex-1">
          <div className="text-sm font-semibold text-(--text-primary)">Manuales y Procedimientos Portal</div>
          <div className="text-xs text-(--text-secondary)">Consulta procedimientos desde los documentos indexados</div>
        </div>
        <button
          onClick={() => setShowUpload(v => !v)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors"
          style={{
            borderColor: showUpload ? '#0a2d82' : '#c8d0dc',
            color: showUpload ? '#0a2d82' : '#616365',
            background: showUpload ? 'rgba(10,45,130,0.06)' : 'white',
          }}
        >
          <Upload size={13} />
          Subir documentos
        </button>
      </div>

      {/* Barra de estado ChromaDB */}
      <StatusBar
        status={status}
        onIngestFolder={handleIngestFolder}
        onReset={handleReset}
        loading={indexing}
      />

      {/* Panel de carga de archivos (colapsable) */}
      {showUpload && (
        <div className="px-5 py-4 border-b border-(--border) bg-(--bg-panel) shrink-0">
          <DropZone onUpload={handleUpload} uploading={uploading} />
          {status?.files?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-(--text-muted) mb-1.5">Documentos en la carpeta:</p>
              <div className="flex flex-wrap gap-1.5">
                {status.files.map(f => (
                  <span
                    key={f}
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border"
                    style={{ background: 'rgba(10,45,130,0.05)', borderColor: 'rgba(10,45,130,0.2)', color: '#0a2d82' }}
                  >
                    <FileText size={10} />{f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-3 flex flex-col gap-3.5">
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      {status?.chunks > 0 && (
        <div className="px-5 py-2 flex gap-1.5 flex-wrap border-t border-(--border) bg-(--bg-panel) shrink-0">
          {QUICK_CHIPS.map(c => (
            <button
              key={c}
              onClick={() => sendMessage(c)}
              disabled={loading}
              className="text-xs py-1 px-3 rounded-[20px] border cursor-pointer whitespace-nowrap transition-all duration-150 disabled:opacity-50"
              style={{ background: '#fff', border: '1px solid #e0e2e4', color: '#616365' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0a2d82'; e.currentTarget.style.color = '#0a2d82'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e2e4'; e.currentTarget.style.color = '#616365'; }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 p-3 px-4 bg-(--bg-panel) border-t border-(--border) shrink-0">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onInput={autoResize}
          onKeyDown={handleKey}
          placeholder={status?.chunks > 0 ? '¿Cómo se realiza este procedimiento?' : 'Sube documentos para comenzar a consultar...'}
          rows={1}
          disabled={loading}
          className="flex-1 border border-(--border) rounded-3xl py-2.5 px-4 text-sm text-(--text-primary) resize-none outline-none leading-[1.4] placeholder:text-(--text-muted)"
          style={{ height: 44, maxHeight: 120, background: '#f2f5f7' }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 cursor-pointer disabled:opacity-50 transition-opacity duration-150"
          style={{ background: '#0a2d82' }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
