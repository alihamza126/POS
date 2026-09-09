/**
 * SessionManager — tracks the currently logged-in user in the MAIN process.
 *
 * Why this exists: every IPC handler used to trust whatever `userId` the
 * renderer sent along with a call, purely for audit-log attribution — there
 * was no server-side notion of "who is actually logged in", so nothing
 * stopped a compromised/DevTools-driven renderer from calling any handler
 * as if it were an admin. This in-memory singleton is set on successful
 * login and cleared on logout, and permissions.ts checks against it instead
 * of anything the renderer claims.
 *
 * Deliberately in-memory only (not persisted) — it resets on every app
 * restart, which means a fresh launch always requires a real login. That's
 * intentional for a POS handling money/medical data, not an oversight.
 */
export interface SessionUser {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'manager' | 'cashier' | 'accountant';
  branchId: string;
}

class SessionManagerImpl {
  private currentUser: SessionUser | null = null;

  setCurrentUser(user: SessionUser | null) {
    this.currentUser = user;
  }

  getCurrentUser(): SessionUser | null {
    return this.currentUser;
  }

  clear() {
    this.currentUser = null;
  }
}

export const SessionManager = new SessionManagerImpl();
