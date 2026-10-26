// Application error reporting helper
// Preserves runtime error handling without relying on external sandbox scripts

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (process.env.NODE_ENV !== "production") {
    console.error("[Application Error]", error, context);
  }
}
