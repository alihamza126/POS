import { contextBridge, ipcRenderer } from 'electron';

const authHandler = {
  login: (credentials: any) => ipcRenderer.invoke('auth:login', credentials),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getSession: () => ipcRenderer.invoke('auth:get-session'),
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

contextBridge.exposeInMainWorld('api', {
  auth: authHandler,
  db: dbHandler,
  sync: syncHandler,
  products: productHandler,
  audit: auditHandler,
  customers: customerHandler,
  sales: salesHandler,
  categories: categoryHandler,
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
};
