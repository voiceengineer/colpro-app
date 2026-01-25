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
  CreditCard, MapPin, Calendar, FileText, AtSign
} from 'lucide-react-native';
import { registrationService } from '../lib/services/registrationService';
import { useTranslation } from 'react-i18next';

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
          accessibilityLabel={label}
        />
        {showEye && (
          <TouchableOpacity 
            onPress={onEyePress} 
            style={{ padding: 8 }}
            accessibilityLabel={showPasswordValue ? "Hide password" : "Show password"}
            accessibilityRole="button"
          >
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
  const { t } = useTranslation();
  
  // Input refs for navigation
  const usernameRef = useRef(null);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const pinflRef = useRef(null);
  const passportRef = useRef(null);
  const issuePlaceRef = useRef(null);
  const addressRef = useRef(null);
  
  const [formData, setFormData] = useState({
    username: '',
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

  const formatPhoneNumber = (text) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 12 digits (998 + 9 digits)
    const limited = cleaned.slice(0, 12);
    
    // Format: +998 (XX) XXX-XX-XX
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 5) {
      return `${limited.slice(0, 3)} (${limited.slice(3)})`;
    } else if (limited.length <= 8) {
      return `${limited.slice(0, 3)} (${limited.slice(3, 5)}) ${limited.slice(5)}`;
    } else if (limited.length <= 10) {
      return `${limited.slice(0, 3)} (${limited.slice(3, 5)}) ${limited.slice(5, 8)}-${limited.slice(8)}`;
    } else {
      return `${limited.slice(0, 3)} (${limited.slice(3, 5)}) ${limited.slice(5, 8)}-${limited.slice(8, 10)}-${limited.slice(10, 12)}`;
    }
  };

  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setFormData({ ...formData, phoneNumber: formatted });
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    
    setLoading(true);
    try {
      await registrationService.registerFieldAgent(formData);
      
      showToast(t('register.success'), 'success');
      
      // Redirect to login after delay
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
      
    } catch (error) {
      showToast(error?.message || t('register.failed'));
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
        accessibilityLabel={t('common.goBack')}
        accessibilityRole="button"
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
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {!keyboardVisible && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#f1f5f9', fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
                {t('register.title')}
              </Text>
              <Text style={{ color: '#94a3b8', fontSize: 16 }}>
                {t('register.subtitle')}
              </Text>
            </View>
          )}

          <InputField
            inputRef={usernameRef}
            icon={AtSign}
            label={t('register.username')}
            placeholder={t('register.usernamePlaceholder')}
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            onSubmitEditing={() => nameRef.current?.focus()}
            editable={!loading}
          />

          <InputField
            inputRef={nameRef}
            icon={User}
            label={t('register.fullName')}
            placeholder={t('register.fullNamePlaceholder')}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            onSubmitEditing={() => phoneRef.current?.focus()}
            editable={!loading}
          />

          <InputField
            inputRef={phoneRef}
            icon={Phone}
            label={t('register.phoneNumber')}
            placeholder={t('register.phoneNumberPlaceholder')}
            value={formData.phoneNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={22}
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!loading}
          />

          <InputField
            inputRef={passwordRef}
            icon={Lock}
            label={t('register.password')}
            placeholder={t('register.passwordPlaceholder')}
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
            label={t('register.confirmPassword')}
            placeholder={t('register.confirmPasswordPlaceholder')}
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
            label={t('register.pinfl')}
            placeholder={t('register.pinflPlaceholder')}
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
            label={t('register.passportNumber')}
            placeholder={t('register.passportNumberPlaceholder')}
            value={formData.passportNumber}
            onChangeText={(text) => setFormData({ ...formData, passportNumber: text.toUpperCase() })}
            onSubmitEditing={() => setShowDatePicker(true)}
            editable={!loading}
          />

          <InputField
            icon={Calendar}
            label={t('register.issueDate')}
            placeholder={t('register.issueDatePlaceholder')}
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
                {t('register.done')}
              </Text>
            </TouchableOpacity>
          )}

          <InputField
            inputRef={issuePlaceRef}
            icon={MapPin}
            label={t('register.issuePlace')}
            placeholder={t('register.issuePlacePlaceholder')}
            value={formData.passportIssuePlace}
            onChangeText={(text) => setFormData({ ...formData, passportIssuePlace: text })}
            onSubmitEditing={() => addressRef.current?.focus()}
            editable={!loading}
          />

          <InputField
            inputRef={addressRef}
            icon={MapPin}
            label={t('register.address')}
            placeholder={t('register.addressPlaceholder')}
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
                {t('register.submit')}
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '500' }}>
              {t('register.haveAccount')}{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/login')} disabled={loading}>
              <Text style={{ color: '#3b82f6', fontSize: 15, fontWeight: '700' }}>
                {t('register.signIn')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
