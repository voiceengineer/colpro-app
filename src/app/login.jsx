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
  Lock, Eye, EyeOff, ArrowRight, AlertCircle, 
  User, X, CheckCircle, Fingerprint, ScanFace, ArrowLeft
} from 'lucide-react-native';
import { useAuth } from '../lib/authContext';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { 
    login, 
    loginWithBiometric, 
    enableBiometricLogin,
    biometricAvailable, 
    biometricEnabled,
    biometricType 
  } = useAuth();
  
  const [isLanding, setIsLanding] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

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
      showToast(t('login.success'), 'success');
      setTimeout(() => router.replace('/(tabs)'), 1000);
    } catch (error) {
      showToast(error?.message || t('login.failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username.trim()) { 
      showToast(t('login.emptyUsername')); 
      return; 
    }
    if (!password) { 
      showToast(t('login.emptyPassword')); 
      return; 
    }

    setLoading(true);
    try {
      await login(username, password);
      
      const shouldShowBiometricPrompt = biometricAvailable === true && biometricEnabled === false;
      
      if (shouldShowBiometricPrompt) {
        setLoading(false);
        Alert.alert(
          t('login.enableBiometric', { type: biometricType }),
          t('login.enableBiometricMsg', { type: biometricType }),
          [
            {
              text: t('login.skip'),
              onPress: () => {
                showToast(t('login.success'), 'success');
                setTimeout(() => router.replace('/(tabs)'), 500);
              },
              style: 'cancel'
            },
            {
              text: t('login.enable', { type: biometricType }),
              onPress: async () => {
                try {
                  const success = await enableBiometricLogin(username, password);
                  if (success) {
                    showToast(t('login.biometricEnabled', { type: biometricType }), 'success');
                  } else {
                    showToast('Failed to enable biometric', 'error');
                  }
                } catch (error) {
                  showToast(t('login.biometricError'), 'error');
                }
                setTimeout(() => router.replace('/(tabs)'), 1000);
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        showToast(t('login.success'), 'success');
        setLoading(false);
        setTimeout(() => router.replace('/(tabs)'), 1000);
      }
    } catch (error) {
      showToast(error?.message || t('login.failed'));
      setLoading(false);
    }
  };

  const isSuccess = toast.type === 'success';
  const showBiometricButton = biometricAvailable === true && biometricEnabled === true;
  const isFaceID = biometricType === 'Face ID';

  const BackgroundGradients = () => (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{
        position: 'absolute',
        top: -120,
        right: -60,
        width: 340,
        height: 340,
        backgroundColor: '#4f46e5',
        opacity: 0.22,
        borderRadius: 170,
      }} />
      <View style={{
        position: 'absolute',
        bottom: -80,
        left: -90,
        width: 300,
        height: 300,
        backgroundColor: '#06b6d4',
        opacity: 0.16,
        borderRadius: 150,
      }} />
      <View style={{
        position: 'absolute',
        top: '35%',
        left: '12%',
        width: 220,
        height: 220,
        backgroundColor: '#8b5cf6',
        opacity: 0.08,
        borderRadius: 110,
      }} />
    </View>
  );

  if (isLanding) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <BackgroundGradients />

        <Animated.View style={[
          styles.landingContent,
          { opacity: fadeAnim, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 40 }
        ]}>
          {/* Animated Varahi Branding */}
          <Animated.View style={[
            styles.brandingContainer,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <Text style={styles.varahiBranding}>Varahi</Text>
            <Text style={styles.brandingSubtitle}>Field Excellence</Text>
          </Animated.View>

          <View style={styles.landingHeader}>
            <View style={styles.landingLogoContainer}>
              <Lock color="#ffffff" size={48} strokeWidth={2} />
            </View>
            <Text style={styles.landingTitle}>{t('login.appTitle')}</Text>
            <Text style={styles.landingSubtitle}>{t('login.appSubtitle')}</Text>
          </View>

          <View style={styles.landingButtons}>
            <TouchableOpacity
              onPress={() => setIsLanding(false)}
              style={styles.landingButtonPrimary}
              activeOpacity={0.8}
            >
              <Text style={styles.landingButtonTextPrimary}>{t('login.loginButton')}</Text>
              <ArrowRight color="#ffffff" size={20} strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/register')}
              style={styles.landingButtonSecondary}
              activeOpacity={0.8}
            >
              <Text style={styles.landingButtonTextSecondary}>{t('login.createAccount')}</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.versionText}>{t('login.version', { version: '1.0.0' })}</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <BackgroundGradients />
      
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => {
          setIsLanding(true);
          Keyboard.dismiss();
        }}
        style={[styles.backButton, { top: insets.top + 20 }]}
      >
        <ArrowLeft color="#f1f5f9" size={24} />
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
              <Text style={styles.title}>{t('login.welcome')}</Text>
              <Text style={styles.subtitle}>{t('login.signIn')}</Text>
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
                  {t('login.biometric', { type: biometricType })}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('login.or')}</Text>
                <View style={styles.dividerLine} />
              </View>
            </>
          )}

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('login.usernameLabel')}</Text>
              <View style={styles.inputContainer}>
                <User color="#64748b" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder={t('login.usernamePlaceholder')}
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
              <Text style={styles.label}>{t('login.passwordLabel')}</Text>
              <View style={styles.inputContainer}>
                <Lock color="#64748b" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder={t('login.passwordPlaceholder')}
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
              onPress={() => showToast(t('login.contactAdmin'))}
              style={styles.forgotPassword}
              disabled={loading}
              accessibilityLabel="Forgot password"
            >
              <Text style={styles.forgotPasswordText}>{t('login.forgotPassword')}</Text>
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
                  <Text style={styles.loginButtonText}>{t('login.loginButton')}</Text>
                  <ArrowRight color="#ffffff" size={20} strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  landingContent: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  landingHeader: {
    alignItems: 'center',
    width: '100%',
  },
  landingLogoContainer: {
    backgroundColor: '#4f46e5',
    borderRadius: 32,
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.42,
    shadowRadius: 22,
    elevation: 12,
  },
  landingTitle: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  landingSubtitle: {
    color: '#b6c2d8',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  landingButtons: {
    width: '100%',
    gap: 16,
  },
  landingButtonPrimary: {
    backgroundColor: '#4f46e5',
    borderRadius: 18,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 10,
  },
  landingButtonTextPrimary: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },
  landingButtonSecondary: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.28)',
  },
  landingButtonTextSecondary: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '600',
  },
  versionText: {
    color: '#7c8ca8',
    fontSize: 12,
    marginBottom: 20,
    letterSpacing: 0.4,
  },
  backButton: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderRadius: 14,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  toastText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 12,
    fontWeight: '600',
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
    marginBottom: 32,
  },
  logoContainer: {
    backgroundColor: '#4f46e5',
    borderRadius: 24,
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 29,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  subtitle: {
    color: '#b6c2d8',
    fontSize: 15,
    lineHeight: 22,
  },
  biometricButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
  },
  biometricButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
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
    backgroundColor: 'rgba(148,163,184,0.25)',
  },
  dividerText: {
    color: '#8aa0bd',
    fontSize: 13,
    marginHorizontal: 16,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 16,
    paddingVertical: 16,
    marginLeft: 10,
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
    color: '#7dd3fc',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 48,
    marginTop: 20,
  },
  varahiBranding: {
    fontSize: 56,
    fontWeight: '900',
    color: '#ffffff',
    fontStyle: 'italic',
    letterSpacing: -1.2,
    lineHeight: 62,
    textShadowColor: 'rgba(79, 70, 229, 0.3)',
    textShadowOffset: { width: 0, height: 8 },
    textShadowRadius: 12,
  },
  brandingSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#60a5fa',
    marginTop: 8,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
});