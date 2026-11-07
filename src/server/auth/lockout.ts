export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;

/** Counts a failed login; locks for 15 minutes on the `max`-th failure unless auto-block is off. */
export function registerFailure(failedLogin: number, now: Date, max = MAX_FAILED_LOGINS, autoBlock = true) {
  const next = failedLogin + 1;
  if (!autoBlock || next < max) return { failedLogin: next, lockedUntil: null };
  return { failedLogin: 0, lockedUntil: new Date(now.getTime() + LOCK_MINUTES * 60_000) };
}

export const isLocked = (lockedUntil: Date | null, now: Date) =>
  lockedUntil !== null && lockedUntil.getTime() > now.getTime();
