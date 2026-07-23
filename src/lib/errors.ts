type ErrorLike = {
  message?: unknown;
  digest?: unknown;
  stack?: unknown;
  cause?: unknown;
};

function isErrorLike(error: unknown): error is ErrorLike {
  return typeof error === 'object' && error !== null;
}

export function getErrorMessage(error: unknown, fallback = 'Unexpected error') {
  if (error instanceof Error) {
    return error.message;
  }

  if (isErrorLike(error) && typeof error.message === 'string') {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallback;
}

export function getErrorStack(error: unknown) {
  if (error instanceof Error) {
    return error.stack;
  }

  if (isErrorLike(error) && typeof error.stack === 'string') {
    return error.stack;
  }

  return undefined;
}

export function getErrorCause(error: unknown): Record<string, unknown> {
  if (!isErrorLike(error) || !isErrorLike(error.cause)) {
    return {};
  }

  return error.cause as Record<string, unknown>;
}

export function isNextRedirectError(error: unknown) {
  if (!isErrorLike(error)) {
    return false;
  }

  return (
    error.message === 'NEXT_REDIRECT' ||
    (typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT'))
  );
}
