interface EditNodeModalProps {
  editingNodeId: string | null;
  editingLabel: string;
  setEditingLabel: (label: string) => void;
  editingNodeType: string;
  setEditingNodeType: (type: string) => void;
  saveNodeLabel: () => void;
  cancelEdit: () => void;
  deleteNode: (nodeId: string) => void;
}

export function EditNodeModal({
  editingNodeId,
  editingLabel,
  setEditingLabel,
  editingNodeType,
  setEditingNodeType,
  saveNodeLabel,
  cancelEdit,
  deleteNode,
}: EditNodeModalProps) {
  if (!editingNodeId) return null;

  return (
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
            onClick={() => deleteNode(editingNodeId)}
            style={{
              backgroundColor: '#E62727',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c21f1f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E62727';
            }}
          >
            Delete
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={cancelEdit}
              style={{
                backgroundColor: '#DCDCDC',
                color: '#333',
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
                backgroundColor: '#1E93AB',
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
  );
}
