import { contextBridge, ipcRenderer } from 'electron';

const authHandler = {
  login: (credentials: any) => ipcRenderer.invoke('auth:login', credentials),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getSession: () => ipcRenderer.invoke('auth:get-session'),
  getUsers: () => ipcRenderer.invoke('auth:get-users'),
  createUser: (params: any) => ipcRenderer.invoke('auth:create-user', params),
  changePassword: (params: any) => ipcRenderer.invoke('auth:change-password', params),
};

const dbHandler = {
  execute: (query: string, params?: any[]) =>
    ipcRenderer.invoke('db:execute', { query, params }),
  query: (query: string, params?: any[]) =>
    ipcRenderer.invoke('db:query', { query, params }),
};

const syncHandler = {
  getStatus: () => ipcRenderer.invoke('sync:status'),
  getHistory: () => ipcRenderer.invoke('sync:history'),
  triggerSync: () => ipcRenderer.invoke('sync:trigger'),
  pullFromCloud: () => ipcRenderer.invoke('sync:pull'),
  setAuto: (enabled: boolean) => ipcRenderer.invoke('sync:set-auto', enabled),
};

const productHandler = {
  list: (filters: any) => ipcRenderer.invoke('products:list', filters),
  get: (id: string) => ipcRenderer.invoke('products:get', id),
  create: (data: any, userId: string) =>
    ipcRenderer.invoke('products:create', { data, userId }),
  update: (id: string, data: any, userId: string) =>
    ipcRenderer.invoke('products:update', { id, data, userId }),
  delete: (id: string, userId: string) =>
    ipcRenderer.invoke('products:delete', { id, userId }),
  adjustStock: (params: any) =>
    ipcRenderer.invoke('products:adjust-stock', params),
  importBulk: (params: { products: any[]; userId: string; branchId: string }) =>
    ipcRenderer.invoke('products:import-bulk', params),
};

const auditHandler = {
  log: (action: string, entity: string, entityId: string, metadata?: any) =>
    ipcRenderer.invoke('audit:log', { action, entity, entityId, metadata }),
  getLogs: (filters: any) => ipcRenderer.invoke('audit:get-logs', filters),
  getActions: () => ipcRenderer.invoke('audit:get-actions'),
};

const customerHandler = {
  list: (filters: any) => ipcRenderer.invoke('customers:list', filters),
  get: (id: string) => ipcRenderer.invoke('customers:get', id),
  create: (data: any, userId: string) =>
    ipcRenderer.invoke('customers:create', { data, userId }),
  update: (id: string, data: any, userId: string) =>
    ipcRenderer.invoke('customers:update', { id, data, userId }),
  delete: (id: string, userId: string) =>
    ipcRenderer.invoke('customers:delete', { id, userId }),
  getLedger: (customerId: string) =>
    ipcRenderer.invoke('customers:get-ledger', customerId),
  getSummary: (customerId: string) =>
    ipcRenderer.invoke('customers:get-summary', customerId),
  recordPayment: (data: any, userId: string) =>
    ipcRenderer.invoke('customers:record-payment', { data, userId }),
  getPayments: (customerId: string) =>
    ipcRenderer.invoke('customers:get-payments', customerId),
};

const salesHandler = {
  create: (input: any) => ipcRenderer.invoke('sales:create', input),
  get: (id: string) => ipcRenderer.invoke('sales:get', id),
  list: (filters: any) => ipcRenderer.invoke('sales:list', filters),
  cancel: (id: string, userId: string, branchId: string, deviceId: string) =>
    ipcRenderer.invoke('sales:cancel', { id, userId, branchId, deviceId }),
  getDailySummary: (branchId: string) =>
    ipcRenderer.invoke('sales:daily-summary', branchId),
  getNextInvoiceNumber: (branchId: string, deviceId: string) =>
    ipcRenderer.invoke('sales:next-invoice-number', { branchId, deviceId }),
};

const categoryHandler = {
  list: (branchId: string) => ipcRenderer.invoke('categories:list', branchId),
  create: (data: any, userId: string) =>
    ipcRenderer.invoke('categories:create', { data, userId }),
  update: (id: string, data: any, userId: string) =>
    ipcRenderer.invoke('categories:update', { id, data, userId }),
  delete: (id: string, userId: string) =>
    ipcRenderer.invoke('categories:delete', { id, userId }),
};

const supplierHandler = {
  list: (filters: any) => ipcRenderer.invoke('suppliers:list', filters),
  get: (id: string) => ipcRenderer.invoke('suppliers:get', id),
  create: (data: any, userId: string) =>
    ipcRenderer.invoke('suppliers:create', { data, userId }),
  update: (id: string, data: any, userId: string) =>
    ipcRenderer.invoke('suppliers:update', { id, data, userId }),
  delete: (id: string, userId: string) =>
    ipcRenderer.invoke('suppliers:delete', { id, userId }),
  getLedger: (supplierId: string) =>
    ipcRenderer.invoke('suppliers:get-ledger', supplierId),
  getSummary: (supplierId: string) =>
    ipcRenderer.invoke('suppliers:get-summary', supplierId),
  createPurchaseInvoice: (
    invoiceData: any,
    items: any[],
    userId: string,
    branchId: string,
    deviceId: string,
  ) =>
    ipcRenderer.invoke('suppliers:create-purchase-invoice', {
      invoiceData,
      items,
      userId,
      branchId,
      deviceId,
    }),
  getPurchaseInvoices: (supplierId: string) =>
    ipcRenderer.invoke('suppliers:get-purchase-invoices', supplierId),
  recordPayment: (data: any, userId: string) =>
    ipcRenderer.invoke('suppliers:record-payment', { data, userId }),
  getPayments: (supplierId: string) =>
    ipcRenderer.invoke('suppliers:get-payments', supplierId),
  createSimplePurchase: (data: any, userId: string) =>
    ipcRenderer.invoke('suppliers:create-simple-purchase', { data, userId }),
};

const windowHandler = {
  toggleFullscreen: () => ipcRenderer.invoke('window:toggle-fullscreen'),
  onFullscreenChange: (callback: (isFullscreen: boolean) => void) => {
    const subscription = (_event: any, value: boolean) => callback(value);
    ipcRenderer.on('window:fullscreen-change', subscription);
    return () =>
      ipcRenderer.removeListener('window:fullscreen-change', subscription);
  },
  onCloseRequest: (callback: () => void) => {
    ipcRenderer.on('app:close-request', () => callback());
    return () => ipcRenderer.removeAllListeners('app:close-request');
  },
  confirmClose: () => ipcRenderer.send('app:confirm-close'),
};

// Medical / Clinic Handlers
const medicalHandler = {
  // Expiry Alerts
  getAlerts: (branchId: string) => ipcRenderer.invoke('medical:get-alerts', branchId),
  getAlertCounts: (branchId: string) => ipcRenderer.invoke('medical:get-alert-counts', branchId),
  dismissAlert: (alertId: string, userId: string, branchId: string) =>
    ipcRenderer.invoke('medical:dismiss-alert', { alertId, userId, branchId }),
  refreshAlerts: (branchId: string, thresholdDays?: number) =>
    ipcRenderer.invoke('medical:refresh-alerts', { branchId, thresholdDays: thresholdDays ?? 90 }),
  getExpiringBatches: (branchId: string, thresholdDays?: number) =>
    ipcRenderer.invoke('medical:get-expiring-batches', { branchId, thresholdDays: thresholdDays ?? 90 }),
  // Product Batches
  getBatches: (productId: string) => ipcRenderer.invoke('medical:get-batches', productId),
  addBatch: (data: any, userId: string) => ipcRenderer.invoke('medical:add-batch', { data, userId }),
  // Patient Records
  getPatientRecord: (customerId: string) =>
    ipcRenderer.invoke('medical:get-patient-record', customerId),
  savePatientRecord: (customerId: string, data: any, userId: string, branchId: string) =>
    ipcRenderer.invoke('medical:save-patient-record', { customerId, data, userId, branchId }),
  // Prescriptions
  createPrescription: (data: any) => ipcRenderer.invoke('medical:create-prescription', data),
  getPrescriptions: (customerId: string) =>
    ipcRenderer.invoke('medical:get-prescriptions', customerId),
  getPrescription: (id: string) => ipcRenderer.invoke('medical:get-prescription', id),
  linkPrescription: (prescriptionId: string, invoiceId: string, userId: string, branchId: string) =>
    ipcRenderer.invoke('medical:link-prescription', { prescriptionId, invoiceId, userId, branchId }),
  // Clinic Settings
  getClinicSettings: () => ipcRenderer.invoke('medical:get-clinic-settings'),
  saveClinicSettings: (settings: Record<string, string>, userId: string, branchId: string) =>
    ipcRenderer.invoke('medical:save-clinic-settings', { settings, userId, branchId }),
};

// Print Handler
const printHandler = {
  printReceipt: (html: string, silent?: boolean) =>
    ipcRenderer.invoke('print:receipt', { html, silent: silent ?? false }),
};

contextBridge.exposeInMainWorld('api', {
  auth: authHandler,
  db: dbHandler,
  sync: syncHandler,
  products: productHandler,
  audit: auditHandler,
  customers: customerHandler,
  sales: salesHandler,
  categories: categoryHandler,
  suppliers: supplierHandler,
  window: windowHandler,
  medical: medicalHandler,
  print: printHandler,
});

export type ApiHandler = {
  auth: typeof authHandler;
  db: typeof dbHandler;
  sync: typeof syncHandler;
  products: typeof productHandler;
  audit: typeof auditHandler;
  customers: typeof customerHandler;
  sales: typeof salesHandler;
  categories: typeof categoryHandler;
  suppliers: typeof supplierHandler;
  window: typeof windowHandler;
  medical: typeof medicalHandler;
  print: typeof printHandler;
};
