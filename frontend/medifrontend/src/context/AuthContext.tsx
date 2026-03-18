import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "manufacturer" | "distributor" | "pharmacy" | "consumer";

export interface PendingUser {
  email: string;
  role: UserRole;
  name: string;
  organization: string;
  registeredAt: string;
}

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
  organization?: string;
  walletAddress?: string;
  isApproved: boolean;
}

// Roles that require upstream approval
const ROLES_REQUIRING_APPROVAL: UserRole[] = ["manufacturer", "distributor", "pharmacy"];

// Who can approve whom
export const APPROVER_FOR: Record<string, UserRole> = {
  manufacturer: "admin",
  distributor: "manufacturer",
  pharmacy: "distributor",
};

interface AuthContextType {
  user: AuthUser | null;
  pendingUsers: PendingUser[];
  login: (email: string, role: UserRole, walletAddress?: string) => void;
  register: (email: string, role: UserRole, name: string, organization?: string, walletAddress?: string) => void;
  logout: () => void;
  approveUser: (email: string) => void;
  rejectUser: (email: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// In-memory user store shared across the session (simulates a backend DB)
let userStore: (AuthUser & { password?: string })[] = [
  // Pre-seeded admin
  { email: "admin@medichain.com", role: "admin", name: "Admin", isApproved: true, walletAddress: "0xADMIN...0001" },
  // Demo pending users so approval flow can be tested immediately
  { email: "pharma@medlife.com", role: "manufacturer", name: "MedLife Labs", organization: "MedLife Labs", isApproved: false },
  { email: "dist@quickship.com", role: "distributor", name: "QuickShip Co.", organization: "QuickShip Co.", isApproved: false },
  { email: "rx@citycare.com", role: "pharmacy", name: "CityCare Pharmacy", organization: "CityCare Pharmacy", isApproved: false },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  // pendingUsers is derived from userStore (roles that need approval and are not yet approved)
  const getPendingUsers = (): PendingUser[] =>
    userStore
      .filter(u => ROLES_REQUIRING_APPROVAL.includes(u.role) && !u.isApproved)
      .map(u => ({
        email: u.email,
        role: u.role,
        name: u.name,
        organization: u.organization || u.name,
        registeredAt: new Date().toISOString().split("T")[0],
      }));

  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>(getPendingUsers);

  const refreshPending = () => setPendingUsers(getPendingUsers());

  const login = (email: string, role: UserRole, walletAddress?: string) => {
    // Find existing user in store or create ephemeral entry
    let stored = userStore.find(u => u.email === email && u.role === role);
    if (!stored) {
      // First-time login with no prior registration — treat as auto-approved for admin/consumer
      const isApproved = !ROLES_REQUIRING_APPROVAL.includes(role);
      stored = { email, role, name: email.split("@")[0], isApproved };
      userStore.push(stored);
    }
    setUser({
      email: stored.email,
      role: stored.role,
      name: stored.name,
      organization: stored.organization,
      walletAddress: walletAddress || stored.walletAddress || "0x1234...abcd",
      isApproved: stored.isApproved,
    });
    refreshPending();
  };

  const register = (email: string, role: UserRole, name: string, organization?: string, walletAddress?: string) => {
    const isApproved = !ROLES_REQUIRING_APPROVAL.includes(role);
    const newUser: AuthUser = { email, role, name, organization, walletAddress, isApproved };
    // Remove if already exists, then push fresh entry
    userStore = userStore.filter(u => !(u.email === email && u.role === role));
    userStore.push(newUser);
    refreshPending();
    // Only auto-login for roles that are immediately approved
    if (isApproved) {
      setUser(newUser);
    } else {
      // Log in so they can see the pending screen
      setUser(newUser);
    }
  };

  const approveUser = (email: string) => {
    userStore = userStore.map(u =>
      u.email === email ? { ...u, isApproved: true } : u
    );
    // If the currently logged-in user was just approved, update their state too
    setUser(prev => prev && prev.email === email ? { ...prev, isApproved: true } : prev);
    refreshPending();
  };

  const rejectUser = (email: string) => {
    userStore = userStore.filter(u => u.email !== email);
    refreshPending();
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, pendingUsers, login, register, logout, approveUser, rejectUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
