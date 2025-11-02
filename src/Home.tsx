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
      {!isLoading ?<div style={{ height: '100%', width: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        />
      </div>  : <a>Loading</a>}
      {showBubble && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '20px',
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '10px 15px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          maxWidth: '300px',
          zIndex: 1000
        }}>
          <input 
            type="text" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="Buat alur untuk..."
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '16px'
            }}
          />
          <button 
            onClick={handleGenerateFlow} 
            disabled={isLoading}
            style={{
              marginTop: '5px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '5px 10px',
              cursor: 'pointer'
            }}
          >
            {isLoading ? "Generating..." : "Generate"}
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
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1001
        }}
      >
        💬
      </div>
    </div>
  );
}

export default FlowCanvas;