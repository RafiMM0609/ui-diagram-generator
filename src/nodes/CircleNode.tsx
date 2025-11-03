import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

function CircleNode({ data }: NodeProps) {
  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          width: '110px',
          height: '110px',
          background: 'linear-gradient(135deg, #ffffff 0%, #fef5e7 100%)',
          border: '2px solid #ffc107',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
          boxShadow: '0 4px 12px rgba(255, 193, 7, 0.2)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            overflowWrap: 'break-word',
            maxWidth: '90px',
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(CircleNode);
