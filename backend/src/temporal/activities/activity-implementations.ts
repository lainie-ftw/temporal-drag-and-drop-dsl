import { log } from '@temporalio/activity';
import type { ActivityResult } from '../../types/workflow-schema';
import type { ActivitySchema } from '../../types/activity-schema';
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
 * Activity schemas defining parameters and their types
 */
const sendEmailSchema: ActivitySchema = {
  name: 'sendEmail',
  label: 'Send Email',
  description: 'Send an email message',
  category: 'Communication',
  parameters: [
    {
      name: 'to',
      label: 'Recipient Email',
      type: 'string',
      required: true,
      helpText: 'Email address of the recipient',
      placeholder: 'user@example.com',
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'string',
      required: true,
      helpText: 'Email subject line',
      placeholder: 'Enter subject...',
    },
    {
      name: 'body',
      label: 'Message Body',
      type: 'string',
      required: true,
      helpText: 'Email message content',
      placeholder: 'Enter message...',
      multiline: true,
    },
  ],
};

const httpRequestSchema: ActivitySchema = {
  name: 'httpRequest',
  label: 'HTTP Request',
  description: 'Make an HTTP request to an external API',
  category: 'Integration',
  parameters: [
    {
      name: 'url',
      label: 'URL',
      type: 'string',
      required: true,
      helpText: 'The URL to make the request to',
      placeholder: 'https://api.example.com/endpoint',
    },
    {
      name: 'method',
      label: 'HTTP Method',
      type: 'enum',
      required: false,
      default: 'GET',
      helpText: 'HTTP method to use',
      options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
  ],
};

const transformDataSchema: ActivitySchema = {
  name: 'transformData',
  label: 'Transform Data',
  description: 'Transform text data using various operations',
  category: 'Data Processing',
  parameters: [
    {
      name: 'input',
      label: 'Input Text',
      type: 'string',
      required: true,
      helpText: 'The text to transform',
      placeholder: 'Enter text or use ${variableName}',
    },
    {
      name: 'operation',
      label: 'Operation',
      type: 'enum',
      required: true,
      helpText: 'Transformation to apply',
      options: ['uppercase', 'lowercase', 'reverse'],
    },
  ],
};

const waitSchema: ActivitySchema = {
  name: 'wait',
  label: 'Wait / Delay',
  description: 'Pause workflow execution for a specified duration',
  category: 'Flow Control',
  parameters: [
    {
      name: 'seconds',
      label: 'Duration (seconds)',
      type: 'number',
      required: false,
      default: 1,
      min: 0,
      max: 3600,
      helpText: 'Number of seconds to wait',
    },
  ],
};

const logMessageSchema: ActivitySchema = {
  name: 'logMessage',
  label: 'Log Message',
  description: 'Log a message during workflow execution',
  category: 'Debugging',
  parameters: [
    {
      name: 'message',
      label: 'Message',
      type: 'string',
      required: true,
      helpText: 'The message to log',
      placeholder: 'Enter log message...',
      multiline: true,
    },
    {
      name: 'level',
      label: 'Log Level',
      type: 'enum',
      required: false,
      default: 'info',
      helpText: 'Severity level of the log message',
      options: ['debug', 'info', 'warn', 'error'],
    },
  ],
};

/**
 * Register all sample activities
 */
export function registerActivities(): void {
  activityRegistry.register('sendEmail', sendEmail, sendEmailSchema);
  activityRegistry.register('httpRequest', httpRequest, httpRequestSchema);
  activityRegistry.register('transformData', transformData, transformDataSchema);
  activityRegistry.register('wait', wait, waitSchema);
  activityRegistry.register('logMessage', logMessage, logMessageSchema);
}
