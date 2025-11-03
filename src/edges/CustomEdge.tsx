import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from 'reactflow';

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  markerEnd,
  style = {},
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Enhanced edge styling with animation for better visibility
  const edgeStyle = {
    stroke: '#4a90e2',
    strokeWidth: 2,
    strokeDasharray: '5,5',
    animation: 'dashdraw 0.5s linear infinite',
    ...style,
  };

  return (
    <>
      <defs>
        <style>{`
          @keyframes dashdraw {
            to {
              stroke-dashoffset: -10;
            }
          }
        `}</style>
      </defs>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={edgeStyle}
      />
      <EdgeLabelRenderer>
        {label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#ffffff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
              border: '1px solid #b1b1b7',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              pointerEvents: 'all',
              cursor: 'pointer',
              zIndex: 1000,
            }}
            className="nodrag nopan react-flow__edge-label"
          >
            {label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge);
