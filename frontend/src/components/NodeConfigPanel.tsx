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
        width: '320px',
        minWidth: '320px',
        background: 'white',
        borderLeft: '1px solid var(--secondary-200)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}>
        <div style={{
          padding: 'var(--space-5) var(--space-4)',
          borderBottom: '1px solid var(--secondary-200)',
          background: 'linear-gradient(to bottom, white, var(--secondary-50))',
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--secondary-900)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.875rem',
            }}>
              ⚙️
            </div>
            Properties
          </h3>
        </div>
        
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-8) var(--space-6)',
          textAlign: 'center',
        }}>
          <div>
            <div style={{
              fontSize: '3rem',
              marginBottom: 'var(--space-3)',
              opacity: 0.3,
            }}>
              🎯
            </div>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--secondary-600)',
              margin: 0,
              lineHeight: 1.5,
            }}>
              Select a node on the canvas to view and edit its properties
            </p>
          </div>
        </div>
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
      width: '320px',
      minWidth: '320px',
      background: 'white',
      borderLeft: '1px solid var(--secondary-200)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <div style={{
        padding: 'var(--space-5) var(--space-4)',
        borderBottom: '1px solid var(--secondary-200)',
        background: 'linear-gradient(to bottom, white, var(--secondary-50))',
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--secondary-900)',
          margin: '0 0 var(--space-2) 0',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.875rem',
          }}>
            ⚙️
          </div>
          Properties
        </h3>
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--secondary-600)',
          margin: 0,
        }}>
          Configure node settings
        </p>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-4)',
      }}>
        <FormSection title="Basic Information">
          <FormField label="Label" required>
            <input
              type="text"
              value={node.data.label}
              onChange={handleLabelChange}
              placeholder="Enter node label..."
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--secondary-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                transition: 'all var(--transition-fast)',
              }}
            />
          </FormField>

          {node.data.activityName && (
            <FormField label="Activity Type">
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--secondary-50)',
                border: '1px solid var(--secondary-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--secondary-700)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}>
                <span style={{ fontSize: '1rem' }}>⚡</span>
                {node.data.activityName}
              </div>
            </FormField>
          )}
        </FormSection>

        {node.data.activityName && (
          <>
            <FormSection title="Configuration">
              <FormField 
                label="Arguments" 
                helpText="JSON object with activity parameters. Use ${variableName} for variable references"
              >
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
                  placeholder='{\n  "key": "value"\n}'
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    border: '1px solid var(--secondary-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-mono)',
                    minHeight: '120px',
                    resize: 'vertical',
                    lineHeight: 1.5,
                    background: 'var(--secondary-50)',
                    transition: 'all var(--transition-fast)',
                  }}
                />
              </FormField>

              <FormField 
                label="Result Variable" 
                helpText="Variable name to store the activity result"
              >
                <input
                  type="text"
                  value={node.data.resultVariable || ''}
                  onChange={handleResultVariableChange}
                  placeholder="e.g., myResult"
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--secondary-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-mono)',
                    transition: 'all var(--transition-fast)',
                  }}
                />
              </FormField>
            </FormSection>

            <div style={{
              padding: 'var(--space-3)',
              background: 'var(--warning-50)',
              border: '1px solid var(--warning-500)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              color: 'var(--warning-600)',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              gap: 'var(--space-2)',
            }}>
              <div style={{ fontSize: '1rem', flexShrink: 0 }}>💡</div>
              <div style={{ lineHeight: 1.4 }}>
                <strong>Tip:</strong> Use <code style={{
                  background: 'white',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-mono)',
                }}>{'${varName}'}</code> to reference variables from previous steps
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{
        padding: 'var(--space-4)',
        borderTop: '1px solid var(--secondary-200)',
        background: 'var(--secondary-50)',
      }}>
        <button
          onClick={handleDeleteClick}
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            background: 'white',
            color: 'var(--danger-600)',
            border: '1px solid var(--danger-500)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--danger-600)';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = 'var(--danger-600)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = 'var(--danger-600)';
            e.currentTarget.style.borderColor = 'var(--danger-500)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" />
          </svg>
          Delete Node
        </button>
      </div>
    </div>
  );
};

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children }) => (
  <div style={{ marginBottom: 'var(--space-5)' }}>
    <h4 style={{
      fontSize: '0.8125rem',
      fontWeight: 600,
      color: 'var(--secondary-700)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: 'var(--space-3)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
    }}>
      {title}
    </h4>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
    }}>
      {children}
    </div>
  </div>
);

interface FormFieldProps {
  label: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, required, helpText, children }) => (
  <div>
    <label style={{
      display: 'block',
      marginBottom: 'var(--space-2)',
      fontSize: '0.8125rem',
      fontWeight: 500,
      color: 'var(--secondary-700)',
    }}>
      {label}
      {required && (
        <span style={{ color: 'var(--danger-500)', marginLeft: 'var(--space-1)' }}>*</span>
      )}
    </label>
    {children}
    {helpText && (
      <p style={{
        fontSize: '0.75rem',
        color: 'var(--secondary-500)',
        margin: 'var(--space-2) 0 0 0',
        lineHeight: 1.4,
      }}>
        {helpText}
      </p>
    )}
  </div>
);

export default NodeConfigPanel;
