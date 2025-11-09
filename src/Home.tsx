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
import TableNode from './nodes/TableNode';
import CustomEdge from './edges/CustomEdge';
import RelationshipEdge from './edges/RelationshipEdge';

// Constants for node positioning
const NODE_POSITION_RANGE = 400;
const NODE_POSITION_OFFSET = 100;
// PDF Export constants
const PDF_EXPORT_PADDING = 150;
const PDF_FIT_VIEW_DURATION = 200;
const PDF_FIT_VIEW_WAIT_TIME = 300;
// import axios from 'axios'; // Untuk memanggil backend

const initialNodes: Node[] = [
  { id: '1', type: 'oval', position: { x: 300, y: 50 }, data: { label: 'Start' } },
  { id: '2', type: 'default', position: { x: 300, y: 180 }, data: { label: 'Input Data' }, style: { background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)', border: '2px solid #2196f3', padding: '12px 20px', borderRadius: '8px', fontWeight: '500', boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)' } },
  { id: '3', type: 'default', position: { x: 300, y: 310 }, data: { label: 'Process' }, style: { background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)', border: '2px solid #2196f3', padding: '12px 20px', borderRadius: '8px', fontWeight: '500', boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)' } },
  { id: '4', type: 'diamond', position: { x: 150, y: 460 }, data: { label: 'Decision' } },
  { id: '5', type: 'default', position: { x: 450, y: 490 }, data: { label: 'Output' }, style: { background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)', border: '2px solid #2196f3', padding: '12px 20px', borderRadius: '8px', fontWeight: '500', boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)' } },
  { id: '6', type: 'oval', position: { x: 300, y: 630 }, data: { label: 'End' } },
  // ERD Example Nodes
  { 
    id: 'erd-1', 
    type: 'tableNode', 
    position: { x: 800, y: 100 }, 
    data: { 
      tableName: 'users',
      columns: [
        { id: 'col-u1', name: 'id', type: 'INT', isPK: true, isFK: false },
        { id: 'col-u2', name: 'username', type: 'VARCHAR', isPK: false, isFK: false },
        { id: 'col-u3', name: 'email', type: 'VARCHAR', isPK: false, isFK: false },
      ]
    }
  },
  { 
    id: 'erd-2', 
    type: 'tableNode', 
    position: { x: 800, y: 400 }, 
    data: { 
      tableName: 'profiles',
      columns: [
        { id: 'col-p1', name: 'id', type: 'INT', isPK: true, isFK: false },
        { id: 'col-p2', name: 'user_id', type: 'INT', isPK: false, isFK: true },
        { id: 'col-p3', name: 'bio', type: 'TEXT', isPK: false, isFK: false },
      ]
    }
  },
];
const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    type: 'custom',
    style: { stroke: '#4a90e2', strokeWidth: 2 },
    animated: true
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3', 
    type: 'custom',
    style: { stroke: '#4a90e2', strokeWidth: 2 },
    animated: true
  },
  { 
    id: 'e3-4', 
    source: '3', 
    target: '4', 
    type: 'custom', 
    label: 'Yes',
    style: { stroke: '#4a90e2', strokeWidth: 2 },
    animated: true
  },
  { 
    id: 'e3-5', 
    source: '3', 
    target: '5', 
    type: 'custom', 
    label: 'No',
    style: { stroke: '#4a90e2', strokeWidth: 2 },
    animated: true
  },
  { 
    id: 'e4-6', 
    source: '4', 
    target: '6', 
    type: 'custom',
    style: { stroke: '#4a90e2', strokeWidth: 2 },
    animated: true
  },
  { 
    id: 'e5-6', 
    source: '5', 
    target: '6', 
    type: 'custom',
    style: { stroke: '#4a90e2', strokeWidth: 2 },
    animated: true
  },
  // ERD Example Edge - Column-level relationship
  { 
    id: 'erd-e1', 
    source: 'erd-1',
    sourceHandle: 'col-u1-src',
    target: 'erd-2',
    targetHandle: 'col-p2-tgt',
    type: 'relationship',
    data: { relationship: '1:N' },
  },
];

function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(initialNodes.length + 1);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [selectedNodeType, setSelectedNodeType] = useState<string>('default');
  const [editingNodeType, setEditingNodeType] = useState<string>('default');
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [editingEdgeLabel, setEditingEdgeLabel] = useState("");
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [generateCount, setGenerateCount] = useState(0);
  const { getNodes, fitView } = useReactFlow();

  // Define custom node types
  const nodeTypes = useMemo(() => ({
    diamond: DiamondNode,
    oval: OvalNode,
    circle: CircleNode,
    tableNode: TableNode,
  }), []);

  // Define custom edge types
  const edgeTypes = useMemo(() => ({
    custom: CustomEdge,
    relationship: RelationshipEdge,
  }), []);

  // Default edge styles for better visibility with animation
  const defaultEdgeOptions = useMemo(() => ({
    type: 'custom',
    animated: true,
    style: {
      stroke: '#4a90e2',
      strokeWidth: 2,
    },
  }), []);

  // Handle connecting nodes
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      type: 'custom',
      animated: true,
      style: {
        stroke: '#4a90e2',
        strokeWidth: 2,
      },
    }, eds)),
    [setEdges]
  );

  // Add a new node
  const addNode = useCallback(() => {
    let nodeData;
    
    // If adding a table node, create sample table data structure
    if (selectedNodeType === 'tableNode') {
      nodeData = {
        tableName: `table_${nodeIdCounter}`,
        columns: [
          { id: `col-${nodeIdCounter}-1`, name: 'id', type: 'INT', isPK: true, isFK: false },
          { id: `col-${nodeIdCounter}-2`, name: 'name', type: 'VARCHAR', isPK: false, isFK: false },
          { id: `col-${nodeIdCounter}-3`, name: 'created_at', type: 'TIMESTAMP', isPK: false, isFK: false },
        ]
      };
    } else {
      // For other node types, use simple label
      nodeData = { label: `Node ${nodeIdCounter}` };
    }

    const newNode: Node = {
      id: nodeIdCounter.toString(),
      type: selectedNodeType,
      position: { 
        x: Math.random() * NODE_POSITION_RANGE + NODE_POSITION_OFFSET, 
        y: Math.random() * NODE_POSITION_RANGE + NODE_POSITION_OFFSET 
      },
      data: nodeData,
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
    try {
      // CALL_FIT_VIEW_BEFORE_SNAPSHOT: Temporarily adjust viewport to fit all elements
      // This ensures all nodes and edges are visible and properly rendered before snapshot
      await fitView({ padding: 0.2, duration: PDF_FIT_VIEW_DURATION });
      
      // Wait for fitView animation to complete and ensure edges are rendered
      await new Promise(resolve => setTimeout(resolve, PDF_FIT_VIEW_WAIT_TIME + 200));

      // ADJUST_CANVAS_DIMENSIONS_TO_CONTENT: Calculate actual bounds of all nodes
      const nodesBounds = getNodesBounds(getNodes());
      
      // Add padding to the bounds for better visual appearance
      const width = nodesBounds.width + PDF_EXPORT_PADDING * 2;
      const height = nodesBounds.height + PDF_EXPORT_PADDING * 2;

      // SELECT_CORRECT_BOUNDING_BOX: Target the viewport specifically to include edges
      // The viewport contains both nodes and edges
      const flowElement = reactFlowWrapper.current?.querySelector('.react-flow__viewport');
      
      if (!flowElement || !(flowElement instanceof HTMLElement)) {
        console.error('React Flow viewport not found, trying main container');
        // Fallback to main container
        const mainFlowElement = reactFlowWrapper.current?.querySelector('.react-flow');
        if (!mainFlowElement || !(mainFlowElement instanceof HTMLElement)) {
          console.error('React Flow element not found');
          alert('Failed to find diagram element. Please try again.');
          return;
        }
      }

      // Use the viewport element or fallback to main flow element
      const targetElement = reactFlowWrapper.current?.querySelector('.react-flow__viewport') || 
                           reactFlowWrapper.current?.querySelector('.react-flow');
      
      if (!targetElement || !(targetElement instanceof HTMLElement)) {
        console.error('No suitable React Flow element found');
        alert('Failed to find diagram element. Please try again.');
        return;
      }
      
      // IMPROVED_FILTER: More precise filtering to preserve edges while excluding UI controls
      const dataUrl = await toPng(targetElement, {
        backgroundColor: '#ffffff',
        width: width,
        height: height,
        pixelRatio: 2, // Higher quality export
        cacheBust: true, // Prevent caching issues
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
        filter: (node) => {
          // Always include elements without classList (like SVG elements for edges)
          if (!node.classList) return true;
          
          // Exclude only specific UI control elements
          const exclusionClasses = [
            'react-flow__controls', 
            'react-flow__minimap',
            'react-flow__panel',
            'react-flow__attribution'
          ];
          
          // Include background for better visual appearance
          if (node.classList.contains('react-flow__background')) {
            return true;
          }
          
          // Explicitly include edge-related elements
          if (node.classList.contains('react-flow__edge') || 
              node.classList.contains('react-flow__edge-path') ||
              node.classList.contains('react-flow__edge-text') ||
              node.classList.contains('react-flow__edge-textbg')) {
            return true;
          }
          
          // Explicitly include node-related elements
          if (node.classList.contains('react-flow__node') ||
              node.classList.contains('react-flow__handle')) {
            return true;
          }
          
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

  // Alternative export function as backup
  const exportToPDFAlternative = useCallback(async () => {
    try {
      await fitView({ padding: 0.1, duration: 500 });
      await new Promise(resolve => setTimeout(resolve, 800));

      // Get the entire react flow container including all sub-elements
      const reactFlowContainer = reactFlowWrapper.current;
      
      if (!reactFlowContainer) {
        alert('Failed to find diagram container. Please try again.');
        return;
      }

      const dataUrl = await toPng(reactFlowContainer, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        // No filter to ensure everything is captured
        skipFonts: true,
        style: {
          width: reactFlowContainer.offsetWidth + 'px',
          height: reactFlowContainer.offsetHeight + 'px',
        }
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [reactFlowContainer.offsetWidth, reactFlowContainer.offsetHeight],
      });

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        pdf.addImage(dataUrl, 'PNG', 0, 0, reactFlowContainer.offsetWidth, reactFlowContainer.offsetHeight);
        pdf.save('diagram-full.pdf');
      };
    } catch (error) {
      console.error('Error in alternative export:', error);
      alert('Failed to export diagram. Please try again.');
    }
  }, [fitView]);

  // INI ADALAH FUNGSI KUNCINYA
  const handleGenerateFlow = async () => {
    if (!prompt.trim()) return; // Don't submit empty prompts
    
    setIsLoading(true);
    try {
      // Add current prompt to history
      setPromptHistory(prev => [...prev, prompt]);
      let finalPrompt = prompt;
      if (generateCount > 0) {
        // Modify prompt to include existing flow context
        const existingFlowSummary = `This is the existing flow chart data in JSON format: ${JSON.stringify({ nodes, edges })}. Please update the flow chart based on the new prompt: "${prompt}". Ensure continuity and coherence with the existing structure.`;
        finalPrompt = existingFlowSummary;
      }
      
      // 1. Kirim prompt ke backend Anda (bukan ke AI langsung)
      const response = await fetch(`http://127.0.0.1:3000/api/generate/flow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promp: finalPrompt }),
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
      
      // Clear the prompt after successful generation
      setPrompt("");
      setGenerateCount(prev => prev + 1);

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
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
          </ReactFlow>
          {/* Left Sidebar with Draggable Node Types */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '240px',
              height: '100%',
              backgroundColor: '#f8f9fa',
              borderRight: '2px solid #e0e0e0',
              padding: '20px',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>
              Node Types
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#666' }}>
              Click to select, then add to canvas
            </p>
            
            {/* Rectangle Node */}
            <div
              onClick={() => setSelectedNodeType('default')}
              style={{
                padding: '12px',
                backgroundColor: selectedNodeType === 'default' ? '#e3f2fd' : 'white',
                border: selectedNodeType === 'default' ? '2px solid #2196f3' : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedNodeType === 'default' ? '0 4px 8px rgba(33, 150, 243, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>📦 Rectangle</div>
              <div style={{ fontSize: '11px', color: '#666' }}>For processes</div>
            </div>

            {/* Diamond Node */}
            <div
              onClick={() => setSelectedNodeType('diamond')}
              style={{
                padding: '12px',
                backgroundColor: selectedNodeType === 'diamond' ? '#e3f2fd' : 'white',
                border: selectedNodeType === 'diamond' ? '2px solid #4a90e2' : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedNodeType === 'diamond' ? '0 4px 8px rgba(74, 144, 226, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>🔷 Diamond</div>
              <div style={{ fontSize: '11px', color: '#666' }}>For decisions</div>
            </div>

            {/* Oval Node */}
            <div
              onClick={() => setSelectedNodeType('oval')}
              style={{
                padding: '12px',
                backgroundColor: selectedNodeType === 'oval' ? '#e8f5e9' : 'white',
                border: selectedNodeType === 'oval' ? '2px solid #28a745' : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedNodeType === 'oval' ? '0 4px 8px rgba(40, 167, 69, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>⭕ Oval</div>
              <div style={{ fontSize: '11px', color: '#666' }}>For start/end</div>
            </div>

            {/* Circle Node */}
            <div
              onClick={() => setSelectedNodeType('circle')}
              style={{
                padding: '12px',
                backgroundColor: selectedNodeType === 'circle' ? '#fff3e0' : 'white',
                border: selectedNodeType === 'circle' ? '2px solid #ffc107' : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedNodeType === 'circle' ? '0 4px 8px rgba(255, 193, 7, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>⚫ Circle</div>
              <div style={{ fontSize: '11px', color: '#666' }}>For connectors</div>
            </div>

            {/* Divider for ERD Section */}
            <div style={{ borderTop: '2px solid #ddd', margin: '15px 0' }}></div>

            {/* Table Node (ERD) */}
            <div
              onClick={() => setSelectedNodeType('tableNode')}
              style={{
                padding: '12px',
                backgroundColor: selectedNodeType === 'tableNode' ? '#f3e8ff' : 'white',
                border: selectedNodeType === 'tableNode' ? '2px solid #6c5ce7' : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedNodeType === 'tableNode' ? '0 4px 8px rgba(108, 92, 231, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>📊 Database Table</div>
              <div style={{ fontSize: '11px', color: '#666' }}>For ERD diagrams</div>
            </div>

            {/* Add Node Button */}
            <button
              onClick={addNode}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(40,167,69,0.3)',
                transition: 'all 0.3s ease',
                marginTop: '10px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#218838';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(40,167,69,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#28a745';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(40,167,69,0.3)';
              }}
            >
              ➕ Add to Canvas
            </button>

            <div style={{ borderTop: '1px solid #ddd', margin: '10px 0' }}></div>

            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>
              Export Options
            </h3>
          </div>
          {/* Top Export Buttons */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '140px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              zIndex: 5,
            }}
          >
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
            <button
              onClick={exportToPDFAlternative}
              style={{
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(111,66,193,0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5a2d91';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(111,66,193,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6f42c1';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(111,66,193,0.3)';
              }}
              title="Alternative export method if main export doesn't show edges"
            >
              📋 Export Full
            </button>
            {/* <button
              onClick={toggleExcelSelectMode}
              style={{
                backgroundColor: isExcelSelectMode ? '#ff6b6b' : '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: isExcelSelectMode ? '0 2px 8px rgba(255,107,107,0.3)' : '0 2px 8px rgba(23,162,184,0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isExcelSelectMode ? '#ff5252' : '#138496';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = isExcelSelectMode ? '0 4px 12px rgba(255,107,107,0.4)' : '0 4px 12px rgba(23,162,184,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isExcelSelectMode ? '#ff6b6b' : '#17a2b8';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isExcelSelectMode ? '0 2px 8px rgba(255,107,107,0.3)' : '0 2px 8px rgba(23,162,184,0.3)';
              }}
              title={isExcelSelectMode ? 'Exit selection mode' : 'Select nodes to export to Excel'}
            >
              {isExcelSelectMode ? '✖ Cancel' : '📊 Select for Excel'}
            </button> */}
            {/* {(isExcelSelectMode || selectedNodesForExcel.size > 0) && (
              <button
                onClick={exportToExcel}
                style={{
                  backgroundColor: '#20c997',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 2px 8px rgba(32,201,151,0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1aa179';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(32,201,151,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#20c997';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(32,201,151,0.3)';
                }}
                title={`Export ${selectedNodesForExcel.size > 0 ? selectedNodesForExcel.size + ' selected' : 'all'} nodes to Excel`}
              >
                📑 Export {selectedNodesForExcel.size > 0 ? `(${selectedNodesForExcel.size})` : 'All'} to Excel
              </button>
            )} */}
          </div>
          {/* Instructions */}
          {/* <div
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
            💡 Double-click a node/edge to edit • Drag to connect nodes • Select and press Delete to remove nodes{isExcelSelectMode ? ' • Click nodes to select/deselect for Excel export' : ' • Use "Select for Excel" to choose specific nodes to export'}
          </div> */}
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
          borderRadius: '16px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
          maxWidth: '420px',
          width: '420px',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease-out',
          border: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '500px',
        }}>
          {/* Prompt History Section */}
          {promptHistory.length > 0 && (
            <div style={{
              padding: '16px 20px 12px 20px',
              borderBottom: '1px solid #f0f0f0',
              maxHeight: '200px',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                📜 Prompt History
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {promptHistory.map((historyPrompt, index) => (
                  <div
                    key={index}
                    style={{
                      fontSize: '13px',
                      color: '#444',
                      backgroundColor: '#f8f9fa',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      wordBreak: 'break-word',
                      lineHeight: '1.4',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setPrompt(historyPrompt)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e9ecef';
                      e.currentTarget.style.borderColor = '#007bff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.borderColor = '#e9ecef';
                    }}
                  >
                    <span style={{ color: '#999', fontSize: '11px', marginRight: '6px' }}>
                      #{index + 1}
                    </span>
                    {historyPrompt}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Section */}
          <div style={{ padding: '16px 20px' }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your diagram in detail..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerateFlow();
                }
              }}
              style={{
                border: '2px solid #e0e0e0',
                outline: 'none',
                width: '100%',
                fontSize: '14px',
                padding: '12px',
                backgroundColor: '#fafafa',
                resize: 'vertical',
                minHeight: '80px',
                maxHeight: '150px',
                borderRadius: '10px',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.backgroundColor = '#fafafa';
              }}
            />
            <div style={{ fontSize: '11px', color: '#999', marginTop: '6px', marginBottom: '10px' }}>
              💡 Press Enter to generate • Shift+Enter for new line
            </div>
            {(() => {
              const isPromptEmpty = !prompt.trim();
              const isDisabled = isLoading || isPromptEmpty;
              return (
                <button
                  onClick={handleGenerateFlow}
                  disabled={isDisabled}
                  style={{
                    backgroundColor: isDisabled ? '#6c757d' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 20px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    width: '100%',
                    transition: 'all 0.3s ease',
                    boxShadow: isDisabled ? 'none' : '0 4px 12px rgba(0,123,255,0.3)',
                    opacity: isDisabled ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isDisabled) {
                      e.currentTarget.style.backgroundColor = '#0056b3';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,123,255,0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDisabled) {
                      e.currentTarget.style.backgroundColor = '#007bff';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)';
                    }
                  }}
                >
                  {isLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '14px',
                        height: '14px',
                        border: '2px solid white',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }}>
                      </span>
                      Generating...
                    </span>
                  ) : "✨ Generate Diagram"}
                </button>
              );
            })()}
          </div>
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