import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  Linking,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  ArrowLeft,
  FileText, 
  Download, 
  Calendar, 
  Hash, 
  Users,
  Tag,
  HardDrive,
  Clock
} from 'lucide-react-native';
import { contractService } from '../../lib/services/contractService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function ContractDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContractDetail();
    }
  }, [id]);

  const fetchContractDetail = async () => {
    try {
      setLoading(true);
      const data = await contractService.getContractDocumentById(id);
      setContract(data);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load contract details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDownload = async () => {
    if (!contract?.storageUrl) {
      Alert.alert('Error', 'Download URL not available');
      return;
    }

    try {
      setDownloading(true);
      
      const fileName = contract.originalFileName || `contract_${contract.id}.${contract.fileExt}`;
      const fileUri = FileSystem.documentDirectory + fileName;

      // Construct full URL
      const API_BASE = 'https://dev.collpro.uz';
      const downloadUrl = contract.storageUrl.startsWith('http') 
        ? contract.storageUrl 
        : `${API_BASE}/${contract.storageUrl}`;

      const token = await contractService.getToken();

      // Download using fetch + blob/arraybuffer manually to avoid deprecated downloadAsync
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      
      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        try {
          const base64data = reader.result.split(',')[1];
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Share or open the file
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
          } else {
            Alert.alert('Success', 'File downloaded successfully');
          }
        } catch (saveError) {
          console.error('Save error:', saveError);
          Alert.alert('Error', 'Failed to save file');
        }
      };
      
      reader.onerror = () => {
        Alert.alert('Error', 'Failed to process file');
      };

    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  const InfoRow = ({ icon: Icon, label, value, isLast = false }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 14,
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
        marginTop: 2,
      }}>
        <Icon color="#60a5fa" size={18} strokeWidth={2.5} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ 
          color: '#94a3b8', 
          fontSize: 11, 
          fontWeight: '600', 
          marginBottom: 4 
        }}>
          {label}
        </Text>
        <Text style={{ 
          color: '#f1f5f9', 
          fontSize: 14, 
          fontWeight: '600',
          lineHeight: 20,
        }}>
          {value || 'Not available'}
        </Text>
      </View>
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
          Loading contract details...
        </Text>
      </View>
    );
  }

  if (!contract) {
    return null;
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
        paddingBottom: 16,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: '#1e293b',
            borderRadius: 12,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            borderWidth: 1,
            borderColor: '#334155',
          }}
        >
          <ArrowLeft color="#f1f5f9" size={20} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: '#f1f5f9', 
            fontSize: 20, 
            fontWeight: 'bold' 
          }}>
            Contract Details
          </Text>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1, zIndex: 5 }}
        contentContainerStyle={{ 
          paddingHorizontal: 20, 
          paddingBottom: insets.bottom + 100
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Card */}
        <View style={{
          backgroundColor: '#1e293b',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#334155',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              borderRadius: 14,
              width: 56,
              height: 56,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <FileText color="#60a5fa" size={28} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                color: '#f1f5f9', 
                fontSize: 18, 
                fontWeight: 'bold',
                marginBottom: 8,
                lineHeight: 24,
              }}>
                {contract.title}
              </Text>
              <Text style={{ 
                color: '#94a3b8', 
                fontSize: 13, 
                fontWeight: '500',
              }}>
                {contract.originalFileName}
              </Text>
            </View>
          </View>
        </View>

        {/* Basic Information */}
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
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            Basic Information
          </Text>

          <InfoRow 
            icon={Hash}
            label="Document ID"
            value={contract.id?.toString()}
          />
          <InfoRow 
            icon={Tag}
            label="File Extension"
            value={contract.fileExt?.toUpperCase()}
          />
          <InfoRow 
            icon={HardDrive}
            label="File Size"
            value={formatFileSize(contract.fileSize)}
          />
          <InfoRow 
            icon={Tag}
            label="MIME Type"
            value={contract.mimeType}
            isLast={true}
          />
        </View>

        {/* Version Information */}
        {contract.currentVersion && (
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
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              Version Information
            </Text>

            <InfoRow 
              icon={Hash}
              label="Version ID"
              value={contract.currentVersion.id?.toString()}
            />
            <InfoRow 
              icon={Tag}
              label="Version Number"
              value={`Version ${contract.currentVersion.versionNo}`}
            />
            <InfoRow 
              icon={Clock}
              label="Last Saved"
              value={formatDate(contract.currentVersion.savedAt)}
              isLast={true}
            />
          </View>
        )}

        {/* Field Agents */}
        {contract.fieldAgents && contract.fieldAgents.length > 0 && (
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
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              Assigned Field Agents ({contract.fieldAgents.length})
            </Text>

            {contract.fieldAgents.map((agent, index) => (
              <View
                key={agent.id}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: index === contract.fieldAgents.length - 1 ? 0 : 1,
                  borderBottomColor: '#334155',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: '#8b5cf6',
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
                      {agent.name?.charAt(0).toUpperCase() || 'A'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      color: '#f1f5f9', 
                      fontSize: 15, 
                      fontWeight: '600',
                      marginBottom: 2,
                    }}>
                      {agent.name || agent.username}
                    </Text>
                    <Text style={{ 
                      color: '#94a3b8', 
                      fontSize: 12, 
                      fontWeight: '500' 
                    }}>
                      {agent.officerType || 'Field Agent'} • ID: {agent.id}
                    </Text>
                  </View>
                  {agent.status && (
                    <View style={{
                      backgroundColor: agent.status === 'active' 
                        ? 'rgba(34, 197, 94, 0.2)' 
                        : 'rgba(239, 68, 68, 0.2)',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}>
                      <Text style={{ 
                        color: agent.status === 'active' ? '#22c55e' : '#ef4444',
                        fontSize: 11, 
                        fontWeight: '700' 
                      }}>
                        {agent.status.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Timestamps */}
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
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            Timestamps
          </Text>

          <InfoRow 
            icon={Calendar}
            label="Created At"
            value={formatDate(contract.createdAt)}
          />
          <InfoRow 
            icon={Calendar}
            label="Updated At"
            value={formatDate(contract.updatedAt)}
            isLast={true}
          />
        </View>
      </ScrollView>

      {/* Download Button */}
      {/* <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0f172a',
        borderTopWidth: 1,
        borderTopColor: '#334155',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: insets.bottom + 16,
      }}>
        <TouchableOpacity
          onPress={handleDownload}
          disabled={downloading}
          style={{
            backgroundColor: '#3b82f6',
            borderRadius: 14,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {downloading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Download color="#ffffff" size={20} strokeWidth={2.5} />
              <Text style={{ 
                color: '#ffffff', 
                fontSize: 16, 
                fontWeight: '700', 
                marginLeft: 10 
              }}>
                Download Document
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View> */}
    </View>
  );
}