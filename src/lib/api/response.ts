/**
 * Utilitários para respostas de API padronizadas
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Cria uma resposta de sucesso padronizada
 */
export function createSuccessResponse<T>(
  data: T,
  requestId?: string
): ApiResponse<T> {
  return {
    data,
    meta: {
      request_id: requestId,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Cria uma resposta de erro padronizada
 */
export function createErrorResponse(
  error: ApiError,
  requestId?: string
): ApiResponse {
  return {
    error,
    meta: {
      request_id: requestId,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Cria uma resposta de erro para problemas de validação de tenant
 */
export function createTenantErrorResponse(
  code: string,
  message: string,
  details?: any,
  requestId?: string
): ApiResponse {
  return createErrorResponse({ code, message, details }, requestId);
}

/**
 * Cria uma resposta de erro para problemas de RBAC
 */
export function createRBACErrorResponse(
  code: string,
  message: string,
  details?: any,
  requestId?: string
): ApiResponse {
  return createErrorResponse({ code, message, details }, requestId);
}

/**
 * Cria uma resposta de erro genérica
 */
export function createGenericErrorResponse(
  message: string = 'Erro interno do servidor',
  details?: any,
  requestId?: string
): ApiResponse {
  return createErrorResponse(
    {
      code: 'INTERNAL_ERROR',
      message,
      details,
    },
    requestId
  );
}

/**
 * Cria uma resposta de erro para validação
 */
export function createValidationErrorResponse(
  message: string,
  details?: any,
  requestId?: string
): ApiResponse {
  return createErrorResponse(
    {
      code: 'VALIDATION_ERROR',
      message,
      details,
    },
    requestId
  );
}

/**
 * Cria uma resposta de erro para recurso não encontrado
 */
export function createNotFoundErrorResponse(
  resource: string,
  id?: string,
  requestId?: string
): ApiResponse {
  return createErrorResponse(
    {
      code: 'NOT_FOUND',
      message: `${resource} não encontrado`,
      details: id ? { resource, id } : { resource },
    },
    requestId
  );
}
