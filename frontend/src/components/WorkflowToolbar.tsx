import React, { useState } from 'react';

interface WorkflowToolbarProps {
  workflowName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onExport: () => void;
  onExecute: () => void;
  onImport: (yaml: string) => void;
}

const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  workflowName,
  onNameChange,
  onSave,
  onExport,
  onExecute,
  onImport,
}) => {
  const [showImport, setShowImport] = useState(false);
  const [yamlInput, setYamlInput] = useState('');

  const handleImport = () => {
    onImport(yamlInput);
    setYamlInput('');
    setShowImport(false);
  };

  return (
    <div style={{ 
      padding: '16px', 
      borderBottom: '1px solid #ddd',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }}>
      <input
        type="text"
        value={workflowName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Workflow Name"
        style={{
          padding: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '16px',
          minWidth: '200px',
        }}
      />
      
      <button onClick={onSave} style={buttonStyle}>
        Save
      </button>
      
      <button onClick={onExport} style={buttonStyle}>
        Export YAML
      </button>
      
      <button onClick={() => setShowImport(!showImport)} style={buttonStyle}>
        Import YAML
      </button>
      
      <button onClick={onExecute} style={{ ...buttonStyle, background: '#4caf50' }}>
        Execute
      </button>

      {showImport && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '400px',
        }}>
          <h3>Import Workflow YAML</h3>
          <textarea
            value={yamlInput}
            onChange={(e) => setYamlInput(e.target.value)}
            placeholder="Paste YAML here..."
            rows={10}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace',
            }}
          />
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button onClick={handleImport} style={buttonStyle}>
              Import
            </button>
            <button onClick={() => setShowImport(false)} style={buttonStyle}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  background: '#1976d2',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
};

export default WorkflowToolbar;
