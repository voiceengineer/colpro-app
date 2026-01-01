import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export const biometricService = {
  async isAvailable() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      console.log('Biometric availability:', { hasHardware, isEnrolled, supportedTypes });
      
      return hasHardware && isEnrolled && supportedTypes.length > 0;
    } catch (error) {
      console.error('Biometric check error:', error);
      return false;
    }
  },

  async authenticate() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to login',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      console.log('Biometric auth result:', result);
      return result.success;
    } catch (error) {
      console.error('Biometric auth error:', error);
      return false;
    }
  },

  async isBiometricEnabled() {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      console.log('Biometric enabled status:', enabled);
      return enabled === 'true';
    } catch (error) {
      console.error('Check biometric enabled error:', error);
      return false;
    }
  },

  async enableBiometric() {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
      console.log('Biometric enabled successfully');
      return true;
    } catch (error) {
      console.error('Enable biometric error:', error);
      return false;
    }
  },

  async disableBiometric() {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      console.log('Biometric disabled successfully');
      return true;
    } catch (error) {
      console.error('Disable biometric error:', error);
      return false;
    }
  },

  async getBiometricType() {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      console.log('Supported biometric types:', types);
      
      // Check for Face ID first (most secure)
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      } 
      // Then check for Fingerprint
      else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Fingerprint';
      } 
      // Check for Iris
      else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Iris';
      }
      
      return 'Biometric';
    } catch (error) {
      console.error('Get biometric type error:', error);
      return 'Biometric';
    }
  },

  async getAllAvailableTypes() {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const availableTypes = [];
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        availableTypes.push({ type: 'Face ID', id: LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION });
      }
      
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        availableTypes.push({ type: 'Fingerprint', id: LocalAuthentication.AuthenticationType.FINGERPRINT });
      }
      
      if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        availableTypes.push({ type: 'Iris', id: LocalAuthentication.AuthenticationType.IRIS });
      }
      
      return availableTypes;
    } catch (error) {
      console.error('Get all types error:', error);
      return [];
    }
  }
};