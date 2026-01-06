import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

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

  async authenticate(promptMessage = 'Authenticate to login') {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        requireConfirmation: false,
      });

      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
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

  async enableBiometric(username, password) {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
      if (username && password) {
        await this.storeCredentials(username, password);
      }
      return true;
    } catch (error) {
      return false;
    }
  },

  async disableBiometric() {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      await this.deleteCredentials();
      return true;
    } catch (error) {
      return false;
    }
  },

  async storeCredentials(username, password) {
    try {
      await SecureStore.setItemAsync(
        BIOMETRIC_CREDENTIALS_KEY, 
        JSON.stringify({ username, password })
      );
      return true;
    } catch (error) {
      return false;
    }
  },

  async getCredentials() {
    try {
      const credentials = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
      return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
      return null;
    }
  },

  async deleteCredentials() {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
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