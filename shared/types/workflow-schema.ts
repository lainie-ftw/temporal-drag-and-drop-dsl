/**
 * Represents the complete workflow definition
 */
export interface WorkflowDefinition {
  name: string;
  description?: string;
  version: string;
  root: string; // ID of the starting step
  steps: Step[];
}

/**
 * Individual step in the workflow
 */
export interface Step {
  id: string;
  type: 'activity' | 'parallel' | 'sequence' | 'condition';
  name: string;
  activityName?: string; // For activity type - maps to function name
  arguments?: Record<string, any>;
  resultVariable?: string; // Variable name to store result
  next?: string; // ID of next step
  onSuccess?: string; // For conditional
  onFailure?: string; // For conditional
  branches?: string[]; // For parallel execution - IDs of branch steps
  steps?: string[]; // For sequence - IDs of sequential steps
}

/**
 * Activity execution result
 */
export interface ActivityResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Workflow execution request
 */
export interface ExecuteWorkflowRequest {
  workflowDefinition: WorkflowDefinition;
  input?: Record<string, any>;
}

/**
 * Workflow execution response
 */
export interface ExecuteWorkflowResponse {
  workflowId: string;
  runId: string;
  status: string;
}
