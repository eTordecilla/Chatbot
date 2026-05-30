import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import RightPanel from './components/RightPanel.jsx';

/**
 * App raíz – tema Yamaha corporativo
 * Paleta: Yamaha Red #ff0000 · Blue Racing #0a2d82
 * Tipografía: Source Sans 3 (cargada en index.css)
 */
export default function App() {
  const [activeNav, setActiveNav] = useState('banco-preguntas');
  const [knowledgeStatus, setKnowledgeStatus] = useState(null);

  useEffect(() => {
    fetch('/api/knowledge-status')
      .then(r => r.json())
      .then(setKnowledgeStatus)
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-5px); }
        }
        /* Yamaha red accent line at top */
        .yamaha-topline {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #0a2d82 0%, #ff0000 100%);
          z-index: 100;
        }
      `}</style>

      {/* Yamaha brand top line */}
      <div className="yamaha-topline" />

      {/* Subtle background tint – light, corporate */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'linear-gradient(135deg, #f2f5f7 0%, #eaecf4 100%)' }}
      />

      {/* Very soft blue glow top-right */}
      <div
        className="fixed w-[600px] h-[400px] rounded-full pointer-events-none z-0 -top-[100px] right-[0%]"
        style={{ background: 'radial-gradient(circle, rgba(10,45,130,0.05) 0%, transparent 70%)' }}
      />

      {/* Very soft red glow bottom-left */}
      <div
        className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0 -bottom-[100px] -left-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(255,0,0,0.04) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex h-screen overflow-hidden pt-[3px]">
        <Sidebar active={activeNav} onNav={setActiveNav} />
        {activeNav === 'banco-preguntas' && (
          <>
            <ChatPanel />
            <RightPanel knowledgeStatus={knowledgeStatus} />
          </>
        )}
        {activeNav === 'modulo-2' && (
          <div className="flex-1 flex items-center justify-center bg-(--bg-deep)">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(10,45,130,0.08)' }}>
                <div className="w-8 h-1 rounded-full bg-[#0a2d82] opacity-30" />
              </div>
              <div className="text-lg font-semibold text-(--text-primary)">Módulo 2</div>
              <div className="text-sm text-(--text-secondary) mt-1">Próximamente</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
