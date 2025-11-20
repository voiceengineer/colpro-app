import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  User,
  X
} from 'lucide-react-native';

export default function Login() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleLogin = () => {
    // Validate fields
    if (!username.trim()) {
      alert('Please enter your username');
      return;
    }
    
    if (!password) {
      alert('Please enter your password');
      return;
    }
    
    console.log('Login clicked:', { username, password });
    // TODO: Add your authentication logic here
  };

  const handleForgotPassword = () => {
    setShowToast(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />
      
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: insets.top + 16,
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
        }}
      >
        <ArrowLeft color="#ffffff" size={24} />
      </TouchableOpacity>

      {/* Toast Notification */}
      {showToast && (
        <View style={{
          position: 'absolute',
          top: insets.top + 80,
          left: 24,
          right: 24,
          zIndex: 20,
          backgroundColor: '#1e293b',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#3b82f6',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}>
          <AlertCircle color="#3b82f6" size={20} />
          <Text style={{
            flex: 1,
            color: '#ffffff',
            fontSize: 14,
            marginLeft: 12,
            fontWeight: '500'
          }}>
            Please contact the administrator to reset your password
          </Text>
          <TouchableOpacity 
            onPress={() => setShowToast(false)}
            style={{ padding: 4 }}
          >
            <X color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={{ 
              flexGrow: 1,
              paddingTop: insets.top + 80,
              paddingHorizontal: 24,
              paddingBottom: Math.max(insets.bottom, 24)
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Logo & Header */}
            <View style={{ alignItems: 'center', marginBottom: 48 }}>
              <View style={{
                backgroundColor: '#3b82f6',
                borderRadius: 20,
                width: 80,
                height: 80,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}>
                <Lock color="#ffffff" size={40} />
              </View>
              
              <Text style={{ 
                color: '#ffffff', 
                fontSize: 32, 
                fontWeight: 'bold',
                marginBottom: 8
              }}>
                Welcome Back
              </Text>
            </View>

            {/* Username Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ 
                color: '#94a3b8', 
                fontSize: 14, 
                fontWeight: '600',
                marginBottom: 8 
              }}>
                Username
              </Text>
              <View style={{
                backgroundColor: '#1e293b',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#334155',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
              }}>
                <User color="#64748b" size={20} />
                <TextInput
                  style={{
                    flex: 1,
                    color: '#ffffff',
                    fontSize: 16,
                    paddingVertical: 16,
                    marginLeft: 12,
                  }}
                  placeholder="Enter your username"
                  placeholderTextColor="#64748b"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ 
                color: '#94a3b8', 
                fontSize: 14, 
                fontWeight: '600',
                marginBottom: 8 
              }}>
                Password
              </Text>
              <View style={{
                backgroundColor: '#1e293b',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#334155',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
              }}>
                <Lock color="#64748b" size={20} />
                <TextInput
                  style={{
                    flex: 1,
                    color: '#ffffff',
                    fontSize: 16,
                    paddingVertical: 16,
                    marginLeft: 12,
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 4 }}
                >
                  {showPassword ? (
                    <EyeOff color="#64748b" size={20} />
                  ) : (
                    <Eye color="#64748b" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              onPress={handleForgotPassword}
              style={{ alignSelf: 'flex-end', marginBottom: 32 }}
            >
              <Text style={{ 
                color: '#3b82f6', 
                fontSize: 14,
                fontWeight: '600'
              }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              style={{
                backgroundColor: '#3b82f6',
                borderRadius: 12,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Text style={{ 
                color: '#ffffff', 
                fontSize: 16, 
                fontWeight: 'bold',
                marginRight: 8
              }}>
                Login
              </Text>
              <ArrowRight color="#ffffff" size={20} />
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}