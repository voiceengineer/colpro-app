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
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.18)',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      <View
        style={{
          backgroundColor: `${color}22`,
          borderRadius: 12,
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Icon color={color} size={20} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '700', marginBottom: 2 }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500' }}>
            {subtitle}
          </Text>
        )}
      </View>

      {showChevron && (
        <ChevronRight color="#94a3b8" size={18} />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={{
      color: '#9fb3c8',
      fontSize: 12,
      fontWeight: '700',
      marginLeft: 16,
      marginTop: 24,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 1.2
    }}>
      {title}
    </Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#07111f' }}>
      <StatusBar style="light" />

      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: '#0f172a',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(148, 163, 184, 0.16)',
        }}
      >
        <Text style={{ color: '#f8fafc', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="Profile" />
        <SettingsItem
          icon={User}
          title="Profile Information"
          subtitle="Update your personal details"
          onPress={() => console.log('Profile pressed')}
          color="#60a5fa"
        />

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
          color="#34d399"
        />
        <SettingsItem
          icon={Database}
          title="Data Sync"
          subtitle="Sync settings and offline data"
          onPress={() => console.log('Data sync pressed')}
          color="#a78bfa"
        />

        <SectionHeader title="Reports" />
        <SettingsItem
          icon={BarChart3}
          title="Performance Reports"
          subtitle="View collection statistics"
          onPress={() => console.log('Reports pressed')}
          color="#22d3ee"
        />
        <SettingsItem
          icon={FileText}
          title="Export Data"
          subtitle="Export visit reports and data"
          onPress={() => console.log('Export pressed')}
          color="#a3e635"
        />

        <SectionHeader title="Support" />
        <SettingsItem
          icon={HelpCircle}
          title="Help & Support"
          subtitle="Get help and contact support"
          onPress={() => console.log('Help pressed')}
          color="#94a3b8"
        />
        <SettingsItem
          icon={FileText}
          title="Terms & Privacy"
          subtitle="Read our terms and privacy policy"
          onPress={() => console.log('Terms pressed')}
          color="#cbd5e1"
        />

        <View
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderRadius: 16,
            padding: 18,
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: 'rgba(148, 163, 184, 0.18)',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
            Varahi Mobile
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '500' }}>
            Version 1.0.0
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            borderRadius: 16,
            padding: 16,
            marginHorizontal: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.35)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LogOut color="#f87171" size={20} />
          <Text style={{ color: '#fca5a5', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}