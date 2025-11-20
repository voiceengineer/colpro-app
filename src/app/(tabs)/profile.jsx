import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { User, LogOut, ChevronRight, Mail, Shield, Hash } from 'lucide-react-native';
import { useAuth } from '../../lib/authContext';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
              router.replace('/');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const InfoRow = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
      <View style={{
        flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#334155',
      }}>
        <Icon color="#3b82f6" size={20} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 2 }}>{label}</Text>
          <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '500' }}>{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />
      
      <View style={{ paddingTop: insets.top + 24, paddingHorizontal: 24, paddingBottom: 24 }}>
        <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: 'bold' }}>Profile</Text>
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        {/* User Avatar Card */}
        <View style={{
          backgroundColor: '#1e293b', borderRadius: 16, padding: 24, borderWidth: 1,
          borderColor: '#334155', marginBottom: 16, alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: '#3b82f6', borderRadius: 50, width: 100, height: 100,
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Text style={{ color: '#ffffff', fontSize: 36, fontWeight: 'bold' }}>
              {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>
            {user?.name || 'User'}
          </Text>
          
          {user?.role && (
            <View style={{
              backgroundColor: '#3b82f620', paddingHorizontal: 12, paddingVertical: 4,
              borderRadius: 20, marginTop: 8,
            }}>
              <Text style={{ color: '#3b82f6', fontSize: 13, fontWeight: '600' }}>
                {user.role}
              </Text>
            </View>
          )}
        </View>

        {/* User Details Card */}
        <View style={{
          backgroundColor: '#1e293b', borderRadius: 16, padding: 20, borderWidth: 1,
          borderColor: '#334155', marginBottom: 16,
        }}>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Account Information
          </Text>
          
          <InfoRow icon={User} label="Username" value={user?.username} />
          <InfoRow icon={Mail} label="Email" value={user?.email} />
          <InfoRow icon={Hash} label="User ID" value={user?.id?.toString()} />
          <InfoRow icon={Shield} label="Role" value={user?.role} />
          
          {!user?.username && !user?.email && !user?.id && (
            <Text style={{ color: '#64748b', fontSize: 14, textAlign: 'center', paddingVertical: 16 }}>
              No additional information available
            </Text>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout} disabled={loading}
          style={{
            backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155',
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {loading ? <ActivityIndicator color="#ef4444" size="small" /> : <LogOut color="#ef4444" size={20} />}
            <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: '600', marginLeft: 12 }}>
              {loading ? 'Logging out...' : 'Logout'}
            </Text>
          </View>
          <ChevronRight color="#64748b" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}