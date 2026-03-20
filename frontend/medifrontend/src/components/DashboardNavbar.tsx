import { Bell, User, Wallet } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DashboardNavbar = () => {
  const { user } = useAuth();

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <span className="text-sm font-medium text-muted-foreground hidden sm:block">
          Welcome, <span className="text-foreground">{user?.email}</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-muted px-3 py-1.5 rounded-md">
          <Wallet className="h-3.5 w-3.5 text-primary" />
          {user?.walletAddress || "Not connected"}
        </div>
        <Badge variant="secondary" className="capitalize">{user?.role}</Badge>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-destructive rounded-full" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default DashboardNavbar;
