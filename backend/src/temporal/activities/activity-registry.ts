import type { ActivityResult } from '../../types/workflow-schema';

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
