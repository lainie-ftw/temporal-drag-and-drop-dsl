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
  const [availableActivities, setAvailableActivities] = useState<string[]>([]);
  
  const { executeWorkflow, getAvailableActivities, loading, error } = useTemporalAPI();

  // Load available activities on mount
  useEffect(() => {
    const loadActivities = async () => {
      const activities = await getAvailableActivities();
      console.log('Activities loaded from backend:', activities);
      setAvailableActivities(activities);
    };
    loadActivities();
    // This effect should only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addNode = useCallback((type: string, activityName?: string) => {
    console.log('addNode called with type:', type, 'activityName:', activityName);
    setNodes(prevNodes => {
      // Count only activity nodes (exclude start and end)
      const activityNodes = prevNodes.filter(n => n.data.stepType === 'activity');
      const activityCount = activityNodes.length;
      
      // Position between Start (y:50) and End (y:400)
      // Space them evenly: 150, 200, 250, 300, 350
      const yPosition = 150 + (activityCount * 60);
      
      const newNode: WorkflowNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        type: 'activityNode',
        position: { 
          x: 250, 
          y: yPosition,
        },
        data: {
          label: activityName || 'New Step',
          activityName,
          stepType: 'activity',
          arguments: {},
        },
      };
      
      console.log('Node added:', newNode, 'Total nodes after add:', prevNodes.length + 1, 'Activity count:', activityCount + 1);
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <WorkflowToolbar
        workflowName={workflowName}
        onNameChange={setWorkflowName}
        onSave={handleSave}
        onExport={handleExport}
        onExecute={handleExecute}
        onImport={handleImport}
      />
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: '250px', padding: '16px', borderRight: '1px solid #ddd' }}>
          <NodePalette 
            onAddNode={addNode}
            availableActivities={availableActivities}
          />
        </div>
        
        <div style={{ flex: 1 }}>
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
        />
      </div>
      
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '24px',
        }}>
          Loading...
        </div>
      )}
    </div>
  );
}

export default App;
