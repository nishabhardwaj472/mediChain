import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useAuth } from "@/hooks/useAuth";
import { APPROVER_FOR } from "@/types/auth";
import { Clock, ShieldOff, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const PendingApprovalScreen = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const approverRole = user ? APPROVER_FOR[user.role] : null;
  const approverLabel: Record<string, string> = {
    admin: "Admin",
    manufacturer: "an approved Manufacturer",
    distributor: "an approved Distributor",
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon + glow */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/20" />
            <div className="relative h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-10 w-10 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Approval Pending</h2>
          <p className="text-muted-foreground">
            Your <strong className="capitalize text-foreground">{user?.role}</strong> account is waiting for
            approval from {approverRole ? <strong className="text-foreground">{approverLabel[approverRole]}</strong> : "an administrator"}.
          </p>
          <p className="text-sm text-muted-foreground">
            Once approved, you'll have full access to your dashboard features.
          </p>
        </div>

        {/* Step indicator */}
        <div className="rounded-xl border bg-muted/30 p-4 text-left space-y-3">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Approval Chain</p>
          {[
            { role: "Manufacturer", approver: "Admin" },
            { role: "Distributor", approver: "Manufacturer" },
            { role: "Pharmacy", approver: "Distributor" },
          ].map(row => (
            <div key={row.role} className="flex items-center gap-2 text-sm">
              <ShieldOff className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{row.role}</span> is approved by{" "}
                <span className="font-medium text-foreground">{row.approver}</span>
              </span>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={handleLogout} className="gap-2 w-full">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          {user && ["manufacturer", "distributor", "pharmacy"].includes(user.role) && (!user.isApproved || !user.onChainApproved) ? (
            <PendingApprovalScreen />
          ) : (
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              <Outlet />
            </main>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
