import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  MapPin, Bell, Search, FileText, Briefcase, Zap, TrendingUp, CheckCircle, Clock, XCircle
} from 'lucide-react-native';
import { useAuth } from '../../lib/authContext';
import { casesService } from '../../lib/services/casesService';

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  const [casesCount, setCasesCount] = useState(0);
  const [casesLoading, setCasesLoading] = useState(true);
  const [activeView, setActiveView] = useState('cases');

  useEffect(() => {
    if (user?.id) {
      fetchUserCasesCount();
    }
  }, [user?.id]);

  const fetchUserCasesCount = async () => {
    try {
      setCasesLoading(true);
      const count = await casesService.getUserCasesCount(user.id);
      setCasesCount(count);
    } catch (error) {
      if (error.message === 'UNAUTHORIZED' || error.message.includes('401')) {
        Alert.alert(
          'Session Expired', 
          'Your session has expired. Please login again.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
        return;
      }
      setCasesCount(0);
    } finally {
      setCasesLoading(false);
    }
  };

  const getDisplayData = () => {
    switch(activeView) {
      case 'cases':
        return {
          mainValue: '0',
          casesCount: casesCount,
          label: 'Total Amount',
          color: '#3b82f6'
        };
      case 'processed':
        return {
          mainValue: '0',
          casesCount: 0,
          label: 'Processed',
          color: '#8b5cf6'
        };
      case 'bonuses':
        return {
          mainValue: '0',
          casesCount: 0,
          label: 'Bonuses',
          color: '#f59e0b'
        };
      default:
        return {
          mainValue: '0',
          casesCount: casesCount,
          label: 'Total Amount',
          color: '#3b82f6'
        };
    }
  };

  const CategoryButton = ({ icon: Icon, label, color, isActive, onPress }) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flex: 1,
        backgroundColor: isActive ? color : '#1e293b',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: isActive ? color : '#334155',
      }}
    >
      <Icon 
        color={isActive ? '#ffffff' : color} 
        size={22} 
        strokeWidth={2.5} 
      />
      <Text style={{
        color: isActive ? '#ffffff' : '#94a3b8',
        fontSize: 11,
        fontWeight: '700',
        marginTop: 6,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const displayData = getDisplayData();

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f1e' }}>
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
          opacity: 0.12,
          borderRadius: 150,
        }} />
        <View style={{
          position: 'absolute',
          top: 180,
          left: -80,
          width: 200,
          height: 200,
          backgroundColor: '#8b5cf6',
          opacity: 0.1,
          borderRadius: 100,
        }} />
        <View style={{
          position: 'absolute',
          bottom: 100,
          right: -60,
          width: 250,
          height: 250,
          backgroundColor: '#f59e0b',
          opacity: 0.08,
          borderRadius: 125,
        }} />
      </View>
      
      {/* Header */}
      <View style={{ 
        paddingTop: insets.top + 16, 
        paddingHorizontal: 20, 
        paddingBottom: 12,
        zIndex: 10,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{
              backgroundColor: '#3b82f6',
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>
                {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                {user?.name || user?.username || 'User'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <MapPin color="#64748b" size={12} />
                <Text style={{ color: '#64748b', fontSize: 11, marginLeft: 4 }}>
                  {user?.employeeAddress || "Not Available"}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={{
              backgroundColor: '#1e293b',
              borderRadius: 10,
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bell color="#64748b" size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={{
              backgroundColor: '#1e293b',
              borderRadius: 10,
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Search color="#64748b" size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1, zIndex: 5 }}
        contentContainerStyle={{ 
          paddingHorizontal: 20, 
          paddingTop: 8,
          paddingBottom: 100 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Card - Compact */}
        <View style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          borderRadius: 20,
          padding: 20,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#334155',
        }}>
          <Text style={{
            color: '#94a3b8',
            fontSize: 12,
            fontWeight: '600',
            marginBottom: 12,
            textAlign: 'center',
            letterSpacing: 1,
          }}>
            {displayData.label}
          </Text>

          {casesLoading && activeView === 'cases' ? (
            <ActivityIndicator color="#3b82f6" size="large" />
          ) : (
            <>
              {/* Currency */}
              <Text style={{
                color: '#ffffff',
                fontSize: 56,
                fontWeight: 'bold',
                textAlign: 'center',
                lineHeight: 60,
              }}>
                {displayData.mainValue}
              </Text>
              <Text style={{
                color: displayData.color,
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'center',
                marginBottom: 16,
              }}>
                UZS
              </Text>

              {/* Cases Count */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1e293b',
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 16,
                marginBottom: 16,
              }}>
                <FileText color="#3b82f6" size={18} />
                <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginHorizontal: 8 }}>
                  {displayData.casesCount}
                </Text>
                <Text style={{ color: '#64748b', fontSize: 13 }}>
                  cases
                </Text>
              </View>
            </>
          )}

          {/* Category Buttons */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <CategoryButton 
              icon={FileText} 
              label="Cases" 
              color="#3b82f6" 
              isActive={activeView === 'cases'}
              onPress={() => {
                setActiveView('cases');
                if (casesCount > 0) {
                  setTimeout(() => router.push('/(tabs)/cases'), 200);
                }
              }}
            />
            <CategoryButton 
              icon={Briefcase} 
              label="Processed" 
              color="#8b5cf6"
              isActive={activeView === 'processed'}
              onPress={() => setActiveView('processed')}
            />
            <CategoryButton 
              icon={Zap} 
              label="Bonuses" 
              color="#f59e0b"
              isActive={activeView === 'bonuses'}
              onPress={() => setActiveView('bonuses')}
            />
          </View>
        </View>

        {/* Bypass Statistics - Compact */}
        <View style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          borderRadius: 18,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#334155',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <TrendingUp color="#10b981" size={18} />
            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600', marginLeft: 8 }}>
              Bypass Statistics
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingVertical: 12 }}>
              <CheckCircle color="#10b981" size={20} />
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginTop: 6 }}>0</Text>
              <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '600' }}>ACCEPTED</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingVertical: 12 }}>
              <Clock color="#f59e0b" size={20} />
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginTop: 6 }}>0</Text>
              <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '600' }}>PENDING</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingVertical: 12 }}>
              <XCircle color="#ef4444" size={20} />
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginTop: 6 }}>0</Text>
              <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '600' }}>REJECTED</Text>
            </View>
          </View>
        </View>

        {/* Sent Checks - Compact */}
        <View style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          borderRadius: 18,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#334155',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <FileText color="#3b82f6" size={18} />
            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600', marginLeft: 8 }}>
              Sent Checks
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingVertical: 12 }}>
              <CheckCircle color="#10b981" size={20} />
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginTop: 6 }}>0</Text>
              <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '600' }}>ACCEPTED</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingVertical: 12 }}>
              <Clock color="#f59e0b" size={20} />
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginTop: 6 }}>0</Text>
              <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '600' }}>PENDING</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingVertical: 12 }}>
              <XCircle color="#ef4444" size={20} />
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginTop: 6 }}>0</Text>
              <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '600' }}>REJECTED</Text>
            </View>
          </View>
        </View>

        {/* Portfolio - Compact */}
        <View style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          borderRadius: 18,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#334155',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Briefcase color="#8b5cf6" size={18} />
            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600', marginLeft: 8 }}>
              Portfolio
            </Text>
          </View>

          <View style={{
            backgroundColor: '#1e293b',
            borderRadius: 14,
            padding: 14,
          }}>
            <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600', marginBottom: 12 }}>
              "VARIANT RETAIL FINANCE" MCHJ
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>Balance</Text>
                <Text style={{ color: '#10b981', fontSize: 18, fontWeight: '700' }}>0 UZS</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>Total</Text>
                <Text style={{ color: '#3b82f6', fontSize: 18, fontWeight: '700' }}>0 UZS</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}