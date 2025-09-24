import { TenantContext } from '@/lib/middleware/tenant';

export interface LogEntry {
  request_id: string;
  user_id: string;
  tenant_id: string;
  route: string;
  method: string;
  status: number;
  latency_ms: number;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  details?: any;
}

export interface ErrorLogEntry extends LogEntry {
  level: 'error';
  error: {
    code: string;
    message: string;
    stack?: string;
    details?: any;
  };
}

/**
 * Sistema de logs estruturados para observabilidade
 */
export class Logger {
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static formatLogEntry(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log de requisição HTTP
   */
  static logRequest(
    context: TenantContext,
    route: string,
    method: string,
    status: number,
    latencyMs: number,
    requestId?: string
  ): void {
    const entry: LogEntry = {
      request_id: requestId || this.generateRequestId(),
      user_id: context.userId,
      tenant_id: context.tenantId,
      route,
      method,
      status,
      latency_ms: latencyMs,
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Request ${method} ${route} completed with status ${status}`,
    };

    console.log(this.formatLogEntry(entry));
  }

  /**
   * Log de erro
   */
  static logError(
    context: TenantContext,
    route: string,
    method: string,
    error: Error | { code: string; message: string; details?: any },
    requestId?: string
  ): void {
    const entry: ErrorLogEntry = {
      request_id: requestId || this.generateRequestId(),
      user_id: context.userId,
      tenant_id: context.tenantId,
      route,
      method,
      status: 500,
      latency_ms: 0,
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error instanceof Error ? error.message : error.message,
      error: {
        code: error instanceof Error ? 'INTERNAL_ERROR' : error.code,
        message: error instanceof Error ? error.message : error.message,
        stack: error instanceof Error ? error.stack : undefined,
        details: error instanceof Error ? undefined : error.details,
      },
    };

    console.error(this.formatLogEntry(entry));
  }

  /**
   * Log de warning
   */
  static logWarning(
    context: TenantContext,
    route: string,
    message: string,
    details?: any,
    requestId?: string
  ): void {
    const entry: LogEntry = {
      request_id: requestId || this.generateRequestId(),
      user_id: context.userId,
      tenant_id: context.tenantId,
      route,
      method: '',
      status: 0,
      latency_ms: 0,
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      details,
    };

    console.warn(this.formatLogEntry(entry));
  }

  /**
   * Log de debug
   */
  static logDebug(
    context: TenantContext,
    route: string,
    message: string,
    details?: any,
    requestId?: string
  ): void {
    const entry: LogEntry = {
      request_id: requestId || this.generateRequestId(),
      user_id: context.userId,
      tenant_id: context.tenantId,
      route,
      method: '',
      status: 0,
      latency_ms: 0,
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      details,
    };

    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatLogEntry(entry));
    }
  }

  /**
   * Log de auditoria para ações sensíveis
   */
  static logAudit(
    context: TenantContext,
    action: string,
    entity: string,
    entityId: string,
    details?: any,
    requestId?: string
  ): void {
    const entry: LogEntry = {
      request_id: requestId || this.generateRequestId(),
      user_id: context.userId,
      tenant_id: context.tenantId,
      route: `audit:${action}`,
      method: 'AUDIT',
      status: 0,
      latency_ms: 0,
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Audit: ${action} on ${entity} (${entityId})`,
      details: {
        action,
        entity,
        entity_id: entityId,
        user_role: context.userRole,
        ...details,
      },
    };

    console.log(this.formatLogEntry(entry));
  }

  /**
   * Middleware para logging automático de requisições
   */
  static createRequestLogger() {
    return {
      startTime: Date.now(),
      requestId: this.generateRequestId(),
      
      log(context: TenantContext, route: string, method: string, status: number): void {
        const latency = Date.now() - this.startTime;
        Logger.logRequest(context, route, method, status, latency, this.requestId);
      },

      logError(context: TenantContext, route: string, method: string, error: Error | { code: string; message: string; details?: any }): void {
        Logger.logError(context, route, method, error, this.requestId);
      }
    };
  }
}

/**
 * Utilitário para medir latência de operações
 */
export class PerformanceLogger {
  private startTime: number;
  private operation: string;

  constructor(operation: string) {
    this.operation = operation;
    this.startTime = Date.now();
  }

  end(): number {
    const duration = Date.now() - this.startTime;
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Performance: ${this.operation} took ${duration}ms`);
    }
    return duration;
  }
}
