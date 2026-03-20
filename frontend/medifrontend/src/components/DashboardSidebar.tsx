import {
  LayoutDashboard, PlusCircle, Route, QrCode, ArrowLeftRight,
  FileBarChart, LogOut, Truck, Store, Shield, ShieldCheck
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manufacturer", "distributor", "pharmacy", "consumer"] },
  { title: "Supply Chain Tracking", url: "/dashboard/track", icon: Route, roles: ["admin", "manufacturer", "distributor", "pharmacy", "consumer"] },
  { title: "Add Medicine Batch", url: "/dashboard/add-batch", icon: PlusCircle, roles: ["manufacturer"] },
  { title: "Update Shipment", url: "/dashboard/distributor", icon: Truck, roles: ["manufacturer", "distributor"] },
  { title: "Receive Medicine", url: "/dashboard/pharmacy", icon: Store, roles: ["pharmacy"] },
  { title: "QR Verification", url: "/dashboard/verify", icon: QrCode, roles: ["admin", "manufacturer", "distributor", "pharmacy", "consumer"] },
  { title: "Transactions", url: "/dashboard/transactions", icon: ArrowLeftRight, roles: ["admin", "manufacturer", "distributor", "pharmacy", "consumer"] },
  { title: "Reports", url: "/dashboard/reports", icon: FileBarChart, roles: ["admin"] },
];

const approvalRoles = ["admin", "manufacturer", "distributor"];

const DashboardSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout, pendingUsers } = useAuth();
  const navigate = useNavigate();

  const filtered = menuItems.filter(item => user && item.roles.includes(user.role));

  const canManageApprovals = user && approvalRoles.includes(user.role) && user.isApproved;

  // Count only the pending users that the current user can approve
  const myPendingCount = canManageApprovals
    ? pendingUsers.filter(p =>
      (user.role === "admin" && p.role === "manufacturer") ||
      (user.role === "manufacturer" && p.role === "distributor") ||
      (user.role === "distributor" && p.role === "pharmacy")
    ).length
    : 0;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            {!collapsed && "MediChain"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filtered.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Approvals item – only shown to roles who can approve */}
              {canManageApprovals && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/dashboard/approvals" className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      {!collapsed && (
                        <span className="flex items-center gap-2 flex-1">
                          Manage Approvals
                          {myPendingCount > 0 && (
                            <Badge className="ml-auto bg-amber-500 text-white text-xs px-1.5 py-0 h-5">
                              {myPendingCount}
                            </Badge>
                          )}
                        </span>
                      )}
                      {collapsed && myPendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                          {myPendingCount}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="hover:bg-sidebar-accent/50 text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  {!collapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
