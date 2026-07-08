export class AppError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function toErrorResponse(err, requestId) {
  const status = err?.status ?? 500;
  const code = err?.code ?? 'INTERNAL_ERROR';
  const message = err?.status ? err.message : 'An unexpected error occurred';

  return {
    status,
    body: {
      error: {
        code,
        message,
        requestId,
        details: err?.details ?? null
      }
    }
  };
}
