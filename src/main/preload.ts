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

const auditHandler = {
  log: (action: string, entity: string, entityId: string, metadata?: any) =>
    ipcRenderer.invoke('audit:log', { action, entity, entityId, metadata }),
};

contextBridge.exposeInMainWorld('api', {
  auth: authHandler,
  db: dbHandler,
  sync: syncHandler,
  audit: auditHandler,
});

export type ApiHandler = {
  auth: typeof authHandler;
  db: typeof dbHandler;
  sync: typeof syncHandler;
  audit: typeof auditHandler;
};
