import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { User, LogOut, ChevronRight, Mail, Shield, Hash, Briefcase, RefreshCw } from 'lucide-react-native';
import { useAuth } from '../../lib/authContext';
import { authService } from '../../lib/auth';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [casesCount, setCasesCount] = useState(0);
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = await authService.getToken();
      // console.log("Profile - Token check:", token ? "exists" : "missing");
      
      if (!token) {
        Alert.alert('Session Expired', 'Please login again');
        router.replace('/');
      }
    };
    checkAuth();
  }, []);

  // Fetch cases when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      console.log("Profile - Fetching cases for user:", user.id);
      fetchUserCases();
    }
  }, [user?.id]);

  const fetchUserCases = async () => {
    try {
      setCasesLoading(true);
      setCasesError(null);
      
      console.log("Profile - Starting to fetch cases...");
      const casesData = await authService.getUserCases(user.id);
      
      console.log("Profile - Cases received:", casesData);
      setCasesCount(casesData?.length || 0);
    } catch (error) {
      console.error("Profile - Fetch cases error:", error);
      
      // Handle unauthorized error specifically
      if (error.message === "UNAUTHORIZED" || error.message.includes('401')) {
        Alert.alert(
          'Session Expired', 
          'Your session has expired. Please login again.',
          [
            { 
              text: 'OK', 
              onPress: async () => {
                await logout();
                router.replace('/');
              }
            }
          ]
        );
        return;
      }
      
      setCasesError(error.message);
      setCasesCount(0);
    } finally {
      setCasesLoading(false);
    }
  };

  const handleRefreshCases = async () => {
    await fetchUserCases();
    // Alert removed - refresh happens silently
  };

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

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Cases Stats Card */}
        <View style={{
          backgroundColor: '#1e293b', borderRadius: 16, padding: 20, borderWidth: 1,
          borderColor: '#334155', marginBottom: 16,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
              Your Cases
            </Text>
            <TouchableOpacity onPress={handleRefreshCases} disabled={casesLoading}>
              <RefreshCw 
                color={casesLoading ? '#64748b' : '#3b82f6'} 
                size={18}
                style={{ transform: [{ rotate: casesLoading ? '360deg' : '0deg' }] }}
              />
            </TouchableOpacity>
          </View>

          {casesError ? (
            <View>
              <Text style={{ color: '#ef4444', fontSize: 14, paddingVertical: 12 }}>
                Error: {casesError}
              </Text>
              <TouchableOpacity 
                onPress={handleRefreshCases}
                style={{
                  backgroundColor: '#ef444420',
                  padding: 8,
                  borderRadius: 8,
                  marginTop: 8,
                }}
              >
                <Text style={{ color: '#ef4444', fontSize: 13, textAlign: 'center' }}>
                  Tap to retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : casesLoading ? (
            <View style={{ paddingVertical: 12 }}>
              <ActivityIndicator color="#3b82f6" size="large" />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Briefcase color="#10b981" size={24} />
              <Text style={{ color: '#10b981', fontSize: 32, fontWeight: 'bold', marginLeft: 12 }}>
                {casesCount}
              </Text>
              <Text style={{ color: '#64748b', fontSize: 14, marginLeft: 8 }}>
                {casesCount === 1 ? 'case' : 'cases'}
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
            marginBottom: 24,
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
      </ScrollView>
    </View>
  );
}