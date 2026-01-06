import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from './services/authService';
import { biometricService } from './biometricService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      setIsLoading(true);
      
      const authResult = await checkAuth();
      
      const bioAvailable = await biometricService.isAvailable();
      const bioEnabled = await biometricService.isBiometricEnabled();
      const bioType = await biometricService.getBiometricType();
      
      setBiometricAvailable(bioAvailable);
      setBiometricEnabled(bioEnabled);
      setBiometricType(bioType);
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const token = await authService.getToken();
      const userData = await authService.getUser();
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(userData);
        
        const role = userData.role?.name || userData.roleName || 'User';
        setUserRole(role);
        
        const userPermissions = userData.permissions || [];
        setPermissions(userPermissions);
        
        return true;
      } else {
        resetAuthState();
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      resetAuthState();
      return false;
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
      const { token, user: userData } = await authService.login(username, password);
      
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
      console.error('Login error:', error);
      resetAuthState();
      throw error;
    }
  };

  const loginWithBiometric = async () => {
    try {
      // Check if biometric is enabled first
      const isEnabled = await biometricService.isBiometricEnabled();
      if (!isEnabled) {
        throw new Error('Biometric login is not enabled');
      }

      // Get stored credentials
      const credentials = await biometricService.getCredentials();
      if (!credentials || !credentials.username || !credentials.password) {
        // If enabled but no credentials, we might need to ask user to login manually once to repair
        await biometricService.disableBiometric();
        throw new Error('Biometric credentials missing. Please login with password to re-enable.');
      }

      const { success, error } = await biometricService.authenticate();
      
      if (!success) {
        throw new Error(error || 'Biometric authentication failed');
      }

      // Perform actual login with stored credentials
      return await login(credentials.username, credentials.password);
    } catch (error) {
      throw error;
    }
  };

  const enableBiometricLogin = async (username, password) => {
    try {
      const { success } = await biometricService.authenticate('Confirm to enable biometric login');
      if (!success) {
        return false;
      }
      
      const enabled = await biometricService.enableBiometric(username, password);
      if (enabled) {
        setBiometricEnabled(true);
      }
      return enabled;
    } catch (error) {
      console.error('Enable biometric error:', error);
      return false;
    }
  };

  const disableBiometricLogin = async () => {
    try {
      const success = await biometricService.disableBiometric();
      if (success) {
        setBiometricEnabled(false);
      }
      return success;
    } catch (error) {
      console.error('Disable biometric error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      resetAuthState();
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getUser();
      if (userData) {
        setUser(userData);
        setUserRole(userData.role?.name || userData.roleName || 'User');
        setPermissions(userData.permissions || []);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const hasPermission = (permissionSlug) => {
    return permissions.includes(permissionSlug);
  };

  const hasAllPermissions = (permissionSlugs) => {
    return permissionSlugs.every(slug => permissions.includes(slug));
  };

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
    biometricAvailable,
    biometricEnabled,
    biometricType,
    checkAuth,
    login,
    loginWithBiometric,
    enableBiometricLogin,
    disableBiometricLogin,
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