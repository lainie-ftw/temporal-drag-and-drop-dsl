import React, { useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  BackgroundVariant,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ActivityNode from './nodes/ActivityNode';
import StartNode from './nodes/StartNode';
import EndNode from './nodes/EndNode';
import type { WorkflowNode } from '../types/workflow.types';

interface WorkflowCanvasProps {
  initialNodes?: WorkflowNode[];
  initialEdges?: any[];
  onNodesChange?: (nodes: WorkflowNode[]) => void;
  onEdgesChange?: (edges: any[]) => void;
  onNodeSelect?: (nodeId: string | null) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
}) => {
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Sync from parent when the structure changes (nodes added/removed)
  const prevInitialNodesRef = useRef(initialNodes);
  useEffect(() => {
    // Only sync if the actual nodes array changed (not just a re-render with same data)
    if (initialNodes !== prevInitialNodesRef.current) {
      console.log('Parent nodes changed, syncing', initialNodes.length, 'nodes to canvas');
      setNodes(initialNodes);
      prevInitialNodesRef.current = initialNodes;
    }
  }, [initialNodes, setNodes]);

  // Sync parent edge changes to internal state
  const prevInitialEdgesRef = useRef(initialEdges);
  useEffect(() => {
    if (initialEdges !== prevInitialEdgesRef.current) {
      console.log('Parent edges changed, syncing', initialEdges.length, 'edges to canvas');
      setEdges(initialEdges);
      prevInitialEdgesRef.current = initialEdges;
    }
  }, [initialEdges, setEdges]);

  const nodeTypes: NodeTypes = useMemo(() => ({
    activityNode: ActivityNode,
    startNode: StartNode,
    endNode: EndNode,
  }), []);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      onEdgesChange?.(newEdges);
    },
    [edges, setEdges, onEdgesChange]
  );

  const onNodesChangeInternal = useCallback(
    (changes: any) => {
      handleNodesChange(changes);
      // Don't sync changes back to parent - parent controls structure
      // Canvas controls internal state like positions
    },
    [handleNodesChange]
  );

  const onNodeClickInternal = useCallback(
    (event: React.MouseEvent, node: any) => {
      onNodeSelect?.(node.id);
    },
    [onNodeSelect]
  );

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickInternal}
        onPaneClick={() => onNodeSelect?.(null)}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
