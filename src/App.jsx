import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/layout/Layout';
import Toast from './components/common/Toast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PGDetails from './pages/PGDetails';
import MapView from './pages/MapView';
import TenantDashboard from './pages/TenantDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import Chat from './pages/Chat';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, loading } = useApp();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { toast } = useApp();
  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="pg/:id" element={<PGDetails />} />
          <Route path="map" element={<MapView />} />
          <Route path="contact" element={<Contact />} />
          <Route path="chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="dashboard/tenant" element={<ProtectedRoute requiredRole="tenant"><TenantDashboard /></ProtectedRoute>} />
          <Route path="dashboard/owner" element={<ProtectedRoute requiredRole="owner"><OwnerDashboard /></ProtectedRoute>} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
