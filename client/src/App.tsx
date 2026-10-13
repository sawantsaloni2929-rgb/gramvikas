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
import { SmsNotificationsPage } from './pages/SmsNotificationsPage';
import { SyncCentrePage } from './pages/SyncCentrePage';
import { SchemesPage } from './pages/SchemesPage';
import { ReportsBackupPage } from './pages/ReportsBackupPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { OrdersPage } from './pages/OrdersPage';

export const App: React.FC = () => {
  const [dbReady, setDbReady] = useState(false);
  const [lowResourceMode, setLowResourceMode] = useState<boolean>(() => {
    return localStorage.getItem('gv_low_resource') === 'true';
  });

  useEffect(() => {
    // Initialize offline IndexedDB on application boot
    initDatabase().then(() => {
      setDbReady(true);
    });
  }, []);

  const handleSetLowResource = (val: boolean) => {
    setLowResourceMode(val);
    localStorage.setItem('gv_low_resource', String(val));
    if (val) {
      document.body.classList.add('low-resource-mode');
    } else {
      document.body.classList.remove('low-resource-mode');
    }
  };

  useEffect(() => {
    if (lowResourceMode) {
      document.body.classList.add('low-resource-mode');
    } else {
      document.body.classList.remove('low-resource-mode');
    }
  }, [lowResourceMode]);

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

          {/* Protected Business Management Routes wrapped in Layout */}
          <Route
            path="/dashboard"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <DashboardPage />
              </Layout>
            }
          />
          <Route
            path="/customer-dashboard"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <CustomerDashboardPage />
              </Layout>
            }
          />
          <Route
            path="/customer-portal"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <CustomerDashboardPage />
              </Layout>
            }
          />
          <Route
            path="/products"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <ProductsPage />
              </Layout>
            }
          />
          <Route
            path="/products/new"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <ProductFormPage />
              </Layout>
            }
          />
          <Route
            path="/products/edit/:id"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <ProductFormPage />
              </Layout>
            }
          />
          <Route
            path="/sales"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <SalesPage />
              </Layout>
            }
          />
          <Route
            path="/orders"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <OrdersPage />
              </Layout>
            }
          />
          <Route
            path="/expenses"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <ExpensesPage />
              </Layout>
            }
          />
          <Route
            path="/customers"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <CustomersPage />
              </Layout>
            }
          />
          <Route
            path="/payments"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <PaymentsPage />
              </Layout>
            }
          />
          <Route
            path="/insights"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <InsightsPage />
              </Layout>
            }
          />
          <Route
            path="/sms"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <SmsNotificationsPage />
              </Layout>
            }
          />
          <Route
            path="/sync"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <SyncCentrePage />
              </Layout>
            }
          />
          <Route
            path="/schemes"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <SchemesPage />
              </Layout>
            }
          />
          <Route
            path="/reports"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <ReportsBackupPage />
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <ProfileSettingsPage
                  lowResourceMode={lowResourceMode}
                  setLowResourceMode={handleSetLowResource}
                />
              </Layout>
            }
          />
          <Route
            path="/admin"
            element={
              <Layout lowResourceMode={lowResourceMode} setLowResourceMode={handleSetLowResource}>
                <AdminDashboardPage />
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
