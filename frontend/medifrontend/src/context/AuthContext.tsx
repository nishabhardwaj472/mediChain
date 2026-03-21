import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  approveUser as approveUserAPI,
  rejectUser as rejectUserAPI,
  getPendingUsers,
} from "@/services/auth.service";

import { UserRole, AuthUser, RegisterRole } from "@/types/auth";

/* =====================================================
   TYPES
===================================================== */
export interface AuthContextType {
  user: AuthUser | null;
  pendingUsers: AuthUser[];
  loading: boolean;
  isAuthenticated: boolean;

  login: (
    email: string,
    password: string,
    walletAddress: string
  ) => Promise<void>;

  register: (data: {
    fullName: string;
    email: string;
    role: RegisterRole;
    password: string;
    walletAddress: string;
  }) => Promise<void>;

  logout: () => Promise<void>;

  approveUser: (userId: string, txHash: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;

  refreshUser: () => Promise<void>;
}

/* =====================================================
   CONTEXT
===================================================== */
export const AuthContext = createContext<AuthContextType | null>(null);

/* =====================================================
   PROVIDER
===================================================== */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pendingUsers, setPendingUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     INITIAL LOAD
  ===================================================== */
  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const res = await getCurrentUser();
      const currentUser = res.data;

      setUser(currentUser);

      if (canManageApprovals(currentUser.role)) {
        await fetchPendingUsers();
      }
    } catch {
      setUser(null);
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOGIN
  ===================================================== */
  const login = async (
    email: string,
    password: string,
    walletAddress: string
  ) => {
    try {
      setLoading(true);

      const res = await loginUser({ email, password, walletAddress });
      const loggedUser = res.user;

      setUser(loggedUser);

      if (canManageApprovals(loggedUser.role)) {
        await fetchPendingUsers();
      } else {
        setPendingUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     REGISTER
  ===================================================== */
  const register = async (data: {
    fullName: string;
    email: string;
    role: RegisterRole;
    password: string;
    walletAddress: string;
  }) => {
    try {
      setLoading(true);

      await registerUser(data);

      // auto login
      await login(data.email, data.password, data.walletAddress);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */
  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setPendingUsers([]);
    }
  };

  /* =====================================================
     FETCH PENDING USERS
  ===================================================== */
  const fetchPendingUsers = async () => {
    try {
      const res = await getPendingUsers();
      setPendingUsers(res.data || []);
    } catch {
      setPendingUsers([]);
    }
  };

  /* =====================================================
     APPROVE USER (BLOCKCHAIN VERIFIED)
  ===================================================== */
  const approveUser = async (userId: string, txHash: string) => {
    try {
      if (!txHash) {
        throw new Error("Transaction hash is required");
      }

      await approveUserAPI(userId, txHash);

      // refresh list
      await fetchPendingUsers();
    } catch (error) {
      console.error("Approval error:", error);
      throw error;
    }
  };

  /* =====================================================
     REJECT USER
  ===================================================== */
  const rejectUser = async (userId: string) => {
    try {
      await rejectUserAPI(userId);
      await fetchPendingUsers();
    } catch (error) {
      console.error("Reject error:", error);
      throw error;
    }
  };

  /* =====================================================
     REFRESH USER
  ===================================================== */
  const refreshUser = async () => {
    try {
      const res = await getCurrentUser();
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  /* =====================================================
     ROLE CHECK
  ===================================================== */
  const canManageApprovals = (role: UserRole) => {
    return ["admin", "manufacturer", "distributor"].includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        pendingUsers,
        loading,
        isAuthenticated: !!user,

        login,
        register,
        logout,

        approveUser,
        rejectUser,

        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =====================================================
   HOOK
===================================================== */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};