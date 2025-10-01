import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register"; // ✅ Tambahan baru
import Menu from "./pages/Menu"; // ✅ Tambahan baru
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerOrder from "./pages/CustomerOrder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ✅ Halaman utama */}
          <Route path="/" element={<Index />} />

          {/* ✅ Public routes */}
          <Route path="/menu" element={<Menu />} /> {/* ➕ Tambahan baru */}

          {/* ✅ Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* ➕ Tambahan baru */}

          {/* ✅ Customer routes */}
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/order" element={<CustomerOrder />} />

          {/* ✅ Admin route */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* ✅ Catch-all (404) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
