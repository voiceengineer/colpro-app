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
  User,
  Phone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react-native';

export default function SignUp() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = () => {
    // TODO: Add your registration logic here
    console.log('Sign Up clicked:', { fullName, email, phone, password });
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const strength = [hasMinLength, hasUpperCase, hasNumber].filter(Boolean).length;
    return { strength, hasMinLength, hasUpperCase, hasNumber };
  };

  const passwordStrength = getPasswordStrength();
  const strengthColor = passwordStrength?.strength === 3 ? '#10b981' : 
                        passwordStrength?.strength === 2 ? '#f59e0b' : '#ef4444';
  const strengthText = passwordStrength?.strength === 3 ? 'Strong' : 
                       passwordStrength?.strength === 2 ? 'Medium' : 'Weak';

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ 
          flex: 1, 
          paddingTop: insets.top + 40,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24
        }}>
          
          {/* Logo & Header */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{
              backgroundColor: '#3b82f6',
              borderRadius: 20,
              width: 80,
              height: 80,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
              <DollarSign color="#ffffff" size={40} />
            </View>
            
            <Text style={{ 
              color: '#ffffff', 
              fontSize: 28, 
              fontWeight: 'bold',
              marginBottom: 8
            }}>
              Create Account
            </Text>
            <Text style={{ 
              color: '#94a3b8', 
              fontSize: 15,
              textAlign: 'center',
              lineHeight: 22
            }}>
              Sign up to start managing debts efficiently
            </Text>
          </View>

          {/* Full Name Input */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ 
              color: '#94a3b8', 
              fontSize: 14, 
              fontWeight: '600',
              marginBottom: 8 
            }}>
              Full Name
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
                placeholder="Enter your full name"
                placeholderTextColor="#64748b"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
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

          {/* Phone Input */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ 
              color: '#94a3b8', 
              fontSize: 14, 
              fontWeight: '600',
              marginBottom: 8 
            }}>
              Phone Number (Optional)
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
              <Phone color="#64748b" size={20} />
              <TextInput
                style={{
                  flex: 1,
                  color: '#ffffff',
                  fontSize: 16,
                  paddingVertical: 16,
                  marginLeft: 12,
                }}
                placeholder="+998 90 123 45 67"
                placeholderTextColor="#64748b"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
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
                placeholder="Create a password"
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
            
            {/* Password Strength Indicator */}
            {passwordStrength && (
              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <View style={{ flex: 1, height: 4, backgroundColor: strengthColor, borderRadius: 2, marginRight: 8 }} />
                  <View style={{ flex: 1, height: 4, backgroundColor: passwordStrength.strength >= 2 ? strengthColor : '#334155', borderRadius: 2, marginRight: 8 }} />
                  <View style={{ flex: 1, height: 4, backgroundColor: passwordStrength.strength === 3 ? strengthColor : '#334155', borderRadius: 2 }} />
                </View>
                <Text style={{ color: strengthColor, fontSize: 12, fontWeight: '600' }}>
                  Password strength: {strengthText}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ 
              color: '#94a3b8', 
              fontSize: 14, 
              fontWeight: '600',
              marginBottom: 8 
            }}>
              Confirm Password
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
                placeholder="Re-enter your password"
                placeholderTextColor="#64748b"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ padding: 4 }}
              >
                {showConfirmPassword ? (
                  <EyeOff color="#64748b" size={20} />
                ) : (
                  <Eye color="#64748b" size={20} />
                )}
              </TouchableOpacity>
            </View>
            {confirmPassword && password === confirmPassword && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <CheckCircle2 color="#10b981" size={16} />
                <Text style={{ color: '#10b981', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
                  Passwords match
                </Text>
              </View>
            )}
          </View>

          {/* Terms and Conditions */}
          <View style={{ 
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#334155',
          }}>
            <Text style={{ color: '#94a3b8', fontSize: 13, lineHeight: 20 }}>
              By signing up, you agree to our{' '}
              <Text style={{ color: '#3b82f6', fontWeight: '600' }}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={{ color: '#3b82f6', fontWeight: '600' }}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
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
              Create Account
            </Text>
            <ArrowRight color="#ffffff" size={20} />
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={{ 
                color: '#3b82f6', 
                fontSize: 14,
                fontWeight: 'bold'
              }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}