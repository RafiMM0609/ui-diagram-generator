import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

// Define the structure for table column data
interface ColumnData {
  id: string;
  name: string;
  type: string;
  isPK: boolean;
  isFK: boolean;
}

// Define the structure for table node data
interface TableNodeData {
  tableName: string;
  columns: ColumnData[];
}

function TableNode({ data }: NodeProps<TableNodeData>) {
  return (
    <div 
      style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #F3F2EC 100%)',
        border: '2px solid #1E93AB',
        borderRadius: '8px',
        minWidth: '250px',
        boxShadow: '0 4px 12px rgba(30, 147, 171, 0.2)',
        overflow: 'hidden',
      }}
    >
      {/* Table Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E93AB 0%, #167589 100%)',
          color: 'white',
          padding: '12px 16px',
          fontWeight: '600',
          fontSize: '15px',
          borderBottom: '2px solid #167589',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '18px' }}>📊</span>
        <span>{data.tableName}</span>
      </div>

      {/* Table Body - Columns List */}
      <div style={{ padding: '0' }}>
        {data.columns.map((column, index) => (
          <div
            key={column.id}
            style={{
              position: 'relative',
              padding: '10px 16px',
              borderBottom: index < data.columns.length - 1 ? '1px solid #DCDCDC' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              backgroundColor: index % 2 === 0 ? '#ffffff' : '#F3F2EC',
              transition: 'background-color 0.2s',
            }}
          >
            {/* Target Handle (left side) for incoming connections */}
            <Handle
              type="target"
              position={Position.Left}
              id={`${column.id}-tgt`}
              style={{
                background: '#1E93AB',
                width: '10px',
                height: '10px',
                border: '2px solid white',
                left: '-5px',
              }}
            />

            {/* Column Content */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Key Indicators */}
              <div style={{ minWidth: '45px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                {column.isPK && (
                  <span 
                    title="Primary Key"
                    style={{ 
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#ffd700',
                      textShadow: '0 0 2px rgba(0,0,0,0.5)',
                      lineHeight: '1',
                    }}
                  >
                    🔑
                  </span>
                )}
                {column.isFK && (
                  <span 
                    title="Foreign Key"
                    style={{ 
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#1E93AB',
                      lineHeight: '1',
                    }}
                  >
                    🔗
                  </span>
                )}
              </div>

              {/* Column Name and Type */}
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: '500', color: '#333' }}>{column.name}</span>
                <span style={{ color: '#999', marginLeft: '8px', fontSize: '12px' }}>
                  {column.type}
                </span>
              </div>
            </div>

            {/* Source Handle (right side) for outgoing connections */}
            <Handle
              type="source"
              position={Position.Right}
              id={`${column.id}-src`}
              style={{
                background: '#1E93AB',
                width: '10px',
                height: '10px',
                border: '2px solid white',
                right: '-5px',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(TableNode);
