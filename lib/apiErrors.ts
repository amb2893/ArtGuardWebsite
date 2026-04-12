import { NextResponse } from "next/server";

type UnknownError = {
  message?: string;
  code?: string;
  name?: string;
  detail?: string;
  constraint?: string;
};

export interface ApiErrorInfo {
  status: number;
  message: string;
  cause: string;
  code?: string;
}

function asError(err: unknown): UnknownError {
  if (!err || typeof err !== "object") return {};
  return err as UnknownError;
}

export function normalizeApiError(err: unknown, fallbackMessage: string): ApiErrorInfo {
  const error = asError(err);
  const code = error.code;
  const name = error.name;

  if (err instanceof SyntaxError) {
    return { status: 400, message: "Invalid request body", cause: "Malformed JSON payload" };
  }

  if (name === "JsonWebTokenError" || name === "TokenExpiredError") {
    return { status: 401, message: "Unauthorized", cause: "Invalid or expired authentication token" };
  }

  if (code === "23505") {
    return { status: 409, message: "Conflict", cause: "Duplicate value violates a unique constraint", code };
  }

  if (code === "23503") {
    return { status: 400, message: "Invalid reference", cause: "Referenced record does not exist", code };
  }

  if (code === "23514") {
    return { status: 400, message: "Validation failed", cause: "Value violates a database check constraint", code };
  }

  if (code === "22P02") {
    return { status: 400, message: "Validation failed", cause: "Invalid value format for one or more fields", code };
  }

  if (code === "42P01") {
    return { status: 500, message: "Database setup error", cause: "Required table is missing", code };
  }

  if (code === "42703") {
    return { status: 500, message: "Database setup error", cause: "Required column is missing", code };
  }

  if (code === "ECONNREFUSED" || code === "ETIMEDOUT") {
    return { status: 503, message: "Database unavailable", cause: "Cannot connect to the database" };
  }

  return {
    status: 500,
    message: fallbackMessage,
    cause: error.message || "Unexpected internal error",
    code,
  };
}

export function apiErrorResponse(route: string, err: unknown, fallbackMessage: string) {
  const normalized = normalizeApiError(err, fallbackMessage);
  console.error(`${route} error:`, err);

  const payload: Record<string, unknown> = {
    error: normalized.message,
    cause: normalized.cause,
  };

  if (normalized.code) payload.code = normalized.code;

  if (process.env.NODE_ENV !== "production") {
    const maybeErr = asError(err);
    if (maybeErr.detail) payload.detail = maybeErr.detail;
    if (maybeErr.constraint) payload.constraint = maybeErr.constraint;
  }

  return NextResponse.json(payload, { status: normalized.status });
}
