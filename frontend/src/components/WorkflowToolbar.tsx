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
    <>
      <div style={{ 
        padding: 'var(--space-4) var(--space-6)', 
        background: 'white',
        borderBottom: '1px solid var(--secondary-200)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          flex: 1,
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.25rem',
            boxShadow: 'var(--shadow-md)',
          }}>
            ⚡
          </div>
          
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            minWidth: '250px',
          }}>
            <label style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--secondary-600)',
              marginBottom: 'var(--space-1)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Workflow Name
            </label>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter workflow name..."
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--secondary-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 500,
                background: 'white',
                transition: 'all var(--transition-fast)',
              }}
            />
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: 'var(--space-2)',
          alignItems: 'center',
        }}>
          <button 
            onClick={onSave}
            style={{
              ...buttonStyles.secondary,
            }}
            title="Save workflow"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2H3C2.45 2 2 2.45 2 3V13C2 13.55 2.45 14 3 14H13C13.55 14 14 13.55 14 13V3C14 2.45 13.55 2 13 2Z" />
              <path d="M11 2V6H5V2" />
              <path d="M5 10H11" />
            </svg>
            Save
          </button>
          
          <button 
            onClick={onExport}
            style={{
              ...buttonStyles.secondary,
            }}
            title="Export as YAML"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 10V13C14 13.55 13.55 14 13 14H3C2.45 14 2 13.55 2 13V10" />
              <path d="M8 11V2" />
              <path d="M5 5L8 2L11 5" />
            </svg>
            Export
          </button>
          
          <button 
            onClick={() => setShowImport(!showImport)}
            style={{
              ...buttonStyles.secondary,
            }}
            title="Import from YAML"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 10V13C14 13.55 13.55 14 13 14H3C2.45 14 2 13.55 2 13V10" />
              <path d="M8 2V11" />
              <path d="M5 8L8 11L11 8" />
            </svg>
            Import
          </button>
          
          <div style={{
            width: '1px',
            height: '32px',
            background: 'var(--secondary-200)',
            margin: '0 var(--space-2)',
          }} />
          
          <button 
            onClick={onExecute}
            style={{
              ...buttonStyles.primary,
            }}
            title="Execute workflow"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2L13 8L4 14V2Z" />
            </svg>
            Execute Workflow
          </button>
        </div>
      </div>

      {showImport && (
        <>
          <div 
            onClick={() => setShowImport(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
              animation: 'fadeIn 0.2s ease-out',
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            minWidth: '500px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)',
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--secondary-900)',
                margin: 0,
              }}>
                Import Workflow
              </h3>
              <button
                onClick={() => setShowImport(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--secondary-100)',
                  color: 'var(--secondary-600)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--secondary-200)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--secondary-100)';
                }}
              >
                ✕
              </button>
            </div>
            
            <p style={{
              color: 'var(--secondary-600)',
              fontSize: '0.875rem',
              marginBottom: 'var(--space-4)',
            }}>
              Paste your workflow YAML content below to import it.
            </p>
            
            <textarea
              value={yamlInput}
              onChange={(e) => setYamlInput(e.target.value)}
              placeholder="Paste YAML here..."
              rows={12}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: '1px solid var(--secondary-300)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                resize: 'vertical',
                minHeight: '200px',
                background: 'var(--secondary-50)',
                color: 'var(--secondary-900)',
              }}
            />
            
            <div style={{ 
              marginTop: 'var(--space-4)', 
              display: 'flex', 
              gap: 'var(--space-3)',
              justifyContent: 'flex-end',
            }}>
              <button 
                onClick={() => setShowImport(false)}
                style={{
                  ...buttonStyles.ghost,
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleImport}
                style={{
                  ...buttonStyles.primary,
                }}
                disabled={!yamlInput.trim()}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 10V13C14 13.55 13.55 14 13 14H3C2.45 14 2 13.55 2 13V10" />
                  <path d="M8 2V11" />
                  <path d="M5 8L8 11L11 8" />
                </svg>
                Import Workflow
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
};

const buttonStyles = {
  primary: {
    background: 'linear-gradient(135deg, var(--success-600) 0%, var(--success-500) 100%)',
    color: 'white',
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all var(--transition-fast)',
  } as React.CSSProperties,
  
  secondary: {
    background: 'white',
    color: 'var(--secondary-700)',
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--secondary-300)',
    fontWeight: 500,
    fontSize: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    transition: 'all var(--transition-fast)',
  } as React.CSSProperties,
  
  ghost: {
    background: 'transparent',
    color: 'var(--secondary-700)',
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    fontWeight: 500,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  } as React.CSSProperties,
};

export default WorkflowToolbar;
