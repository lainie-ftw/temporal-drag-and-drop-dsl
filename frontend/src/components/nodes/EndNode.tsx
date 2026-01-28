import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

const EndNode: React.FC<NodeProps> = () => {
  return (
    <div
      style={{
        padding: '10px 20px',
        border: '2px solid #f44336',
        borderRadius: '50%',
        background: '#ffebee',
        minWidth: '80px',
        textAlign: 'center',
        fontWeight: 'bold',
      }}
    >
      End
      <Handle type="target" position={Position.Top} />
    </div>
  );
};

export default memo(EndNode);
