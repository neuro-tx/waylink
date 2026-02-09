export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "SERVER_ERROR";

export const ERROR_STATUS: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION: 422,
  SERVER_ERROR: 500,
};

export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;

  constructor(code: ErrorCode, message: string) {
    super(message);

    this.code = code;
    this.status = ERROR_STATUS[code] ?? 500;
  }
}

export const Errors = {
  badRequest: (msg = "Bad request") => new ApiError("BAD_REQUEST", msg),

  unauthorized: (msg = "Unauthorized") => new ApiError("UNAUTHORIZED", msg),

  forbidden: (msg = "Forbidden") => new ApiError("FORBIDDEN", msg),

  notFound: (msg = "Not found") => new ApiError("NOT_FOUND", msg),

  conflict: (msg = "Conflict") => new ApiError("CONFLICT", msg),

  validation: (msg = "Invalid input") => new ApiError("VALIDATION", msg),

  server: (msg = "Server error") => new ApiError("SERVER_ERROR", msg),
};

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
