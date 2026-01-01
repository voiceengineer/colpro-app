import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Keyboard, 
  ActivityIndicator, StyleSheet, Animated, Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, 
  User, X, CheckCircle, Fingerprint, ScanFace
} from 'lucide-react-native';
import { useAuth } from '../lib/authContext';
import BiometricEnrollmentModal from '../components/BiometricEnrollmentModal';

export default function Login() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { 
    login, 
    loginWithBiometric, 
    enableBiometricLogin,
    biometricAvailable, 
    biometricEnabled,
    biometricType 
  } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [loading, setLoading] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      await loginWithBiometric();
      showToast('Login successful', 'success');
      setTimeout(() => router.replace('/(tabs)/reports'), 1000);
    } catch (error) {
      showToast(error?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username.trim()) { 
      showToast('Please enter your username'); 
      return; 
    }
    if (!password) { 
      showToast('Please enter your password'); 
      return; 
    }

    setLoading(true);
    try {
      await login(username, password);
      
      const shouldShowBiometricPrompt = biometricAvailable === true && biometricEnabled === false;
      
      if (shouldShowBiometricPrompt) {
        setLoading(false);
        Alert.alert(
          `Enable ${biometricType}?`,
          `Login faster and securely with ${biometricType}`,
          [
            {
              text: 'Skip',
              onPress: () => {
                showToast('Login successful', 'success');
                setTimeout(() => router.replace('/(tabs)/reports'), 500);
              },
              style: 'cancel'
            },
            {
              text: `Enable ${biometricType}`,
              onPress: async () => {
                try {
                  const success = await enableBiometricLogin();
                  if (success) {
                    showToast(`${biometricType} enabled successfully`, 'success');
                  } else {
                    showToast('Failed to enable biometric', 'error');
                  }
                } catch (error) {
                  showToast('Error enabling biometric', 'error');
                }
                setTimeout(() => router.replace('/(tabs)/reports'), 1000);
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        showToast('Login successful', 'success');
        setLoading(false);
        setTimeout(() => router.replace('/(tabs)/reports'), 1000);
      }
    } catch (error) {
      showToast(error?.message || 'Login failed');
      setLoading(false);
    }
  };

  const isSuccess = toast.type === 'success';
  const showBiometricButton = biometricAvailable === true && biometricEnabled === true;
  const isFaceID = biometricType === 'Face ID';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 16 }]}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <ArrowLeft color="#ffffff" size={24} />
      </TouchableOpacity>

      {toast.show && (
        <Animated.View style={[
          styles.toast, 
          { 
            top: insets.top + 80,
            borderColor: isSuccess ? '#22c55e' : '#3b82f6'
          }
        ]}>
          {isSuccess ? 
            <CheckCircle color="#22c55e" size={20} /> : 
            <AlertCircle color="#3b82f6" size={20} />
          }
          <Text style={styles.toastText}>{toast.message}</Text>
          <TouchableOpacity 
            onPress={() => setToast({ ...toast, show: false })} 
            style={styles.toastClose}
            accessibilityLabel="Close notification"
          >
            <X color="#94a3b8" size={20} />
          </TouchableOpacity>
        </Animated.View>
      )}

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Animated.View style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            paddingTop: keyboardVisible ? 20 : insets.top + 80,
            paddingBottom: keyboardVisible ? 20 : Math.max(insets.bottom, 24)
          }
        ]}>
          {!keyboardVisible && (
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Lock color="#ffffff" size={40} strokeWidth={2} />
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>
          )}

          {showBiometricButton && !keyboardVisible && (
            <>
              <TouchableOpacity
                onPress={handleBiometricLogin}
                disabled={loading}
                style={[styles.biometricButton, loading && styles.buttonDisabled]}
                accessibilityLabel="Login with biometric"
                accessibilityRole="button"
                accessibilityState={{ disabled: loading }}
              >
                {isFaceID ? (
                  <ScanFace color="#ffffff" size={24} strokeWidth={2.5} />
                ) : (
                  <Fingerprint color="#ffffff" size={24} strokeWidth={2.5} />
                )}
                <Text style={styles.biometricButtonText}>
                  Biometric Login
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
            </>
          )}

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <User color="#64748b" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor="#64748b"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!loading}
                  returnKeyType="next"
                  accessibilityLabel="Username input"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Lock color="#64748b" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  accessibilityLabel="Password input"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.eyeButton}
                  disabled={loading}
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? 
                    <EyeOff color="#64748b" size={20} /> : 
                    <Eye color="#64748b" size={20} />
                  }
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => showToast('Contact administrator to reset password')}
              style={styles.forgotPassword}
              disabled={loading}
              accessibilityLabel="Forgot password"
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              accessibilityLabel="Login button"
              accessibilityRole="button"
              accessibilityState={{ disabled: loading }}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Login</Text>
                  <ArrowRight color="#ffffff" size={20} strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {!keyboardVisible && (
            <View style={styles.footer}>
              <Lock color="#64748b" size={16} />
              <Text style={styles.footerText}>
                Secure connection
              </Text>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 20,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  toastText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 12,
    fontWeight: '500',
  },
  toastClose: {
    padding: 4,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
  },
  biometricButton: {
    backgroundColor: '#9333ea',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  biometricButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#64748b',
    fontSize: 14,
    marginHorizontal: 16,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 16,
    marginLeft: 12,
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 4,
  },
  forgotPasswordText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#64748b',
    fontSize: 13,
    marginLeft: 8,
  },
});