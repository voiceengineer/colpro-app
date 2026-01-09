
import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  ActivityIndicator, Alert, Dimensions, RefreshControl,
  Modal, Platform, Image, Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  ArrowLeft, User, Phone, MapPin, Calendar, 
  DollarSign, AlertCircle, FileText, Package,
  Copy, CheckCircle, Eye, EyeOff, X, Download,
  Clock, ClipboardList, Image as ImageIcon, Camera
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';

// --- IMPORTS FOR DOWNLOAD & CAMERA ---
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library'; 
import * as ImagePicker from 'expo-image-picker';

// --- SERVICES ---
import { tasksService } from '../../lib/services/tasksService';
import { casesService } from '../../lib/services/casesService';
import { authService } from '../../lib/services/authService';

const { width } = Dimensions.get('window');

// Helper to check file type
const isMediaFile = (fileName) => {
  if (!fileName) return false;
  const ext = fileName.split('.').pop().toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov'].includes(ext);
};

const TABS = [
  { id: 'info', label: 'Info', icon: User },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'documents', label: 'Docs', icon: FileText },
];

export default function TaskDetailsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [activeTab, setActiveTab] = useState('info');
  const [refreshing, setRefreshing] = useState(false);
  const [sensitiveDataVisible, setSensitiveDataVisible] = useState({
    phone: false,
    address: false,
  });

  const { data: taskData, isLoading, error, refetch } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksService.getTaskById(id),
    enabled: !!id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const toggleSensitiveData = (field) => {
    setSensitiveDataVisible(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <AlertCircle color="#ef4444" size={48} />
        <Text style={{ color: '#ffffff', fontSize: 18, marginTop: 16 }}>Failed to load task</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#3b82f6', borderRadius: 8 }}>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#64748b', fontSize: 16, marginTop: 16 }}>Loading task details...</Text>
      </View>
    );
  }

  const agent = taskData?.agent || {};

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0';
    return Number(amount).toLocaleString('en-US');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return 'N/A'; }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch { return 'N/A'; }
  };

  const getPriorityColor = (priority) => {
    const p = priority?.toLowerCase();
    switch(p) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch(s) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', `${label} copied to clipboard`);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 8 }}>
              <ArrowLeft color="#ffffff" size={24} />
            </TouchableOpacity>
            
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>Task #{taskData?.id}</Text>
              <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{taskData?.debtorName || 'N/A'}</Text>
            </View>
          </View>

          <View style={{ backgroundColor: `${getPriorityColor(taskData?.priority)}20`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
            <Text style={{ color: getPriorityColor(taskData?.priority), fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>
              {taskData?.priority || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={{ flexDirection: 'row', marginTop: 16, gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#334155' }}>
          <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>EXPECTED</Text>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>{formatCurrency(taskData?.expectedAmount)}</Text>
          </View>
          
          <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>COLLECTED</Text>
            <Text style={{ color: '#10b981', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>{formatCurrency(taskData?.actualAmountCollected || 0)}</Text>
          </View>

          <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>STATUS</Text>
            <Text style={{ color: getStatusColor(taskData?.status), fontSize: 13, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' }}>{taskData?.status?.replace(/_/g, ' ') || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155', maxHeight: 60 }} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 10 }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)} style={{ backgroundColor: isActive ? '#3b82f6' : '#0f172a', paddingHorizontal: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: isActive ? '#3b82f6' : '#334155' }}>
              <Icon color={isActive ? '#ffffff' : '#64748b'} size={18} />
              <Text style={{ color: isActive ? '#ffffff' : '#64748b', fontSize: 14, fontWeight: isActive ? '700' : '600' }}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }} refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" /> }>
        {activeTab === 'info' && (
          <TaskInfoTab taskData={taskData} agent={agent} formatCurrency={formatCurrency} formatDate={formatDate} formatTime={formatTime} copyToClipboard={copyToClipboard} sensitiveDataVisible={sensitiveDataVisible} toggleSensitiveData={toggleSensitiveData} />
        )}
        {activeTab === 'products' && (
          <ProductsTab caseId={taskData?.caseId} formatCurrency={formatCurrency} />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab taskId={id} />
        )}
      </ScrollView>
    </View>
  );
}

// Products Tab
function ProductsTab({ caseId, formatCurrency }) {
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['case-products', caseId],
    queryFn: () => casesService.getCaseProducts(caseId),
    enabled: !!caseId, 
  });

  if (!caseId) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}><Package color="#64748b" size={48} /><Text style={{ color: '#64748b', fontSize: 14, marginTop: 16 }}>No Case ID linked</Text></View>;
  if (isLoading) return <View style={{ paddingVertical: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#3b82f6" /><Text style={{ color: '#64748b', marginTop: 12 }}>Loading products...</Text></View>;

  let productList = [];
  if (rawData) {
    if (Array.isArray(rawData)) productList = rawData;
    else if (Array.isArray(rawData.data)) productList = rawData.data;
    else if (Array.isArray(rawData.items)) productList = rawData.items;
    else if (Array.isArray(rawData.products)) productList = rawData.products;
    else if (rawData.id || rawData.contractNumber) productList = [rawData];
  }

  if (productList.length === 0) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}><Package color="#64748b" size={48} /><Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginTop: 16 }}>No Products</Text></View>;

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Products ({productList.length})</Text>
      {productList.map((product, index) => (
        <View key={product.id || index} style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Package color="#3b82f6" size={20} />
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>{product.name || product.productName || product.sourceOfDebt || 'Product'}</Text>
          </View>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: '#64748b', fontSize: 14 }}>Contract:</Text><Text style={{ color: '#ffffff', fontSize: 14 }}>{product.contractNumber}</Text></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: '#64748b', fontSize: 14 }}>Total Amount:</Text><Text style={{ color: '#ffffff', fontSize: 14 }}>{formatCurrency(product.totalAmount || product.amount)}</Text></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: '#64748b', fontSize: 14 }}>Fees:</Text><Text style={{ color: '#ffffff', fontSize: 14 }}>{formatCurrency(product.fees || 0)}</Text></View>
          </View>
        </View>
      ))}
    </View>
  );
}

// Documents Tab
function DocumentsTab({ taskId }) {
  const [documents, setDocuments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [downloadingIds, setDownloadingIds] = React.useState({});
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => { fetchDocuments(); }, [taskId]);

  const fetchDocuments = async () => {
    try {
      const docs = await tasksService.getTaskAttachments(taskId);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (error) { 
      console.error('Failed to fetch documents:', error); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleLaunchCamera = async () => {
    try {
      // Check and request camera permission with custom alert
      const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const granted = await new Promise((resolve) => {
          Alert.alert(
            "Camera Permission Required",
            "CollPro needs access to your camera to take photos for task documentation.",
            [
              {
                text: "Deny",
                onPress: () => resolve(false),
                style: "cancel"
              },
              {
                text: "Allow",
                onPress: async () => {
                  const { status } = await ImagePicker.requestCameraPermissionsAsync();
                  resolve(status === 'granted');
                }
              }
            ],
            { cancelable: false }
          );
        });
        
        if (!granted) {
          Alert.alert(
            "Permission Denied",
            "Camera permission is required to take photos. Please enable it in your device settings.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, 
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleUpload(result.assets[0]);
      }
    } catch (error) { 
      console.error("Camera Error:", error);
      Alert.alert("Error", "Could not open camera."); 
    }
  };

  const handleUpload = async (photo) => {
    setUploading(true);
    try {
      const token = await authService.getToken();
      if (!token) throw new Error("Unauthorized");

      const photoUri = photo.uri;
      const originalFileName = photo.fileName || `photo_${Date.now()}.jpg`;
      const fileInfo = await FileSystem.getInfoAsync(photoUri);
      
      console.log('Uploading file:', { uri: photoUri, name: originalFileName, size: fileInfo.size });

      const uploadUrl = `https://dev.collpro.uz/api/field-visit/tasks/${taskId}/attachments`;

      const formData = new FormData();
      formData.append('file', {
        uri: photoUri,
        type: 'image/jpeg',
        name: originalFileName,
      });
      formData.append('description', `${originalFileName} uploaded from field visit`);
      formData.append('attachmentType', 'photo');

      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); } catch (e) { resolve({ success: true }); }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.open('POST', uploadUrl);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      await uploadPromise;
      Alert.alert("Success", "Photo uploaded successfully!");
      setLoading(true);
      await fetchDocuments();

    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Upload Failed", error.message || "Could not upload photo.");
    } finally {
      setUploading(false);
    }
  };

const handleDownload = async (doc) => {
    setDownloadingIds(prev => ({ ...prev, [doc.id]: true }));
    try {
      const token = await authService.getToken();
      if (!token) throw new Error("Unauthorized");

      let fileName = doc.originalName || doc.fileName || `task_doc_${doc.id}`;
      fileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      
      const hasExtension = fileName.includes('.');
      if (!hasExtension && doc.mimeType) {
        const mimeMap = {
          'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png',
          'application/msword': 'doc', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
          'application/vnd.ms-excel': 'xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        };
        const ext = mimeMap[doc.mimeType];
        if (ext) fileName += `.${ext}`;
      }

      const isImage = isMediaFile(fileName);
      
      // For images, request permission (system will show native dialog automatically)
      if (isImage && Platform.OS === 'android') {
        try {
          // Use granular permissions - only request 'photo' to avoid AUDIO permission error
          const { status, canAskAgain, granted } = await MediaLibrary.requestPermissionsAsync(
            false, 
            ['photo'] // Only request photo permission
          );
          
          if (!granted) {
            // User denied permission
            if (canAskAgain) {
              Alert.alert(
                "Permission Required",
                "Gallery permission is needed to save images. Please allow it when prompted.",
                [{ text: "OK" }]
              );
            } else {
              // User denied with "Don't ask again"
              Alert.alert(
                "Permission Denied",
                "Gallery permission was denied. Please enable it in your device settings to save images.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Open Settings", onPress: () => Linking.openSettings() }
                ]
              );
            }
            setDownloadingIds(prev => ({ ...prev, [doc.id]: false }));
            return;
          }
        } catch (permError) {
          console.error('Permission error:', permError);
          Alert.alert("Permission Error", "Could not request gallery permission.");
          setDownloadingIds(prev => ({ ...prev, [doc.id]: false }));
          return;
        }
      }

      // Download the file
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const downloadUrl = tasksService.getAttachmentDownloadUrl(doc.id); 
      
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl, fileUri, { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const result = await downloadResumable.downloadAsync();
      if (!result || !result.uri) throw new Error("Download failed");

      // Save based on file type
      if (isImage) {
        // Permission already granted, save to gallery
        try {
          await MediaLibrary.saveToLibraryAsync(result.uri);
          Alert.alert("Success!", "Image saved to your Gallery.");
        } catch (saveError) {
          console.error('Save to gallery error:', saveError);
          Alert.alert("Save Failed", "Could not save image to gallery. Please check app permissions in settings.");
        }
      } else if (Platform.OS === 'android') {
        // For non-image files on Android, use SAF
        Alert.alert(
          "Save File",
          `Save "${fileName}" to your device?`,
          [
            { 
              text: "Cancel", 
              style: "cancel",
              onPress: () => {
                setDownloadingIds(prev => ({ ...prev, [doc.id]: false }));
              }
            },
            {
              text: "Choose Location",
              onPress: async () => {
                try {
                  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                  if (permissions.granted) {
                    const base64Data = await FileSystem.readAsStringAsync(result.uri, { encoding: FileSystem.EncodingType.Base64 });
                    const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                      permissions.directoryUri, fileName, doc.mimeType || 'application/octet-stream'
                    );
                    await FileSystem.writeAsStringAsync(newFileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
                    Alert.alert("Success!", "File saved successfully.");
                  } else {
                    Alert.alert("Cancelled", "File save cancelled.");
                  }
                } catch (e) {
                  console.error('SAF error:', e);
                  Alert.alert("Error", "Could not save file. Please try again.");
                }
                setDownloadingIds(prev => ({ ...prev, [doc.id]: false }));
              }
            }
          ],
          { cancelable: false }
        );
        return;
      } else {
        // iOS
        await Sharing.shareAsync(result.uri, { 
          UTI: doc.mimeType, 
          dialogTitle: 'Save File',
          mimeType: doc.mimeType 
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', error.message || 'Could not download file.');
    } finally {
      setDownloadingIds(prev => ({ ...prev, [doc.id]: false }));
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.toLowerCase().split('.').pop();
    switch(ext) {
      case 'pdf': return '📄';
      case 'doc': case 'docx': return '📝';
      case 'xls': case 'xlsx': return '📊';
      case 'jpg': case 'jpeg': case 'png': return '🖼️';
      default: return '📎';
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />;

  return (
    <View>
      {/* Upload Button */}
      <TouchableOpacity 
        onPress={handleLaunchCamera} 
        disabled={uploading}
        style={{ 
          backgroundColor: '#3b82f6', 
          borderRadius: 12, 
          paddingVertical: 18, 
          flexDirection: 'row', 
          justifyContent: 'center', 
          alignItems: 'center', 
          marginBottom: 24,
          gap: 12,
          borderWidth: 2,
          borderColor: '#60a5fa',
          shadowColor: '#3b82f6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8
        }}
      >
        {uploading ? (
          <>
            <ActivityIndicator color="#ffffff" size="small" />
            <Text style={{ color: '#ffffff', fontSize: 17, fontWeight: '700' }}>Uploading...</Text>
          </>
        ) : (
          <>
            <Camera color="#ffffff" size={28} strokeWidth={2.5} />
            <Text style={{ color: '#ffffff', fontSize: 17, fontWeight: '700' }}>Add Attachment</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Documents & Photos ({documents.length})
      </Text>

      {/* Documents List or Empty State */}
      {documents.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 40, opacity: 0.8 }}>
          <FileText color="#64748b" size={48} />
          <Text style={{ color: '#64748b', marginTop: 16, fontSize: 15 }}>No attachments found</Text>
        </View>
      ) : (
        documents.map((doc, index) => {
          const docName = doc.originalName || doc.fileName || `File ${index + 1}`;
          const isMedia = isMediaFile(docName);

          return (
            <View key={doc.id || index} style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 32, marginRight: 12 }}>{getFileIcon(docName)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '500' }}>{docName}</Text>
                  <Text style={{ color: '#64748b', fontSize: 12 }}>{doc.mimeType || 'File'}</Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => handleDownload(doc)}
                  disabled={downloadingIds[doc.id]}
                  style={{
                    backgroundColor: downloadingIds[doc.id] ? '#1e293b' : '#3b82f6',
                    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8,
                    flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 8, minWidth: 100, justifyContent: 'center'
                  }}
                >
                  {downloadingIds[doc.id] ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <>
                      {isMedia ? <ImageIcon color="#ffffff" size={16} /> : <Download color="#ffffff" size={16} />}
                      <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600' }}>
                        {isMedia ? "Gallery" : "Save File"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

// Task Info Component (unchanged)
function TaskInfoTab({ taskData, agent, formatCurrency, formatDate, formatTime, copyToClipboard, sensitiveDataVisible, toggleSensitiveData }) {
    const InfoCard = ({ icon: Icon, label, value, onCopy, sensitive, sensitiveKey }) => {
        const isSensitive = sensitive && !sensitiveDataVisible[sensitiveKey];
        const displayValue = isSensitive ? '••••••••' : value;
        return (
          <View style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon color="#64748b" size={16} />
                  <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', marginLeft: 8 }}>{label}</Text>
                </View>
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '500' }}>{displayValue || 'N/A'}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginLeft: 8 }}>
                {sensitive && (
                  <TouchableOpacity onPress={() => toggleSensitiveData(sensitiveKey)} style={{ padding: 8 }}>
                    {isSensitive ? <Eye color="#64748b" size={16} /> : <EyeOff color="#64748b" size={16} />}
                  </TouchableOpacity>
                )}
                {onCopy && value && (
                  <TouchableOpacity onPress={() => onCopy(value, label)} style={{ padding: 8 }}>
                    <Copy color="#64748b" size={16} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        );
      };
  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Task Information
      </Text>

      <InfoCard icon={User} label="Debtor Name" value={taskData.debtorName} onCopy={copyToClipboard} />
      <InfoCard icon={Phone} label="Phone Number" value={taskData.debtorPhone} onCopy={copyToClipboard} sensitive={true} sensitiveKey="phone" />
      <InfoCard icon={MapPin} label="Address" value={taskData.debtorAddress || taskData.address} sensitive={true} sensitiveKey="address" />
      <InfoCard icon={Calendar} label="Scheduled Date" value={formatDate(taskData.scheduledDate)} />
      <InfoCard icon={Clock} label="Scheduled Time" value={formatTime(taskData.scheduledTime)} />
      <InfoCard icon={DollarSign} label="Expected Amount" value={formatCurrency(taskData.expectedAmount)} />
      <InfoCard icon={DollarSign} label="Amount Collected" value={formatCurrency(taskData.actualAmountCollected || 0)} />
      <InfoCard icon={Clock} label="Estimated Duration" value={taskData.estimatedDuration ? `${taskData.estimatedDuration} mins` : 'N/A'} />
      {taskData.actualDuration && <InfoCard icon={Clock} label="Actual Duration" value={`${taskData.actualDuration} mins`} />}
      <InfoCard icon={ClipboardList} label="Visit Type" value={taskData.visitType ? taskData.visitType.replace(/_/g, ' ').toUpperCase() : 'N/A'} />
      <InfoCard icon={CheckCircle} label="Status" value={taskData.status ? taskData.status.replace(/_/g, ' ').toUpperCase() : 'N/A'} />

      {taskData.instructions && (
        <View style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <FileText color="#64748b" size={16} />
            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', marginLeft: 8 }}>Instructions</Text>
          </View>
          <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 20 }}>{taskData.instructions}</Text>
        </View>
      )}

      {taskData.notes && (
        <View style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <FileText color="#64748b" size={16} />
            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', marginLeft: 8 }}>Notes</Text>
          </View>
          <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 20 }}>{taskData.notes}</Text>
        </View>
      )}

      {taskData.outcome && (
        <View style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <CheckCircle color="#64748b" size={16} />
            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', marginLeft: 8 }}>Outcome</Text>
          </View>
          <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 20 }}>{taskData.outcome}</Text>
        </View>
      )}

      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 16 }}>Timing Information</Text>
      {taskData.actualStartTime && <InfoCard icon={Clock} label="Start Time" value={formatTime(taskData.actualStartTime)} />}
      {taskData.actualEndTime && <InfoCard icon={Clock} label="End Time" value={formatTime(taskData.actualEndTime)} />}
      <InfoCard icon={Calendar} label="Created Date" value={formatDate(taskData.createdDate)} />
      <InfoCard icon={Calendar} label="Last Updated" value={formatDate(taskData.updatedDate)} />

      {agent?.name && (
        <View>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 16 }}>Assigned Agent</Text>
          <InfoCard icon={User} label="Agent Name" value={agent.name} />
          {agent.phoneNumber && <InfoCard icon={Phone} label="Agent Phone" value={agent.phoneNumber} />}
          {agent.staffNo && <InfoCard icon={FileText} label="Staff Number" value={agent.staffNo} />}
        </View>
      )}
    </View>
  );
}