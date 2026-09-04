import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("hr_platform_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("hr_platform_token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("hr_platform_token");
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
          localStorage.setItem("hr_platform_user", JSON.stringify(res.data));
        } catch (err) {
          console.error("Auth check failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password, required_role = null) => {
    setError(null);
    try {
      const res = await authAPI.login(email, password, required_role);
      const { access_token, user: userData } = res.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem("hr_platform_token", access_token);
      localStorage.setItem("hr_platform_user", JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid login credentials";
      setError(msg);
      return { success: false, error: msg };
    }
  };


  const register = async (registerData) => {
    setError(null);
    try {
      const res = await authAPI.register(registerData);
      const { access_token, user: userData } = res.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem("hr_platform_token", access_token);
      localStorage.setItem("hr_platform_user", JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed. Please check your details.";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const registerCompany = async (companyData) => {
    setError(null);
    try {
      const res = await authAPI.registerCompany(companyData);
      const { access_token, user: userData } = res.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem("hr_platform_token", access_token);
      localStorage.setItem("hr_platform_user", JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.detail || "Company registration failed.";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("hr_platform_token");
      localStorage.removeItem("hr_platform_user");
    }
  };


  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      error, 
      login, 
      register, 
      registerCompany, 
      logout, 
      setError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
