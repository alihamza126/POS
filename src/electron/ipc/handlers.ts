import { ipcMain } from 'electron';
import { AuthService } from '../../features/auth/services/auth-service';
import { AuditService } from '../../features/audit/services/audit-service';
import { ProductService } from '../../features/products/services/product-service';
import { CustomerService } from '../../features/customers/services/customer-service';
import { PaymentService } from '../../features/customers/services/payment-service';
import { LedgerService } from '../../features/customers/services/ledger-service';
import { SalesService } from '../../features/sales/services/sales-service';
import { CategoryService } from '../../features/categories/services/category-service';
import { SupplierService } from '../../features/suppliers/services/supplier-service';
import { SupplierLedgerService } from '../../features/suppliers/services/supplier-ledger-service';
import { syncService } from '../../sync/services/sync-service';
import { syncWorker } from '../../main/sync-worker';

export function setupIpcHandlers() {
  // Auth Handlers
  ipcMain.handle('auth:login', async (_event, credentials) => {
    return AuthService.login(credentials.username, credentials.password);
  });

  ipcMain.handle('auth:get-users', async () => {
    return AuthService.getUsers();
  });

  ipcMain.handle('auth:create-user', async (_event, { username, password, role, adminUserId }) => {
    return AuthService.createUser(username, password, role, adminUserId);
  });

  ipcMain.handle('auth:change-password', async (_event, { username, newPassword, adminUserId }) => {
    return AuthService.changePassword(username, newPassword, adminUserId);
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

  ipcMain.handle(
    'products:import-bulk',
    async (_event, { products, userId, branchId }) => {
      return ProductService.importProductsBulk(products, userId, branchId);
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
    return syncService.getSyncStatus();
  });

  ipcMain.handle('sync:history', async () => {
    return syncService.getSyncHistory();
  });

  ipcMain.handle('sync:trigger', async () => {
    return syncService.processQueue();
  });

  ipcMain.handle('sync:pull', async () => {
    return syncService.pullFromCloud();
  });

  ipcMain.handle('sync:set-auto', async (_event, enabled: boolean) => {
    return syncWorker.setAutoSync(enabled);
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

  // Customer Handlers
  ipcMain.handle('customers:list', async (_event, filters) => {
    return CustomerService.getCustomers(filters);
  });

  ipcMain.handle('customers:get', async (_event, id) => {
    return CustomerService.getCustomer(id);
  });

  ipcMain.handle('customers:create', async (_event, { data, userId }) => {
    return CustomerService.createCustomer(data, userId);
  });

  ipcMain.handle('customers:update', async (_event, { id, data, userId }) => {
    return CustomerService.updateCustomer(id, data, userId);
  });

  ipcMain.handle('customers:delete', async (_event, { id, userId }) => {
    return CustomerService.deleteCustomer(id, userId);
  });

  ipcMain.handle('customers:get-ledger', async (_event, customerId) => {
    return LedgerService.getCustomerLedger(customerId);
  });

  ipcMain.handle('customers:get-summary', async (_event, customerId) => {
    return LedgerService.getCustomerSummary(customerId);
  });

  ipcMain.handle(
    'customers:record-payment',
    async (_event, { data, userId }) => {
      return PaymentService.recordPayment(data, userId);
    },
  );

  ipcMain.handle('customers:get-payments', async (_event, customerId) => {
    return PaymentService.getCustomerPayments(customerId);
  });

  // Sales Handlers
  ipcMain.handle('sales:create', async (_event, input) => {
    return SalesService.createSale(input);
  });

  ipcMain.handle('sales:get', async (_event, id) => {
    return SalesService.getSale(id);
  });

  ipcMain.handle('sales:list', async (_event, filters) => {
    return SalesService.getSales(filters);
  });

  ipcMain.handle(
    'sales:cancel',
    async (_event, { id, userId, branchId, deviceId }) => {
      return SalesService.cancelSale(id, userId, branchId, deviceId);
    },
  );

  ipcMain.handle('sales:daily-summary', async (_event, branchId) => {
    return SalesService.getDailySummary(branchId);
  });

  ipcMain.handle(
    'sales:next-invoice-number',
    async (_event, { branchId, deviceId }) => {
      return SalesService.getNextInvoiceNumber(branchId, deviceId);
    },
  );

  // Category Handlers
  ipcMain.handle('categories:list', async (_event, branchId) => {
    return CategoryService.getCategories(branchId);
  });

  ipcMain.handle('categories:create', async (_event, { data, userId }) => {
    return CategoryService.createCategory(data, userId);
  });

  ipcMain.handle('categories:update', async (_event, { id, data, userId }) => {
    return CategoryService.updateCategory(id, data, userId);
  });

  ipcMain.handle('categories:delete', async (_event, { id, userId }) => {
    return CategoryService.deleteCategory(id, userId);
  });

  // Supplier Handlers
  ipcMain.handle('suppliers:list', async (_event, filters) => {
    return SupplierService.getSuppliers(filters);
  });

  ipcMain.handle('suppliers:get', async (_event, id) => {
    return SupplierService.getSupplier(id);
  });

  ipcMain.handle('suppliers:create', async (_event, { data, userId }) => {
    return SupplierService.createSupplier(data, userId);
  });

  ipcMain.handle('suppliers:update', async (_event, { id, data, userId }) => {
    return SupplierService.updateSupplier(id, data, userId);
  });

  ipcMain.handle('suppliers:delete', async (_event, { id, userId }) => {
    return SupplierService.deleteSupplier(id, userId);
  });

  ipcMain.handle('suppliers:get-ledger', async (_event, supplierId) => {
    return SupplierLedgerService.getSupplierLedger(supplierId);
  });

  ipcMain.handle('suppliers:get-summary', async (_event, supplierId) => {
    return SupplierLedgerService.getSupplierSummary(supplierId);
  });

  ipcMain.handle(
    'suppliers:create-purchase-invoice',
    async (_event, { invoiceData, items, userId, branchId, deviceId }) => {
      return SupplierService.createPurchaseInvoice(
        invoiceData,
        items,
        userId,
        branchId,
        deviceId,
      );
    },
  );

  ipcMain.handle('suppliers:get-purchase-invoices', async (_event, supplierId) => {
    return SupplierService.getPurchaseInvoices(supplierId);
  });

  ipcMain.handle(
    'suppliers:record-payment',
    async (_event, { data, userId }) => {
      return SupplierService.recordPayment(data, userId);
    },
  );

  ipcMain.handle('suppliers:get-payments', async (_event, supplierId) => {
    return SupplierService.getPayments(supplierId);
  });

  ipcMain.handle(
    'suppliers:create-simple-purchase',
    async (_event, { data, userId }) => {
      return SupplierService.createSimplePurchase(data, userId);
    },
  );
}

export default setupIpcHandlers;
