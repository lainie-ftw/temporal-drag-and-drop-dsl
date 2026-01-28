import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { WorkflowNodeData } from '../../types/workflow.types';

const ActivityNode: React.FC<NodeProps<WorkflowNodeData>> = ({ data, selected }) => {
  return (
    <div
      style={{
        padding: '10px 20px',
        border: `2px solid ${selected ? '#1976d2' : '#ddd'}`,
        borderRadius: '8px',
        background: '#fff',
        minWidth: '150px',
        boxShadow: selected ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        {data.label}
      </div>
      
      {data.activityName && (
        <div style={{ fontSize: '12px', color: '#666' }}>
          {data.activityName}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(ActivityNode);
