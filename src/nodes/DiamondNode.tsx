import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

function DiamondNode({ data }: NodeProps) {
  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          width: '120px',
          height: '120px',
          background: '#fff',
          border: '2px solid #555',
          transform: 'rotate(45deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            transform: 'rotate(-45deg)',
            textAlign: 'center',
            padding: '10px',
            fontSize: '12px',
            overflowWrap: 'break-word',
            maxWidth: '80px',
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(DiamondNode);
