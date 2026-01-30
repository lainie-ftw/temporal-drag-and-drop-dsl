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
  type Edge,
  MarkerType,
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

  // Default edge styling
  const defaultEdgeOptions = useMemo(() => ({
    type: 'smoothstep',
    animated: true,
    style: { 
      stroke: '#3b82f6',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#3b82f6',
    },
  }), []);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge({
        ...params,
        ...defaultEdgeOptions,
      }, edges);
      setEdges(newEdges);
      onEdgesChange?.(newEdges);
    },
    [edges, setEdges, onEdgesChange, defaultEdgeOptions]
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

  const onPaneClickInternal = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  return (
    <div ref={reactFlowWrapper} style={{ 
      width: '100%', 
      height: '100%',
      position: 'relative',
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickInternal}
        onPaneClick={onPaneClickInternal}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        selectNodesOnDrag={false}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#cbd5e1"
          style={{
            backgroundColor: '#f8fafc',
          }}
        />
        <Controls />
      </ReactFlow>
      
      {/* Watermark */}
      <div style={{
        position: 'absolute',
        bottom: 'var(--space-4)',
        right: 'var(--space-4)',
        padding: 'var(--space-2) var(--space-3)',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--secondary-200)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.75rem',
        color: 'var(--secondary-600)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        boxShadow: 'var(--shadow-sm)',
        pointerEvents: 'none',
      }}>
        <span style={{ fontSize: '1rem' }}>⚡</span>
        <span style={{ fontWeight: 500 }}>Temporal Workflow Builder</span>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
