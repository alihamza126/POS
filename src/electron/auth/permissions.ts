/**
 * Role-based permission checks for sensitive IPC handlers, enforced against
 * the server-side SessionManager (never against anything the renderer
 * claims). Mirrors the "Permission Rules" section of
 * .agents/rules/business-rules.md: deleting invoices, stock adjustment,
 * settings changes, refund processing, and user management all require
 * permission — plus destructive catalog/party management (deleting
 * products/categories/customers/suppliers), which the rules imply but don't
 * spell out.
 */
import { SessionManager, SessionUser } from './session';

export const PERMISSIONS = {
  // Creating/editing users, changing passwords
  MANAGE_USERS: ['owner', 'admin'],
  // Clinic settings, sync auto-toggle, and other system-level configuration
  MANAGE_SETTINGS: ['owner', 'admin', 'manager'],
  // Manual stock adjustments (damage, correction, transfer)
  ADJUST_STOCK: ['owner', 'admin', 'manager'],
  // Cancelling a sale (invoices are never hard-deleted, cancel is the closest equivalent)
  CANCEL_SALE: ['owner', 'admin', 'manager'],
  // Soft-deleting products, categories, customers, suppliers
  DELETE_RECORDS: ['owner', 'admin', 'manager'],
  // Triggering manual cloud sync / pull / toggling auto-sync
  MANAGE_SYNC: ['owner', 'admin', 'manager'],
} as const satisfies Record<string, readonly SessionUser['role'][]>;

export type Permission = keyof typeof PERMISSIONS;

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

/**
 * Throws if there is no logged-in session, or the logged-in user's role
 * isn't allowed to perform `permission`. Call this at the top of any
 * sensitive ipcMain.handle callback — throwing inside a handle callback
 * rejects the renderer's `invoke()` promise with this exact message, which
 * existing UI code already catches and surfaces via toast/error banners.
 */
export function requirePermission(permission: Permission): SessionUser {
  const user = SessionManager.getCurrentUser();
  if (!user) {
    throw new PermissionError('You must be logged in to do this.');
  }
  const allowedRoles: readonly string[] = PERMISSIONS[permission];
  if (!allowedRoles.includes(user.role)) {
    throw new PermissionError(
      `Permission denied — your role ("${user.role}") cannot perform this action.`,
    );
  }
  return user;
}
