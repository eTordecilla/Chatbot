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
    <aside className="w-[220px] shrink-0 bg-(--bg-panel) backdrop-blur-2xl border-r border-(--border) flex flex-col py-5 px-3 relative overflow-hidden">

      {/* Blob decorativo */}
      <div className="absolute w-[200px] h-[200px] rounded-full pointer-events-none -bottom-[60px] -left-[60px]"
           style={{ background: 'radial-gradient(circle, rgba(79,126,255,0.15) 0%, transparent 70%)' }} />

      {/* Bot */}
      <div className="flex flex-col items-center gap-2.5 mb-7 pb-5 border-b border-(--border)">
        <div className="w-16 h-16 rounded-full border-2 border-(--accent) flex items-center justify-center"
             style={{
               boxShadow: '0 0 20px var(--accent-glow), inset 0 0 20px rgba(79,126,255,0.1)',
               background: 'radial-gradient(circle at 40% 35%, rgba(124,92,255,0.3), rgba(79,126,255,0.1))',
             }}>
          <div className="flex flex-col items-center gap-1">
            <div className="flex">
              <span className="inline-block w-2 h-2 rounded-full bg-(--accent) mx-0.75"
                    style={{ boxShadow: '0 0 6px var(--accent)' }} />
              <span className="inline-block w-2 h-2 rounded-full bg-(--accent) mx-0.75"
                    style={{ boxShadow: '0 0 6px var(--accent)' }} />
            </div>
            <span className="block w-3.5 h-1.5 rounded-b-[10px] border-2 border-(--accent) border-t-0"
                  style={{ boxShadow: '0 0 6px var(--accent)' }} />
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-(--text-primary) text-center">Asistente ✨</div>
          <div className="text-[11px] text-(--text-secondary) text-center">Yamaha Support</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5">
        {navItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => onNav(id)}
            className={[
              'flex items-center gap-2.5 py-2.5 rounded-[10px] text-sm transition-all duration-150 text-left w-full cursor-pointer border-none',
              active === id
                ? 'bg-gradient-to-r from-[rgba(79,126,255,0.25)] to-[rgba(124,92,255,0.15)] text-(--text-primary) border-l-2 border-(--accent) pl-2.5 pr-3'
                : 'text-(--text-secondary) px-3',
            ].join(' ')}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Usuario */}
      <div className="flex items-center gap-2 p-2.5 rounded-[10px] bg-(--bg-input) border border-(--border) mt-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
             style={{ background: 'linear-gradient(135deg, #4f7eff, #7c5cff)' }}>
          YA
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-(--text-primary) whitespace-nowrap overflow-hidden text-ellipsis">
            Usuario Yamaha
          </div>
          <div className="text-[11px] text-amber-400">⭐ Cuenta Corporativa</div>
        </div>
        <ChevronDown size={14} color="rgba(200,210,255,0.4)" />
      </div>
    </aside>
  );
}
