import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import CustomerList from '@/pages/customers/CustomerList';
import CustomerDetail from '@/pages/customers/CustomerDetail';
import ProductList from '@/pages/products/ProductList';
import ProductDetail from '@/pages/products/ProductDetail';
import InventoryPage from '@/pages/inventory/InventoryPage';
import ChallanList from '@/pages/challans/ChallanList';
import CreateChallan from '@/pages/challans/CreateChallan';
import ChallanDetail from '@/pages/challans/ChallanDetail';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';

import { SocketProvider } from '@/contexts/SocketContext';
import SettingsPage from '@/pages/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return <SocketProvider>{children}</SocketProvider>;
}

function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg-primary">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              <Route
                path="customers"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}>
                    <CustomerList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="customers/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}>
                    <CustomerDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="products"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE']}>
                    <ProductList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="products/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE']}>
                    <ProductDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="inventory"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}>
                    <InventoryPage />
                  </ProtectedRoute>
                }
              />
              <Route path="stock" element={<Navigate to="/inventory" replace />} />

              <Route
                path="challans"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}>
                    <ChallanList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="challans/new"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
                    <CreateChallan />
                  </ProtectedRoute>
                }
              />
              <Route
                path="challans/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}>
                    <ChallanDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
