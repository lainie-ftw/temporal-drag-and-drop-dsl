import { Worker } from '@temporalio/worker';
import { dslWorkflow } from './workflows/dsl-workflow';
import { executeActivity, registerSampleActivities } from './activities/index';

async function run() {
  // Register all sample activities
  registerSampleActivities();

  const worker = await Worker.create({
    workflowsPath: new URL('./workflows/dsl-workflow.ts', import.meta.url).pathname,
    activities: {
      executeActivity,
    },
    taskQueue: 'workflow-builder',
  });

  console.log('Worker started, listening on task queue: workflow-builder');
  await worker.run();
}

run().catch((err) => {
  console.error('Worker error:', err);
  process.exit(1);
});
