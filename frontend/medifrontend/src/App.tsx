import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import AddBatch from "./pages/AddBatch";
import TrackMedicine from "./pages/TrackMedicine";
import VerifyMedicine from "./pages/VerifyMedicine";
import Distributor from "./pages/Distributor";
import Pharmacy from "./pages/Pharmacy";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Approvals from "./pages/Approvals";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<VerifyMedicine />} />
            <Route path="/verify/:batchId" element={<VerifyMedicine />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="add-batch" element={<AddBatch />} />
              <Route path="track" element={<TrackMedicine />} />
              <Route path="verify" element={<VerifyMedicine />} />
              <Route path="distributor" element={<Distributor />} />
              <Route path="pharmacy" element={<Pharmacy />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="reports" element={<Reports />} />
              <Route path="approvals" element={<Approvals />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
