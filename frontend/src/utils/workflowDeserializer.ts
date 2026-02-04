import type { Edge } from 'reactflow';
import yaml from 'js-yaml';
import type { WorkflowDefinition } from '../../../shared/types/workflow-schema';
import type { WorkflowNode } from '../types/workflow.types';

/**
 * Convert WorkflowDefinition to React Flow nodes and edges
 */
export function deserializeWorkflow(
  workflow: WorkflowDefinition
): { nodes: WorkflowNode[]; edges: Edge[] } {
  const nodes: WorkflowNode[] = [];
  const edges: Edge[] = [];
  
  // Create start node
  const startNode: WorkflowNode = {
    id: 'start',
    type: 'startNode',
    position: { x: 250, y: 50 },
    data: {
      label: 'Start',
      stepType: 'start',
    },
  };
  nodes.push(startNode);
  
  // Create step nodes with auto-layout
  workflow.steps.forEach((step, index) => {
    const node: WorkflowNode = {
      id: step.id,
      type: step.type === 'condition' ? 'conditionNode' : 'activityNode',
      position: { 
        x: 250, 
        y: 150 + (index * 120),
      },
      data: {
        label: step.name,
        activityName: step.activityName,
        arguments: step.arguments,
        resultVariable: step.resultVariable,
        stepType: step.type === 'condition' ? 'condition' : 'activity',
      },
    };
    nodes.push(node);
  });
  
  // Create end node
  const endNode: WorkflowNode = {
    id: 'end',
    type: 'endNode',
    position: { x: 250, y: 150 + (workflow.steps.length * 120) },
    data: {
      label: 'End',
      stepType: 'end',
    },
  };
  nodes.push(endNode);
  
  // Connect start to root
  if (workflow.root) {
    edges.push({
      id: `start-${workflow.root}`,
      source: 'start',
      target: workflow.root,
    });
  }
  
  // Create edges from step connections
  workflow.steps.forEach(step => {
    if (step.next) {
      edges.push({
        id: `${step.id}-${step.next}`,
        source: step.id,
        target: step.next,
      });
    }
    
    if (step.onSuccess) {
      edges.push({
        id: `${step.id}-${step.onSuccess}`,
        source: step.id,
        sourceHandle: 'success',
        target: step.onSuccess,
        label: '✓ Success',
        style: { stroke: '#10b981', strokeWidth: 2 },
        animated: true,
        type: 'smoothstep',
      } as any);
    }
    
    if (step.onFailure) {
      edges.push({
        id: `${step.id}-${step.onFailure}`,
        source: step.id,
        sourceHandle: 'failure',
        target: step.onFailure,
        label: '✗ Failure',
        style: { stroke: '#ef4444', strokeWidth: 2 },
        animated: true,
        type: 'smoothstep',
      } as any);
    }
    
    if (step.branches) {
      step.branches.forEach((branchId, index) => {
        edges.push({
          id: `${step.id}-${branchId}`,
          source: step.id,
          target: branchId,
          label: `branch ${index + 1}`,
        });
      });
    }
  });
  
  // Connect last step to end (if no next defined)
  const lastStep = workflow.steps[workflow.steps.length - 1];
  if (lastStep && !lastStep.next && !lastStep.onSuccess) {
    edges.push({
      id: `${lastStep.id}-end`,
      source: lastStep.id,
      target: 'end',
    });
  }
  
  return { nodes, edges };
}

/**
 * Parse YAML string to WorkflowDefinition
 */
export function yamlToWorkflow(yamlString: string): WorkflowDefinition {
  return yaml.load(yamlString) as WorkflowDefinition;
}

/**
 * Parse YAML and deserialize in one step
 */
export function deserializeWorkflowFromYaml(
  yamlString: string
): { nodes: WorkflowNode[]; edges: Edge[] } {
  const workflow = yamlToWorkflow(yamlString);
  return deserializeWorkflow(workflow);
}
