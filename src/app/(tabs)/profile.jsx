import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  FileText, Lock, DollarSign, MapPin, User, ChevronRight, 
  Globe, LogOut, Phone, Mail, Hash, Shield, CreditCard, Calendar, MapPinned
} from 'lucide-react-native';
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
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const MenuButton = ({ icon: Icon, label, onPress, color = '#94a3b8' }) => (
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
      <ChevronRight color="#94a3b8" size={20} />
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
          {value || 'Not available'}
        </Text>
      </View>
    </View>
  );

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
          Profile
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
              {user?.phoneNumber || user?.username || 'No contact info'}
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
            label="PDF File"
            onPress={() => Alert.alert('PDF', 'PDF feature coming soon')}
            color="#3b82f6"
          />
          <MenuButton 
            icon={Lock}
            label="Change Password"
            onPress={() => Alert.alert('Password', 'Change password feature coming soon')}
            color="#f59e0b"
          />
          <MenuButton 
            icon={DollarSign}
            label="Revenues"
            onPress={() => Alert.alert('Revenues', `Amount Collected: ${user?.amountCollected || 0}`)}
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
            Personal Information
          </Text>

          <InfoRow 
            icon={Hash}
            label="Employee ID"
            value={user?.id?.toString()}
          />
          <InfoRow 
            icon={Hash}
            label="PINFL"
            value={user?.pinfl}
          />
          <InfoRow 
            icon={User}
            label="Name"
            value={user?.name}
          />
          <InfoRow 
            icon={Phone}
            label="Phone Number"
            value={user?.phoneNumber}
          />
          <InfoRow 
            icon={User}
            label="Login"
            value={user?.login}
          />
          <InfoRow 
            icon={MapPin}
            label="Employee Address"
            value={user?.employeeAddress}
          />
          <InfoRow 
            icon={Shield}
            label="Role"
            value={user?.role}
          />
          <InfoRow 
            icon={Shield}
            label="Status"
            value={user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Not available'}
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
            Passport Details
          </Text>

          <InfoRow 
            icon={CreditCard}
            label="Passport Number"
            value={user?.passportNumber}
          />
          <InfoRow 
            icon={Calendar}
            label="Issue Date"
            value={formatDate(user?.passportIssueDate)}
          />
          <InfoRow 
            icon={MapPinned}
            label="Issue Place"
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
            Work Statistics
          </Text>

          <InfoRow 
            icon={DollarSign}
            label="Amount Collected"
            value={`${user?.amountCollected || 0}`}
          />
          <InfoRow 
            icon={Hash}
            label="Active Tasks"
            value={user?.activeTasks?.toString() || '0'}
          />
          <InfoRow 
            icon={Calendar}
            label="Last Login"
            value={formatDate(user?.lastLogin)}
          />
          <InfoRow 
            icon={Calendar}
            label="Created At"
            value={formatDate(user?.createdAt)}
            isLast={true}
          />
        </View>

        {/* Settings */}
        <View style={{ marginBottom: 16 }}>
          <MenuButton 
            icon={Globe}
            label="Select Language"
            onPress={() => Alert.alert('Language', 'Language selection coming soon')}
            color="#8b5cf6"
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
                Logout
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}