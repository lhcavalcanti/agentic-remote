export const TERMINAL_STARTUP_TIMEOUT_MS = 90_000

// Admission can resolve startup before delivery performs its own readiness
// check. Leave time for both budgets plus owner discovery and cleanup.
export const TERMINAL_REQUEST_TIMEOUT_MS = 2 * TERMINAL_STARTUP_TIMEOUT_MS + 30_000
