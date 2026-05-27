import React from 'react';
import {
  MessageCircle, Compass, CheckSquare, Bell,
  Folder, Clock, Settings, ChevronDown
} from 'lucide-react';

const navItems = [
  { icon: MessageCircle, label: 'Chat',          id: 'chat' },
  { icon: Compass,       label: 'Descubre',      id: 'discover' },
  { icon: CheckSquare,   label: 'Tareas',        id: 'tasks' },
  { icon: Bell,          label: 'Recordatorios', id: 'reminders' },
  { icon: Folder,        label: 'Archivos',      id: 'files' },
  { icon: Clock,         label: 'Historial',     id: 'history' },
  { icon: Settings,      label: 'Ajustes',       id: 'settings' },
];

export default function Sidebar({ active, onNav }) {
  return (
    <aside style={styles.sidebar}>
      {/* Background nebula blob */}
      <div style={styles.blob} />

      {/* Logo / Bot */}
      <div style={styles.botArea}>
        <div style={styles.botRing}>
          <div style={styles.botFace}>
            <span style={styles.botEye} /><span style={styles.botEye} />
            <span style={styles.botMouth} />
          </div>
        </div>
        <div>
          <div style={styles.botName}>Asistente ✨</div>
          <div style={styles.botSub}>Yamaha Support</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            style={{ ...styles.navItem, ...(active === id ? styles.navActive : {}) }}
            onClick={() => onNav(id)}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={styles.userArea}>
        <div style={styles.avatar}>YA</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.userName}>Usuario Yamaha</div>
          <div style={styles.userPlan}>⭐ Cuenta Corporativa</div>
        </div>
        <ChevronDown size={14} color="rgba(200,210,255,0.4)" />
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-w)',
    flexShrink: 0,
    background: 'var(--bg-panel)',
    backdropFilter: 'blur(24px)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(79,126,255,0.15) 0%, transparent 70%)',
    bottom: -60,
    left: -60,
    pointerEvents: 'none',
  },
  botArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: '1px solid var(--border)',
  },
  botRing: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    border: '2px solid var(--accent)',
    boxShadow: '0 0 20px var(--accent-glow), inset 0 0 20px rgba(79,126,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at 40% 35%, rgba(124,92,255,0.3), rgba(79,126,255,0.1))',
  },
  botFace: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  botEye: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--accent)',
    boxShadow: '0 0 6px var(--accent)',
    marginInline: 3,
  },
  botMouth: {
    display: 'block',
    width: 14,
    height: 6,
    borderRadius: '0 0 10px 10px',
    border: '2px solid var(--accent)',
    borderTop: 'none',
    boxShadow: '0 0 6px var(--accent)',
  },
  botName: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' },
  botSub:  { fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center' },
  nav:     { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 14,
    color: 'var(--text-secondary)',
    transition: 'all 0.15s',
    textAlign: 'left',
    width: '100%',
  },
  navActive: {
    background: 'linear-gradient(90deg, rgba(79,126,255,0.25), rgba(124,92,255,0.15))',
    color: 'var(--text-primary)',
    borderLeft: '2px solid var(--accent)',
    paddingLeft: 10,
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 8px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    marginTop: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f7eff, #7c5cff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userName: { fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userPlan: { fontSize: 11, color: '#f59e0b' },
};
