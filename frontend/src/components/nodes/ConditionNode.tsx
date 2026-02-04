import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { WorkflowNodeData } from '../../types/workflow.types';

const ConditionNode: React.FC<NodeProps<WorkflowNodeData>> = ({ data, selected }) => {
  // Extract condition details from arguments
  const variable = data.arguments?.variable || '';
  const operator = data.arguments?.operator || '';
  const value = data.arguments?.value || '';

  const getOperatorSymbol = (op: string): string => {
    switch (op) {
      case 'equals': return '==';
      case 'notEquals': return '!=';
      case 'greaterThan': return '>';
      case 'lessThan': return '<';
      case 'greaterThanOrEqual': return '>=';
      case 'lessThanOrEqual': return '<=';
      case 'exists': return '?';
      case 'notExists': return '!?';
      default: return '?';
    }
  };

  return (
    <div
      style={{
        minWidth: '200px',
        position: 'relative',
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top}
        style={{
          background: selected ? 'var(--primary-500)' : 'var(--secondary-400)',
          width: '10px',
          height: '10px',
          border: '2px solid white',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all var(--transition-fast)',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      
      {/* Diamond shape */}
      <div
        style={{
          width: '120px',
          height: '120px',
          background: 'white',
          border: `2px solid ${selected ? 'var(--warning-500)' : 'var(--warning-300)'}`,
          transform: 'rotate(45deg)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: selected 
            ? '0 8px 24px rgba(245, 158, 11, 0.3), 0 0 0 4px rgba(245, 158, 11, 0.1)'
            : 'var(--shadow-md)',
          transition: 'all var(--transition-fast)',
          position: 'relative',
          margin: '40px auto',
        }}
      >
        {/* Content inside diamond (counter-rotated) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            width: '90%',
            height: '90%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-2)',
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            background: selected 
              ? 'linear-gradient(135deg, var(--warning-500) 0%, var(--warning-600) 100%)'
              : 'var(--warning-100)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            marginBottom: 'var(--space-2)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)',
          }}>
            🔀
          </div>

          <div style={{ 
            fontWeight: 600, 
            fontSize: '0.75rem',
            color: 'var(--secondary-900)',
            textAlign: 'center',
            marginBottom: 'var(--space-1)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}>
            {data.label}
          </div>

          {variable && operator && (
            <div style={{
              fontSize: '0.625rem',
              color: 'var(--warning-700)',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              background: 'var(--warning-50)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--warning-200)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}>
              {variable} {getOperatorSymbol(operator)} {value}
            </div>
          )}
        </div>
      </div>
      
      {/* Success handle (left) */}
      <Handle 
        type="source" 
        position={Position.Left}
        id="success"
        style={{
          background: selected ? 'var(--success-600)' : 'var(--success-500)',
          width: '12px',
          height: '12px',
          border: '2px solid white',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all var(--transition-fast)',
          top: '50%',
          left: '30px',
          transform: 'translateY(-50%)',
        }}
      />
      
      {/* Failure handle (right) */}
      <Handle 
        type="source" 
        position={Position.Right}
        id="failure"
        style={{
          background: selected ? 'var(--danger-600)' : 'var(--danger-500)',
          width: '12px',
          height: '12px',
          border: '2px solid white',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all var(--transition-fast)',
          top: '50%',
          right: '30px',
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  );
};

export default memo(ConditionNode);
