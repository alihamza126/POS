import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/globals.css';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../features/auth/pages/LoginPage';
import ProtectedRoute from '../routes/ProtectedRoute';

import ProductListPage from '../features/products/pages/ProductListPage';
import ProductDetailsPage from '../features/products/pages/ProductDetailsPage';
import AuditLogPage from '../features/audit/pages/AuditLogPage';
import CustomerListPage from '../features/customers/pages/CustomerListPage';
import CustomerDetailsPage from '../features/customers/pages/CustomerDetailsPage';
import SupplierListPage from '../features/suppliers/pages/SupplierListPage';
import SupplierDetailsPage from '../features/suppliers/pages/SupplierDetailsPage';
import POSPage from '../features/sales/pages/POSPage';
import SalesHistoryPage from '../features/sales/pages/SalesHistoryPage';
import CategoryListPage from '../features/categories/pages/CategoryListPage';
import SettingsPage from '../features/settings/pages/SettingsPage';
import FormulaListPage from '../features/formulas/pages/FormulaListPage';

import { Toaster } from '../components/ui/toaster';
import GlobalCloseDialog from '../components/shared/GlobalCloseDialog';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import { useAuthStore } from '../stores/auth-store';

export default function App() {
  // The renderer's auth state is persisted to localStorage and survives an
  // app restart, but the main process's session (which every permission
  // check trusts) is intentionally in-memory only and resets on restart.
  // Reconcile the two on boot so a stale "still logged in" renderer never
  // sits in front of IPC calls that will all fail with "not logged in".
  React.useEffect(() => {
    const syncSession = async () => {
      try {
        // @ts-ignore
        const session = await window.api.auth.getSession();
        if (!session && useAuthStore.getState().isAuthenticated) {
          useAuthStore.getState().logout();
        }
      } catch {
        // If the check itself fails, err on the side of requiring login.
        useAuthStore.getState().logout();
      }
    };
    syncSession();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* POS uses its own full-screen layout — no sidebar */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute>
              <POSPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/inventory" element={<ProductListPage />} />
                  <Route
                    path="/inventory/:id"
                    element={<ProductDetailsPage />}
                  />
                  <Route path="/sales" element={<SalesHistoryPage />} />
                  <Route path="/categories" element={<CategoryListPage />} />
                  <Route path="/formulas" element={<FormulaListPage />} />
                  <Route path="/audit" element={<AuditLogPage />} />
                  <Route path="/customers" element={<CustomerListPage />} />
                  <Route
                    path="/customers/:id"
                    element={<CustomerDetailsPage />}
                  />
                  <Route path="/suppliers" element={<SupplierListPage />} />
                  <Route
                    path="/suppliers/:id"
                    element={<SupplierDetailsPage />}
                  />
                  <Route
                    path="/settings"
                    element={<SettingsPage />}
                  />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
      <GlobalCloseDialog />
    </Router>
  );
}
