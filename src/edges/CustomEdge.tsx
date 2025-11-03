import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from 'reactflow';

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  markerEnd,
  style = {},
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  // Enhanced edge styling for better visibility in exports
  const edgeStyle = {
    stroke: '#333',
    strokeWidth: 2,
    ...style,
  };

  return (
    <>
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
              zIndex: 1000, // Ensure label appears above other elements
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
