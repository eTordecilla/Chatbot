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
      <div style={styles.bgBlob1} />
      <div style={styles.bgBlob2} />
      <div style={styles.bgBlob3} />

      <div style={styles.shell}>
        <Sidebar active={activeNav} onNav={setActiveNav} />
        <ChatPanel />
        <RightPanel knowledgeStatus={knowledgeStatus} />
      </div>
    </>
  );
}

const styles = {
  bgBlob1: {
    position: 'fixed', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(79,126,255,0.08) 0%, transparent 70%)',
    top: -150, left: '20%', pointerEvents: 'none', zIndex: 0,
  },
  bgBlob2: {
    position: 'fixed', width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,92,255,0.10) 0%, transparent 70%)',
    bottom: -100, right: '10%', pointerEvents: 'none', zIndex: 0,
  },
  bgBlob3: {
    position: 'fixed', width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)',
    top: '40%', left: -100, pointerEvents: 'none', zIndex: 0,
  },
  shell: {
    position: 'relative', zIndex: 1,
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
};
