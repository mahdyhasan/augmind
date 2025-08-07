import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AIChat from "./pages/AIChat";
import AdminPanel from "./pages/AdminPanel";
import ClientProspect from "./pages/ClientProspect";
import Uploads from "./pages/Uploads";
import PresetQuestions from "./pages/PresetQuestions";
import PlaceholderPage from "./components/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected routes with dashboard layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AIChat />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/uploads"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Uploads />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/competitors"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PlaceholderPage
                title="Competitor Insights"
                description="Analyze competitors and market trends to stay ahead in your industry."
              />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PlaceholderPage
                title="Client Intelligence"
                description="Manage and analyze client data to improve relationships and identify opportunities."
              />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/usp-vision"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PlaceholderPage
                title="USP & Vision"
                description="Define and refine your unique selling propositions and company vision with AI assistance."
              />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/preset-questions"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PresetQuestions />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AdminPanel />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/client-prospect"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ClientProspect />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PlaceholderPage
                title="Settings"
                description="Manage your account settings, change password, and view usage statistics."
              />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
