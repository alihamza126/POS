import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/globals.css';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../features/auth/pages/LoginPage';
import ProtectedRoute from '../routes/ProtectedRoute';

function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-secondary">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface p-6 rounded-2xl shadow-soft border border-border h-32 flex items-center justify-center"
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
                  <Route
                    path="/inventory"
                    element={
                      <div className="text-2xl font-bold">
                        Inventory Module (Coming Soon)
                      </div>
                    }
                  />
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
    </Router>
  );
}
