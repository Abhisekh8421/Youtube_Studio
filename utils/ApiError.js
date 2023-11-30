class ApiError extends Error {
  constructor(
    statusCode,
    message = "some related error",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.errors = errors;
    this.data = null;
    this.message = message;
    this.success = false;
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
