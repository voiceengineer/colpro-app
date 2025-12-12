import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from './apiService';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await apiService.getToken();
      const userData = await apiService.getUser();
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(userData);
        
        // Extract role
        const role = userData.role?.name || userData.roleName || 'User';
        setUserRole(role);
        
        // Extract permissions
        const userPermissions = userData.permissions || [];
        setPermissions(userPermissions);
      } else {
        resetAuthState();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      resetAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  const resetAuthState = () => {
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
    setPermissions([]);
  };

  const login = async (username, password) => {
    try {
      const { token, user: userData } = await apiService.login(username, password);
      
      if (userData) {
        setIsAuthenticated(true);
        setUser(userData);
        
        const role = userData.role?.name || userData.roleName || 'User';
        setUserRole(role);
        
        const userPermissions = userData.permissions || [];
        setPermissions(userPermissions);
      } else {
        setIsAuthenticated(true);
        setUser({ username });
        setUserRole('User');
        setPermissions([]);
      }
      
      return { token, user: userData };
    } catch (error) {
      resetAuthState();
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      resetAuthState();
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiService.getUser();
      if (userData) {
        setUser(userData);
        setUserRole(userData.role?.name || userData.roleName || 'User');
        setPermissions(userData.permissions || []);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  // Permission helpers
  const hasPermission = (permissionSlug) => {
    return permissions.includes(permissionSlug);
  };

  const hasAllPermissions = (permissionSlugs) => {
    return permissionSlugs.every(slug => permissions.includes(slug));
  };

  // Specific permission checks based on API guide
  const canViewCases = () => hasPermission('view_hard_collection');
  
  const canEditCases = () => hasAllPermissions(['edit_hard_collection', 'manage_hard_collection']);
  
  const canUploadDocuments = () => hasPermission('view_hard_collection');
  
  const canViewPayments = () => hasPermission('view_payment');

  const value = {
    isAuthenticated,
    user,
    isLoading,
    userRole,
    permissions,
    checkAuth,
    login,
    logout,
    refreshUser,
    hasPermission,
    hasAllPermissions,
    canViewCases,
    canEditCases,
    canUploadDocuments,
    canViewPayments,
  };

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