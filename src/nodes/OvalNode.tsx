import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

function OvalNode({ data }: NodeProps) {
  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          width: '140px',
          height: '60px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)',
          border: '2px solid #28a745',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
          boxShadow: '0 4px 12px rgba(40, 167, 69, 0.2)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            overflowWrap: 'break-word',
            maxWidth: '130px',
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(OvalNode);
