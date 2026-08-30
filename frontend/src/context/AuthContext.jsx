import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'medai-auth-token';
const USER_KEY = 'medai-auth-user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .getMe(token)
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      })
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    const onAuthCleared = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('medai-auth-cleared', onAuthCleared);
    return () => window.removeEventListener('medai-auth-cleared', onAuthCleared);
  }, []);

  const persistSession = useCallback((session) => {
    setUser(session.user);
    setToken(session.token);
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  }, []);

  const login = useCallback(
    async (email, password, role) => {
      const res = await api.login({ email, password, role });
      persistSession(res.data);
      return res.data.user;
    },
    [persistSession]
  );

  const register = useCallback(
    async (email, password, name, role, condition) => {
      const body = { email, password, name, role };
      if (condition?.trim()) body.condition = condition.trim();
      const res = await api.register(body);
      persistSession(res.data);
      return res.data.user;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user && !!token,
    }),
    [user, token, loading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
