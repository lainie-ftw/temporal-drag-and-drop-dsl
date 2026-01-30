import { Router } from 'express';
import { getTemporalClient } from '../../temporal/client';
import type { WorkflowDefinition, ExecuteWorkflowRequest } from '../../types/workflow-schema';
import { activityRegistry } from '../../temporal/activities/activity-registry';
import { registerActivities } from '../../temporal/activities/activity-implementations';

const router = Router();

// Initialize activities on route setup
registerActivities();

/**
 * Execute a workflow from definition
 */
router.post('/execute', async (req, res) => {
  try {
    const { workflowDefinition, input } = req.body as ExecuteWorkflowRequest;

    // Validate workflow definition
    if (!workflowDefinition || !workflowDefinition.name) {
      return res.status(400).json({ error: 'Invalid workflow definition' });
    }

    const client = await getTemporalClient();
    
    const handle = await client.workflow.start('dslWorkflow', {
      taskQueue: 'workflow-builder',
      workflowId: `${workflowDefinition.name}-${Date.now()}`,
      args: [workflowDefinition, input || {}],
    });

    res.json({
      workflowId: handle.workflowId,
      runId: handle.firstExecutionRunId,
      status: 'started',
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({ 
      error: 'Failed to execute workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get workflow result
 */
router.get('/result/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const client = await getTemporalClient();
    
    const handle = client.workflow.getHandle(workflowId);
    const result = await handle.result();
    
    res.json({ result });
  } catch (error) {
    console.error('Error getting workflow result:', error);
    res.status(500).json({ 
      error: 'Failed to get workflow result',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get available activities with their schemas
 */
router.get('/activities', async (req, res) => {
  try {
    const schemas = activityRegistry.getAllSchemas();
    res.json({ schemas });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

/**
 * Get schema for a specific activity
 */
router.get('/activities/:activityName/schema', async (req, res) => {
  try {
    const { activityName } = req.params;
    const schema = activityRegistry.getSchema(activityName);
    
    if (!schema) {
      return res.status(404).json({ error: `Activity '${activityName}' not found` });
    }
    
    res.json({ schema });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get activity schema' });
  }
});

export default router;
