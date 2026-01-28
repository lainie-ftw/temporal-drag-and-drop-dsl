import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

const StartNode: React.FC<NodeProps> = () => {
  return (
    <div
      style={{
        padding: '10px 20px',
        border: '2px solid #4caf50',
        borderRadius: '50%',
        background: '#e8f5e9',
        minWidth: '80px',
        textAlign: 'center',
        fontWeight: 'bold',
      }}
    >
      Start
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(StartNode);
