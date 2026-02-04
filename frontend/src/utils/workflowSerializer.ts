import type { Node, Edge } from 'reactflow';
import yaml from 'js-yaml';
import type { WorkflowDefinition, Step } from '../../../shared/types/workflow-schema';
import type { WorkflowNodeData } from '../types/workflow.types';

type WorkflowNode = Node<WorkflowNodeData>;

/**
 * Convert React Flow nodes and edges to WorkflowDefinition
 */
export function serializeWorkflow(
  nodes: WorkflowNode[],
  edges: Edge[],
  name: string,
  description?: string
): WorkflowDefinition {
  const steps: Step[] = nodes
    .filter(node => node.data.stepType !== 'start' && node.data.stepType !== 'end')
    .map(node => {
      const outgoingEdges = edges.filter(e => e.source === node.id);
      
      const step: Step = {
        id: node.id,
        type: node.data.stepType === 'condition' ? 'condition' : 'activity',
        name: node.data.label,
        activityName: node.data.activityName,
        arguments: node.data.arguments,
        resultVariable: node.data.resultVariable,
      };
      
      // Handle next step connections
      if (outgoingEdges.length > 0) {
        if (node.data.stepType === 'parallel') {
          step.type = 'parallel';
          step.branches = outgoingEdges.map(e => e.target);
        } else if (node.data.stepType === 'condition') {
          // Handle conditional edges based on sourceHandle
          outgoingEdges.forEach(edge => {
            if (edge.sourceHandle === 'success') {
              step.onSuccess = edge.target;
            } else if (edge.sourceHandle === 'failure') {
              step.onFailure = edge.target;
            }
          });
          
          // Fallback: if no sourceHandle, use label or order
          if (!step.onSuccess && !step.onFailure) {
            outgoingEdges.forEach((edge, index) => {
              if (edge.label === '✓ Success' || index === 0) {
                step.onSuccess = edge.target;
              } else if (edge.label === '✗ Failure' || index === 1) {
                step.onFailure = edge.target;
              }
            });
          }
        } else {
          step.next = outgoingEdges[0].target;
        }
      }
      
      return step;
    });
  
  // Find the start node to determine root
  const startNode = nodes.find(n => n.data.stepType === 'start');
  const startEdge = edges.find(e => e.source === startNode?.id);
  const rootId = startEdge?.target || (steps[0]?.id ?? '');
  
  return {
    name,
    description,
    version: '1.0',
    root: rootId,
    steps,
  };
}

/**
 * Convert WorkflowDefinition to YAML string
 */
export function workflowToYaml(workflow: WorkflowDefinition): string {
  return yaml.dump(workflow, {
    indent: 2,
    lineWidth: -1,
  });
}

/**
 * Serialize and convert to YAML in one step
 */
export function serializeWorkflowToYaml(
  nodes: WorkflowNode[],
  edges: Edge[],
  name: string,
  description?: string
): string {
  const workflow = serializeWorkflow(nodes, edges, name, description);
  return workflowToYaml(workflow);
}
