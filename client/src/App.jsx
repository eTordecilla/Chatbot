import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import RightPanel from './components/RightPanel.jsx';

export default function App() {
  const [activeNav, setActiveNav] = useState('chat');
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
          40%           { transform: translateY(-6px); }
        }
      `}</style>

      {/* Ambient background blobs */}
      <div className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0 -top-[150px] left-[20%]"
           style={{ background: 'radial-gradient(circle, rgba(79,126,255,0.08) 0%, transparent 70%)' }} />
      <div className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0 -bottom-[100px] right-[10%]"
           style={{ background: 'radial-gradient(circle, rgba(124,92,255,0.10) 0%, transparent 70%)' }} />
      <div className="fixed w-[300px] h-[300px] rounded-full pointer-events-none z-0 top-[40%] -left-[100px]"
           style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex h-screen overflow-hidden">
        <Sidebar active={activeNav} onNav={setActiveNav} />
        <ChatPanel />
        <RightPanel knowledgeStatus={knowledgeStatus} />
      </div>
    </>
  );
}
