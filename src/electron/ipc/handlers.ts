import { ipcMain, BrowserWindow, shell } from 'electron';
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
import { MedicalService } from '../../features/inventory/services/medical-service';

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

  // ---------------------------------------------------------------------------
  // Medical Handlers — Expiry Alerts
  // ---------------------------------------------------------------------------
  ipcMain.handle('medical:get-alerts', async (_event, branchId) => {
    return MedicalService.getActiveAlerts(branchId);
  });

  ipcMain.handle('medical:get-alert-counts', async (_event, branchId) => {
    return MedicalService.getAlertCounts(branchId);
  });

  ipcMain.handle('medical:dismiss-alert', async (_event, { alertId, userId, branchId }) => {
    return MedicalService.dismissAlert(alertId, userId, branchId);
  });

  ipcMain.handle('medical:refresh-alerts', async (_event, { branchId, thresholdDays }) => {
    return MedicalService.refreshExpiryAlerts(branchId, thresholdDays);
  });

  ipcMain.handle('medical:get-expiring-batches', async (_event, { branchId, thresholdDays }) => {
    return MedicalService.getExpiringBatches(branchId, thresholdDays);
  });

  // ---------------------------------------------------------------------------
  // Medical Handlers — Product Batches
  // ---------------------------------------------------------------------------
  ipcMain.handle('medical:get-batches', async (_event, productId) => {
    return MedicalService.getBatchesForProduct(productId);
  });

  ipcMain.handle('medical:add-batch', async (_event, { data, userId }) => {
    return MedicalService.addBatch(data, userId);
  });

  // ---------------------------------------------------------------------------
  // Medical Handlers — Patient Records
  // ---------------------------------------------------------------------------
  ipcMain.handle('medical:get-patient-record', async (_event, customerId) => {
    return MedicalService.getPatientRecord(customerId);
  });

  ipcMain.handle('medical:save-patient-record', async (_event, { customerId, data, userId, branchId }) => {
    return MedicalService.savePatientRecord(customerId, data, userId, branchId);
  });

  // ---------------------------------------------------------------------------
  // Medical Handlers — Prescriptions
  // ---------------------------------------------------------------------------
  ipcMain.handle('medical:create-prescription', async (_event, data) => {
    return MedicalService.createPrescription(data);
  });

  ipcMain.handle('medical:get-prescriptions', async (_event, customerId) => {
    return MedicalService.getPrescriptionsByCustomer(customerId);
  });

  ipcMain.handle('medical:get-prescription', async (_event, id) => {
    return MedicalService.getPrescriptionById(id);
  });

  ipcMain.handle('medical:link-prescription', async (_event, { prescriptionId, invoiceId, userId, branchId }) => {
    return MedicalService.linkPrescriptionToInvoice(prescriptionId, invoiceId, userId, branchId);
  });

  // ---------------------------------------------------------------------------
  // Medical Handlers — Clinic Settings
  // ---------------------------------------------------------------------------
  ipcMain.handle('medical:get-clinic-settings', async () => {
    return MedicalService.getClinicSettings();
  });

  ipcMain.handle('medical:save-clinic-settings', async (_event, { settings, userId, branchId }) => {
    return MedicalService.saveClinicSettings(settings, userId, branchId);
  });

  // ---------------------------------------------------------------------------
  // Print Handler — Opens hidden window and prints receipt HTML
  // ---------------------------------------------------------------------------
  ipcMain.handle('print:receipt', async (_event, { html, silent }) => {
    return new Promise((resolve, reject) => {
      const printWindow = new BrowserWindow({
        show: false,
        width: 400,
        height: 800,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
        },
      });

      const encodedHtml = encodeURIComponent(html);
      printWindow.loadURL(`data:text/html;charset=utf-8,${encodedHtml}`);

      printWindow.webContents.once('did-finish-load', () => {
        printWindow.webContents.print(
          {
            silent: silent ?? false,
            printBackground: true,
            margins: { marginType: 'none' },
          },
          (success, failureReason) => {
            printWindow.destroy();
            if (success) {
              resolve({ success: true });
            } else {
              // eslint-disable-next-line no-console
              console.error('Print failed:', failureReason);
              resolve({ success: false, reason: failureReason });
            }
          },
        );
      });

      printWindow.webContents.once('did-fail-load', () => {
        printWindow.destroy();
        reject(new Error('Failed to load print content'));
      });
    });
  });
}

export default setupIpcHandlers;
