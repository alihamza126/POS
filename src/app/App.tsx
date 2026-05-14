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
import POSPage from '../features/sales/pages/POSPage';
import SalesHistoryPage from '../features/sales/pages/SalesHistoryPage';
import CategoryListPage from '../features/categories/pages/CategoryListPage';
import SettingsPage from '../features/settings/pages/SettingsPage';

import { Toaster } from '../components/ui/toaster';

function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-secondary">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface p-6 rounded-2xl shadow-soft border border-navy/20 h-32 flex items-center justify-center"
          >
            <p className="text-text-secondary font-medium">Metric Card {i}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
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
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<ProductListPage />} />
                  <Route
                    path="/inventory/:id"
                    element={<ProductDetailsPage />}
                  />
                  <Route path="/sales" element={<SalesHistoryPage />} />
                  <Route path="/categories" element={<CategoryListPage />} />
                  <Route path="/audit" element={<AuditLogPage />} />
                  <Route path="/customers" element={<CustomerListPage />} />
                  <Route
                    path="/customers/:id"
                    element={<CustomerDetailsPage />}
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
    </Router>
  );
}
