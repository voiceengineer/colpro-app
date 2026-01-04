import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Keyboard
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, Eye, EyeOff, User, Phone, Lock, 
  CreditCard, MapPin, Calendar, FileText
} from 'lucide-react-native';
import { registrationService } from '../lib/services/registrationService';
import { useAuth } from '../lib/authContext';

const InputField = React.memo(({ 
  icon: Icon, 
  label, 
  value, 
  onChangeText, 
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  maxLength,
  showEye = false,
  onEyePress,
  showPasswordValue = false,
  required = true,
  inputRef,
  onSubmitEditing,
  returnKeyType = 'next',
  editable = true,
  onPress
}) => (
  <View style={{ marginBottom: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
      <Text style={{ 
        color: '#cbd5e1', 
        fontSize: 14, 
        fontWeight: '600',
      }}>
        {label}
      </Text>
      {required && (
        <Text style={{ color: '#ef4444', fontSize: 14, marginLeft: 4 }}>*</Text>
      )}
    </View>
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={{
        backgroundColor: '#1e293b',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#334155',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        opacity: editable ? 1 : 0.6,
      }}>
        <Icon color="#64748b" size={22} />
        <TextInput
          ref={inputRef}
          style={{
            flex: 1,
            color: '#f1f5f9',
            fontSize: 15,
            paddingVertical: 16,
            marginLeft: 12,
          }}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPasswordValue}
          keyboardType={keyboardType}
          autoCapitalize="none"
          maxLength={maxLength}
          editable={editable && !onPress}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          pointerEvents={onPress ? 'none' : 'auto'}
        />
        {showEye && (
          <TouchableOpacity onPress={onEyePress} style={{ padding: 8 }}>
            {showPasswordValue ? 
              <EyeOff color="#64748b" size={22} /> : 
              <Eye color="#64748b" size={22} />
            }
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  </View>
));

export default function Registration() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { checkAuth } = useAuth();
  
  // Input refs for navigation
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const pinflRef = useRef(null);
  const passportRef = useRef(null);
  const issuePlaceRef = useRef(null);
  const addressRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    pinfl: '',
    passportNumber: '',
    passportIssueDate: '',
    passportIssuePlace: '',
    employeeAddress: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
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
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      setFormData({ ...formData, passportIssueDate: formatDate(date) });
    }
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    
    setLoading(true);
    try {
      const result = await registrationService.registerFieldAgent(formData);
      
      showToast(result.message, 'success');
      
      // Auto login after 1.5 seconds
      setTimeout(async () => {
        try {
          await registrationService.autoLoginAfterRegistration(
            formData.phoneNumber,
            formData.password
          );
          await checkAuth();
          router.replace('/(tabs)/index');
        } catch (error) {
          // If auto-login fails, redirect to login page
          setTimeout(() => router.replace('/login'), 500);
        }
      }, 1500);
      
    } catch (error) {
      showToast(error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = toast.type === 'success';

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />
      
      {/* Background Gradients */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        <View style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          backgroundColor: '#3b82f6',
          opacity: 0.1,
          borderRadius: 150,
        }} />
        <View style={{
          position: 'absolute',
          bottom: 100,
          left: -80,
          width: 250,
          height: 250,
          backgroundColor: '#8b5cf6',
          opacity: 0.08,
          borderRadius: 125,
        }} />
      </View>
      
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
          borderWidth: 1.5,
          borderColor: '#334155',
        }}
      >
        <ArrowLeft color="#f1f5f9" size={24} />
      </TouchableOpacity>

      {toast.show && (
        <View style={{
          position: 'absolute',
          top: insets.top + 80,
          left: 24,
          right: 24,
          zIndex: 20,
          backgroundColor: isSuccess ? '#064e3b' : '#7f1d1d',
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: isSuccess ? '#22c55e' : '#ef4444',
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}>
          <Text style={{ color: '#f1f5f9', fontSize: 14, fontWeight: '600' }}>
            {toast.message}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingHorizontal: 24,
            paddingTop: insets.top + 80,
            paddingBottom: Math.max(insets.bottom, 24) + 20,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {!keyboardVisible && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#f1f5f9', fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
                Create Account
              </Text>
              <Text style={{ color: '#94a3b8', fontSize: 16 }}>
                Register as a Field Agent
              </Text>
            </View>
          )}

          <InputField
            inputRef={nameRef}
            icon={User}
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            onSubmitEditing={() => phoneRef.current?.focus()}
            editable={!loading}
          />

          <InputField
            inputRef={phoneRef}
            icon={Phone}
            label="Phone Number"
            placeholder="+998 (90) 123-45-67"
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
            keyboardType="phone-pad"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!loading}
          />

          <InputField
            inputRef={passwordRef}
            icon={Lock}
            label="Password"
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry={true}
            showEye={true}
            showPasswordValue={showPassword}
            onEyePress={() => setShowPassword(!showPassword)}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            editable={!loading}
          />

          <InputField
            inputRef={confirmPasswordRef}
            icon={Lock}
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry={true}
            showEye={true}
            showPasswordValue={showConfirmPassword}
            onEyePress={() => setShowConfirmPassword(!showConfirmPassword)}
            onSubmitEditing={() => pinflRef.current?.focus()}
            editable={!loading}
          />

          <InputField
            inputRef={pinflRef}
            icon={FileText}
            label="PINFL"
            placeholder="14 digits"
            value={formData.pinfl}
            onChangeText={(text) => setFormData({ ...formData, pinfl: text.replace(/\D/g, '') })}
            keyboardType="numeric"
            maxLength={14}
            onSubmitEditing={() => passportRef.current?.focus()}
            editable={!loading}
          />

          <InputField
            inputRef={passportRef}
            icon={CreditCard}
            label="Passport Number"
            placeholder="AB1234567"
            value={formData.passportNumber}
            onChangeText={(text) => setFormData({ ...formData, passportNumber: text.toUpperCase() })}
            onSubmitEditing={() => setShowDatePicker(true)}
            editable={!loading}
          />

          <InputField
            icon={Calendar}
            label="Passport Issue Date"
            placeholder="Select date"
            value={formData.passportIssueDate}
            editable={false}
            onPress={() => !loading && setShowDatePicker(true)}
          />

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1950, 0, 1)}
            />
          )}

          {Platform.OS === 'ios' && showDatePicker && (
            <TouchableOpacity
              onPress={() => setShowDatePicker(false)}
              style={{
                backgroundColor: '#2563eb',
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                Done
              </Text>
            </TouchableOpacity>
          )}

          <InputField
            inputRef={issuePlaceRef}
            icon={MapPin}
            label="Place of Passport Issue"
            placeholder="City name"
            value={formData.passportIssuePlace}
            onChangeText={(text) => setFormData({ ...formData, passportIssuePlace: text })}
            onSubmitEditing={() => addressRef.current?.focus()}
            editable={!loading}
          />

          <InputField
            inputRef={addressRef}
            icon={MapPin}
            label="Employee's Address"
            placeholder="Full address"
            value={formData.employeeAddress}
            onChangeText={(text) => setFormData({ ...formData, employeeAddress: text })}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            editable={!loading}
          />

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#2563eb',
              borderRadius: 14,
              paddingVertical: 18,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 8,
              marginBottom: 16,
              opacity: loading ? 0.6 : 1,
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '500' }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/login')} disabled={loading}>
              <Text style={{ color: '#3b82f6', fontSize: 15, fontWeight: '700' }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}