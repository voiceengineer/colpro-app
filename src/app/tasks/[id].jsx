import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  ActivityIndicator, Alert, Dimensions, RefreshControl,
  Modal, Platform, Linking, TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  ArrowLeft, User, Phone, MapPin, Calendar, 
  DollarSign, AlertCircle, FileText, Package,
  Copy, CheckCircle, Eye, EyeOff, X, Download,
  Clock, ClipboardList, Image as ImageIcon, Camera,
  Navigation, Play, Save, CreditCard, ChevronDown
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library'; 
import * as ImagePicker from 'expo-image-picker';
import { tasksService } from '../../lib/services/tasksService';
import { casesService } from '../../lib/services/casesService';
import { authService } from '../../lib/services/authService';

const { width } = Dimensions.get('window');

const isMediaFile = (fileName) => {
  if (!fileName) return false;
  const ext = fileName.split('.').pop().toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov'].includes(ext);
};

const TABS = [
  { id: 'info', label: 'Info', icon: User },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'documents', label: 'Docs', icon: FileText },
  { id: 'visit', label: 'Visit', icon: Navigation },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'partial_payment', label: 'Частичная оплата' },
  { value: 'aggression', label: 'Агрессия' },
  { value: 'ptp', label: 'Обещания (PTP)' },
  { value: 'skip_trace', label: 'Скипт (skipt trace)' }
];

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'mobile_payment', label: 'Mobile Payment' },
  { value: 'cheque', label: 'Cheque' }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' }
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
    pinfl: false,
  });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [completingVisit, setCompletingVisit] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [visitForm, setVisitForm] = useState({
    status: 'completed',
    notes: '',
    actualAmountCollected: ''
  });
  const [paymentDetails, setPaymentDetails] = useState({
    amount: '',
    method: 'bank_transfer',
    date: new Date().toISOString().split('T')[0],
    status: 'completed',
    transactionId: '',
    notes: ''
  });
  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = useState(false);
  const [showPaymentStatusDropdown, setShowPaymentStatusDropdown] = useState(false);
  const [showVisitRemarksModal, setShowVisitRemarksModal] = useState(false);
  const [pendingVisitPhoto, setPendingVisitPhoto] = useState(null);
  const [visitPhotoRemarks, setVisitPhotoRemarks] = useState('');

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

  const handleStartVisit = async () => {
    // Open camera using Documents tab's exact function
    try {
      const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
      
      if (existingStatus !== 'granted') {
        const granted = await new Promise((resolve) => {
          Alert.alert(
            "Camera Permission Required",
            "CollPro needs access to your camera to take evidence photos.",
            [
              { text: "Deny", onPress: () => resolve(false), style: "cancel" },
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
            "Camera permission is required. Please enable it in your device settings.",
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
        // Store photo and show remarks modal
        setPendingVisitPhoto(result.assets[0]);
        setVisitPhotoRemarks('');
        setShowVisitRemarksModal(true);
      }
    } catch (error) { 
      console.error("Camera Error:", error);
      Alert.alert("Error", "Could not open camera."); 
    }
  };

  const uploadEvidencePhoto = async (photo, remarks = '') => {
    setUploadingEvidence(true);
    try {
      const token = await authService.getToken();
      if (!token) throw new Error("Unauthorized");

      const photoUri = photo.uri;
      const originalFileName = photo.fileName || `photo_${Date.now()}.jpg`;
      const uploadUrl = `https://dev.collpro.uz/api/field-visit/tasks/${id}/attachments`;

      const formData = new FormData();
      formData.append('file', {
        uri: photoUri,
        type: 'image/jpeg',
        name: originalFileName,
      });
      
      // Add remarks/description
      const description = remarks.trim() 
        ? `${originalFileName} - ${remarks}` 
        : `${originalFileName} uploaded from field visit`;
      formData.append('description', description);
      formData.append('attachmentType', 'photo');

      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); } catch (e) { resolve({ success: true }); }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.open('POST', uploadUrl);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      await uploadPromise;
      
      // After successful upload, open modal
      Alert.alert("Success", "Evidence photo uploaded successfully!");
      setVisitForm({
        status: 'completed',
        notes: '',
        actualAmountCollected: taskData?.expectedAmount?.toString() || ''
      });
      setShowCompleteModal(true);
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Upload Failed", error.message || "Could not upload evidence photo.");
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleConfirmVisitUpload = async () => {
    if (!pendingVisitPhoto) return;
    
    setShowVisitRemarksModal(false);
    await uploadEvidencePhoto(pendingVisitPhoto, visitPhotoRemarks);
    setPendingVisitPhoto(null);
    setVisitPhotoRemarks('');
  };

  const handleCompleteVisit = async () => {
    // Validation
    if (!visitForm.notes.trim()) {
      Alert.alert("Validation Error", "Please add notes about the visit.");
      return;
    }

    if (!visitForm.actualAmountCollected) {
      Alert.alert("Validation Error", "Please enter the amount collected (enter 0 if none).");
      return;
    }

    Alert.alert(
      'Update Status',
      'Are you sure you want to complete this visit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              setCompletingVisit(true);

              // Update task data (NO outcome, NO photos)
              const updateData = {
                status: visitForm.status,
                notes: visitForm.notes,
                actualAmountCollected: parseFloat(visitForm.actualAmountCollected) || 0
              };

              await tasksService.updateTask(id, updateData);

              Alert.alert(
                "Success!", 
                `Update Status successfully!\n\n• Status: ${visitForm.status.replace(/_/g, ' ').toUpperCase()}\n• Amount: ${visitForm.actualAmountCollected}`,
                [{ text: "OK", onPress: async () => {
                  setShowCompleteModal(false);
                  await refetch();
                }}]
              );
            } catch (error) {
              console.error("update status Error:", error);
              Alert.alert("Error", error.message || "Could not update status.");
            } finally {
              setCompletingVisit(false);
            }
          }
        }
      ]
    );
  };

  const handleAddPaymentDetails = () => {
    // TODO: Add payment details submission logic here
    console.log('Payment Details:', paymentDetails);
    Alert.alert(
      "Payment Details",
      "Payment details will be submitted in future implementation.\n\nCurrent Details:\n" +
      `Amount: ${paymentDetails.amount}\n` +
      `Method: ${PAYMENT_METHODS.find(m => m.value === paymentDetails.method)?.label}\n` +
      `Date: ${paymentDetails.date}\n` +
      `Status: ${paymentDetails.status}`,
      [{ text: "OK", onPress: () => setShowPaymentDetailsModal(false) }]
    );
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

  const canStartVisit = taskData?.status?.toLowerCase() === 'pending';

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />
      
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

        {/* Start Visit Button */}
        {canStartVisit && (
          <TouchableOpacity 
            onPress={handleStartVisit}
            disabled={uploadingEvidence}
            style={{ 
              backgroundColor: uploadingEvidence ? '#059669' : '#10b981', 
              borderRadius: 10, 
              paddingVertical: 12, 
              flexDirection: 'row', 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginTop: 12,
              gap: 8,
              opacity: uploadingEvidence ? 0.7 : 1
            }}
          >
            {uploadingEvidence ? (
              <>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>Uploading...</Text>
              </>
            ) : (
              <>
                <Play color="#ffffff" size={18} strokeWidth={2.5} />
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>Start Visit</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}>
        {activeTab === 'info' && (
          <TaskInfoTab taskData={taskData} agent={agent} formatCurrency={formatCurrency} formatDate={formatDate} formatTime={formatTime} copyToClipboard={copyToClipboard} sensitiveDataVisible={sensitiveDataVisible} toggleSensitiveData={toggleSensitiveData} />
        )}
        {activeTab === 'visit' && (
          <VisitTab taskId={id} taskData={taskData} formatDate={formatDate} formatTime={formatTime} formatCurrency={formatCurrency} refetch={refetch} />
        )}
        {activeTab === 'products' && (
          <ProductsTab caseId={taskData?.caseId} formatCurrency={formatCurrency} />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab taskId={id} />
        )}
      </ScrollView>

      {/* Complete Visit Modal */}
      <Modal
        visible={showCompleteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !completingVisit && setShowCompleteModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={() => !completingVisit && setShowCompleteModal(false)}
          />
          <View style={{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: insets.bottom }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#334155' }}>
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>Complete Visit</Text>
              <TouchableOpacity onPress={() => !completingVisit && setShowCompleteModal(false)} disabled={completingVisit}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: '75%' }} contentContainerStyle={{ padding: 20 }}>
              {/* Status Selection with Dropdown */}
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Status</Text>
              <TouchableOpacity
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                disabled={completingVisit}
                style={{
                  backgroundColor: '#0f172a',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 15 }}>
                  {STATUS_OPTIONS.find(s => s.value === visitForm.status)?.label || 'Select Status'}
                </Text>
                <ChevronDown color="#64748b" size={20} />
              </TouchableOpacity>

              {showStatusDropdown && (
                <View style={{
                  backgroundColor: '#0f172a',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                  marginBottom: 20,
                  overflow: 'hidden'
                }}>
                  {STATUS_OPTIONS.map((option, index) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => {
                        setVisitForm(prev => ({ ...prev, status: option.value }));
                        setShowStatusDropdown(false);
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: visitForm.status === option.value ? '#334155' : 'transparent',
                        borderBottomWidth: index < STATUS_OPTIONS.length - 1 ? 1 : 0,
                        borderBottomColor: '#334155'
                      }}
                    >
                      <Text style={{ 
                        color: visitForm.status === option.value ? '#3b82f6' : '#ffffff',
                        fontSize: 15,
                        fontWeight: visitForm.status === option.value ? '600' : '400'
                      }}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {!showStatusDropdown && <View style={{ marginBottom: 20 }} />}

              {/* Amount Collected */}
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Amount Collected</Text>
              <TextInput
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: 16,
                  padding: 14,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                  marginBottom: 20
                }}
                placeholder="Enter amount collected"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                value={visitForm.actualAmountCollected}
                onChangeText={(text) => setVisitForm(prev => ({ ...prev, actualAmountCollected: text }))}
                editable={!completingVisit}
              />

              {/* Notes */}
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Notes</Text>
              <TextInput
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: 15,
                  padding: 14,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                  marginBottom: 20,
                  minHeight: 100,
                  textAlignVertical: 'top'
                }}
                placeholder="Add notes about the visit..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={4}
                value={visitForm.notes}
                onChangeText={(text) => setVisitForm(prev => ({ ...prev, notes: text }))}
                editable={!completingVisit}
              />
            </ScrollView>

            {/* Action Buttons */}
            <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#334155', gap: 12 }}>
              {/* Add Payment Details Button */}
              <TouchableOpacity
                onPress={() => {
                  setPaymentDetails({
                    amount: visitForm.actualAmountCollected,
                    method: 'bank_transfer',
                    date: new Date().toISOString().split('T')[0],
                    status: 'completed',
                    transactionId: '',
                    notes: ''
                  });
                  setShowPaymentDetailsModal(true);
                }}
                disabled={completingVisit}
                style={{
                  backgroundColor: '#3b82f6',
                  borderRadius: 12,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <CreditCard color="#ffffff" size={20} />
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Add Payment Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCompleteVisit}
                disabled={completingVisit}
                style={{
                  backgroundColor: '#10b981',
                  borderRadius: 12,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                {completingVisit ? (
                  <>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Saving...</Text>
                  </>
                ) : (
                  <>
                    <Save color="#ffffff" size={20} />
                    <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Update Status</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowCompleteModal(false)}
                disabled={completingVisit}
                style={{
                  backgroundColor: '#334155',
                  borderRadius: 12,
                  paddingVertical: 16,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Visit Photo Remarks Modal */}
      <Modal
        visible={showVisitRemarksModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowVisitRemarksModal(false);
          setPendingVisitPhoto(null);
          setVisitPhotoRemarks('');
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: insets.bottom + 20 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#334155' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <FileText color="#10b981" size={24} />
                <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>Add Evidence Remarks</Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setShowVisitRemarksModal(false);
                  setPendingVisitPhoto(null);
                  setVisitPhotoRemarks('');
                }}
                disabled={uploadingEvidence}
              >
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#64748b', fontSize: 14, paddingHorizontal: 20, paddingTop: 16 }}>
              Add remarks to justify this evidence photo for the visit.
            </Text>

            <View style={{ padding: 20 }}>
              {/* Remarks Input */}
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                Remarks / Notes
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: 15,
                  padding: 14,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                  marginBottom: 20,
                  minHeight: 120,
                  textAlignVertical: 'top'
                }}
                placeholder="E.g., Debtor not at home, Property entrance, Meeting evidence, etc."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={5}
                value={visitPhotoRemarks}
                onChangeText={setVisitPhotoRemarks}
                autoFocus
                editable={!uploadingEvidence}
              />

              {/* Action Buttons */}
              <View style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={handleConfirmVisitUpload}
                  disabled={uploadingEvidence}
                  style={{
                    backgroundColor: '#10b981',
                    borderRadius: 12,
                    paddingVertical: 16,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    opacity: uploadingEvidence ? 0.7 : 1
                  }}
                >
                  {uploadingEvidence ? (
                    <>
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Uploading...</Text>
                    </>
                  ) : (
                    <>
                      <Camera color="#ffffff" size={20} />
                      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Upload Evidence</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowVisitRemarksModal(false);
                    setPendingVisitPhoto(null);
                    setVisitPhotoRemarks('');
                  }}
                  disabled={uploadingEvidence}
                  style={{
                    backgroundColor: '#334155',
                    borderRadius: 12,
                    paddingVertical: 16,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Details Modal */}
      <Modal
        visible={showPaymentDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentDetailsModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={() => setShowPaymentDetailsModal(false)}
          />
          <View style={{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: insets.bottom }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#334155' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <CreditCard color="#3b82f6" size={24} />
                <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>Add New Payment</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPaymentDetailsModal(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#64748b', fontSize: 14, paddingHorizontal: 20, paddingTop: 16 }}>
              Enter the payment details for this debtor.
            </Text>

            <ScrollView style={{ maxHeight: '75%' }} contentContainerStyle={{ padding: 20 }}>
              {/* Amount (UZS) */}
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                Amount (UZS) <Text style={{ color: '#ef4444' }}>*</Text>
              </Text>
              <View style={{
                backgroundColor: '#0f172a',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#334155',
                marginBottom: 20,
                flexDirection: 'row',
                alignItems: 'center',
                paddingRight: 14
              }}>
                <TextInput
                  style={{
                    flex: 1,
                    color: '#ffffff',
                    fontSize: 16,
                    padding: 14,
                  }}
                  placeholder="0"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                  value={paymentDetails.amount}
                  onChangeText={(text) => setPaymentDetails(prev => ({ ...prev, amount: text }))}
                />
                <View style={{
                  backgroundColor: '#334155',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6
                }}>
                  <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>UZS</Text>
                </View>
              </View>

              {/* Payment Method Dropdown */}
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Method</Text>
              <TouchableOpacity
                onPress={() => setShowPaymentMethodDropdown(!showPaymentMethodDropdown)}
                style={{
                  backgroundColor: '#0f172a',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#3b82f6',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8
                }}
              >
                <Text style={{ color: '#3b82f6', fontSize: 15 }}>
                  {PAYMENT_METHODS.find(m => m.value === paymentDetails.method)?.label || 'Select Method'}
                </Text>
                <ChevronDown color="#3b82f6" size={20} />
              </TouchableOpacity>

              {showPaymentMethodDropdown && (
                <View style={{
                  backgroundColor: '#0f172a',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                  marginBottom: 20,
                  overflow: 'hidden'
                }}>
                  {PAYMENT_METHODS.map((method, index) => (
                    <TouchableOpacity
                      key={method.value}
                      onPress={() => {
                        setPaymentDetails(prev => ({ ...prev, method: method.value }));
                        setShowPaymentMethodDropdown(false);
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: paymentDetails.method === method.value ? '#334155' : 'transparent',
                        borderBottomWidth: index < PAYMENT_METHODS.length - 1 ? 1 : 0,
                        borderBottomColor: '#334155'
                      }}
                    >
                      <Text style={{ 
                        color: paymentDetails.method === method.value ? '#3b82f6' : '#ffffff',
                        fontSize: 15,
                        fontWeight: paymentDetails.method === method.value ? '600' : '400'
                      }}>
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {!showPaymentMethodDropdown && <View style={{ marginBottom: 20 }} />}

              {/* Date */}
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                Date <Text style={{ color: '#ef4444' }}>*</Text>
              </Text>
              <View style={{
                backgroundColor: '#0f172a',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#334155',
                marginBottom: 20,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 14
              }}>
                <Text style={{ color: '#3b82f6', fontSize: 16, flex: 1 }}>
                  {paymentDetails.date}
                </Text>
                <Calendar color="#3b82f6" size={20} />
              </View>

              {/* Status Dropdown */}
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Status</Text>
              <TouchableOpacity
                onPress={() => setShowPaymentStatusDropdown(!showPaymentStatusDropdown)}
                style={{
                  backgroundColor: '#0f172a',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#3b82f6',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8
                }}
              >
                <Text style={{ color: '#3b82f6', fontSize: 15 }}>
                  {PAYMENT_STATUS_OPTIONS.find(s => s.value === paymentDetails.status)?.label || 'Select Status'}
                </Text>
                <ChevronDown color="#3b82f6" size={20} />
              </TouchableOpacity>

              {showPaymentStatusDropdown && (
                <View style={{
                  backgroundColor: '#0f172a',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                  marginBottom: 20,
                  overflow: 'hidden'
                }}>
                  {PAYMENT_STATUS_OPTIONS.map((status, index) => (
                    <TouchableOpacity
                      key={status.value}
                      onPress={() => {
                        setPaymentDetails(prev => ({ ...prev, status: status.value }));
                        setShowPaymentStatusDropdown(false);
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: paymentDetails.status === status.value ? '#334155' : 'transparent',
                        borderBottomWidth: index < PAYMENT_STATUS_OPTIONS.length - 1 ? 1 : 0,
                        borderBottomColor: '#334155'
                      }}
                    >
                      <Text style={{ 
                        color: paymentDetails.status === status.value ? '#3b82f6' : '#ffffff',
                        fontSize: 15,
                        fontWeight: paymentDetails.status === status.value ? '600' : '400'
                      }}>
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {!showPaymentStatusDropdown && <View style={{ marginBottom: 20 }} />}

              {/* Transaction ID */}
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Transaction ID</Text>
              <TextInput
                style={{
                  backgroundColor: '#0f172a',
                  color: '#3b82f6',
                  fontSize: 16,
                  padding: 14,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                  marginBottom: 20
                }}
                placeholder="Optional"
                placeholderTextColor="#64748b"
                value={paymentDetails.transactionId}
                onChangeText={(text) => setPaymentDetails(prev => ({ ...prev, transactionId: text }))}
              />

              {/* Notes */}
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Notes</Text>
              <TextInput
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: 15,
                  padding: 14,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                  marginBottom: 20,
                  minHeight: 80,
                  textAlignVertical: 'top'
                }}
                placeholder="Add any additional notes..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
                value={paymentDetails.notes}
                onChangeText={(text) => setPaymentDetails(prev => ({ ...prev, notes: text }))}
              />
            </ScrollView>

            {/* Action Buttons */}
            <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#334155', gap: 12 }}>
              <TouchableOpacity
                onPress={handleAddPaymentDetails}
                style={{
                  backgroundColor: '#10b981',
                  borderRadius: 12,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <Save color="#ffffff" size={20} />
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Add Payment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowPaymentDetailsModal(false)}
                style={{
                  backgroundColor: '#334155',
                  borderRadius: 12,
                  paddingVertical: 16,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function VisitTab({ taskId, taskData, formatDate, formatTime, refetch, formatCurrency }) {
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

  const isVisitCompleted = taskData?.status?.toLowerCase() === 'completed';
  const isVisitActive = taskData?.status?.toLowerCase() === 'in_progress';

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Visit Details</Text>

      {isVisitActive && (
        <View style={{ backgroundColor: '#3b82f620', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#3b82f6' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#3b82f6', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 4 }} />
            <Text style={{ color: '#3b82f6', fontSize: 16, fontWeight: '700' }}>Visit In Progress</Text>
          </View>
        </View>
      )}

      {isVisitCompleted && (
        <View style={{ backgroundColor: '#10b98120', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#10b981' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <CheckCircle color="#10b981" size={24} />
            <Text style={{ color: '#10b981', fontSize: 18, fontWeight: '700' }}>Visit Completed</Text>
          </View>
          {taskData?.actualEndTime && (
            <Text style={{ color: '#64748b', fontSize: 14, marginLeft: 34 }}>
              Completed at: <Text style={{ color: '#ffffff', fontWeight: '600' }}>{formatTime(taskData.actualEndTime)}</Text>
            </Text>
          )}
        </View>
      )}

      {/* Visit Information Cards */}
      <View style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Navigation color="#3b82f6" size={20} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>Visit Information</Text>
        </View>

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>Visit Type:</Text>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500', textTransform: 'uppercase' }}>
              {taskData?.visitType?.replace(/_/g, ' ') || 'N/A'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>Status:</Text>
            <Text style={{ color: getStatusColor(taskData?.status), fontSize: 14, fontWeight: '600', textTransform: 'uppercase' }}>
              {taskData?.status?.replace(/_/g, ' ') || 'N/A'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>Scheduled Date:</Text>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
              {formatDate(taskData?.scheduledDate)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>Scheduled Time:</Text>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
              {formatTime(taskData?.scheduledTime)}
            </Text>
          </View>

          {taskData?.estimatedDuration && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>Estimated Duration:</Text>
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
                {taskData.estimatedDuration} minutes
              </Text>
            </View>
          )}

          {taskData?.expectedAmount && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>Expected Amount:</Text>
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
                {formatCurrency(taskData.expectedAmount)}
              </Text>
            </View>
          )}

          {taskData?.actualAmountCollected != null && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>Amount Collected:</Text>
              <Text style={{ color: '#10b981', fontSize: 14, fontWeight: '600' }}>
                {formatCurrency(taskData.actualAmountCollected)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Visit Timeline */}
      {(taskData?.actualStartTime || taskData?.actualEndTime || taskData?.actualDuration) && (
        <View style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Clock color="#3b82f6" size={20} />
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>Visit Timeline</Text>
          </View>

          <View style={{ gap: 8 }}>
            {taskData.actualStartTime && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ color: '#64748b', fontSize: 14 }}>Start Time:</Text>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
                  {formatTime(taskData.actualStartTime)}
                </Text>
              </View>
            )}

            {taskData.actualEndTime && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ color: '#64748b', fontSize: 14 }}>End Time:</Text>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
                  {formatTime(taskData.actualEndTime)}
                </Text>
              </View>
            )}

            {taskData.actualDuration && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ color: '#64748b', fontSize: 14 }}>Actual Duration:</Text>
                <Text style={{ color: '#10b981', fontSize: 14, fontWeight: '600' }}>
                  {taskData.actualDuration} minutes
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Outcome & Notes */}
      {(taskData?.outcome || taskData?.notes) && (
        <View style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <FileText color="#3b82f6" size={20} />
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>Visit Summary</Text>
          </View>

          {taskData.outcome && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>OUTCOME</Text>
              <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 20 }}>{taskData.outcome}</Text>
            </View>
          )}

          {taskData.notes && (
            <View>
              <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>NOTES</Text>
              <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 20 }}>{taskData.notes}</Text>
            </View>
          )}
        </View>
      )}

      {/* Location if available */}
      {(taskData?.coordinatesLat || taskData?.coordinatesLng) && (
        <View style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MapPin color="#3b82f6" size={20} />
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>Location</Text>
          </View>
          <Text style={{ color: '#ffffff', fontSize: 14 }}>
            {taskData.coordinatesLat?.toFixed(6)}, {taskData.coordinatesLng?.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
}

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

function DocumentsTab({ taskId }) {
  const [documents, setDocuments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [downloadingIds, setDownloadingIds] = React.useState({});
  const [uploading, setUploading] = React.useState(false);
  const [showRemarksModal, setShowRemarksModal] = React.useState(false);
  const [pendingPhoto, setPendingPhoto] = React.useState(null);
  const [photoRemarks, setPhotoRemarks] = React.useState('');

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
      const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
      
      if (existingStatus !== 'granted') {
        const granted = await new Promise((resolve) => {
          Alert.alert(
            "Camera Permission Required",
            "CollPro needs access to your camera to take photos for task documentation.",
            [
              { text: "Deny", onPress: () => resolve(false), style: "cancel" },
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
        // Store photo and show remarks modal
        setPendingPhoto(result.assets[0]);
        setPhotoRemarks('');
        setShowRemarksModal(true);
      }
    } catch (error) { 
      console.error("Camera Error:", error);
      Alert.alert("Error", "Could not open camera."); 
    }
  };

  const handleUpload = async (photo, remarks = '') => {
    setUploading(true);
    try {
      const token = await authService.getToken();
      if (!token) throw new Error("Unauthorized");

      const photoUri = photo.uri;
      const originalFileName = photo.fileName || `photo_${Date.now()}.jpg`;
      const uploadUrl = `https://dev.collpro.uz/api/field-visit/tasks/${taskId}/attachments`;

      const formData = new FormData();
      formData.append('file', {
        uri: photoUri,
        type: 'image/jpeg',
        name: originalFileName,
      });
      
      // Add remarks/description
      const description = remarks.trim() 
        ? `${originalFileName} - ${remarks}` 
        : `${originalFileName} uploaded from field visit`;
      formData.append('description', description);
      formData.append('attachmentType', 'photo');

      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); } catch (e) { resolve({ success: true }); }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
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

  const handleConfirmUpload = async () => {
    if (!pendingPhoto) return;
    
    setShowRemarksModal(false);
    await handleUpload(pendingPhoto, photoRemarks);
    setPendingPhoto(null);
    setPhotoRemarks('');
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
      
      if (isImage && Platform.OS === 'android') {
        try {
          const { status, canAskAgain, granted } = await MediaLibrary.requestPermissionsAsync(
            false, 
            ['photo']
          );
          
          if (!granted) {
            if (canAskAgain) {
              Alert.alert(
                "Permission Required",
                "Gallery permission is needed to save images. Please allow it when prompted.",
                [{ text: "OK" }]
              );
            } else {
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

      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const downloadUrl = tasksService.getAttachmentDownloadUrl(doc.id); 
      
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl, fileUri, { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const result = await downloadResumable.downloadAsync();
      if (!result || !result.uri) throw new Error("Download failed");

      if (isImage) {
        try {
          await MediaLibrary.saveToLibraryAsync(result.uri);
          Alert.alert("Success!", "Image saved to your Gallery.");
        } catch (saveError) {
          console.error('Save to gallery error:', saveError);
          Alert.alert("Save Failed", "Could not save image to gallery. Please check app permissions in settings.");
        }
      } else if (Platform.OS === 'android') {
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

      {/* Remarks Modal */}
      <Modal
        visible={showRemarksModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowRemarksModal(false);
          setPendingPhoto(null);
          setPhotoRemarks('');
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#334155' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <FileText color="#3b82f6" size={24} />
                <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>Add Remarks</Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setShowRemarksModal(false);
                  setPendingPhoto(null);
                  setPhotoRemarks('');
                }}
              >
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#64748b', fontSize: 14, paddingHorizontal: 20, paddingTop: 16 }}>
              Add remarks or notes to justify this attachment.
            </Text>

            <View style={{ padding: 20 }}>
              {/* Remarks Input */}
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                Remarks / Notes
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: 15,
                  padding: 14,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                  marginBottom: 20,
                  minHeight: 120,
                  textAlignVertical: 'top'
                }}
                placeholder="E.g., Front view of property, Customer signature, Payment receipt, etc."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={5}
                value={photoRemarks}
                onChangeText={setPhotoRemarks}
                autoFocus
              />

              {/* Action Buttons */}
              <View style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={handleConfirmUpload}
                  disabled={uploading}
                  style={{
                    backgroundColor: '#10b981',
                    borderRadius: 12,
                    paddingVertical: 16,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    opacity: uploading ? 0.7 : 1
                  }}
                >
                  {uploading ? (
                    <>
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Uploading...</Text>
                    </>
                  ) : (
                    <>
                      <Camera color="#ffffff" size={20} />
                      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Upload Photo</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowRemarksModal(false);
                    setPendingPhoto(null);
                    setPhotoRemarks('');
                  }}
                  disabled={uploading}
                  style={{
                    backgroundColor: '#334155',
                    borderRadius: 12,
                    paddingVertical: 16,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
      <InfoCard icon={User} label="PINFL" value={taskData.pinfl || taskData.debtorPinfl} onCopy={copyToClipboard} sensitive={true} sensitiveKey="pinfl" />
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