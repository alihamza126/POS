import { ipcMain } from 'electron';
import { AuthService } from '../../features/auth/services/auth-service';
import { AuditService } from '../../features/audit/services/audit-service';
import { ProductService } from '../../features/products/services/product-service';

export function setupIpcHandlers() {
  // Auth Handlers
  ipcMain.handle('auth:login', async (_event, credentials) => {
    return AuthService.login(credentials.username, credentials.password);
  });

  // Product Handlers
  ipcMain.handle('products:list', async (_event, filters) => {
    return ProductService.getProducts(filters);
  });

  ipcMain.handle('products:get', async (_event, id) => {
    return ProductService.getProduct(id);
  });

  ipcMain.handle('products:create', async (_event, { data, userId }) => {
    return ProductService.createProduct(data, userId);
  });

  ipcMain.handle('products:update', async (_event, { id, data, userId }) => {
    return ProductService.updateProduct(id, data, userId);
  });

  ipcMain.handle('products:delete', async (_event, { id, userId }) => {
    return ProductService.deleteProduct(id, userId);
  });

  ipcMain.handle(
    'products:adjust-stock',
    async (_event, { productId, quantity, type, reason, userId, branchId }) => {
      return ProductService.adjustStock(
        productId,
        quantity,
        type,
        reason,
        userId,
        branchId,
      );
    },
  );

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
  ipcMain.handle('audit:get-logs', async (_event, filters) => {
    return AuditService.getLogs(filters);
  });
  ipcMain.handle('audit:get-actions', async () => {
    return AuditService.getActions();
  });
}

export default setupIpcHandlers;
