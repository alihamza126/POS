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
  triggerSync: () => ipcRenderer.invoke('sync:trigger'),
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

contextBridge.exposeInMainWorld('api', {
  auth: authHandler,
  db: dbHandler,
  sync: syncHandler,
  products: productHandler,
  audit: auditHandler,
});

export type ApiHandler = {
  auth: typeof authHandler;
  db: typeof dbHandler;
  sync: typeof syncHandler;
  products: typeof productHandler;
  audit: typeof auditHandler;
};
