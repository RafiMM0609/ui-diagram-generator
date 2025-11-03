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
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '2px solid #4a90e2',
          transform: 'rotate(45deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(74, 144, 226, 0.2)',
        }}
      >
        <div
          style={{
            transform: 'rotate(-45deg)',
            textAlign: 'center',
            padding: '10px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            overflowWrap: 'break-word',
            maxWidth: '75px',
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
