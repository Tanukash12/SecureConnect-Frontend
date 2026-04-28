import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import AdminDashboard from "@/pages/AdminDashboard";
import ChatPage from "@/pages/ChatPage";
import TeamPage from "@/pages/TeamPage";
import NotFound from "@/pages/NotFound";
import FileManagerPage from "./pages/FileManagerPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              {/* Admin Only */}
              <Route element={<AdminRoute />}>
                <Route path="/dashboard" element={<AdminDashboard />} />
              </Route>
              
              {/* All Users */}
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/files" element={<FileManagerPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
