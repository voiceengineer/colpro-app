import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Alert, 
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { 
  FileText, 
  Calendar, 
  Hash, 
  AlertCircle, 
  Tag, 
  HardDrive, 
  Clock,
  Users,
  Layers
} from 'lucide-react-native';
import { useAuth } from '../../lib/authContext';
import { contractService } from '../../lib/services/contractService';

export default function Contracts() {
  const insets = useSafeAreaInsets();
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
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const StatBadge = ({ icon: Icon, label, value, color = '#60a5fa' }) => (
    <View style={{
      flex: 1,
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: '#334155',
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
      }}>
        <Icon color={color} size={14} strokeWidth={2.5} />
        <Text style={{ 
          color: '#94a3b8', 
          fontSize: 10, 
          fontWeight: '600',
          marginLeft: 6,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          {label}
        </Text>
      </View>
      <Text style={{ 
        color: '#f1f5f9', 
        fontSize: 13, 
        fontWeight: '700',
      }} numberOfLines={1}>
        {value || 'N/A'}
      </Text>
    </View>
  );

  const renderContractCard = ({ item }) => (
    <View
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 0,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
        overflow: 'hidden',
      }}
    >
      {/* Header Section with Gradient */}
      <View style={{
        backgroundColor: '#0f172a',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            backgroundColor: '#3b82f6',
            borderRadius: 16,
            width: 64,
            height: 64,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <FileText color="#ffffff" size={32} strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              color: '#f1f5f9', 
              fontSize: 18, 
              fontWeight: 'bold',
              marginBottom: 8,
              lineHeight: 24,
            }} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={{
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 5,
              alignSelf: 'flex-start',
            }}>
              <Text style={{ 
                color: '#60a5fa', 
                fontSize: 11, 
                fontWeight: '700',
              }} numberOfLines={1}>
                {item.originalFileName}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={{
        padding: 16,
        backgroundColor: '#1e293b',
      }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <StatBadge 
            icon={Hash}
            label="ID"
            value={`#${item.id}`}
            color="#60a5fa"
          />
          <StatBadge 
            icon={Tag}
            label="Type"
            value={item.fileExt?.toUpperCase()}
            color="#8b5cf6"
          />
          <StatBadge 
            icon={HardDrive}
            label="Size"
            value={formatFileSize(item.fileSize)}
            color="#ec4899"
          />
        </View>

        {item.currentVersion && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <StatBadge 
              icon={Layers}
              label="Version"
              value={`v${item.currentVersion.versionNo}`}
              color="#10b981"
            />
            <View style={{ flex: 2 }}>
              <StatBadge 
                icon={Clock}
                label="Last Saved"
                value={formatDate(item.currentVersion.savedAt)}
                color="#f59e0b"
              />
            </View>
          </View>
        )}
      </View>

      {/* Field Agents Section */}
      {item.fieldAgents && item.fieldAgents.length > 0 && (
        <View style={{
          backgroundColor: 'rgba(139, 92, 246, 0.05)',
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: '#334155',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}>
            <Users color="#8b5cf6" size={16} strokeWidth={2.5} />
            <Text style={{ 
              color: '#a78bfa', 
              fontSize: 12, 
              fontWeight: '700',
              marginLeft: 6,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              Assigned Agents ({item.fieldAgents.length})
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            {item.fieldAgents.map((agent) => (
              <View
                key={agent.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#1e293b',
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#334155',
                }}
              >
                <View style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  backgroundColor: '#8b5cf6',
                  borderRadius: 12,
                  width: 44,
                  height: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ 
                    color: '#ffffff', 
                    fontSize: 16, 
                    fontWeight: 'bold' 
                  }}>
                    {agent.name?.charAt(0).toUpperCase() || 'A'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    color: '#f1f5f9', 
                    fontSize: 14, 
                    fontWeight: '700',
                    marginBottom: 3,
                  }}>
                    {agent.name || agent.username}
                  </Text>
                  <Text style={{ 
                    color: '#94a3b8', 
                    fontSize: 11, 
                    fontWeight: '600' 
                  }}>
                    {agent.officerType || 'Field Agent'} • ID {agent.id}
                  </Text>
                </View>
                {agent.status && (
                  <View style={{
                    backgroundColor: agent.status === 'active' 
                      ? 'rgba(34, 197, 94, 0.2)' 
                      : 'rgba(239, 68, 68, 0.2)',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderWidth: 1,
                    borderColor: agent.status === 'active' 
                      ? 'rgba(34, 197, 94, 0.3)' 
                      : 'rgba(239, 68, 68, 0.3)',
                  }}>
                    <Text style={{ 
                      color: agent.status === 'active' ? '#22c55e' : '#ef4444',
                      fontSize: 10, 
                      fontWeight: '800',
                      letterSpacing: 0.5,
                    }}>
                      {agent.status.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Footer - Timestamps */}
      <View style={{
        backgroundColor: '#0f172a',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#334155',
      }}>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Calendar color="#64748b" size={12} strokeWidth={2.5} />
              <Text style={{ 
                color: '#64748b', 
                fontSize: 10, 
                fontWeight: '600',
                marginLeft: 6,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Created
              </Text>
            </View>
            <Text style={{ 
              color: '#cbd5e1', 
              fontSize: 12, 
              fontWeight: '600',
            }}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Clock color="#64748b" size={12} strokeWidth={2.5} />
              <Text style={{ 
                color: '#64748b', 
                fontSize: 10, 
                fontWeight: '600',
                marginLeft: 6,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Updated
              </Text>
            </View>
            <Text style={{ 
              color: '#cbd5e1', 
              fontSize: 12, 
              fontWeight: '600',
            }}>
              {formatDate(item.updatedAt)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={{ 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center',
      paddingVertical: 100,
    }}>
      <View style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderRadius: 40,
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
      }}>
        <FileText color="#60a5fa" size={40} strokeWidth={2.5} />
      </View>
      <Text style={{ 
        color: '#f1f5f9', 
        fontSize: 20, 
        fontWeight: 'bold',
        marginBottom: 8,
      }}>
        No Contracts Found
      </Text>
      <Text style={{ 
        color: '#94a3b8', 
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
      }}>
        You don't have any contract documents assigned to you yet
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
          marginTop: 16,
          fontWeight: '600',
        }}>
          Loading contracts...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />
      
      {/* Animated Background Gradients */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <View style={{
          position: 'absolute',
          top: -150,
          right: -150,
          width: 400,
          height: 400,
          backgroundColor: '#3b82f6',
          opacity: 0.08,
          borderRadius: 200,
        }} />
        <View style={{
          position: 'absolute',
          top: 200,
          left: -100,
          width: 300,
          height: 300,
          backgroundColor: '#8b5cf6',
          opacity: 0.06,
          borderRadius: 150,
        }} />
        <View style={{
          position: 'absolute',
          bottom: -100,
          right: -50,
          width: 350,
          height: 350,
          backgroundColor: '#ec4899',
          opacity: 0.05,
          borderRadius: 175,
        }} />
      </View>

      {/* Header */}
      <View style={{ 
        paddingTop: insets.top + 20, 
        paddingHorizontal: 20, 
        paddingBottom: 24,
        zIndex: 10,
      }}>
        <Text style={{ 
          color: '#f1f5f9', 
          fontSize: 32, 
          fontWeight: 'bold',
          marginBottom: 6,
        }}>
          Contracts
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <View style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#3b82f6',
            marginRight: 8,
          }} />
          <Text style={{ 
            color: '#94a3b8', 
            fontSize: 14,
            fontWeight: '600',
          }}>
            {contracts.length} {contracts.length === 1 ? 'document' : 'documents'} available
          </Text>
        </View>
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