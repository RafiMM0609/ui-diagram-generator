// components/FlowCanvas.jsx
import { useState } from 'react';
import ReactFlow, { useNodesState, useEdgesState, type Node, type Edge } from 'reactflow';
import 'reactflow/dist/style.css';
// import axios from 'axios'; // Untuk memanggil backend

const initialNodes: Node[] = [
  { id: '1', type: 'default', position: { x: 250, y: 50 }, data: { label: 'Start' } },
  { id: '2', type: 'default', position: { x: 250, y: 150 }, data: { label: 'Input Data' } },
  { id: '3', type: 'default', position: { x: 250, y: 250 }, data: { label: 'Process' } },
  { id: '4', type: 'default', position: { x: 100, y: 350 }, data: { label: 'Decision' } },
  { id: '5', type: 'default', position: { x: 400, y: 350 }, data: { label: 'Output' } },
  { id: '6', type: 'default', position: { x: 250, y: 450 }, data: { label: 'End' } },
];
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e3-5', source: '3', target: '5' },
  { id: 'e4-6', source: '4', target: '6' },
  { id: 'e5-6', source: '5', target: '6' },
];

function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  // INI ADALAH FUNGSI KUNCINYA
  const handleGenerateFlow = async () => {
    setIsLoading(true);
    try {
      // 1. Kirim prompt ke backend Anda (bukan ke AI langsung)
      const response = await fetch(`http://127.0.0.1:3000/api/generate/flow?promp=${encodeURIComponent(prompt)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error("Network Error");
      }
      // 4. AI mengembalikan JSON. Backend meneruskannya.
      const flowData = await response.json(); // Ini adalah { nodes: [...], edges: [...] }
      console.log("ini flowdata:", flowData.response);
      
      // Bersihkan string dari markdown code block
      const cleanedString = flowData.response.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      const jsonData = JSON.parse(cleanedString);

      // 5. Integrasi ke React Flow
      // Cukup update state, React Flow akan otomatis menggambar ulang
      
      
      setNodes(jsonData.nodes);
      setEdges(jsonData.edges);

    } catch (error) {
      console.error("Error generating flow:", error);
    }
    setIsLoading(false);
    setShowBubble(false); // Hide bubble after generate
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes pulseButton {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(0,123,255,0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 4px 20px rgba(0,123,255,0.6);
            transform: scale(1.05);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {!isLoading ? (
        <div style={{ height: '100%', width: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
          />
        </div>
      ) : (
        <div style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '5px solid #e0e0e0',
            borderTop: '5px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            marginTop: '20px',
            fontSize: '18px',
            color: '#007bff',
            fontWeight: '500',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            Generating your diagram...
          </p>
        </div>
      )}
      {showBubble && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '20px',
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '15px 20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          maxWidth: '320px',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease-out',
          border: '1px solid #e0e0e0'
        }}>
          <input 
            type="text" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="Describe your diagram..."
            onKeyPress={(e) => e.key === 'Enter' && handleGenerateFlow()}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '15px',
              padding: '8px 0',
              backgroundColor: 'transparent'
            }}
          />
          <button 
            onClick={handleGenerateFlow} 
            disabled={isLoading}
            style={{
              marginTop: '10px',
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              width: '100%',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,123,255,0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#0056b3';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,123,255,0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#007bff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,123,255,0.3)';
              }
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}>
                </span>
                Generating...
              </span>
            ) : "Generate Diagram"}
          </button>
        </div>
      )}
      <div 
        onClick={() => setShowBubble(!showBubble)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#007bff',
          color: 'white',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,123,255,0.4)',
          zIndex: 1001,
          fontSize: '24px',
          transition: 'all 0.3s ease',
          animation: showBubble ? 'none' : 'pulseButton 2s ease-in-out infinite'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,123,255,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,123,255,0.4)';
        }}
      >
        💬
      </div>
    </div>
  );
}

export default FlowCanvas;