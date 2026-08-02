/**
 * Optional runtime error reporter for React error boundaries.
 * Logs to console in production; no third-party telemetry.
 */
export function reportRuntimeError(
  error: unknown,
  context: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;

  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error("[Axiomm]", message, { stack, ...context });
}
