import React from 'react';
import { Globe, Quote, Heart, Cloud } from 'lucide-react';

const topics = ['Inicio de sesión', 'Pedidos', 'Inventario', 'Facturación'];

export default function RightPanel({ knowledgeStatus }) {
  const [likedQuote, setLikedQuote] = React.useState(false);

  return (
    <aside style={styles.panel}>
      <div style={styles.blob} />

      {/* Knowledge base */}
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <Globe size={15} color="var(--accent)" />
          <span style={styles.cardTitle}>Base de Conocimiento</span>
          <div style={{ ...styles.statusDot, background: knowledgeStatus?.exists ? '#22c55e' : '#ef4444' }} />
        </div>
        <div style={styles.topics}>
          {topics.map(t => (
            <span key={t} style={styles.topic}>{t}</span>
          ))}
        </div>
        {knowledgeStatus && (
          <div style={styles.kbMeta}>
            {knowledgeStatus.exists
              ? `📂 ${knowledgeStatus.sizeKB} KB · ${knowledgeStatus.lines} líneas`
              : '⚠️ Archivo no encontrado'}
          </div>
        )}
      </section>

      {/* Quote */}
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <Quote size={15} color="var(--accent2)" />
          <span style={styles.cardTitle}>Frase del día</span>
        </div>
        <p style={styles.quoteText}>
          "La excelencia no es un acto, sino un hábito."
        </p>
        <div style={styles.quoteFooter}>
          <span style={styles.quoteAuthor}>— Aristóteles</span>
          <button
            style={{ ...styles.heartBtn, color: likedQuote ? '#ef4444' : 'var(--text-muted)' }}
            onClick={() => setLikedQuote(v => !v)}
          >
            <Heart size={14} fill={likedQuote ? '#ef4444' : 'none'} />
          </button>
        </div>
      </section>

      {/* Weather */}
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <Cloud size={15} color="#60a5fa" />
          <span style={styles.cardTitle}>Clima · Medellín, CO</span>
        </div>
        <div style={styles.weatherRow}>
          <div>
            <div style={styles.weatherTemp}>24°C</div>
            <div style={styles.weatherDesc}>Parcialmente nublado</div>
          </div>
          <div style={styles.weatherCloud}>☁️</div>
        </div>
        <div style={styles.weatherGrid}>
          <div style={styles.weatherStat}><span>Humedad</span><strong>68%</strong></div>
          <div style={styles.weatherStat}><span>Viento</span><strong>14 km/h</strong></div>
          <div style={styles.weatherStat}><span>Sensación</span><strong>22°C</strong></div>
        </div>
      </section>
    </aside>
  );
}

const styles = {
  panel: {
    width: 'var(--right-w)',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: '16px 14px',
    overflowY: 'auto',
    background: 'var(--bg-panel)',
    backdropFilter: 'blur(24px)',
    borderLeft: '1px solid var(--border)',
    position: 'relative',
  },
  blob: {
    position: 'absolute',
    width: 200, height: 200,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 70%)',
    top: -60, right: -60, pointerEvents: 'none',
  },
  card: {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px 14px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 },
  statusDot: { width: 7, height: 7, borderRadius: '50%' },

  topics: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  topic: {
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 20,
    background: 'var(--bg-hover)',
    border: '1px solid var(--border-accent)',
    color: 'var(--accent)',
    cursor: 'pointer',
  },
  kbMeta: { fontSize: 11, color: 'var(--text-muted)', marginTop: 8 },

  quoteText: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 8 },
  quoteFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  quoteAuthor: { fontSize: 12, color: 'var(--text-muted)' },
  heartBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 },

  weatherRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  weatherTemp: { fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 },
  weatherDesc: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 },
  weatherCloud: { fontSize: 36 },
  weatherGrid: { display: 'flex', gap: 8 },
  weatherStat: {
    flex: 1, display: 'flex', flexDirection: 'column', gap: 2,
    fontSize: 11, color: 'var(--text-muted)',
  },
};
