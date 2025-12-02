import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CookieConsent } from "@/components/CookieConsent";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Validatie from "./pages/Validatie";
import Profile from "./pages/Profile";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/voorwaarden" element={<Terms />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/validatie" 
              element={
                <ProtectedRoute>
                  <Validatie />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profiel" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projecten" 
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projecten/:id" 
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projecten/:id/producten/:productId" 
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
