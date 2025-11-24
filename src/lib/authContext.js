import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from './auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("=== AuthContext: Checking authentication ===");
      
      const token = await authService.getToken();
      const userData = await authService.getUser();
      
      console.log("Token exists:", !!token);
      console.log("User data:", userData);
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(userData);
        console.log("✅ User authenticated:", userData.username || userData.name);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.log("❌ Not authenticated");
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log("=== Auth check complete ===");
    }
  };

  const login = async (username, password) => {
    try {
      console.log("=== AuthContext: Login attempt ===");
      console.log("Username:", username);
      
      const { token, user: userData } = await authService.login(username, password);
      
      console.log("Login successful");
      console.log("Token received:", !!token);
      console.log("User data received:", userData);
      
      // Make sure user data is set properly
      if (userData) {
        setIsAuthenticated(true);
        setUser(userData);
        console.log("✅ User set in context:", userData);
      } else {
        console.warn("⚠️ Warning: No user data received from login");
        // Even if no user data, we can still authenticate with token
        setIsAuthenticated(true);
        setUser({ username }); // Fallback user object
      }
      
      return { token, user: userData };
    } catch (error) {
      console.error("❌ Login failed:", error);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("=== AuthContext: Logging out ===");
      await authService.logout();
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      console.log("User cleared from context");
    }
  };

  // Add a function to refresh user data
  const refreshUser = async () => {
    try {
      const userData = await authService.getUser();
      if (userData) {
        setUser(userData);
        console.log("User data refreshed:", userData);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    checkAuth,
    login,
    logout,
    refreshUser,
  };

  console.log("AuthContext current state:", {
    isAuthenticated,
    hasUser: !!user,
    userId: user?.id,
    isLoading,
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}