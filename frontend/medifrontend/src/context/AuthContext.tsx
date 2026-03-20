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
  getUsersByHierarchy,
} from "@/services/auth.service";

import { UserRole, AuthUser } from "@/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  pendingUsers: AuthUser[];
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string, walletAddress: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    role: UserRole;
    password: string;
    walletAddress: string;
  }) => Promise<void>;
  logout: () => Promise<void>;

  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;

  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

//
// 🔧 PROVIDER
//
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pendingUsers, setPendingUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  //
  // 🔄 LOAD USER ON APP START
  //
  useEffect(() => {
    const initialize = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
        await fetchPendingUsers();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const init = async () => {
    try {
      const res = await getCurrentUser();
      setUser(res.data);

      // load pending users if user has authority
      await fetchPendingUsers();
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  //
  // 🔐 LOGIN
  //
  const login = async (
    email: string,
    password: string,
    walletAddress: string
  ) => {
    setLoading(true);
    try {
      const res = await loginUser({ email, password, walletAddress });

      setUser(res.user);

      await fetchPendingUsers();
    } finally {
      setLoading(false);
    }
  };

  //
  // 📝 REGISTER
  //
  const register = async (data: {
    fullName: string;
    email: string;
    role: UserRole;
    password: string;
    walletAddress: string;
  }) => {
    setLoading(true);
    try {
      await registerUser(data);

      // auto login after register
      await login(data.email, data.password, data.walletAddress);
    } finally {
      setLoading(false);
    }
  };

  //
  // 🚪 LOGOUT
  //
  const logout = async () => {
    await logoutUser();
    setUser(null);
    setPendingUsers([]);
  };

  //
  // 📊 FETCH USERS FOR APPROVAL
  //
  const fetchPendingUsers = async () => {
    try {
      const res = await getUsersByHierarchy();
      setPendingUsers(res.data || []);
    } catch {
      setPendingUsers([]);
    }
  };

  //
  // ✅ APPROVE USER (BLOCKCHAIN)
  //
  const approveUser = async (userId: string) => {
    await approveUserAPI(userId);
    await fetchPendingUsers();
  };

  //
  // ❌ REJECT USER
  //
  const rejectUser = async (userId: string) => {
    await rejectUserAPI(userId);
    await fetchPendingUsers();
  };

  //
  // 🔄 REFRESH USER (useful after approval)
  //
  const refreshUser = async () => {
    try {
      const res = await getCurrentUser();
      setUser(res.data);
    } catch {
      setUser(null);
    }
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

export { AuthContext };