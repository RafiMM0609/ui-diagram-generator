import type { AutoSaveStatus } from '../hooks/useAutoSave';

interface SidebarProps {
  isSidebarVisible: boolean;
  selectedNodeType: string;
  setSelectedNodeType: (type: string) => void;
  addNode: () => void;
  exportToJSON: () => void;
  importFromJSON: () => void;
  exportToPDF: () => void;
  exportToPDFAlternative: () => void;
  clearAutoSave: () => void;
  autoSaveStatus: AutoSaveStatus;
}

export function Sidebar({
  isSidebarVisible,
  selectedNodeType,
  setSelectedNodeType,
  addNode,
  exportToJSON,
  importFromJSON,
  exportToPDF,
  exportToPDFAlternative,
  clearAutoSave,
  autoSaveStatus,
}: SidebarProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '0',
        left: isSidebarVisible ? '0' : '-260px',
        width: '260px',
        height: '90%',
        backgroundColor: '#F3F2EC',
        borderRight: '2px solid #DCDCDC',
        padding: '20px',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflowY: 'auto',
        transition: 'left 0.3s ease-in-out',
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '700', color: '#333', letterSpacing: '0.5px' }}>
        Node Types
      </h3>
      <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
        Click to select, then add to canvas
      </p>
      
      {/* Rectangle Node */}
      <NodeTypeButton
        icon="📦"
        label="Rectangle"
        description="For processes"
        isSelected={selectedNodeType === 'default'}
        onClick={() => setSelectedNodeType('default')}
      />

      {/* Diamond Node */}
      <NodeTypeButton
        icon="🔷"
        label="Diamond"
        description="For decisions"
        isSelected={selectedNodeType === 'diamond'}
        onClick={() => setSelectedNodeType('diamond')}
      />

      {/* Oval Node */}
      <NodeTypeButton
        icon="⭕"
        label="Oval"
        description="For start/end"
        isSelected={selectedNodeType === 'oval'}
        onClick={() => setSelectedNodeType('oval')}
      />

      {/* Circle Node */}
      <NodeTypeButton
        icon="⚫"
        label="Circle"
        description="For connectors"
        isSelected={selectedNodeType === 'circle'}
        onClick={() => setSelectedNodeType('circle')}
      />

      {/* Divider for ERD Section */}
      <div style={{ borderTop: '2px solid #DCDCDC', margin: '15px 0' }}></div>

      {/* Table Node (ERD) */}
      <NodeTypeButton
        icon="📊"
        label="Database Table"
        description="For ERD diagrams"
        isSelected={selectedNodeType === 'tableNode'}
        onClick={() => setSelectedNodeType('tableNode')}
      />

      {/* Add Node Button */}
      <ActionButton
        onClick={addNode}
        icon="➕"
        label="Add to Canvas"
        backgroundColor="#1E93AB"
        hoverColor="#167589"
        style={{ marginTop: '10px' }}
      />

      <div style={{ borderTop: '1px solid #DCDCDC', margin: '10px 0' }}></div>

      <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '700', color: '#333', letterSpacing: '0.5px' }}>
        Export Options
      </h3>
      
      {/* Export to JSON Button */}
      <ActionButton
        onClick={exportToJSON}
        icon="💾"
        label="Export JSON"
        backgroundColor="#1E93AB"
        hoverColor="#167589"
        style={{ marginBottom: '10px' }}
      />

      {/* Import from JSON Button */}
      <ActionButton
        onClick={importFromJSON}
        icon="📂"
        label="Import JSON"
        backgroundColor="#1E93AB"
        hoverColor="#167589"
        style={{ marginBottom: '10px' }}
      />

      {/* Export to PDF Button */}
      <ActionButton
        onClick={exportToPDF}
        icon="📄"
        label="Export PDF"
        backgroundColor="#E62727"
        hoverColor="#c21f1f"
        style={{ marginBottom: '10px' }}
      />

      {/* Export Full PDF Button */}
      <ActionButton
        onClick={exportToPDFAlternative}
        icon="📋"
        label="Export Full"
        backgroundColor="#E62727"
        hoverColor="#c21f1f"
        title="Alternative export method if main export doesn't show edges"
      />

      <div style={{ borderTop: '1px solid #DCDCDC', margin: '15px 0' }}></div>

      {/* Clear Auto-save Button */}
      <ActionButton
        onClick={clearAutoSave}
        icon="🗑️"
        label="Clear Auto-save"
        backgroundColor="#6c757d"
        hoverColor="#545b62"
        style={{ marginBottom: '15px' }}
        title="Clear auto-saved diagram from browser storage"
      />

      {/* Auto-save Status Indicator */}
      <AutoSaveIndicator status={autoSaveStatus} />
    </div>
  );
}

interface NodeTypeButtonProps {
  icon: string;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

function NodeTypeButton({ icon, label, description, isSelected, onClick }: NodeTypeButtonProps) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px',
        backgroundColor: isSelected ? '#1E93AB' : 'white',
        border: isSelected ? '2px solid #1E93AB' : '2px solid #DCDCDC',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: isSelected ? '0 4px 8px rgba(30, 147, 171, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div style={{ fontSize: '28px', lineHeight: '1', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: isSelected ? 'white' : '#333' }}>{label}</div>
        <div style={{ fontSize: '11px', color: isSelected ? 'rgba(255,255,255,0.9)' : '#666', lineHeight: '1.3' }}>{description}</div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  icon: string;
  label: string;
  backgroundColor: string;
  hoverColor: string;
  style?: React.CSSProperties;
  title?: string;
}

function ActionButton({ onClick, icon, label, backgroundColor, hoverColor, style, title }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '14px 20px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '600',
        boxShadow: `0 2px 8px ${backgroundColor}80`,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hoverColor;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 4px 12px ${backgroundColor}80`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = backgroundColor;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 2px 8px ${backgroundColor}80`;
      }}
      title={title}
    >
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function AutoSaveIndicator({ status }: { status: AutoSaveStatus }) {
  return (
    <div style={{
      marginTop: '20px',
      padding: '12px',
      backgroundColor: status === 'saved' ? '#d4edda' : status === 'saving' ? '#fff3cd' : '#f8f9fa',
      borderRadius: '8px',
      border: `2px solid ${status === 'saved' ? '#28a745' : status === 'saving' ? '#ffc107' : '#e0e0e0'}`,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      transition: 'all 0.3s ease',
    }}>
      <span style={{ fontSize: '20px' }}>
        {status === 'saved' ? '✅' : status === 'saving' ? '⏳' : '💾'}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: '600', 
          color: status === 'saved' ? '#155724' : status === 'saving' ? '#856404' : '#666',
          marginBottom: '2px'
        }}>
          {status === 'saved' ? 'Auto-saved' : status === 'saving' ? 'Saving...' : 'Auto-save active'}
        </div>
        <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.3' }}>
          {status === 'saved' ? 'Changes saved automatically' : status === 'saving' ? 'Saving your changes' : 'Changes will be saved automatically'}
        </div>
      </div>
    </div>
  );
}
