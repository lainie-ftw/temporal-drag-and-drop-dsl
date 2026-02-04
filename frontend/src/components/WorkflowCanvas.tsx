import React, { useCallback, useRef, useMemo, useEffect, useImperativeHandle, forwardRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
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
import ConditionNode from './nodes/ConditionNode';
import type { WorkflowNode } from '../types/workflow.types';

interface WorkflowCanvasProps {
  initialNodes?: WorkflowNode[];
  initialEdges?: any[];
  onNodesChange?: (nodes: WorkflowNode[]) => void;
  onEdgesChange?: (edges: any[]) => void;
  onNodeSelect?: (nodeId: string | null) => void;
}

export interface WorkflowCanvasHandle {
  getViewportCenter: () => { x: number; y: number };
}

const WorkflowCanvasInner: React.FC<WorkflowCanvasProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
}) => {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Sync from parent when the structure changes (nodes added/removed)
  const prevInitialNodesRef = useRef(initialNodes);
  useEffect(() => {
    // Only sync if the actual nodes array changed (not just a re-render with same data)
    if (initialNodes !== prevInitialNodesRef.current) {
      const prevNodes = prevInitialNodesRef.current;
      const currentNodes = initialNodes;
      
      // Check if this is a structural change (added/removed nodes) or just data updates
      const isStructuralChange = prevNodes.length !== currentNodes.length ||
        prevNodes.some(pn => !currentNodes.find(cn => cn.id === pn.id)) ||
        currentNodes.some(cn => !prevNodes.find(pn => pn.id === cn.id));
      
      if (isStructuralChange) {
        // Structural change: use new nodes completely
        console.log('Structural change detected, syncing', currentNodes.length, 'nodes to canvas');
        setNodes(currentNodes);
      } else {
        // Data-only change: preserve current positions, only update data
        console.log('Data update detected, preserving positions');
        setNodes((existingNodes) => {
          return existingNodes.map(existingNode => {
            const updatedNode = currentNodes.find(n => n.id === existingNode.id);
            if (updatedNode) {
              // Preserve position from existing node, update data from parent
              return {
                ...updatedNode,
                position: existingNode.position,
              };
            }
            return existingNode;
          });
        });
      }
      
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
    conditionNode: ConditionNode,
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
      // Find the source node to check if it's a condition
      const sourceNode = nodes.find(n => n.id === params.source);
      const isCondition = sourceNode?.data.stepType === 'condition';
      
      // Determine edge style based on source handle for condition nodes
      let edgeStyle: any = { ...defaultEdgeOptions };
      
      if (isCondition && params.sourceHandle) {
        if (params.sourceHandle === 'success') {
          edgeStyle = {
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#10b981', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#10b981',
            },
            label: '✓ Success',
            labelStyle: { 
              fill: '#10b981', 
              fontWeight: 600,
              fontSize: '12px',
            },
            labelBgStyle: { 
              fill: '#f0fdf4',
              fillOpacity: 0.9,
            },
            labelBgPadding: [8, 4] as [number, number],
            labelBgBorderRadius: 4,
          };
        } else if (params.sourceHandle === 'failure') {
          edgeStyle = {
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#ef4444', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#ef4444',
            },
            label: '✗ Failure',
            labelStyle: { 
              fill: '#ef4444', 
              fontWeight: 600,
              fontSize: '12px',
            },
            labelBgStyle: { 
              fill: '#fef2f2',
              fillOpacity: 0.9,
            },
            labelBgPadding: [8, 4] as [number, number],
            labelBgBorderRadius: 4,
          };
        }
      }
      
      const newEdges = addEdge({
        ...params,
        ...edgeStyle,
      }, edges);
      setEdges(newEdges);
      onEdgesChange?.(newEdges);
    },
    [edges, nodes, setEdges, onEdgesChange, defaultEdgeOptions]
  );

  const onNodesChangeInternal = useCallback(
    (changes: any) => {
      handleNodesChange(changes);
      
      // Sync position changes back to parent to keep positions in sync
      // This ensures that when data updates come from parent, positions are preserved
      const hasPositionChange = changes.some((change: any) => 
        change.type === 'position' && change.dragging === false
      );
      
      if (hasPositionChange && onNodesChange) {
        // Use setTimeout to ensure state is updated before we read it
        setTimeout(() => {
          setNodes((currentNodes) => {
            onNodesChange(currentNodes);
            return currentNodes;
          });
        }, 0);
      }
    },
    [handleNodesChange, onNodesChange, setNodes]
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

  const getViewportCenter = useCallback(() => {
    const viewport = reactFlowInstance.getViewport();
    const zoom = viewport.zoom;
    
    // Get the container dimensions
    const container = reactFlowWrapper.current;
    if (!container) {
      return { x: 250, y: 200 }; // Fallback
    }
    
    const bounds = container.getBoundingClientRect();
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;
    
    // Convert screen coordinates to flow coordinates
    const flowX = (centerX - viewport.x) / zoom;
    const flowY = (centerY - viewport.y) / zoom;
    
    return { x: flowX, y: flowY };
  }, [reactFlowInstance]);

  // Expose methods to parent via ref
  useEffect(() => {
    // Store the method on window for parent to access
    (window as any).__workflowCanvasGetViewportCenter = getViewportCenter;
    
    return () => {
      delete (window as any).__workflowCanvasGetViewportCenter;
    };
  }, [getViewportCenter]);

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

const WorkflowCanvas = WorkflowCanvasInner;

export default WorkflowCanvas;
