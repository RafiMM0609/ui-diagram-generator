import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from 'reactflow';

// Define the structure for relationship edge data
interface RelationshipEdgeData {
  relationship: string; // e.g., '1:1', '1:N', 'N:N'
}

function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style = {},
}: EdgeProps<RelationshipEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Enhanced edge styling for database relationships
  const edgeStyle = {
    stroke: '#6c5ce7',
    strokeWidth: 2.5,
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
        {data?.relationship && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#ffffff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              border: '2px solid #6c5ce7',
              boxShadow: '0 2px 8px rgba(108, 92, 231, 0.3)',
              pointerEvents: 'all',
              cursor: 'pointer',
              zIndex: 1000,
              color: '#6c5ce7',
              minWidth: '45px',
              textAlign: 'center',
            }}
            className="nodrag nopan react-flow__edge-label"
          >
            {data.relationship}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(RelationshipEdge);
