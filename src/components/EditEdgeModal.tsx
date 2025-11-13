interface EditEdgeModalProps {
  editingEdgeId: string | null;
  editingEdgeLabel: string;
  setEditingEdgeLabel: (label: string) => void;
  saveEdgeLabel: () => void;
  cancelEdgeEdit: () => void;
  deleteEdge: (edgeId: string) => void;
}

export function EditEdgeModal({
  editingEdgeId,
  editingEdgeLabel,
  setEditingEdgeLabel,
  saveEdgeLabel,
  cancelEdgeEdit,
  deleteEdge,
}: EditEdgeModalProps) {
  if (!editingEdgeId) return null;

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
            border: '2px solid #DCDCDC',
            borderRadius: '8px',
            marginBottom: '15px',
            boxSizing: 'border-box',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          placeholder="e.g., Yes, No, Next..."
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#1E93AB';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#DCDCDC';
          }}
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
          <button
            onClick={() => deleteEdge(editingEdgeId)}
            style={{
              backgroundColor: '#E62727',
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
              onClick={cancelEdgeEdit}
              style={{
                backgroundColor: '#DCDCDC',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#c8c8c8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#DCDCDC';
              }}
            >
              Cancel
            </button>
            <button
              onClick={saveEdgeLabel}
              style={{
                backgroundColor: '#1E93AB',
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
                e.currentTarget.style.backgroundColor = '#167589';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1E93AB';
              }}
            >
              Save Label
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
