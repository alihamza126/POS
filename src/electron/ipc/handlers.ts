import { ipcMain } from 'electron';
import { AuthService } from '../../features/auth/services/auth-service';
import { AuditService } from '../../features/audit/services/audit-service';

export function setupIpcHandlers() {
  // Auth Handlers
  ipcMain.handle('auth:login', async (_event, credentials) => {
    return AuthService.login(credentials.username, credentials.password);
  });

  // DB Handlers
  ipcMain.handle('db:query', async (_event, { action, entity, payload }) => {
    // This would dispatch to repositories based on entity
    // eslint-disable-next-line no-console
    console.log(`DB Query: ${action} ${entity}`, payload);
    return { success: true, data: [] };
  });

  // Sync Handlers
  ipcMain.handle('sync:status', async () => {
    return { lastSync: new Date(), pending: 0 };
  });

  // Audit Handlers
  ipcMain.handle('audit:log', async (_event, logEntry) => {
    return AuditService.log(logEntry);
  });
}

export default setupIpcHandlers;
