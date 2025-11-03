import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

function OvalNode({ data }: NodeProps) {
  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          width: '140px',
          height: '80px',
          background: '#fff',
          border: '2px solid #555',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            fontSize: '12px',
            wordWrap: 'break-word',
            maxWidth: '120px',
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
