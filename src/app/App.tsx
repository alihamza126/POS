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

import { Toaster } from '../components/ui/toaster';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route
                    path="/pos"
                    element={
                      <div className="text-2xl font-bold">
                        POS Module (Coming Soon)
                      </div>
                    }
                  />
                  <Route path="/inventory" element={<ProductListPage />} />
                  <Route
                    path="/inventory/:id"
                    element={<ProductDetailsPage />}
                  />
                  <Route path="/audit" element={<AuditLogPage />} />
                  <Route
                    path="/customers"
                    element={
                      <div className="text-2xl font-bold">
                        Customers Module (Coming Soon)
                      </div>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <div className="text-2xl font-bold">
                        Settings Module (Coming Soon)
                      </div>
                    }
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
