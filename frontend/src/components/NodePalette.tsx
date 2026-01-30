import React from 'react';

interface NodePaletteProps {
  onAddNode: (type: string, activityName?: string) => void;
  availableActivities: string[];
}

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode, availableActivities }) => {
  return (
    <div style={{ 
      width: '280px',
      background: 'white',
      borderRight: '1px solid var(--secondary-200)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
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
            📦
          </div>
          Components
        </h3>
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--secondary-600)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          Drag or click to add activities to your workflow
        </p>
      </div>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-4)',
      }}>
        {availableActivities.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-8) var(--space-4)',
            color: 'var(--secondary-500)',
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: 'var(--space-3)',
              opacity: 0.5,
            }}>
              📭
            </div>
            <p style={{
              fontSize: '0.875rem',
              margin: 0,
            }}>
              No activities available
            </p>
            <p style={{
              fontSize: '0.75rem',
              margin: 'var(--space-2) 0 0 0',
              color: 'var(--secondary-400)',
            }}>
              Start the backend server
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}>
            {availableActivities.map(activity => (
              <ActivityButton
                key={activity}
                activity={activity}
                onClick={() => onAddNode('activity', activity)}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{
        padding: 'var(--space-4)',
        borderTop: '1px solid var(--secondary-200)',
        background: 'var(--secondary-50)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-3)',
          background: 'var(--primary-50)',
          border: '1px solid var(--primary-200)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.75rem',
          color: 'var(--primary-800)',
        }}>
          <div style={{ fontSize: '1rem' }}>💡</div>
          <div style={{ flex: 1, lineHeight: 1.4 }}>
            <strong>Tip:</strong> Click an activity to add it to the canvas
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActivityButtonProps {
  activity: string;
  onClick: () => void;
}

const ActivityButton: React.FC<ActivityButtonProps> = ({ activity, onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const getActivityIcon = (name: string): string => {
    if (name.toLowerCase().includes('email') || name.toLowerCase().includes('mail')) return '📧';
    if (name.toLowerCase().includes('http') || name.toLowerCase().includes('fetch')) return '🌐';
    if (name.toLowerCase().includes('log')) return '📝';
    if (name.toLowerCase().includes('data') || name.toLowerCase().includes('process')) return '⚙️';
    if (name.toLowerCase().includes('save') || name.toLowerCase().includes('store')) return '💾';
    if (name.toLowerCase().includes('send')) return '📤';
    return '⚡';
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        padding: 'var(--space-3)',
        background: isHovered ? 'var(--primary-50)' : 'white',
        border: `1px solid ${isHovered ? 'var(--primary-300)' : 'var(--secondary-200)'}`,
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        transition: 'all var(--transition-fast)',
        boxShadow: isHovered ? 'var(--shadow-sm)' : 'none',
        transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
      }}
    >
      <div style={{
        width: '36px',
        height: '36px',
        background: isHovered 
          ? 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)'
          : 'var(--secondary-100)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.125rem',
        flexShrink: 0,
        transition: 'all var(--transition-fast)',
      }}>
        {getActivityIcon(activity)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: isHovered ? 'var(--primary-700)' : 'var(--secondary-900)',
          marginBottom: '2px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'color var(--transition-fast)',
        }}>
          {activity}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--secondary-500)',
        }}>
          Click to add
        </div>
      </div>
      <div style={{
        fontSize: '1.25rem',
        color: isHovered ? 'var(--primary-500)' : 'var(--secondary-300)',
        transition: 'color var(--transition-fast)',
      }}>
        +
      </div>
    </button>
  );
};

export default NodePalette;
