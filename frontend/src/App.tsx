import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import WorkflowCanvas from './components/WorkflowCanvas';
import NodePalette from './components/NodePalette';
import WorkflowToolbar from './components/WorkflowToolbar';
import NodeConfigPanel from './components/NodeConfigPanel';
import { useTemporalAPI } from './hooks/useTemporalAPI';
import { serializeWorkflow, serializeWorkflowToYaml } from './utils/workflowSerializer';
import { deserializeWorkflowFromYaml } from './utils/workflowDeserializer';
import type { WorkflowNode } from './types/workflow.types';
import type { ActivitySchema } from './types/activity-schema.types';

function App() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'start',
      type: 'startNode',
      position: { x: 250, y: 50 },
      data: { label: 'Start', stepType: 'start' },
    },
    {
      id: 'end',
      type: 'endNode',
      position: { x: 250, y: 400 },
      data: { label: 'End', stepType: 'end' },
    },
  ]);
  
  const [edges, setEdges] = useState<any[]>([]);
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [activitySchemas, setActivitySchemas] = useState<ActivitySchema[]>([]);
  
  const { executeWorkflow, getActivitySchemas, loading, error } = useTemporalAPI();

  // Load available activities on mount
  useEffect(() => {
    const loadActivities = async () => {
      const schemas = await getActivitySchemas();
      console.log('Activity schemas loaded from backend:', schemas);
      setActivitySchemas(schemas);
    };
    loadActivities();
    // This effect should only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addNode = useCallback((type: string, activityName?: string) => {
    console.log('addNode called with type:', type, 'activityName:', activityName);
    setNodes(prevNodes => {
      // Get viewport center from WorkflowCanvas
      const getViewportCenter = (window as any).__workflowCanvasGetViewportCenter;
      const center = getViewportCenter ? getViewportCenter() : { x: 250, y: 200 };
      
      // Add slight offset for multiple nodes added in succession
      const workflowNodes = prevNodes.filter(n => 
        n.data.stepType === 'activity' || n.data.stepType === 'condition'
      );
      const offset = (workflowNodes.length % 5) * 20; // Slight stagger for visibility
      
      const newNode: WorkflowNode = type === 'condition' 
        ? {
            id: `node-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            type: 'conditionNode',
            position: { 
              x: center.x + offset, 
              y: center.y + offset,
            },
            data: {
              label: 'Condition',
              stepType: 'condition',
              arguments: {
                variable: '',
                operator: 'equals',
                value: '',
              },
            },
          }
        : {
            id: `node-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            type: 'activityNode',
            position: { 
              x: center.x + offset, 
              y: center.y + offset,
            },
            data: {
              label: activityName || 'New Step',
              activityName,
              stepType: 'activity',
              arguments: {},
            },
          };
      
      console.log('Node added at viewport center:', center, 'with offset:', offset);
      return [...prevNodes, newNode];
    });
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prevNodes => {
      const updatedNodes = prevNodes.filter(n => n.id !== nodeId);
      console.log('Node deleted:', nodeId);
      return updatedNodes;
    });
  }, []);

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes(prevNodes => {
      const updatedNodes = prevNodes.map(n => 
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      );
      return updatedNodes;
    });
  }, []);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = selectedNodeId ? (nodes.find(n => n.id === selectedNodeId) ?? null) : null;

  const handleSave = () => {
    const workflow = serializeWorkflow(nodes, edges, workflowName);
    console.log('Saved workflow:', workflow);
    alert('Workflow saved! Check console for details.');
  };

  const handleExport = () => {
    const yaml = serializeWorkflowToYaml(nodes, edges, workflowName);
    
    // Download as file
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '-')}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (yamlString: string) => {
    try {
      const { nodes: importedNodes, edges: importedEdges } = 
        deserializeWorkflowFromYaml(yamlString);
      setNodes(importedNodes);
      setEdges(importedEdges);
      alert('Workflow imported successfully!');
    } catch (err) {
      alert('Failed to import workflow: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleExecute = async () => {
    const workflow = serializeWorkflow(nodes, edges, workflowName);
    
    const result = await executeWorkflow(workflow, {
      // You can add input variables here
    });
    
    if (result) {
      alert(`Workflow started!\nWorkflow ID: ${result.workflowId}\nRun ID: ${result.runId}`);
    } else if (error) {
      alert(`Failed to execute workflow: ${error}`);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--secondary-50)',
    }}>
      <WorkflowToolbar
        workflowName={workflowName}
        onNameChange={setWorkflowName}
        onSave={handleSave}
        onExport={handleExport}
        onExecute={handleExecute}
        onImport={handleImport}
      />
      
      <div style={{ 
        display: 'flex', 
        flex: 1, 
        overflow: 'hidden',
        gap: '0',
      }}>
        <NodePalette 
          onAddNode={addNode}
          activitySchemas={activitySchemas}
        />
        
        <div style={{ 
          flex: 1,
          background: 'white',
          position: 'relative',
        }}>
          <ReactFlowProvider>
            <WorkflowCanvas
              initialNodes={nodes}
              initialEdges={edges}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
              onNodeSelect={setSelectedNodeId}
            />
          </ReactFlowProvider>
        </div>

        <NodeConfigPanel
          node={selectedNode}
          onUpdate={updateNodeData}
          onDelete={(nodeId) => {
            deleteNode(nodeId);
            setSelectedNodeId(null);
          }}
          activitySchemas={activitySchemas}
        />
      </div>
      
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: 'white',
            padding: 'var(--space-8)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid var(--primary-100)',
              borderTopColor: 'var(--primary-600)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto var(--space-4)',
            }} />
            <div style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--secondary-900)',
            }}>
              Loading...
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
