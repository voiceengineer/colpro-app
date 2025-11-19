import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  FileText, 
  LogOut, 
  ChevronRight,
  Settings as SettingsIcon,
  Database,
  BarChart3
} from 'lucide-react-native';

export default function Settings() {
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // Handle logout logic here
            console.log('User logged out');
          }
        }
      ]
    );
  };

  const SettingsItem = ({ icon: Icon, title, subtitle, onPress, color = '#ffffff', showChevron = true }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          backgroundColor: '#334155',
          borderRadius: 10,
          padding: 10,
          marginRight: 16,
        }}
      >
        <Icon color={color} size={20} />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 2 }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ color: '#94a3b8', fontSize: 14 }}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {showChevron && (
        <ChevronRight color="#64748b" size={20} />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={{ 
      color: '#94a3b8', 
      fontSize: 14, 
      fontWeight: '600', 
      marginLeft: 16, 
      marginTop: 24, 
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    }}>
      {title}
    </Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: '#1e293b',
          borderBottomWidth: 1,
          borderBottomColor: '#334155',
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold' }}>
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <SectionHeader title="Profile" />
        <SettingsItem
          icon={User}
          title="Profile Information"
          subtitle="Update your personal details"
          onPress={() => console.log('Profile pressed')}
          color="#3b82f6"
        />

        {/* App Settings */}
        <SectionHeader title="App Settings" />
        <SettingsItem
          icon={Bell}
          title="Notifications"
          subtitle="Manage notification preferences"
          onPress={() => console.log('Notifications pressed')}
          color="#f59e0b"
        />
        <SettingsItem
          icon={Shield}
          title="Privacy & Security"
          subtitle="Control your privacy settings"
          onPress={() => console.log('Privacy pressed')}
          color="#10b981"
        />
        <SettingsItem
          icon={Database}
          title="Data Sync"
          subtitle="Sync settings and offline data"
          onPress={() => console.log('Data sync pressed')}
          color="#8b5cf6"
        />

        {/* Reports & Analytics */}
        <SectionHeader title="Reports" />
        <SettingsItem
          icon={BarChart3}
          title="Performance Reports"
          subtitle="View collection statistics"
          onPress={() => console.log('Reports pressed')}
          color="#06b6d4"
        />
        <SettingsItem
          icon={FileText}
          title="Export Data"
          subtitle="Export visit reports and data"
          onPress={() => console.log('Export pressed')}
          color="#84cc16"
        />

        {/* Support */}
        <SectionHeader title="Support" />
        <SettingsItem
          icon={HelpCircle}
          title="Help & Support"
          subtitle="Get help and contact support"
          onPress={() => console.log('Help pressed')}
          color="#64748b"
        />
        <SettingsItem
          icon={FileText}
          title="Terms & Privacy"
          subtitle="Read our terms and privacy policy"
          onPress={() => console.log('Terms pressed')}
          color="#64748b"
        />

        {/* App Info */}
        <View
          style={{
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: 16,
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#334155',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 4 }}>
            CollPro Mobile
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12 }}>
            Version 1.0.0
          </Text>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#dc262620',
            borderRadius: 12,
            padding: 16,
            marginHorizontal: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#dc2626',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LogOut color="#dc2626" size={20} />
          <Text style={{ color: '#dc2626', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}