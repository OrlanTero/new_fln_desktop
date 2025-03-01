import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import SplashScreen from './components/SplashScreen';
import './index.css';

// Import pages from their respective folders
import {
  Dashboard,
  Services,
  Messenger,
  Settings,
  Proposals,
  Projects
} from './pages/core';

import {
  Clients,
  ClientTypes,
  Users
} from './pages/administrator';

import {
  CounterProposals,
  AllDocuments
} from './pages/documents';

import {
  Tasks,
  ExchangeRequests
} from './pages/project-manager';

import {
  Billing,
  Payroll
} from './pages/finance';

import {
  Reports,
  Logs,
  Bin,
  BackUp
} from './pages/reports';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <AuthProvider>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <Layout>
                  <Services />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messenger"
            element={
              <ProtectedRoute>
                <Layout>
                  <Messenger />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/proposals"
            element={
              <ProtectedRoute>
                <Layout>
                  <Proposals />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/proposals/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <Proposals />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Layout>
                  <Projects />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <Projects />
                </Layout>
              </ProtectedRoute>
            }
          />
            {/* Administrator Routes */}
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute>
                <Layout>
                  <Clients />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/client-types"
            element={
              <ProtectedRoute>
                <Layout>
                  <ClientTypes />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />
            {/* Document Routes */}
          <Route
            path="/documents/counter-proposals"
            element={
              <ProtectedRoute>
                <Layout>
                  <CounterProposals />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/all"
            element={
              <ProtectedRoute>
                <Layout>
                  <AllDocuments />
                </Layout>
              </ProtectedRoute>
            }
          />
            {/* Project Manager Routes */}
          <Route
            path="/projects/tasks"
            element={
              <ProtectedRoute>
                <Layout>
                  <Tasks />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/exchange-requests"
            element={
              <ProtectedRoute>
                <Layout>
                  <ExchangeRequests />
                </Layout>
              </ProtectedRoute>
            }
          />
            {/* Finance Routes */}
          <Route
            path="/finance/billing"
            element={
              <ProtectedRoute>
                <Layout>
                  <Billing />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/payroll"
            element={
              <ProtectedRoute>
                <Layout>
                  <Payroll />
                </Layout>
              </ProtectedRoute>
            }
          />
            {/* Reports Routes */}
          <Route
            path="/reports/all"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/logs"
            element={
              <ProtectedRoute>
                <Layout>
                  <Logs />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/bin"
            element={
              <ProtectedRoute>
                <Layout>
                  <Bin />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/backup"
            element={
              <ProtectedRoute>
                <Layout>
                  <BackUp />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
      </AuthProvider>
    </Router>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />); 