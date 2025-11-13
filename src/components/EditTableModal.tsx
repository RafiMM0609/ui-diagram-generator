interface Column {
  id: string;
  name: string;
  type: string;
  isPK: boolean;
  isFK: boolean;
}

interface EditTableModalProps {
  editingTableNodeId: string | null;
  editingTableName: string;
  setEditingTableName: (name: string) => void;
  editingColumns: Column[];
  setEditingColumns: (columns: Column[]) => void;
  saveTableNode: () => void;
  cancelTableEdit: () => void;
  addColumnToTable: () => void;
  updateColumn: (columnId: string, field: string, value: string | boolean) => void;
  deleteColumn: (columnId: string) => void;
  deleteTableNode: (nodeId: string) => void;
}

export function EditTableModal({
  editingTableNodeId,
  editingTableName,
  setEditingTableName,
  editingColumns,
  saveTableNode,
  cancelTableEdit,
  addColumnToTable,
  updateColumn,
  deleteColumn,
  deleteTableNode,
}: EditTableModalProps) {
  if (!editingTableNodeId) return null;

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
        padding: '20px',
      }}
      onClick={cancelTableEdit}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          minWidth: '600px',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '600', color: '#333' }}>
          📊 Edit Table Node
        </h3>
        
        {/* Table Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
            Table Name
          </label>
          <input
            type="text"
            value={editingTableName}
            onChange={(e) => setEditingTableName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: '2px solid #DCDCDC',
              borderRadius: '6px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#1E93AB';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#DCDCDC';
            }}
          />
        </div>

        {/* Columns Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#555' }}>
              Columns
            </label>
            <button
              onClick={addColumnToTable}
              style={{
                backgroundColor: '#1E93AB',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#167589';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1E93AB';
              }}
            >
              ➕ Add Column
            </button>
          </div>

          {/* Column List */}
          <div style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            overflow: 'hidden',
            backgroundColor: '#f8f9fa',
          }}>
            {editingColumns.map((column, index) => (
              <div
                key={column.id}
                style={{
                  padding: '12px',
                  borderBottom: index < editingColumns.length - 1 ? '1px solid #e0e0e0' : 'none',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Column Name */}
                  <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      Name
                    </label>
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => updateColumn(column.id, 'name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '13px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Column Type */}
                  <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      Type
                    </label>
                    <select
                      value={column.type}
                      onChange={(e) => updateColumn(column.id, 'type', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '13px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="INT">INT</option>
                      <option value="VARCHAR">VARCHAR</option>
                      <option value="TEXT">TEXT</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                      <option value="DATE">DATE</option>
                      <option value="DATETIME">DATETIME</option>
                      <option value="TIMESTAMP">TIMESTAMP</option>
                      <option value="DECIMAL">DECIMAL</option>
                      <option value="FLOAT">FLOAT</option>
                      <option value="BIGINT">BIGINT</option>
                    </select>
                  </div>

                  {/* Primary Key Checkbox */}
                  <div style={{ flex: '0 0 auto', paddingTop: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={column.isPK}
                        onChange={(e) => updateColumn(column.id, 'isPK', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span title="Primary Key">🔑 PK</span>
                    </label>
                  </div>

                  {/* Foreign Key Checkbox */}
                  <div style={{ flex: '0 0 auto', paddingTop: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={column.isFK}
                        onChange={(e) => updateColumn(column.id, 'isFK', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span title="Foreign Key">🔗 FK</span>
                    </label>
                  </div>

                  {/* Delete Button */}
                  <div style={{ flex: '0 0 auto', paddingTop: '20px' }}>
                    <button
                      onClick={() => deleteColumn(column.id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#c82333';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc3545';
                      }}
                      title="Delete column"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {editingColumns.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                No columns yet. Click "Add Column" to add one.
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '20px' }}>
          <button
            onClick={() => deleteTableNode(editingTableNodeId)}
            style={{
              backgroundColor: '#E62727',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c21f1f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E62727';
            }}
          >
            🗑️ Delete Table
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={cancelTableEdit}
              style={{
                backgroundColor: '#DCDCDC',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
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
              onClick={saveTableNode}
              style={{
                backgroundColor: '#1E93AB',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#167589';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1E93AB';
              }}
            >
              💾 Save Table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
