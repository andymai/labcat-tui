/// <reference types="vite/client" />

/**
 * True when running in a dev bundler (vite). Falls back to true when
 * `import.meta.env` isn't injected (e.g. raw <script> import) so warnings
 * still surface; treat true as the safe default.
 */
export function isDev(): boolean {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.DEV !== false;
    }
  } catch (err) {
    if (!(err instanceof ReferenceError)) throw err;
  }
  return true;
}

export function devWarn(message: string, ...args: unknown[]): void {
  if (isDev() && typeof console !== 'undefined') {
    console.warn(`[@labcat/tui] ${message}`, ...args);
  }
}
