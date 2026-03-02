export function sanitizeError(
  error: unknown,
  operation: string,
  context?: Record<string, unknown>
): Error {
  const err = error as Record<string, unknown>;

  console.error(`[Repository Error: ${operation}]`, {
    operation,
    context,
    code: err.code,
    message: err.message,
    details: err.details,
    hint: err.hint,
  });

  if (err.code === "PGRST116") {
    return new Error("Resource not found");
  }

  if (typeof err.code === "string" && err.code.startsWith("23")) {
    return new Error("Invalid data provided");
  }

  if (err.code === "42501") {
    return new Error("You do not have permission to access this resource");
  }

  return new Error("Something went wrong. Please try again.");
}
