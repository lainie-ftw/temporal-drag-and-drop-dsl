# Temporal Visual Workflow Builder - Implementation Plan

## Project Overview
Build a full-stack TypeScript application that allows users to visually create workflows using drag-and-drop, translate them to YAML configurations, and execute them via Temporal workflows with a generic activity execution pattern.

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Workflow Canvas**: React Flow (reactflow library)
- **UI Components**: shadcn/ui or Material-UI
- **Form Handling**: React Hook Form
- **State Management**: Zustand or React Context
- **HTTP Client**: Axios or fetch API
- **YAML Processing**: js-yaml

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Temporal SDK**: @temporalio/client and @temporalio/worker
- **YAML Parsing**: js-yaml
- **Validation**: Zod
- **Development**: tsx for running TypeScript directly

### Infrastructure
- **Temporal Server**: Local Temporal dev server or Temporal Cloud
- **Database**: Optional (PostgreSQL for storing workflow definitions)
- **Package Manager**: npm or pnpm

---

## Project Structure

```
temporal-workflow-builder/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WorkflowCanvas.tsx       # Main React Flow canvas
│   │   │   ├── NodePalette.tsx          # Draggable node types
│   │   │   ├── NodeConfigPanel.tsx      # Edit node properties
│   │   │   ├── WorkflowToolbar.tsx      # Save, export, execute buttons
│   │   │   └── nodes/
│   │   │       ├── ActivityNode.tsx     # Custom node for activities
│   │   │       ├── StartNode.tsx        # Workflow start node
│   │   │       └── EndNode.tsx          # Workflow end node
│   │   ├── hooks/
│   │   │   ├── useWorkflowBuilder.ts    # Workflow state management
│   │   │   └── useTemporalAPI.ts        # API calls to backend
│   │   ├── types/
│   │   │   ├── workflow.types.ts        # Workflow definition types
│   │   │   └── node.types.ts            # Node types and configs
│   │   ├── utils/
│   │   │   ├── workflowSerializer.ts    # Convert flow to YAML
│   │   │   ├── workflowDeserializer.ts  # Convert YAML to flow
│   │   │   └── validators.ts            # Workflow validation
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── workflow.routes.ts   # Workflow execution endpoints
│   │   │   │   └── health.routes.ts     # Health check
│   │   │   └── server.ts                # Express app setup
│   │   ├── temporal/
│   │   │   ├── workflows/
│   │   │   │   └── dsl-workflow.ts      # Generic DSL workflow
│   │   │   ├── activities/
│   │   │   │   ├── activity-registry.ts # Map step names to functions
│   │   │   │   ├── sample-activities.ts # Example activities
│   │   │   │   └── index.ts
│   │   │   ├── worker.ts                # Temporal worker setup
│   │   │   └── client.ts                # Temporal client setup
│   │   ├── types/
│   │   │   ├── workflow-definition.ts   # Shared workflow types
│   │   │   └── activity-types.ts        # Activity input/output types
│   │   └── utils/
│   │       ├── yaml-parser.ts           # Parse YAML to workflow def
│   │       └── logger.ts                # Logging utility
│   ├── package.json
│   └── tsconfig.json
│
├── shared/
│   └── types/
│       └── workflow-schema.ts           # Shared types between FE/BE
│
└── README.md
```

---

## Implementation Steps

### Phase 1: Project Setup

#### Step 1.1: Initialize Project
```bash
# Create project root
mkdir temporal-workflow-builder
cd temporal-workflow-builder

# Create frontend
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Install frontend dependencies
npm install reactflow @xyflow/react
npm install axios js-yaml
npm install @types/js-yaml --save-dev
npm install zustand
npm install react-hook-form zod @hookform/resolvers

cd ..

# Create backend
mkdir backend
cd backend
npm init -y
npm install express cors
npm install @temporalio/client @temporalio/worker @temporalio/workflow @temporalio/activity
npm install js-yaml zod
npm install --save-dev typescript @types/node @types/express @types/js-yaml tsx nodemon
npm install --save-dev @types/cors

# Initialize TypeScript
npx tsc --init
```

#### Step 1.2: Configure TypeScript (backend/tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### Step 1.3: Setup package.json scripts (backend)
```json
{
  "scripts": {
    "dev": "nodemon --exec tsx src/api/server.ts",
    "worker": "tsx src/temporal/worker.ts",
    "build": "tsc",
    "start": "node dist/api/server.js"
  }
}
```

---

### Phase 2: Define Shared Types

#### Step 2.1: Create Workflow Schema Types
Create `shared/types/workflow-schema.ts`:

```typescript
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
```

---

### Phase 3: Backend Implementation

#### Step 3.1: Temporal Client Setup
Create `backend/src/temporal/client.ts`:

```typescript
import { Client } from '@temporalio/client';

let client: Client | null = null;

export async function getTemporalClient(): Promise<Client> {
  if (!client) {
    client = await Client.connect({
      // For local development
      // address: 'localhost:7233',
      
      // For Temporal Cloud (uncomment and configure)
      // address: 'your-namespace.tmprl.cloud:7233',
      // namespace: 'your-namespace',
      // tls: {
      //   clientCertPair: {
      //     crt: await fs.readFile('./certs/client.pem'),
      //     key: await fs.readFile('./certs/client.key'),
      //   },
      // },
    });
  }
  return client;
}
```

#### Step 3.2: Activity Registry
Create `backend/src/temporal/activities/activity-registry.ts`:

```typescript
import { ActivityResult } from '../../../shared/types/workflow-schema';

/**
 * Type for activity functions
 */
export type ActivityFunction = (args: Record<string, any>) => Promise<ActivityResult>;

/**
 * Registry of available activities mapped by name
 */
class ActivityRegistry {
  private activities: Map<string, ActivityFunction> = new Map();

  /**
   * Register an activity function
   */
  register(name: string, fn: ActivityFunction): void {
    this.activities.set(name, fn);
  }

  /**
   * Get an activity function by name
   */
  get(name: string): ActivityFunction | undefined {
    return this.activities.get(name);
  }

  /**
   * Check if activity exists
   */
  has(name: string): boolean {
    return this.activities.has(name);
  }

  /**
   * Get all registered activity names
   */
  getAvailableActivities(): string[] {
    return Array.from(this.activities.keys());
  }
}

// Singleton instance
export const activityRegistry = new ActivityRegistry();

/**
 * Generic activity executor that looks up and executes activities by name
 */
export async function executeActivity(
  activityName: string,
  args: Record<string, any>
): Promise<ActivityResult> {
  const activityFn = activityRegistry.get(activityName);
  
  if (!activityFn) {
    return {
      success: false,
      error: `Activity '${activityName}' not found in registry`,
    };
  }

  try {
    return await activityFn(args);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

#### Step 3.3: Sample Activities
Create `backend/src/temporal/activities/sample-activities.ts`:

```typescript
import { ActivityResult } from '../../../shared/types/workflow-schema';
import { activityRegistry } from './activity-registry';

/**
 * Sample activity: Send email
 */
async function sendEmail(args: Record<string, any>): Promise<ActivityResult> {
  const { to, subject, body } = args;
  
  // Simulate email sending
  console.log(`Sending email to ${to}: ${subject}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    data: { messageId: `msg-${Date.now()}` },
  };
}

/**
 * Sample activity: HTTP request
 */
async function httpRequest(args: Record<string, any>): Promise<ActivityResult> {
  const { url, method = 'GET' } = args;
  
  console.log(`Making ${method} request to ${url}`);
  
  try {
    // Simulate HTTP request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: { statusCode: 200, body: 'Success' },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'HTTP request failed',
    };
  }
}

/**
 * Sample activity: Data transformation
 */
async function transformData(args: Record<string, any>): Promise<ActivityResult> {
  const { input, operation } = args;
  
  console.log(`Transforming data with operation: ${operation}`);
  
  let result;
  switch (operation) {
    case 'uppercase':
      result = String(input).toUpperCase();
      break;
    case 'lowercase':
      result = String(input).toLowerCase();
      break;
    case 'reverse':
      result = String(input).split('').reverse().join('');
      break;
    default:
      return { success: false, error: `Unknown operation: ${operation}` };
  }
  
  return {
    success: true,
    data: { transformed: result },
  };
}

/**
 * Sample activity: Wait/delay
 */
async function wait(args: Record<string, any>): Promise<ActivityResult> {
  const { seconds = 1 } = args;
  
  console.log(`Waiting for ${seconds} seconds`);
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  
  return {
    success: true,
    data: { waited: seconds },
  };
}

/**
 * Sample activity: Log message
 */
async function logMessage(args: Record<string, any>): Promise<ActivityResult> {
  const { message, level = 'info' } = args;
  
  console.log(`[${level.toUpperCase()}] ${message}`);
  
  return {
    success: true,
    data: { logged: true },
  };
}

// Register all sample activities
export function registerSampleActivities(): void {
  activityRegistry.register('sendEmail', sendEmail);
  activityRegistry.register('httpRequest', httpRequest);
  activityRegistry.register('transformData', transformData);
  activityRegistry.register('wait', wait);
  activityRegistry.register('logMessage', logMessage);
}
```

#### Step 3.4: DSL Workflow Implementation
Create `backend/src/temporal/workflows/dsl-workflow.ts`:

```typescript
import { proxyActivities } from '@temporalio/workflow';
import type { WorkflowDefinition, Step, ActivityResult } from '../../../shared/types/workflow-schema';
import type * as activities from '../activities';

// Proxy activities with default timeout
const { executeActivity } = proxyActivities<typeof activities>({
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
```

#### Step 3.5: Activities Index
Create `backend/src/temporal/activities/index.ts`:

```typescript
export { executeActivity } from './activity-registry';
export { registerSampleActivities } from './sample-activities';
```

#### Step 3.6: Temporal Worker
Create `backend/src/temporal/worker.ts`:

```typescript
import { Worker } from '@temporalio/worker';
import * as activities from './activities';
import { registerSampleActivities } from './activities/sample-activities';

async function run() {
  // Register all sample activities
  registerSampleActivities();

  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'workflow-builder',
  });

  console.log('Worker started, listening on task queue: workflow-builder');
  await worker.run();
}

run().catch((err) => {
  console.error('Worker error:', err);
  process.exit(1);
});
```

#### Step 3.7: Express API Routes
Create `backend/src/api/routes/workflow.routes.ts`:

```typescript
import { Router } from 'express';
import { getTemporalClient } from '../../temporal/client';
import { WorkflowDefinition, ExecuteWorkflowRequest } from '../../../../shared/types/workflow-schema';
import { activityRegistry } from '../../temporal/activities/activity-registry';

const router = Router();

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
 * Get available activities
 */
router.get('/activities', async (req, res) => {
  try {
    const activities = activityRegistry.getAvailableActivities();
    res.json({ activities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

export default router;
```

Create `backend/src/api/routes/health.routes.ts`:

```typescript
import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
```

#### Step 3.8: Express Server Setup
Create `backend/src/api/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import workflowRoutes from './routes/workflow.routes';
import healthRoutes from './routes/health.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api/workflow', workflowRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
```

---

### Phase 4: Frontend Implementation

#### Step 4.1: Workflow Types (Frontend)
Create `frontend/src/types/workflow.types.ts`:

```typescript
import { Node, Edge } from 'reactflow';

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
```

#### Step 4.2: Workflow Serialization Utility
Create `frontend/src/utils/workflowSerializer.ts`:

```typescript
import { Node, Edge } from 'reactflow';
import yaml from 'js-yaml';
import { WorkflowDefinition, Step } from '../../../shared/types/workflow-schema';
import { WorkflowNode } from '../types/workflow.types';

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
          // Assuming edges are labeled or ordered for success/failure
          step.onSuccess = outgoingEdges[0]?.target;
          step.onFailure = outgoingEdges[1]?.target;
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
```

#### Step 4.3: Workflow Deserialization Utility
Create `frontend/src/utils/workflowDeserializer.ts`:

```typescript
import { Edge } from 'reactflow';
import yaml from 'js-yaml';
import { WorkflowDefinition, Step } from '../../../shared/types/workflow-schema';
import { WorkflowNode } from '../types/workflow.types';

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
      type: 'activityNode',
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
        target: step.onSuccess,
        label: 'success',
      });
    }
    
    if (step.onFailure) {
      edges.push({
        id: `${step.id}-${step.onFailure}`,
        source: step.id,
        target: step.onFailure,
        label: 'failure',
      });
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
```

#### Step 4.4: Custom Nodes
Create `frontend/src/components/nodes/ActivityNode.tsx`:

```typescript
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNodeData } from '../../types/workflow.types';

const ActivityNode: React.FC<NodeProps<WorkflowNodeData>> = ({ data, selected }) => {
  return (
    <div
      style={{
        padding: '10px 20px',
        border: `2px solid ${selected ? '#1976d2' : '#ddd'}`,
        borderRadius: '8px',
        background: '#fff',
        minWidth: '150px',
        boxShadow: selected ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        {data.label}
      </div>
      
      {data.activityName && (
        <div style={{ fontSize: '12px', color: '#666' }}>
          {data.activityName}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(ActivityNode);
```

Create `frontend/src/components/nodes/StartNode.tsx`:

```typescript
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const StartNode: React.FC<NodeProps> = () => {
  return (
    <div
      style={{
        padding: '10px 20px',
        border: '2px solid #4caf50',
        borderRadius: '50%',
        background: '#e8f5e9',
        minWidth: '80px',
        textAlign: 'center',
        fontWeight: 'bold',
      }}
    >
      Start
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(StartNode);
```

Create `frontend/src/components/nodes/EndNode.tsx`:

```typescript
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const EndNode: React.FC<NodeProps> = () => {
  return (
    <div
      style={{
        padding: '10px 20px',
        border: '2px solid #f44336',
        borderRadius: '50%',
        background: '#ffebee',
        minWidth: '80px',
        textAlign: 'center',
        fontWeight: 'bold',
      }}
    >
      End
      <Handle type="target" position={Position.Top} />
    </div>
  );
};

export default memo(EndNode);
```

#### Step 4.5: Workflow Canvas Component
Create `frontend/src/components/WorkflowCanvas.tsx`:

```typescript
import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  BackgroundVariant,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ActivityNode from './nodes/ActivityNode';
import StartNode from './nodes/StartNode';
import EndNode from './nodes/EndNode';
import { WorkflowNode } from '../types/workflow.types';

const nodeTypes: NodeTypes = {
  activityNode: ActivityNode,
  startNode: StartNode,
  endNode: EndNode,
};

interface WorkflowCanvasProps {
  initialNodes?: WorkflowNode[];
  initialEdges?: any[];
  onNodesChange?: (nodes: WorkflowNode[]) => void;
  onEdgesChange?: (edges: any[]) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
}) => {
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

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
      onNodesChange?.(nodes);
    },
    [handleNodesChange, onNodesChange, nodes]
  );

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
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
```

#### Step 4.6: Node Palette
Create `frontend/src/components/NodePalette.tsx`:

```typescript
import React from 'react';

interface NodePaletteProps {
  onAddNode: (type: string, activityName?: string) => void;
  availableActivities: string[];
}

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode, availableActivities }) => {
  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      background: '#f9f9f9',
    }}>
      <h3>Add Steps</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Activities</h4>
        {availableActivities.map(activity => (
          <button
            key={activity}
            onClick={() => onAddNode('activity', activity)}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              border: '1px solid #1976d2',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            {activity}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;
```

#### Step 4.7: Workflow Toolbar
Create `frontend/src/components/WorkflowToolbar.tsx`:

```typescript
import React, { useState } from 'react';

interface WorkflowToolbarProps {
  workflowName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onExport: () => void;
  onExecute: () => void;
  onImport: (yaml: string) => void;
}

const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  workflowName,
  onNameChange,
  onSave,
  onExport,
  onExecute,
  onImport,
}) => {
  const [showImport, setShowImport] = useState(false);
  const [yamlInput, setYamlInput] = useState('');

  const handleImport = () => {
    onImport(yamlInput);
    setYamlInput('');
    setShowImport(false);
  };

  return (
    <div style={{ 
      padding: '16px', 
      borderBottom: '1px solid #ddd',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }}>
      <input
        type="text"
        value={workflowName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Workflow Name"
        style={{
          padding: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '16px',
          minWidth: '200px',
        }}
      />
      
      <button onClick={onSave} style={buttonStyle}>
        Save
      </button>
      
      <button onClick={onExport} style={buttonStyle}>
        Export YAML
      </button>
      
      <button onClick={() => setShowImport(!showImport)} style={buttonStyle}>
        Import YAML
      </button>
      
      <button onClick={onExecute} style={{ ...buttonStyle, background: '#4caf50' }}>
        Execute
      </button>

      {showImport && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '400px',
        }}>
          <h3>Import Workflow YAML</h3>
          <textarea
            value={yamlInput}
            onChange={(e) => setYamlInput(e.target.value)}
            placeholder="Paste YAML here..."
            rows={10}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace',
            }}
          />
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button onClick={handleImport} style={buttonStyle}>
              Import
            </button>
            <button onClick={() => setShowImport(false)} style={buttonStyle}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  background: '#1976d2',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
};

export default WorkflowToolbar;
```

#### Step 4.8: API Hook
Create `frontend/src/hooks/useTemporalAPI.ts`:

```typescript
import { useState } from 'react';
import axios from 'axios';
import { WorkflowDefinition, ExecuteWorkflowResponse } from '../../../shared/types/workflow-schema';

const API_BASE_URL = 'http://localhost:3001/api';

export function useTemporalAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeWorkflow = async (
    workflowDefinition: WorkflowDefinition,
    input?: Record<string, any>
  ): Promise<ExecuteWorkflowResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/workflow/execute`, {
        workflowDefinition,
        input,
      });
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to execute workflow';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getWorkflowResult = async (workflowId: string): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/workflow/result/${workflowId}`);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get workflow result';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableActivities = async (): Promise<string[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/workflow/activities`);
      return response.data.activities || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get activities';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    executeWorkflow,
    getWorkflowResult,
    getAvailableActivities,
    loading,
    error,
  };
}
```

#### Step 4.9: Main App Component
Create `frontend/src/App.tsx`:

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import WorkflowCanvas from './components/WorkflowCanvas';
import NodePalette from './components/NodePalette';
import WorkflowToolbar from './components/WorkflowToolbar';
import { useTemporalAPI } from './hooks/useTemporalAPI';
import { serializeWorkflow, serializeWorkflowToYaml } from './utils/workflowSerializer';
import { deserializeWorkflowFromYaml } from './utils/workflowDeserializer';
import { WorkflowNode } from './types/workflow.types';

function App() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'start',
      type: 'startNode',
      position: { x: 250, y: 50 },
      data: { label: 'Start', stepType: 'start' },
    },
    {
      id: 'end',
      type: 'endNode',
      position: { x: 250, y: 400 },
      data: { label: 'End', stepType: 'end' },
    },
  ]);
  
  const [edges, setEdges] = useState<any[]>([]);
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [availableActivities, setAvailableActivities] = useState<string[]>([]);
  
  const { executeWorkflow, getAvailableActivities, loading, error } = useTemporalAPI();

  // Load available activities on mount
  useEffect(() => {
    const loadActivities = async () => {
      const activities = await getAvailableActivities();
      setAvailableActivities(activities);
    };
    loadActivities();
  }, [getAvailableActivities]);

  const addNode = useCallback((type: string, activityName?: string) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: 'activityNode',
      position: { 
        x: 250, 
        y: 200 + (nodes.length * 100),
      },
      data: {
        label: activityName || 'New Step',
        activityName,
        stepType: 'activity',
        arguments: {},
      },
    };
    setNodes([...nodes, newNode]);
  }, [nodes]);

  const handleSave = () => {
    const workflow = serializeWorkflow(nodes, edges, workflowName);
    console.log('Saved workflow:', workflow);
    alert('Workflow saved! Check console for details.');
  };

  const handleExport = () => {
    const yaml = serializeWorkflowToYaml(nodes, edges, workflowName);
    
    // Download as file
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '-')}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (yamlString: string) => {
    try {
      const { nodes: importedNodes, edges: importedEdges } = 
        deserializeWorkflowFromYaml(yamlString);
      setNodes(importedNodes);
      setEdges(importedEdges);
      alert('Workflow imported successfully!');
    } catch (err) {
      alert('Failed to import workflow: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleExecute = async () => {
    const workflow = serializeWorkflow(nodes, edges, workflowName);
    
    const result = await executeWorkflow(workflow, {
      // You can add input variables here
    });
    
    if (result) {
      alert(`Workflow started!\nWorkflow ID: ${result.workflowId}\nRun ID: ${result.runId}`);
    } else if (error) {
      alert(`Failed to execute workflow: ${error}`);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <WorkflowToolbar
        workflowName={workflowName}
        onNameChange={setWorkflowName}
        onSave={handleSave}
        onExport={handleExport}
        onExecute={handleExecute}
        onImport={handleImport}
      />
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: '250px', padding: '16px', borderRight: '1px solid #ddd' }}>
          <NodePalette 
            onAddNode={addNode}
            availableActivities={availableActivities}
          />
        </div>
        
        <div style={{ flex: 1 }}>
          <ReactFlowProvider>
            <WorkflowCanvas
              initialNodes={nodes}
              initialEdges={edges}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
            />
          </ReactFlowProvider>
        </div>
      </div>
      
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '24px',
        }}>
          Loading...
        </div>
      )}
    </div>
  );
}

export default App;
```

---

### Phase 5: Testing & Running

#### Step 5.1: Start Temporal Server
```bash
# Using Temporal CLI
temporal server start-dev

# Or using Docker
docker run -p 7233:7233 -p 8233:8233 temporalio/auto-setup:latest
```

#### Step 5.2: Start Backend Worker
```bash
cd backend
npm run worker
```

#### Step 5.3: Start Backend API Server
```bash
cd backend
npm run dev
```

#### Step 5.4: Start Frontend
```bash
cd frontend
npm run dev
```

#### Step 5.5: Test the Application
1. Open browser to `http://localhost:5173`
2. Add activities from the palette
3. Connect nodes by dragging from one node's handle to another
4. Configure node properties
5. Save workflow
6. Export to YAML
7. Execute workflow
8. View results in Temporal Web UI at `http://localhost:8233`

---

## Sample YAML Workflow

Create a test file `sample-workflow.yaml`:

```yaml
name: Email Notification Workflow
description: Send email after data transformation
version: '1.0'
root: step-1
steps:
  - id: step-1
    type: activity
    name: Transform User Data
    activityName: transformData
    arguments:
      input: '${userName}'
      operation: uppercase
    resultVariable: transformedName
    next: step-2
  
  - id: step-2
    type: activity
    name: Send Welcome Email
    activityName: sendEmail
    arguments:
      to: user@example.com
      subject: Welcome!
      body: 'Hello ${transformedName}'
    resultVariable: emailResult
```

---

## Enhancements & Next Steps

### Optional Enhancements
1. **Node Configuration Panel**: Add a side panel to edit node properties
2. **Validation**: Add workflow validation before execution
3. **Persistence**: Save workflows to database
4. **Real-time Status**: Show workflow execution status in UI
5. **Activity Library**: Create a richer library of pre-built activities
6. **Conditional Logic**: Enhance condition nodes with visual expression builder
7. **Error Handling**: Add retry policies and error handling configuration
8. **Testing**: Add unit and integration tests

### Production Considerations
1. Authentication & authorization
2. Multi-tenancy support
3. Workflow versioning
4. Performance optimization
5. Monitoring and observability
6. Security hardening

---

## Troubleshooting

### Common Issues

1. **Temporal connection errors**: Ensure Temporal server is running on correct port
2. **Worker not picking up workflows**: Check task queue name matches
3. **Activity not found**: Verify activity is registered in activity registry
4. **CORS errors**: Ensure backend has CORS enabled for frontend origin
5. **YAML parsing errors**: Validate YAML syntax

### Debug Commands

```bash
# Check Temporal server
temporal server start-dev --ui-port 8233

# List workflows
temporal workflow list

# Describe workflow
temporal workflow describe --workflow-id <workflow-id>

# Check workflow history
temporal workflow show --workflow-id <workflow-id>
```

---

## Summary

This implementation plan provides:
1. ✅ Drag-and-drop UI for visual workflow creation
2. ✅ Translation from UI to workflow definition
3. ✅ Generic Temporal workflow that executes steps via activity registry
4. ✅ YAML import/export functionality
5. ✅ Extensible architecture for adding new activities
6. ✅ Full-stack TypeScript implementation

The architecture is modular, allowing easy extension of activities, node types, and workflow execution patterns.
