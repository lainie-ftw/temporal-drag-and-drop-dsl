import { proxyActivities } from '@temporalio/workflow';
import type { WorkflowDefinition, Step, ActivityResult } from '../../types/workflow-schema';

// Proxy activities with default timeout
const { executeActivity } = proxyActivities<{
  executeActivity: (activityName: string, args: Record<string, any>) => Promise<ActivityResult>;
}>({
  startToCloseTimeout: '1 minute',
});

/**
 * Main DSL workflow that executes a workflow definition
 */
export async function dslWorkflow(
  workflowDef: WorkflowDefinition,
  input: Record<string, any> = {}
): Promise<Record<string, any>> {
  console.log(`Starting DSL workflow: ${workflowDef.name}`);
  
  // Initialize workflow state - stores results of each step
  const workflowState: Record<string, any> = { ...input };
  
  // Find the root step
  const rootStep = workflowDef.steps.find(s => s.id === workflowDef.root);
  if (!rootStep) {
    throw new Error(`Root step '${workflowDef.root}' not found`);
  }
  
  // Execute starting from root
  await executeStep(rootStep, workflowDef.steps, workflowState);
  
  return workflowState;
}

/**
 * Execute a single step
 */
async function executeStep(
  step: Step,
  allSteps: Step[],
  state: Record<string, any>
): Promise<void> {
  console.log(`Executing step: ${step.name} (${step.type})`);
  
  switch (step.type) {
    case 'activity':
      await executeActivityStep(step, state);
      break;
    
    case 'sequence':
      await executeSequenceStep(step, allSteps, state);
      break;
    
    case 'parallel':
      await executeParallelStep(step, allSteps, state);
      break;
    
    case 'condition':
      await executeConditionalStep(step, allSteps, state);
      break;
    
    default:
      throw new Error(`Unknown step type: ${(step as any).type}`);
  }
  
  // Execute next step if defined
  if (step.next) {
    const nextStep = allSteps.find(s => s.id === step.next);
    if (nextStep) {
      await executeStep(nextStep, allSteps, state);
    }
  }
}

/**
 * Execute an activity step
 */
async function executeActivityStep(
  step: Step,
  state: Record<string, any>
): Promise<void> {
  if (!step.activityName) {
    throw new Error(`Activity step '${step.id}' missing activityName`);
  }
  
  // Resolve arguments from state (supports variable references)
  const resolvedArgs = resolveArguments(step.arguments || {}, state);
  
  // Execute the activity
  const result: ActivityResult = await executeActivity(
    step.activityName,
    resolvedArgs
  );
  
  // Store result in state if resultVariable is specified
  if (step.resultVariable) {
    state[step.resultVariable] = result.data;
  }
  
  // Store in state with step ID as well
  state[step.id] = result;
  
  if (!result.success) {
    throw new Error(`Activity '${step.activityName}' failed: ${result.error}`);
  }
}

/**
 * Execute a sequence of steps (one after another)
 */
async function executeSequenceStep(
  step: Step,
  allSteps: Step[],
  state: Record<string, any>
): Promise<void> {
  if (!step.steps || step.steps.length === 0) {
    return;
  }
  
  for (const stepId of step.steps) {
    const childStep = allSteps.find(s => s.id === stepId);
    if (childStep) {
      await executeStep(childStep, allSteps, state);
    }
  }
}

/**
 * Execute steps in parallel
 */
async function executeParallelStep(
  step: Step,
  allSteps: Step[],
  state: Record<string, any>
): Promise<void> {
  if (!step.branches || step.branches.length === 0) {
    return;
  }
  
  const promises = step.branches.map(stepId => {
    const childStep = allSteps.find(s => s.id === stepId);
    if (!childStep) {
      throw new Error(`Branch step '${stepId}' not found`);
    }
    return executeStep(childStep, allSteps, state);
  });
  
  await Promise.all(promises);
}

/**
 * Execute a conditional step (if/else branching)
 */
async function executeConditionalStep(
  step: Step,
  allSteps: Step[],
  state: Record<string, any>
): Promise<void> {
  // Simple condition evaluation - can be enhanced
  const condition = evaluateCondition(step.arguments || {}, state);
  
  const nextStepId = condition ? step.onSuccess : step.onFailure;
  
  if (nextStepId) {
    const nextStep = allSteps.find(s => s.id === nextStepId);
    if (nextStep) {
      await executeStep(nextStep, allSteps, state);
    }
  }
}

/**
 * Resolve arguments by replacing variable references with actual values
 * Supports syntax like: { "email": "${userEmail}", "count": 5 }
 */
function resolveArguments(
  args: Record<string, any>,
  state: Record<string, any>
): Record<string, any> {
  const resolved: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(args)) {
    if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
      // Extract variable name
      const varName = value.slice(2, -1);
      resolved[key] = state[varName];
    } else {
      resolved[key] = value;
    }
  }
  
  return resolved;
}

/**
 * Simple condition evaluator
 * Can be enhanced to support complex expressions
 */
function evaluateCondition(
  args: Record<string, any>,
  state: Record<string, any>
): boolean {
  const { variable, operator, value } = args;
  
  if (!variable || !operator) {
    return false;
  }
  
  const actualValue = state[variable];
  
  switch (operator) {
    case 'equals':
      return actualValue === value;
    case 'notEquals':
      return actualValue !== value;
    case 'greaterThan':
      return actualValue > value;
    case 'lessThan':
      return actualValue < value;
    case 'exists':
      return actualValue !== undefined;
    default:
      return false;
  }
}
