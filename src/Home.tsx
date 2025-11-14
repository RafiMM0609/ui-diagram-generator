// FlowCanvas Component - Interactive diagram editor with node creation, editing, and connection capabilities
import { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Controls,
  Background,
  MiniMap,
  useReactFlow,
  type Node, 
  type Edge,
  type Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import DiamondNode from './nodes/DiamondNode';
import OvalNode from './nodes/OvalNode';
import CircleNode from './nodes/CircleNode';
import TableNode from './nodes/TableNode';
import CustomEdge from './edges/CustomEdge';
import RelationshipEdge from './edges/RelationshipEdge';
import { useAutoSave, useKeyboardShortcuts, useFlowExport } from './hooks';
import {
  Sidebar,
  EditNodeModal,
  EditEdgeModal,
  EditTableModal,
  PromptBubble,
  FloatingActionButton,
  SidebarToggleButton,
  LoadingScreen,
} from './components';

const initialNodes: Node[] = [
  { id: '1', type: 'oval', position: { x: 300, y: 50 }, data: { label: 'Start' } },
  { id: '2', type: 'default', position: { x: 300, y: 180 }, data: { label: 'Input Data' }, style: { background: 'linear-gradient(135deg, #ffffff 0%, #F3F2EC 100%)', border: '2px solid #1E93AB', padding: '12px 20px', borderRadius: '8px', fontWeight: '500', boxShadow: '0 4px 12px rgba(30, 147, 171, 0.2)' } },
  { id: '3', type: 'default', position: { x: 300, y: 310 }, data: { label: 'Process' }, style: { background: 'linear-gradient(135deg, #ffffff 0%, #F3F2EC 100%)', border: '2px solid #1E93AB', padding: '12px 20px', borderRadius: '8px', fontWeight: '500', boxShadow: '0 4px 12px rgba(30, 147, 171, 0.2)' } },
  { id: '4', type: 'diamond', position: { x: 150, y: 460 }, data: { label: 'Decision' } },
  { id: '5', type: 'default', position: { x: 450, y: 490 }, data: { label: 'Output' }, style: { background: 'linear-gradient(135deg, #ffffff 0%, #F3F2EC 100%)', border: '2px solid #1E93AB', padding: '12px 20px', borderRadius: '8px', fontWeight: '500', boxShadow: '0 4px 12px rgba(30, 147, 171, 0.2)' } },
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
  const [editingNodeType, setEditingNodeType] = useState<string>('default');
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [editingEdgeLabel, setEditingEdgeLabel] = useState("");
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const [generateCount, setGenerateCount] = useState(0);
  
  // State for editing table nodes
  const [editingTableNodeId, setEditingTableNodeId] = useState<string | null>(null);
  const [editingTableName, setEditingTableName] = useState("");
  const [editingColumns, setEditingColumns] = useState<Array<{
    id: string;
    name: string;
    type: string;
    isPK: boolean;
    isFK: boolean;
  }>>([]);
  
  // State for sidebar visibility
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);

  // Custom hooks
  const { autoSaveStatus, setAutoSaveStatus, clearAutoSave, AUTO_SAVE_KEY } = useAutoSave(nodes, edges);
  const { reactFlowWrapper, exportToPDF, exportToPDFAlternative, exportToJSON, importFromJSON } = useFlowExport(nodes, edges);
  
  // ReactFlow instance for coordinate conversion
  const { screenToFlowPosition } = useReactFlow();

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

  // Handle drag over to allow drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop to add node at the drop position
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      
      // Check if a valid node type was dragged
      if (!type) {
        return;
      }

      // Get the drop position in flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Create node data based on type
      let nodeData;
      if (type === 'tableNode') {
        nodeData = {
          tableName: `table_${nodeIdCounter}`,
          columns: [
            { id: `col-${nodeIdCounter}-1`, name: 'id', type: 'INT', isPK: true, isFK: false },
            { id: `col-${nodeIdCounter}-2`, name: 'name', type: 'VARCHAR', isPK: false, isFK: false },
            { id: `col-${nodeIdCounter}-3`, name: 'created_at', type: 'TIMESTAMP', isPK: false, isFK: false },
          ]
        };
      } else {
        nodeData = { label: `Node ${nodeIdCounter}` };
      }

      // Create the new node
      const newNode: Node = {
        id: nodeIdCounter.toString(),
        type,
        position,
        data: nodeData,
      };

      // Add the new node to the canvas
      setNodes((nds) => [...nds, newNode]);
      setNodeIdCounter((id) => id + 1);
    },
    [screenToFlowPosition, nodeIdCounter, setNodes]
  );

  // Handle node double-click to edit label
  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.type === 'tableNode') {
      setEditingTableNodeId(node.id);
      setEditingTableName(node.data.tableName as string);
      setEditingColumns(node.data.columns as Array<{
        id: string;
        name: string;
        type: string;
        isPK: boolean;
        isFK: boolean;
      }>);
    } else {
      setEditingNodeId(node.id);
      setEditingLabel(node.data.label as string);
      setEditingNodeType(node.type || 'default');
    }
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
  
  // Save table node edits
  const saveTableNode = useCallback(() => {
    if (editingTableNodeId) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === editingTableNodeId) {
            return {
              ...node,
              data: {
                tableName: editingTableName,
                columns: editingColumns,
              },
            };
          }
          return node;
        })
      );
      setEditingTableNodeId(null);
      setEditingTableName("");
      setEditingColumns([]);
    }
  }, [editingTableNodeId, editingTableName, editingColumns, setNodes]);
  
  // Cancel table node editing
  const cancelTableEdit = useCallback(() => {
    setEditingTableNodeId(null);
    setEditingTableName("");
    setEditingColumns([]);
  }, []);
  
  // Add a new column to the table being edited
  const addColumnToTable = useCallback(() => {
    const newColumnId = `col-${Date.now()}`;
    setEditingColumns((cols) => [
      ...cols,
      {
        id: newColumnId,
        name: 'new_column',
        type: 'VARCHAR',
        isPK: false,
        isFK: false,
      },
    ]);
  }, []);
  
  // Update a column in the table being edited
  const updateColumn = useCallback((columnId: string, field: string, value: string | boolean) => {
    setEditingColumns((cols) =>
      cols.map((col) => {
        if (col.id === columnId) {
          return { ...col, [field]: value };
        }
        return col;
      })
    );
  }, []);
  
  // Delete a column from the table being edited
  const deleteColumn = useCallback((columnId: string) => {
    setEditingColumns((cols) => cols.filter((col) => col.id !== columnId));
  }, []);
  
  // Delete a table node
  const deleteTableNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    setEditingTableNodeId(null);
    setEditingTableName("");
    setEditingColumns([]);
  }, [setNodes, setEdges]);

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

  // Delete a specific edge
  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    setEditingEdgeId(null);
    setEditingEdgeLabel("");
  }, [setEdges]);

  // Delete selected nodes
  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodes.length > 0) {
      const nodeIdsToDelete = selectedNodes.map(node => node.id);
      setNodes((nds) => nds.filter((node) => !nodeIdsToDelete.includes(node.id)));
      setEdges((eds) => eds.filter((edge) => 
        !nodeIdsToDelete.includes(edge.source) && !nodeIdsToDelete.includes(edge.target)
      ));
      setSelectedNodes([]);
    }
  }, [selectedNodes, setNodes, setEdges]);

  // Delete selected edges
  const deleteSelectedEdges = useCallback(() => {
    if (selectedEdges.length > 0) {
      const edgeIdsToDelete = selectedEdges.map(edge => edge.id);
      setEdges((eds) => eds.filter((edge) => !edgeIdsToDelete.includes(edge.id)));
      setSelectedEdges([]);
    }
  }, [selectedEdges, setEdges]);

  // Delete a specific node (for use in the edit modal)
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    setEditingNodeId(null);
    setEditingLabel("");
    setEditingNodeType('default');
  }, [setNodes, setEdges]);

  // Track selected nodes and edges
  const onSelectionChange = useCallback(({ nodes, edges }: { nodes: Node[], edges: Edge[] }) => {
    setSelectedNodes(nodes);
    setSelectedEdges(edges);
  }, []);

  // Use keyboard shortcuts hook
  useKeyboardShortcuts({
    deleteSelectedNodes,
    deleteSelectedEdges,
    editingNodeId,
    editingEdgeId,
    editingTableNodeId,
  });

  // Auto-load saved diagram from localStorage on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(AUTO_SAVE_KEY);
      if (savedData) {
        const flowData = JSON.parse(savedData);
        if (flowData.nodes && flowData.edges) {
          setNodes(flowData.nodes);
          setEdges(flowData.edges);
          
          const maxId = flowData.nodes.reduce((max: number, node: Node) => {
            const nodeId = parseInt(node.id);
            return isNaN(nodeId) ? max : Math.max(max, nodeId);
          }, 0);
          setNodeIdCounter(maxId + 1);
          
          setAutoSaveStatus('saved');
          console.log('Auto-loaded diagram from localStorage');
        }
      }
    } catch (error) {
      console.error('Error loading auto-saved diagram:', error);
    }
  }, [setNodes, setEdges, AUTO_SAVE_KEY, setAutoSaveStatus]);

  // Handle AI diagram generation
  const handleGenerateFlow = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      setPromptHistory(prev => [...prev, prompt]);
      let finalPrompt = prompt;
      if (generateCount > 0) {
        const existingFlowSummary = `This is the existing flow chart data in JSON format: ${JSON.stringify({ nodes, edges })}. Please update the flow chart based on the new prompt: "${prompt}". Ensure continuity and coherence with the existing structure.`;
        finalPrompt = existingFlowSummary;
      }
      
      const response = await fetch(`http://127.0.0.1:5000/api/generate/flow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promp: finalPrompt }),
      });
      if (!response.ok) {
        throw new Error("Network Error");
      }
      const flowData = await response.json();
      console.log("ini flowdata:", flowData.response);
      
      const cleanedString = flowData.response.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      const jsonData = JSON.parse(cleanedString);
      
      setNodes(jsonData.nodes);
      setEdges(jsonData.edges);
      
      setPrompt("");
      setGenerateCount(prev => prev + 1);

    } catch (error) {
      console.error("Error generating flow:", error);
    }
    setIsLoading(false);
    setShowBubble(false);
  };

  const handleImportJSON = useCallback(() => {
    importFromJSON(setNodes, setEdges, setNodeIdCounter);
  }, [importFromJSON, setNodes, setEdges]);

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
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
          </ReactFlow>
          
          <Sidebar
            isSidebarVisible={isSidebarVisible}
            exportToJSON={exportToJSON}
            importFromJSON={handleImportJSON}
            exportToPDF={exportToPDF}
            exportToPDFAlternative={exportToPDFAlternative}
            clearAutoSave={clearAutoSave}
            autoSaveStatus={autoSaveStatus}
          />

          <SidebarToggleButton
            isSidebarVisible={isSidebarVisible}
            setIsSidebarVisible={setIsSidebarVisible}
          />
        </div>
      ) : (
        <LoadingScreen />
      )}
      
      <EditNodeModal
        editingNodeId={editingNodeId}
        editingLabel={editingLabel}
        setEditingLabel={setEditingLabel}
        editingNodeType={editingNodeType}
        setEditingNodeType={setEditingNodeType}
        saveNodeLabel={saveNodeLabel}
        cancelEdit={cancelEdit}
        deleteNode={deleteNode}
      />
      
      <EditEdgeModal
        editingEdgeId={editingEdgeId}
        editingEdgeLabel={editingEdgeLabel}
        setEditingEdgeLabel={setEditingEdgeLabel}
        saveEdgeLabel={saveEdgeLabel}
        cancelEdgeEdit={cancelEdgeEdit}
        deleteEdge={deleteEdge}
      />
      
      <EditTableModal
        editingTableNodeId={editingTableNodeId}
        editingTableName={editingTableName}
        setEditingTableName={setEditingTableName}
        editingColumns={editingColumns}
        setEditingColumns={setEditingColumns}
        saveTableNode={saveTableNode}
        cancelTableEdit={cancelTableEdit}
        addColumnToTable={addColumnToTable}
        updateColumn={updateColumn}
        deleteColumn={deleteColumn}
        deleteTableNode={deleteTableNode}
      />
      
      <PromptBubble
        showBubble={showBubble}
        prompt={prompt}
        setPrompt={setPrompt}
        promptHistory={promptHistory}
        isLoading={isLoading}
        handleGenerateFlow={handleGenerateFlow}
      />
      
      <FloatingActionButton
        showBubble={showBubble}
        setShowBubble={setShowBubble}
      />
    </div>
  );
}

export default FlowCanvas;
