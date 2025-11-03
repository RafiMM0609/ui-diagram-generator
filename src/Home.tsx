// FlowCanvas Component - Interactive diagram editor with node creation, editing, and connection capabilities
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, { 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Controls,
  Background,
  MiniMap,
  type Node, 
  type Edge,
  type Connection,
  useReactFlow,
  getNodesBounds
} from 'reactflow';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import 'reactflow/dist/style.css';
import DiamondNode from './nodes/DiamondNode';
import OvalNode from './nodes/OvalNode';
import CircleNode from './nodes/CircleNode';
import CustomEdge from './edges/CustomEdge';

// Constants for node positioning
const NODE_POSITION_RANGE = 400;
const NODE_POSITION_OFFSET = 100;
// PDF Export constants
const PDF_EXPORT_PADDING = 250;
const PDF_FIT_VIEW_DURATION = 200;
const PDF_FIT_VIEW_WAIT_TIME = 300;
// import axios from 'axios'; // Untuk memanggil backend

const initialNodes: Node[] = [
  { id: '1', type: 'oval', position: { x: 250, y: 50 }, data: { label: 'Start' } },
  { id: '2', type: 'default', position: { x: 250, y: 150 }, data: { label: 'Input Data' } },
  { id: '3', type: 'default', position: { x: 250, y: 250 }, data: { label: 'Process' } },
  { id: '4', type: 'diamond', position: { x: 100, y: 350 }, data: { label: 'Decision' } },
  { id: '5', type: 'default', position: { x: 400, y: 350 }, data: { label: 'Output' } },
  { id: '6', type: 'oval', position: { x: 250, y: 450 }, data: { label: 'End' } },
];
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'custom' },
  { id: 'e2-3', source: '2', target: '3', type: 'custom' },
  { id: 'e3-4', source: '3', target: '4', type: 'custom', label: 'Yes' },
  { id: 'e3-5', source: '3', target: '5', type: 'custom', label: 'No' },
  { id: 'e4-6', source: '4', target: '6', type: 'custom' },
  { id: 'e5-6', source: '5', target: '6', type: 'custom' },
];

function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [nodeIdCounter, setNodeIdCounter] = useState(initialNodes.length + 1);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [selectedNodeType, setSelectedNodeType] = useState<string>('default');
  const [editingNodeType, setEditingNodeType] = useState<string>('default');
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [editingEdgeLabel, setEditingEdgeLabel] = useState("");
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { getNodes, fitView } = useReactFlow();

  // Define custom node types
  const nodeTypes = useMemo(() => ({
    diamond: DiamondNode,
    oval: OvalNode,
    circle: CircleNode,
  }), []);

  // Define custom edge types
  const edgeTypes = useMemo(() => ({
    custom: CustomEdge,
  }), []);

  // Handle connecting nodes
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds)),
    [setEdges]
  );

  // Add a new node
  const addNode = useCallback(() => {
    const newNode: Node = {
      id: nodeIdCounter.toString(),
      type: selectedNodeType,
      position: { 
        x: Math.random() * NODE_POSITION_RANGE + NODE_POSITION_OFFSET, 
        y: Math.random() * NODE_POSITION_RANGE + NODE_POSITION_OFFSET 
      },
      data: { label: `Node ${nodeIdCounter}` },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter((id) => id + 1);
  }, [nodeIdCounter, selectedNodeType, setNodes]);

  // Handle node double-click to edit label
  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setEditingNodeId(node.id);
    setEditingLabel(node.data.label as string);
    setEditingNodeType(node.type || 'default');
  }, []);

  // Save the edited label
  const saveNodeLabel = useCallback(() => {
    if (editingNodeId) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === editingNodeId) {
            return {
              ...node,
              type: editingNodeType,
              data: {
                ...node.data,
                label: editingLabel,
              },
            };
          }
          return node;
        })
      );
      setEditingNodeId(null);
      setEditingLabel("");
      setEditingNodeType('default');
    }
  }, [editingNodeId, editingLabel, editingNodeType, setNodes]);

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingNodeId(null);
    setEditingLabel("");
    setEditingNodeType('default');
  }, []);

  // Handle edge double-click to edit label
  const onEdgeDoubleClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setEditingEdgeId(edge.id);
    setEditingEdgeLabel(typeof edge.label === 'string' ? edge.label : '');
  }, []);

  // Save the edited edge label
  const saveEdgeLabel = useCallback(() => {
    if (editingEdgeId) {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === editingEdgeId) {
            return {
              ...edge,
              label: editingEdgeLabel,
            };
          }
          return edge;
        })
      );
      setEditingEdgeId(null);
      setEditingEdgeLabel("");
    }
  }, [editingEdgeId, editingEdgeLabel, setEdges]);

  // Cancel edge editing
  const cancelEdgeEdit = useCallback(() => {
    setEditingEdgeId(null);
    setEditingEdgeLabel("");
  }, []);

  // Delete selected nodes
  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodes.length > 0) {
      const nodeIdsToDelete = selectedNodes.map(node => node.id);
      setNodes((nds) => nds.filter((node) => !nodeIdsToDelete.includes(node.id)));
      // Also remove edges connected to deleted nodes
      setEdges((eds) => eds.filter((edge) => 
        !nodeIdsToDelete.includes(edge.source) && !nodeIdsToDelete.includes(edge.target)
      ));
      setSelectedNodes([]);
    }
  }, [selectedNodes, setNodes, setEdges]);

  // Delete a specific node (for use in the edit modal)
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    // Also remove edges connected to the deleted node
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    setEditingNodeId(null);
    setEditingLabel("");
    setEditingNodeType('default');
  }, [setNodes, setEdges]);

  // Handle keyboard events for deletion
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.key === 'Delete' || event.key === 'Backspace') && !editingNodeId && !editingEdgeId) {
      deleteSelectedNodes();
    }
  }, [deleteSelectedNodes, editingNodeId, editingEdgeId]);

  // Track selected nodes
  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    setSelectedNodes(nodes);
  }, []);

  // Set up keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  // Export canvas to PDF
  const exportToPDF = useCallback(async () => {
    // CALL_FIT_VIEW_BEFORE_SNAPSHOT: Temporarily adjust viewport to fit all elements
    // This ensures all nodes and edges are visible and properly rendered before snapshot
    await fitView({ padding: 0.2, duration: PDF_FIT_VIEW_DURATION });
    
    // Wait for fitView animation to complete
    await new Promise(resolve => setTimeout(resolve, PDF_FIT_VIEW_WAIT_TIME));

    // ADJUST_CANVAS_DIMENSIONS_TO_CONTENT: Calculate actual bounds of all nodes
    const nodesBounds = getNodesBounds(getNodes());
    
    // Add padding to the bounds for better visual appearance
    const width = nodesBounds.width + PDF_EXPORT_PADDING * 2;
    const height = nodesBounds.height + PDF_EXPORT_PADDING * 2;

    // SELECT_CORRECT_BOUNDING_BOX: Target the entire React Flow container
    // This includes the viewport (edges/nodes) and the edge-labels container (rendered via portal)
    const flowElement = reactFlowWrapper.current?.querySelector('.react-flow');
    
    if (!flowElement || !(flowElement instanceof HTMLElement)) {
      console.error('React Flow element not found');
      alert('Failed to find diagram element. Please try again.');
      return;
    }
    
    try {
      // ADJUST_CANVAS_DIMENSIONS_TO_CONTENT: Set canvas dimensions to match content bounds
      const dataUrl = await toPng(flowElement, {
        backgroundColor: '#ffffff',
        width: width,
        height: height,
        pixelRatio: 2, // Higher quality export
        cacheBust: true, // Prevent caching issues
        filter: (node) => {
          // Exclude controls, minimap, and other UI elements from export
          if (!node.classList) return true;
          const exclusionClasses = ['react-flow__controls', 'react-flow__minimap', 'react-flow__background'];
          return !exclusionClasses.some(classname => node.classList.contains(classname));
        },
      });

      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height],
      });

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
        pdf.save('diagram.pdf');
      };
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export diagram to PDF. Please try again.');
    }
  }, [getNodes, fitView]);

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
        <div ref={reactFlowWrapper} style={{ height: '100%', width: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
          </ReactFlow>
          {/* Node Type Selector and Add Node Button */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              zIndex: 5,
            }}
          >
            <select
              value={selectedNodeType}
              onChange={(e) => setSelectedNodeType(e.target.value)}
              style={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '10px 15px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <option value="default">Rectangle</option>
              <option value="diamond">Diamond</option>
              <option value="oval">Oval</option>
              <option value="circle">Circle</option>
            </select>
            <button
              onClick={addNode}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(40,167,69,0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#218838';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(40,167,69,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#28a745';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(40,167,69,0.3)';
              }}
            >
              ➕ Add Node
            </button>
            <button
              onClick={exportToPDF}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(220,53,69,0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#c82333';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220,53,69,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc3545';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(220,53,69,0.3)';
              }}
            >
              📄 Export PDF
            </button>
          </div>
          {/* Instructions */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '100px',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '10px 15px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontSize: '12px',
              color: '#666',
              zIndex: 5,
            }}
          >
            💡 Double-click a node/edge to edit • Drag to connect nodes • Select and press Delete to remove nodes
          </div>
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
      {/* Edit Node Modal */}
      {editingNodeId && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={cancelEdit}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              minWidth: '300px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px' }}>
              Edit Node
            </h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                Label
              </label>
              <input
                type="text"
                value={editingLabel}
                onChange={(e) => setEditingLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveNodeLabel()}
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                Shape
              </label>
              <select
                value={editingNodeType}
                onChange={(e) => setEditingNodeType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="default">Rectangle</option>
                <option value="diamond">Diamond</option>
                <option value="oval">Oval</option>
                <option value="circle">Circle</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <button
                onClick={() => editingNodeId && deleteNode(editingNodeId)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c82333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545';
                }}
              >
                Delete
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={cancelEdit}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveNodeLabel}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Edge Modal */}
      {editingEdgeId && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={cancelEdgeEdit}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              minWidth: '350px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
              Edit Edge Label
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666' }}>
              Add a descriptive label to this connection (e.g., "Yes", "No", "Next")
            </p>
            <input
              type="text"
              value={editingEdgeLabel}
              onChange={(e) => setEditingEdgeLabel(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveEdgeLabel()}
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '15px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              placeholder="e.g., Yes, No, Next..."
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#007bff';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={cancelEdgeEdit}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8e8e8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveEdgeLabel}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#007bff';
                }}
              >
                Save Label
              </button>
            </div>
          </div>
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