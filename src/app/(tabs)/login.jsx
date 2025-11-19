import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  DollarSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react-native';

export default function Login() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // TODO: Add your authentication logic here
    console.log('Login clicked:', { email, password });
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ 
          flex: 1, 
          paddingTop: insets.top + 60,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24
        }}>
          
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
              <DollarSign color="#ffffff" size={40} />
            </View>
            
            <Text style={{ 
              color: '#ffffff', 
              fontSize: 32, 
              fontWeight: 'bold',
              marginBottom: 8
            }}>
              Welcome Back
            </Text>
            <Text style={{ 
              color: '#94a3b8', 
              fontSize: 16,
              textAlign: 'center',
              lineHeight: 24
            }}>
              Sign in to manage your debt collection
            </Text>
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ 
              color: '#94a3b8', 
              fontSize: 14, 
              fontWeight: '600',
              marginBottom: 8 
            }}>
              Email Address
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
              <Mail color="#64748b" size={20} />
              <TextInput
                style={{
                  flex: 1,
                  color: '#ffffff',
                  fontSize: 16,
                  paddingVertical: 16,
                  marginLeft: 12,
                }}
                placeholder="Enter your email"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 24 }}>
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
              Sign In
            </Text>
            <ArrowRight color="#ffffff" size={20} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            marginBottom: 24 
          }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#334155' }} />
            <Text style={{ 
              color: '#64748b', 
              fontSize: 14,
              marginHorizontal: 16 
            }}>
              OR
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#334155' }} />
          </View>

          {/* Sign Up Link */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={{ 
                color: '#3b82f6', 
                fontSize: 14,
                fontWeight: 'bold'
              }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}