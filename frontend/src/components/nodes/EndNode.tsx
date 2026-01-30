import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

const EndNode: React.FC<NodeProps> = () => {
  return (
    <div
      style={{
        minWidth: '100px',
        background: 'linear-gradient(135deg, var(--danger-600) 0%, var(--danger-500) 100%)',
        border: '3px solid var(--danger-700)',
        borderRadius: 'var(--radius-full)',
        padding: 'var(--space-4) var(--space-5)',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '0.9375rem',
        color: 'white',
        boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3), 0 0 0 4px rgba(239, 68, 68, 0.1)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top}
        style={{
          background: 'var(--danger-700)',
          width: '12px',
          height: '12px',
          border: '3px solid white',
          boxShadow: 'var(--shadow-md)',
        }}
      />
      <div style={{
        width: '24px',
        height: '24px',
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1rem',
      }}>
        🏁
      </div>
      End
    </div>
  );
};

export default memo(EndNode);
