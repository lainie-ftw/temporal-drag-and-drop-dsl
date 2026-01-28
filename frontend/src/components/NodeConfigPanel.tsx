import React from 'react';
import type { WorkflowNode } from '../types/workflow.types';

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  onUpdate: (nodeId: string, data: any) => void;
  onDelete: (nodeId: string) => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ node, onUpdate, onDelete }) => {
  if (!node || node.data.stepType === 'start' || node.data.stepType === 'end') {
    return (
      <div style={{
        width: '300px',
        padding: '16px',
        borderLeft: '1px solid #ddd',
        background: '#f9f9f9',
        fontSize: '14px',
      }}>
        <h3>Node Configuration</h3>
        <p style={{ color: '#999' }}>Select a node to configure</p>
      </div>
    );
  }

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(node.id, { label: e.target.value });
  };

  const handleArgumentChange = (key: string, value: string) => {
    const currentArgs = node.data.arguments || {};
    onUpdate(node.id, { arguments: { ...currentArgs, [key]: value } });
  };

  const handleResultVariableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(node.id, { resultVariable: e.target.value });
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Delete node "${node.data.label}"?`)) {
      onDelete(node.id);
    }
  };

  return (
    <div style={{
      width: '300px',
      padding: '16px',
      borderLeft: '1px solid #ddd',
      background: '#f9f9f9',
      overflowY: 'auto',
      maxHeight: '100%',
    }}>
      <h3>Node Configuration</h3>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>
          Label
        </label>
        <input
          type="text"
          value={node.data.label}
          onChange={handleLabelChange}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {node.data.activityName && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>
              Activity: {node.data.activityName}
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>
              Arguments (JSON)
            </label>
            <textarea
              value={JSON.stringify(node.data.arguments || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onUpdate(node.id, { arguments: parsed });
                } catch (err) {
                  // Ignore parse errors while typing
                }
              }}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                minHeight: '100px',
                boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>
              Use {'${variableName}'} for variable references
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>
              Result Variable (optional)
            </label>
            <input
              type="text"
              value={node.data.resultVariable || ''}
              onChange={handleResultVariableChange}
              placeholder="Store result in..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </>
      )}

      <button
        onClick={handleDeleteClick}
        style={{
          width: '100%',
          padding: '8px',
          background: '#f44336',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        Delete Node
      </button>
    </div>
  );
};

export default NodeConfigPanel;
