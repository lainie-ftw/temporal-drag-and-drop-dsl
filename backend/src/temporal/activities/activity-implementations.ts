import { log } from '@temporalio/activity';
import type { ActivityResult } from '../../types/workflow-schema';
import { activityRegistry } from './activity-registry';

/**
 * Sample activity: Send email
 */
async function sendEmail(args: Record<string, any>): Promise<ActivityResult> {
  const { to, subject, body } = args;
  
  // Simulate email sending
  log.info('Sending email', { to, subject });
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
  
  log.info('Making HTTP request', { method, url });
  
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
  
  log.info('Transforming data', { operation });
  
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
  
  log.info('Waiting', { seconds });
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
  
  log.info('Log message activity', { message, level });
  
  return {
    success: true,
    data: { logged: true },
  };
}

/**
 * Register all sample activities
 */
export function registerActivities(): void {
  activityRegistry.register('sendEmail', sendEmail);
  activityRegistry.register('httpRequest', httpRequest);
  activityRegistry.register('transformData', transformData);
  activityRegistry.register('wait', wait);
  activityRegistry.register('logMessage', logMessage);
}
