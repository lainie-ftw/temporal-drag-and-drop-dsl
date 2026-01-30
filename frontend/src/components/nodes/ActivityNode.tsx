import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { WorkflowNodeData } from '../../types/workflow.types';

const ActivityNode: React.FC<NodeProps<WorkflowNodeData>> = ({ data, selected }) => {
  const getActivityIcon = (name: string): string => {
    if (!name) return '⚡';
    if (name.toLowerCase().includes('email') || name.toLowerCase().includes('mail')) return '📧';
    if (name.toLowerCase().includes('http') || name.toLowerCase().includes('fetch')) return '🌐';
    if (name.toLowerCase().includes('log')) return '📝';
    if (name.toLowerCase().includes('data') || name.toLowerCase().includes('process')) return '⚙️';
    if (name.toLowerCase().includes('save') || name.toLowerCase().includes('store')) return '💾';
    if (name.toLowerCase().includes('send')) return '📤';
    return '⚡';
  };

  return (
    <div
      style={{
        minWidth: '180px',
        background: 'white',
        border: `2px solid ${selected ? 'var(--primary-500)' : 'var(--secondary-300)'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: selected 
          ? '0 8px 24px rgba(59, 130, 246, 0.3), 0 0 0 4px rgba(59, 130, 246, 0.1)'
          : 'var(--shadow-md)',
        transition: 'all var(--transition-fast)',
        overflow: 'hidden',
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
        }}
      />
      
      <div style={{
        padding: 'var(--space-1)',
        background: selected 
          ? 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)'
          : 'var(--secondary-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all var(--transition-fast)',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: selected ? 'rgba(255, 255, 255, 0.2)' : 'white',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all var(--transition-fast)',
        }}>
          {getActivityIcon(data.activityName || '')}
        </div>
      </div>

      <div style={{ 
        padding: 'var(--space-3) var(--space-4)',
      }}>
        <div style={{ 
          fontWeight: 600, 
          fontSize: '0.875rem',
          marginBottom: 'var(--space-1)',
          color: 'var(--secondary-900)',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {data.label}
        </div>
        
        {data.activityName && (
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--secondary-600)',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-mono)',
          }}>
            {data.activityName}
          </div>
        )}

        {data.resultVariable && (
          <div style={{
            marginTop: 'var(--space-2)',
            padding: 'var(--space-1) var(--space-2)',
            background: 'var(--success-50)',
            border: '1px solid var(--success-500)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.6875rem',
            color: 'var(--success-700)',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            → {data.resultVariable}
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{
          background: selected ? 'var(--primary-500)' : 'var(--secondary-400)',
          width: '10px',
          height: '10px',
          border: '2px solid white',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all var(--transition-fast)',
        }}
      />
    </div>
  );
};

export default memo(ActivityNode);
