import type { ActivityResult } from '../../types/workflow-schema';
import type { ActivitySchema } from '../../types/activity-schema';

/**
 * Type for activity functions
 */
export type ActivityFunction = (args: Record<string, any>) => Promise<ActivityResult>;

/**
 * Registry of available activities mapped by name
 */
class ActivityRegistry {
  private activities: Map<string, ActivityFunction> = new Map();
  private schemas: Map<string, ActivitySchema> = new Map();

  /**
   * Register an activity function with optional schema
   */
  register(name: string, fn: ActivityFunction, schema?: ActivitySchema): void {
    this.activities.set(name, fn);
    if (schema) {
      this.schemas.set(name, schema);
    }
  }

  /**
   * Register or update an activity schema
   */
  registerSchema(name: string, schema: ActivitySchema): void {
    this.schemas.set(name, schema);
  }

  /**
   * Get an activity function by name
   */
  get(name: string): ActivityFunction | undefined {
    return this.activities.get(name);
  }

  /**
   * Get an activity schema by name
   */
  getSchema(name: string): ActivitySchema | undefined {
    return this.schemas.get(name);
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

  /**
   * Get all activity schemas
   */
  getAllSchemas(): ActivitySchema[] {
    return Array.from(this.schemas.values());
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
