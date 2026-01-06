import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  ActivityIndicator,
  RefreshControl,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FileText, ChevronRight, Calendar, Hash, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../../lib/authContext';
import { contractService } from '../../lib/services/contractService';

export default function Contracts() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await contractService.getContractDocuments(user?.id);
      setContracts(data);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContracts();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleContractPress = (contract) => {
    router.push({
      pathname: '/contracts/[id]',
      params: { id: contract.id }
    });
  };

  const renderContractCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleContractPress(item)}
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Icon */}
        <View style={{
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderRadius: 12,
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          <FileText color="#60a5fa" size={24} strokeWidth={2.5} />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: '#f1f5f9', 
            fontSize: 16, 
            fontWeight: '700',
            marginBottom: 8,
          }} numberOfLines={2}>
            {item.title || item.originalFileName}
          </Text>

          {/* File Info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Hash color="#94a3b8" size={14} strokeWidth={2.5} />
            <Text style={{ 
              color: '#94a3b8', 
              fontSize: 12, 
              fontWeight: '500',
              marginLeft: 4,
            }}>
              ID: {item.id}
            </Text>
            <Text style={{ 
              color: '#94a3b8', 
              fontSize: 12,
              marginHorizontal: 8,
            }}>•</Text>
            <Text style={{ 
              color: '#94a3b8', 
              fontSize: 12, 
              fontWeight: '500',
            }}>
              {formatFileSize(item.fileSize)}
            </Text>
          </View>

          {/* Date */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Calendar color="#94a3b8" size={14} strokeWidth={2.5} />
            <Text style={{ 
              color: '#94a3b8', 
              fontSize: 12, 
              fontWeight: '500',
              marginLeft: 4,
            }}>
              {formatDate(item.createdAt)}
            </Text>
          </View>

          {/* Version Badge */}
          {item.currentVersion && (
            <View style={{
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              alignSelf: 'flex-start',
            }}>
              <Text style={{ 
                color: '#a78bfa', 
                fontSize: 11, 
                fontWeight: '700' 
              }}>
                Version {item.currentVersion.versionNo}
              </Text>
            </View>
          )}
        </View>

        {/* Arrow */}
        <ChevronRight color="#94a3b8" size={20} style={{ marginLeft: 8 }} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={{ 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center',
      paddingVertical: 60,
    }}>
      <View style={{
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderRadius: 32,
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
      }}>
        <AlertCircle color="#60a5fa" size={32} strokeWidth={2.5} />
      </View>
      <Text style={{ 
        color: '#f1f5f9', 
        fontSize: 18, 
        fontWeight: '700',
        marginBottom: 8,
      }}>
        No Contracts Found
      </Text>
      <Text style={{ 
        color: '#94a3b8', 
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 32,
      }}>
        You don't have any contract documents yet
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#0f172a',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ 
          color: '#94a3b8', 
          fontSize: 14, 
          marginTop: 12 
        }}>
          Loading contracts...
        </Text>
      </View>
    );
  }

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
        <Text style={{ 
          color: '#f1f5f9', 
          fontSize: 28, 
          fontWeight: 'bold' 
        }}>
          Contract Documents
        </Text>
        <Text style={{ 
          color: '#94a3b8', 
          fontSize: 14, 
          marginTop: 4 
        }}>
          {contracts.length} {contracts.length === 1 ? 'contract' : 'contracts'} found
        </Text>
      </View>

      {/* Contract List */}
      <FlatList
        data={contracts}
        renderItem={renderContractCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ 
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}