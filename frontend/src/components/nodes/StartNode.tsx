import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

const StartNode: React.FC<NodeProps> = () => {
  return (
    <div
      style={{
        minWidth: '100px',
        background: 'linear-gradient(135deg, var(--success-600) 0%, var(--success-500) 100%)',
        border: '3px solid var(--success-700)',
        borderRadius: 'var(--radius-full)',
        padding: 'var(--space-4) var(--space-5)',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '0.9375rem',
        color: 'white',
        boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3), 0 0 0 4px rgba(34, 197, 94, 0.1)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
      }}
    >
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
        ▶️
      </div>
      Start
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{
          background: 'var(--success-700)',
          width: '12px',
          height: '12px',
          border: '3px solid white',
          boxShadow: 'var(--shadow-md)',
        }}
      />
    </div>
  );
};

export default memo(StartNode);
