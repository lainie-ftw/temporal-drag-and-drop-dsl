import React from 'react';

interface NodePaletteProps {
  onAddNode: (type: string, activityName?: string) => void;
  availableActivities: string[];
}

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode, availableActivities }) => {
  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      background: '#f9f9f9',
    }}>
      <h3>Add Steps</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Activities</h4>
        {availableActivities.map(activity => (
          <button
            key={activity}
            onClick={() => onAddNode('activity', activity)}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              border: '1px solid #1976d2',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            {activity}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;
