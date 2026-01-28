import { useState } from 'react';
import axios from 'axios';
import type { WorkflowDefinition, ExecuteWorkflowResponse } from '../../../shared/types/workflow-schema';

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
