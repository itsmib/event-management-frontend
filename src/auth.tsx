import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api, ApiError } from "./api";
import type { User } from "./types";
import { ErrorNotice, Loading } from "./components/Feedback";
type Auth = {
  user: User | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<User | null>;
  logout: () => Promise<void>;
};
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function refresh() {
    try {
      const current = await api<User>("/auth/me");
      setUser(current);
      setError("");
      return current;
    } catch (e) {
      setUser(null);
      if (e instanceof ApiError && e.status === 401) {
        setError("");
        return null;
      }
      setError((e as Error).message);
      throw e;
    } finally {
      setLoading(false);
    }
  }
  async function logout() {
    await api<void>("/auth/logout", { method: "POST" });
    setUser(null);
  }
  useEffect(() => {
    void refresh().catch(() => {});
  }, []);
  return (
    <Context.Provider value={{ user, loading, error, refresh, logout }}>
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const auth = useContext(Context);
  if (!auth) throw new Error("AuthProvider is required");
  return auth;
}
export function Guard({
  children,
  role,
}: {
  children: ReactNode;
  role?: User["role"];
}) {
  const { user, loading, error, refresh } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (error)
    return (
      <ErrorNotice
        message={error}
        retry={() => {
          void refresh().catch(() => {});
        }}
      />
    );
  if (!user)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role)
    return (
      <ErrorNotice message="This page is not available for your account." />
    );
  return children;
}
