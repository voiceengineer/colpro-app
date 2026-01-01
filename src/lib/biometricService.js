import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export const biometricService = {
  async isAvailable() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      return hasHardware && isEnrolled && supportedTypes.length > 0;
    } catch (error) {
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
        requireConfirmation: false,
      });

      return result.success;
    } catch (error) {
      return false;
    }
  },

  async isBiometricEnabled() {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      return false;
    }
  },

  async enableBiometric() {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
      return true;
    } catch (error) {
      return false;
    }
  },

  async disableBiometric() {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      return true;
    } catch (error) {
      return false;
    }
  },

  async getBiometricType() {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Fingerprint';
      }
      
      return 'Biometric';
    } catch (error) {
      return 'Biometric';
    }
  }
};