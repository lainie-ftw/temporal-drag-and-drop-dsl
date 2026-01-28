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
