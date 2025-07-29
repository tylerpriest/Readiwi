export enum ErrorSeverity {
  LOW = 'low',           // Non-blocking, user can continue
  MEDIUM = 'medium',     // Affects functionality, user should be notified
  HIGH = 'high',         // Blocks functionality, requires user action
  CRITICAL = 'critical'  // System failure, requires immediate attention
}

export enum ErrorCategory {
  VALIDATION = 'validation',     // User input validation errors
  NETWORK = 'network',          // Network and API errors
  STORAGE = 'storage',          // Database and storage errors
  PERMISSION = 'permission',    // Authentication and authorization errors
  SYSTEM = 'system',           // System and runtime errors
  UNKNOWN = 'unknown'          // Unclassified errors
}

export interface ErrorInfo {
  message: string;
  code: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context?: Record<string, unknown> | undefined;
  timestamp: Date;
  userId?: string | undefined;
  sessionId: string;
}

export class ReadiwiError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public category: ErrorCategory = ErrorCategory.UNKNOWN,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ReadiwiError';
  }

  toErrorInfo(userId?: string): ErrorInfo {
    return {
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      context: this.context,
      timestamp: new Date(),
      userId,
      sessionId: getSessionId(),
    };
  }
}

export function classifyErrorSeverity(error: Error): ErrorSeverity {
  if (error instanceof ReadiwiError) {
    return error.severity;
  }

  // Default classification based on error type
  if (error.name === 'TypeError' || error.name === 'ReferenceError') {
    return ErrorSeverity.HIGH;
  }

  if (error.name === 'NetworkError' || error.message.includes('fetch')) {
    return ErrorSeverity.MEDIUM;
  }

  return ErrorSeverity.LOW;
}

export function classifyErrorCategory(error: Error): ErrorCategory {
  if (error instanceof ReadiwiError) {
    return error.category;
  }

  // Default classification based on error content
  if (error.message.includes('validation') || error.message.includes('invalid')) {
    return ErrorCategory.VALIDATION;
  }

  if (error.message.includes('network') || error.message.includes('fetch')) {
    return ErrorCategory.NETWORK;
  }

  if (error.message.includes('database') || error.message.includes('storage')) {
    return ErrorCategory.STORAGE;
  }

  if (error.message.includes('permission') || error.message.includes('auth')) {
    return ErrorCategory.PERMISSION;
  }

  return ErrorCategory.UNKNOWN;
}

export function logError(errorInfo: ErrorInfo): void {
  const logLevel = getLogLevel(errorInfo.severity);
  const logMessage = formatErrorMessage(errorInfo);

  switch (logLevel) {
    case 'error':
      console.error(logMessage, errorInfo);
      break;
    case 'warn':
      console.warn(logMessage, errorInfo);
      break;
    case 'info':
      console.info(logMessage, errorInfo);
      break;
    default:
      console.log(logMessage, errorInfo);
  }

  // Store error in database for analysis
  storeErrorLog(errorInfo).catch(err => {
    console.error('Failed to store error log:', err);
  });
}

function getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' | 'log' {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
    case ErrorSeverity.HIGH:
      return 'error';
    case ErrorSeverity.MEDIUM:
      return 'warn';
    case ErrorSeverity.LOW:
      return 'info';
    default:
      return 'log';
  }
}

function formatErrorMessage(errorInfo: ErrorInfo): string {
  return `[${errorInfo.severity.toUpperCase()}] ${errorInfo.category}: ${errorInfo.message}`;
}

async function storeErrorLog(errorInfo: ErrorInfo): Promise<void> {
  try {
    const { db } = await import('@/core/services/database');
    await db.errorLogs.add({
      level: errorInfo.severity as any,
      message: errorInfo.message,
      context: errorInfo.context,
      timestamp: errorInfo.timestamp,
      userId: errorInfo.userId,
    });
  } catch (error) {
    // Don't throw here to avoid infinite error loops
    console.error('Failed to store error in database:', error);
  }
}

function getSessionId(): string {
  // Simple session ID generation - in a real app this would be more sophisticated
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('readiwi-session-id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('readiwi-session-id', sessionId);
    }
    return sessionId;
  }
  return 'server-session';
}