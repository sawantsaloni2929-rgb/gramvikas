import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { initDatabase } from './db/dbOperations';

// Layout
import { Layout } from './components/layout/Layout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductFormPage } from './pages/ProductFormPage';
import { SalesPage } from './pages/SalesPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { CustomersPage } from './pages/CustomersPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { InsightsPage } from './pages/InsightsPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { OrdersPage } from './pages/OrdersPage';

export const App: React.FC = () => {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Initialize offline IndexedDB on application boot
    initDatabase().then(() => {
      setDbReady(true);
    });
  }, []);

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-forest-700 text-white font-black text-2xl flex items-center justify-center shadow-lg animate-pulse mb-4">
          ग
        </div>
        <h2 className="font-extrabold text-base text-slate-900 tracking-tight">ग्रामविकास लोड होत आहे...</h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">Initializing local offline IndexedDB database...</p>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication & Welcome Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Core Business Management Routes */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                <DashboardPage />
              </Layout>
            }
          />
          <Route
            path="/customer-dashboard"
            element={
              <Layout>
                <CustomerDashboardPage />
              </Layout>
            }
          />
          <Route
            path="/customer-portal"
            element={
              <Layout>
                <CustomerDashboardPage />
              </Layout>
            }
          />
          <Route
            path="/products"
            element={
              <Layout>
                <ProductsPage />
              </Layout>
            }
          />
          <Route
            path="/products/new"
            element={
              <Layout>
                <ProductFormPage />
              </Layout>
            }
          />
          <Route
            path="/products/edit/:id"
            element={
              <Layout>
                <ProductFormPage />
              </Layout>
            }
          />
          <Route
            path="/sales"
            element={
              <Layout>
                <SalesPage />
              </Layout>
            }
          />
          <Route
            path="/orders"
            element={
              <Layout>
                <OrdersPage />
              </Layout>
            }
          />
          <Route
            path="/expenses"
            element={
              <Layout>
                <ExpensesPage />
              </Layout>
            }
          />
          <Route
            path="/customers"
            element={
              <Layout>
                <CustomersPage />
              </Layout>
            }
          />
          <Route
            path="/payments"
            element={
              <Layout>
                <PaymentsPage />
              </Layout>
            }
          />
          <Route
            path="/insights"
            element={
              <Layout>
                <InsightsPage />
              </Layout>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
};
