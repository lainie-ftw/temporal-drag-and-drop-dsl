import type { Node, Edge } from 'reactflow';

/**
 * Custom data for workflow nodes
 */
export interface WorkflowNodeData {
  label: string;
  activityName?: string;
  arguments?: Record<string, any>;
  resultVariable?: string;
  stepType: 'start' | 'activity' | 'end' | 'condition' | 'parallel';
}

/**
 * Extended node type with our custom data
 */
export type WorkflowNode = Node<WorkflowNodeData>;

/**
 * Workflow canvas state
 */
export interface WorkflowCanvasState {
  nodes: WorkflowNode[];
  edges: Edge[];
  name: string;
  description?: string;
}
