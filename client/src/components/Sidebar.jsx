import React from 'react';
import {
  MessageCircle, Compass, CheckSquare, Bell,
  Folder, Clock, Settings, ChevronDown, User
} from 'lucide-react';
import yamahaLogo from '../assets/incolmotos.svg';

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
           style={{ background: 'radial-gradient(circle, rgba(79,126,255,0.15) 0%, transparent 70%)' }} />      {/* Bot */}
      <div className="flex flex-col items-center gap-2.5 mb-7 pb-5 border-b border-(--border)">
        <div className="w-16 h-16 rounded-full border-2 border-(--border) flex items-center justify-center bg-white p-2"
             style={{
               boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
             }}>
          <img src={yamahaLogo} alt="Yamaha" className="w-full h-full object-contain" />
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
      <div 
        className="flex items-center gap-2 p-2.5 rounded-[10px] bg-[#e8eaec] border border-(--border) mt-2 w-full cursor-pointer hover:bg-[#dcdfe2] transition-colors"
      >
        <svg 
          className="w-6 h-6 shrink-0" 
          style={{ color: '#ff0000' }}
          focusable="false" 
          aria-hidden="true" 
          viewBox="0 0 24 24"
        >
          <path 
            fill="currentColor"
            d="M10.25 13c0 .69-.56 1.25-1.25 1.25S7.75 13.69 7.75 13s.56-1.25 1.25-1.25 1.25.56 1.25 1.25M15 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25m7 .25c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10m-2 0c0-.78-.12-1.53-.33-2.24-.7.15-1.42.24-2.17.24-3.13 0-5.92-1.44-7.76-3.69C8.69 8.87 6.6 10.88 4 11.86c.01.04 0 .09 0 .14 0 4.41 3.59 8 8 8s8-3.59 8-8"
          />
        </svg>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[13px] font-medium text-(--text-primary) whitespace-nowrap overflow-hidden text-ellipsis">
            Usuario Yamaha
          </div>
        </div>
        <svg 
          className="w-5 h-5 shrink-0" 
          style={{ color: 'var(--gray10)' }}
          focusable="false" 
          aria-hidden="true" 
          viewBox="0 0 24 24"
        >
          <path 
            fill="currentColor"
            d="M15.88 9.29 12 13.17 8.12 9.29a.996.996 0 0 0-1.41 0c-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41-.39-.38-1.03-.39-1.42 0"
          />
        </svg>
      </div>
    </aside>
  );
}
