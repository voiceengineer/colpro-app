import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  FileText, Lock, DollarSign, MapPin, User, ChevronRight, 
  Globe, LogOut, Phone, Hash, Shield, CreditCard, Calendar, MapPinned,
  Check, X
} from 'lucide-react-native';
import { useAuth } from '../../lib/authContext';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setShowLanguageModal(false);
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirmMessage'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert(t('profile.error'), t('profile.logoutFailed'));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const MenuButton = ({ icon: Icon, label, onPress, color = '#94a3b8', rightElement }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1e293b',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#334155',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          backgroundColor: `${color}25`,
          borderRadius: 10,
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          <Icon color={color} size={20} strokeWidth={2.5} />
        </View>
        <Text style={{ color: '#f1f5f9', fontSize: 15, fontWeight: '600' }}>
          {label}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {rightElement}
        <ChevronRight color="#94a3b8" size={20} />
      </View>
    </TouchableOpacity>
  );

  const InfoRow = ({ icon: Icon, label, value, isLast = false }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: '#334155',
    }}>
      <View style={{
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderRadius: 8,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Icon color="#60a5fa" size={18} strokeWidth={2.5} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600', marginBottom: 2 }}>
          {label}
        </Text>
        <Text style={{ color: '#f1f5f9', fontSize: 14, fontWeight: '600' }}>
          {value || t('common.notAvailable')}
        </Text>
      </View>
    </View>
  );

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return t('common.notAvailable');
    try {
      const date = new Date(dateString);
      const locales = {
        en: 'en-US',
        uz: 'uz-UZ',
        ru: 'ru-RU'
      }
      return date.toLocaleDateString(locales[i18n.language] || 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return t('common.notAvailable'); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />
      
      {/* Background Gradients */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
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

      {/* Header */}
      <View style={{ 
        paddingTop: insets.top + 16, 
        paddingHorizontal: 20, 
        paddingBottom: 20,
        zIndex: 10,
      }}>
        <Text style={{ color: '#f1f5f9', fontSize: 28, fontWeight: 'bold' }}>
          {t('profile.title')}
        </Text>
      </View>

      <ScrollView 
        style={{ flex: 1, zIndex: 5 }}
        contentContainerStyle={{ 
          paddingHorizontal: 20, 
          paddingBottom: 100
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card - Compact */}
        <View style={{
          backgroundColor: '#1e293b',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#334155',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          {/* Avatar */}
          <View style={{
            backgroundColor: '#8b5cf6',
            borderRadius: 32,
            width: 64,
            height: 64,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}>
            <Text style={{ color: '#ffffff', fontSize: 26, fontWeight: 'bold' }}>
              {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* User Details */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
              {user?.name || user?.username || 'User'}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500' }}>
              {user?.phoneNumber || user?.username || t('common.noContactInfo')}
            </Text>
            {user?.officerType && (
              <View style={{
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginTop: 6,
                alignSelf: 'flex-start',
              }}>
                <Text style={{ color: '#a78bfa', fontSize: 11, fontWeight: '700' }}>
                  {user.officerType}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 16 }}>
          <MenuButton 
            icon={FileText}
            label={t('profile.contractDocuments')}
            onPress={() => router.push('/contracts')}
            color="#3b82f6"
          />
          <MenuButton 
            icon={Lock}
            label={t('profile.changePassword')}
            onPress={() => Alert.alert(t('profile.changePassword'), t('profile.features.passwordFeature'))}
            color="#f59e0b"
          />
          <MenuButton 
            icon={DollarSign}
            label={t('profile.revenues')}
            onPress={() => Alert.alert(t('profile.revenues'), t('profile.features.amountCollectedMsg', { amount: user?.amountCollected || 0 }))}
            color="#10b981"
          />
        </View>

        {/* Personal Information */}
        <View style={{
          backgroundColor: '#1e293b',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#334155',
        }}>
          <Text style={{ 
            color: '#cbd5e1', 
            fontSize: 13, 
            fontWeight: '700', 
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            {t('profile.personalInformation')}
          </Text>

          <InfoRow 
            icon={Hash}
            label={t('profile.labels.employeeId')}
            value={user?.id?.toString()}
          />
          <InfoRow 
            icon={Hash}
            label={t('profile.labels.pinfl')}
            value={user?.pinfl}
          />
          <InfoRow 
            icon={User}
            label={t('profile.labels.name')}
            value={user?.name}
          />
          <InfoRow 
            icon={Phone}
            label={t('profile.labels.phoneNumber')}
            value={user?.phoneNumber}
          />
          <InfoRow 
            icon={User}
            label={t('profile.labels.login')}
            value={user?.login}
          />
          <InfoRow 
            icon={MapPin}
            label={t('profile.labels.employeeAddress')} 
            value={user?.employeeAddress}
          />
          <InfoRow 
            icon={Shield}
            label={t('profile.labels.role')}
            value={user?.role}
          />
          <InfoRow 
            icon={Shield}
            label={t('profile.labels.status')}
            value={user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : t('common.notAvailable')}
            isLast={true}
          />
        </View>

        {/* Passport Information */}
        <View style={{
          backgroundColor: '#1e293b',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#334155',
        }}>
          <Text style={{ 
            color: '#cbd5e1', 
            fontSize: 13, 
            fontWeight: '700', 
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            {t('profile.passportDetails')}
          </Text>

          <InfoRow 
            icon={CreditCard}
            label={t('profile.labels.passportNumber')}
            value={user?.passportNumber}
          />
          <InfoRow 
            icon={Calendar}
            label={t('profile.labels.issueDate')}
            value={formatDate(user?.passportIssueDate)}
          />
          <InfoRow 
            icon={MapPinned}
            label={t('profile.labels.issuePlace')}
            value={user?.passportIssuePlace}
            isLast={true}
          />
        </View>

        {/* Work Statistics */}
        <View style={{
          backgroundColor: '#1e293b',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#334155',
        }}>
          <Text style={{ 
            color: '#cbd5e1', 
            fontSize: 13, 
            fontWeight: '700', 
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            {t('profile.workStatistics')}
          </Text>

          <InfoRow 
            icon={DollarSign}
            label={t('profile.labels.amountCollected')}
            value={`${user?.amountCollected || 0}`}
          />
          <InfoRow 
            icon={Hash}
            label={t('profile.labels.activeTasks')}
            value={user?.activeTasks?.toString() || '0'}
          />
          <InfoRow 
            icon={Calendar}
            label={t('profile.labels.lastLogin')}
            value={formatDate(user?.lastLogin)}
          />
          <InfoRow 
            icon={Calendar}
            label={t('profile.labels.createdAt')}
            value={formatDate(user?.createdAt)}
            isLast={true}
          />
        </View>

        {/* Settings */}
        <View style={{ marginBottom: 16 }}>
          <MenuButton 
            icon={Globe}
            label={t('profile.selectLanguage')}
            onPress={() => setShowLanguageModal(true)}
            color="#8b5cf6"
            rightElement={
              <Text style={{ fontSize: 20, marginRight: 8 }}>
                {languages.find(l => l.code === i18n.language)?.flag || '🇺🇸'}
              </Text>
            }
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          disabled={loading}
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            borderRadius: 14,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.3)',
            marginBottom: 20,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#ef4444" size="small" />
          ) : (
            <>
              <LogOut color="#ef4444" size={20} strokeWidth={2.5} />
              <Text style={{ 
                color: '#ef4444', 
                fontSize: 16, 
                fontWeight: '700', 
                marginLeft: 10 
              }}>
                {t('profile.logout')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLanguageModal}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
        }}>
          <View style={{
            width: '80%',
            backgroundColor: '#1e293b',
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: '#334155',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 10,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 'bold' }}>
                {t('profile.selectLanguage')}
              </Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X color="#94a3b8" size={24} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              {languages.map((lang) => {
                const isSelected = i18n.language === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => handleLanguageChange(lang.code)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : '#0f172a',
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: isSelected ? '#3b82f6' : '#334155',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, marginRight: 12 }}>{lang.flag}</Text>
                      <Text style={{ 
                        color: isSelected ? '#ffffff' : '#cbd5e1', 
                        fontSize: 16, 
                        fontWeight: isSelected ? '700' : '500' 
                      }}>
                        {lang.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={{
                        backgroundColor: '#3b82f6',
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Check color="#ffffff" size={12} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
