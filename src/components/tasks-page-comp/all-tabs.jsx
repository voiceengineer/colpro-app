import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Platform, Linking, TextInput, Modal } from 'react-native';
import { 
  User, Phone, MapPin, Calendar, Clock, DollarSign, FileText, 
  CheckCircle, ClipboardList, Copy, Eye, EyeOff, Navigation, 
  Package, Camera, Download, Image as ImageIcon, X, CreditCard 
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { tasksService } from '../../lib/services/tasksService';
import { casesService } from '../../lib/services/casesService';
import { authService } from '../../lib/services/authService';
import { 
  formatCurrency, formatDate, formatTime, getStatusColor, 
  getPaymentStatusColor, getPaymentMethodLabel, isMediaFile, getFileIcon 
} from '../../utils/task-helper';

// ============================================
// INFO TAB
// ============================================
function InfoCard({ icon: Icon, label, value, onCopy, sensitive, sensitiveKey, sensitiveDataVisible, toggleSensitiveData, isPhone }) {
  const isSensitive = sensitive && !sensitiveDataVisible[sensitiveKey];
  const displayValue = isSensitive ? '••••••••' : value;
  const { makePhoneCall } = require('../../utils/task-helper');
  
  const handlePhoneCall = () => {
    if (value) {
      makePhoneCall(value);
    }
  };
  
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
          {isPhone && value && (
            <TouchableOpacity onPress={handlePhoneCall} style={{ padding: 8, backgroundColor: '#10b98120', borderRadius: 6 }}>
              <Phone color="#10b981" size={16} />
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
}

export function TaskInfoTab({ taskData, sensitiveDataVisible, toggleSensitiveData }) {
  const agent = taskData?.agent || {};

  const copyToClipboard = async (text, label) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', `${label} copied to clipboard`);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy');
    }
  };

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Task Information</Text>

      <InfoCard icon={User} label="Debtor Name" value={taskData.debtorName} onCopy={copyToClipboard} />
      <InfoCard icon={User} label="PINFL" value={taskData.pinfl || taskData.debtorPinfl} onCopy={copyToClipboard} sensitive={true} sensitiveKey="pinfl" sensitiveDataVisible={sensitiveDataVisible} toggleSensitiveData={toggleSensitiveData} />
      <InfoCard icon={Phone} label="Phone Number" value={taskData.debtorPhone} onCopy={copyToClipboard} isPhone={true} />
      <InfoCard icon={MapPin} label="Address" value={taskData.debtorAddress || taskData.address} sensitive={true} sensitiveKey="address" sensitiveDataVisible={sensitiveDataVisible} toggleSensitiveData={toggleSensitiveData} />
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

      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 16 }}>Timing Information</Text>
      {taskData.actualStartTime && <InfoCard icon={Clock} label="Start Time" value={formatTime(taskData.actualStartTime)} />}
      {taskData.actualEndTime && <InfoCard icon={Clock} label="End Time" value={formatTime(taskData.actualEndTime)} />}
      <InfoCard icon={Calendar} label="Created Date" value={formatDate(taskData.createdDate)} />
      <InfoCard icon={Calendar} label="Last Updated" value={formatDate(taskData.updatedDate)} />

      {agent?.name && (
        <View>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 16 }}>Assigned Agent</Text>
          <InfoCard icon={User} label="Agent Name" value={agent.name} />
          {agent.phoneNumber && <InfoCard icon={Phone} label="Agent Phone" value={agent.phoneNumber} isPhone={true} />}
          {agent.staffNo && <InfoCard icon={FileText} label="Staff Number" value={agent.staffNo} />}
        </View>
      )}
    </View>
  );
}

// ============================================
// VISIT TAB
// ============================================
export function VisitTab({ taskData }) {
  const isVisitCompleted = taskData?.status?.toLowerCase() === 'completed';
  const isVisitActive = taskData?.status?.toLowerCase() === 'in_progress';

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Visit Details</Text>

      {isVisitActive && (
        <View style={{ backgroundColor: '#3b82f620', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#3b82f6' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#3b82f6' }} />
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
          {taskData?.expectedAmount && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>Expected Amount:</Text>
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>{formatCurrency(taskData.expectedAmount)}</Text>
            </View>
          )}
          {taskData?.actualAmountCollected != null && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>Amount Collected:</Text>
              <Text style={{ color: '#10b981', fontSize: 14, fontWeight: '600' }}>{formatCurrency(taskData.actualAmountCollected)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Outcome & Notes - Visit Summary */}
      {(taskData?.outcome || taskData?.notes) && (
        <View style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <FileText color="#3b82f6" size={20} />
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>Visit Summary</Text>
          </View>

          {taskData.outcome && (
            <View style={{ marginBottom: taskData.notes ? 12 : 0 }}>
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
    </View>
  );
}

// ============================================
// PRODUCTS TAB
// ============================================
export function ProductsTab({ caseId }) {
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['case-products', caseId],
    queryFn: () => casesService.getCaseProducts(caseId),
    enabled: !!caseId,
  });

  if (!caseId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
        <Package color="#64748b" size={48} />
        <Text style={{ color: '#64748b', fontSize: 14, marginTop: 16 }}>No Case ID linked</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ paddingVertical: 40, alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#64748b', marginTop: 12 }}>Loading products...</Text>
      </View>
    );
  }

  let productList = [];
  if (rawData) {
    if (Array.isArray(rawData)) productList = rawData;
    else if (Array.isArray(rawData.data)) productList = rawData.data;
    else if (Array.isArray(rawData.items)) productList = rawData.items;
    else if (Array.isArray(rawData.products)) productList = rawData.products;
    else if (rawData.id || rawData.contractNumber) productList = [rawData];
  }

  if (productList.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
        <Package color="#64748b" size={48} />
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginTop: 16 }}>No Products</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Products ({productList.length})</Text>
      {productList.map((product, index) => (
        <View key={product.id || index} style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Package color="#3b82f6" size={20} />
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
              {product.name || product.productName || product.sourceOfDebt || 'Product'}
            </Text>
          </View>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>Contract:</Text>
              <Text style={{ color: '#ffffff', fontSize: 14 }}>{product.contractNumber}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>Total Amount:</Text>
              <Text style={{ color: '#ffffff', fontSize: 14 }}>{formatCurrency(product.totalAmount || product.amount)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>Fees:</Text>
              <Text style={{ color: '#ffffff', fontSize: 14 }}>{formatCurrency(product.fees || 0)}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ============================================
// DOCUMENTS TAB
// ============================================
export function DocumentsTab({ taskId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState({});
  const [uploading, setUploading] = useState(false);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [photoRemarks, setPhotoRemarks] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [taskId]);

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
          Alert.alert("Camera Permission Required", "CollPro needs access to your camera to take photos for task documentation.", [
            { text: "Deny", onPress: () => resolve(false), style: "cancel" },
            { text: "Allow", onPress: async () => { const { status } = await ImagePicker.requestCameraPermissionsAsync(); resolve(status === 'granted'); } }
          ], { cancelable: false });
        });
        if (!granted) {
          Alert.alert("Permission Denied", "Camera permission is required to take photos. Please enable it in your device settings.", [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]);
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
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
      formData.append('file', { uri: photoUri, type: 'image/jpeg', name: originalFileName });
      const description = remarks.trim() ? `${originalFileName} - ${remarks}` : `${originalFileName} uploaded from field visit`;
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

  const handleDownload = async (doc) => {
    setDownloadingIds(prev => ({ ...prev, [doc.id]: true }));
    try {
      const token = await authService.getToken();
      if (!token) throw new Error("Unauthorized");

      let fileName = doc.originalName || doc.fileName || `task_doc_${doc.id}`;
      fileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

      const isImage = isMediaFile(fileName);
      if (isImage && Platform.OS === 'android') {
        const { granted } = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
        if (!granted) {
          Alert.alert("Permission Denied", "Gallery permission was denied.");
          setDownloadingIds(prev => ({ ...prev, [doc.id]: false }));
          return;
        }
      }

      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const downloadUrl = tasksService.getAttachmentDownloadUrl(doc.id);
      const downloadResumable = FileSystem.createDownloadResumable(downloadUrl, fileUri, { headers: { 'Authorization': `Bearer ${token}` } });
      const result = await downloadResumable.downloadAsync();
      if (!result || !result.uri) throw new Error("Download failed");

      if (isImage) {
        await MediaLibrary.saveToLibraryAsync(result.uri);
        Alert.alert("Success!", "Image saved to your Gallery.");
      } else {
        await Sharing.shareAsync(result.uri);
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', error.message || 'Could not download file.');
    } finally {
      setDownloadingIds(prev => ({ ...prev, [doc.id]: false }));
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />;

  return (
    <View>
      <TouchableOpacity onPress={handleLaunchCamera} disabled={uploading} style={{ backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24, gap: 12 }}>
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

      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Documents & Photos ({documents.length})</Text>

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
                <TouchableOpacity onPress={() => handleDownload(doc)} disabled={downloadingIds[doc.id]} style={{ backgroundColor: downloadingIds[doc.id] ? '#1e293b' : '#3b82f6', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 8, minWidth: 100, justifyContent: 'center' }}>
                  {downloadingIds[doc.id] ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <>
                      {isMedia ? <ImageIcon color="#ffffff" size={16} /> : <Download color="#ffffff" size={16} />}
                      <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600' }}>{isMedia ? "Gallery" : "Save File"}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Remarks Modal */}
      <Modal visible={showRemarksModal} animationType="slide" transparent={true} onRequestClose={() => { setShowRemarksModal(false); setPendingPhoto(null); setPhotoRemarks(''); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#334155' }}>
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>Add Remarks</Text>
              <TouchableOpacity onPress={() => { setShowRemarksModal(false); setPendingPhoto(null); setPhotoRemarks(''); }}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              <TextInput style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: 15, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 20, minHeight: 120, textAlignVertical: 'top' }} placeholder="E.g., Front view of property, Customer signature, etc." placeholderTextColor="#64748b" multiline numberOfLines={5} value={photoRemarks} onChangeText={setPhotoRemarks} autoFocus />
              <TouchableOpacity onPress={async () => { setShowRemarksModal(false); await handleUpload(pendingPhoto, photoRemarks); setPendingPhoto(null); setPhotoRemarks(''); }} disabled={uploading} style={{ backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, opacity: uploading ? 0.7 : 1, marginBottom: 12 }}>
                <Camera color="#ffffff" size={20} />
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Upload Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================
// PAYMENTS TAB
// ============================================
export function PaymentsTab({ payments, onAddPayment }) {
  if (payments.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 60 }}>
        <CreditCard color="#64748b" size={64} />
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '600', marginTop: 16 }}>No Payments Yet</Text>
        <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 32 }}>Payment records will appear here once added</Text>
        <TouchableOpacity onPress={onAddPayment} style={{ backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <CreditCard color="#ffffff" size={20} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Add Payment</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>Payment History ({payments.length})</Text>
        <TouchableOpacity onPress={onAddPayment} style={{ backgroundColor: '#3b82f6', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <CreditCard color="#ffffff" size={16} />
          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>Add</Text>
        </TouchableOpacity>
      </View>

      {payments.map((payment, index) => (
        <View key={payment.id || index} style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>{formatCurrency(payment.amount)} UZS</Text>
              <Text style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{getPaymentMethodLabel(payment.paymentMethodId)}</Text>
            </View>
            <View style={{ backgroundColor: `${getPaymentStatusColor(payment.status)}20`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
              <Text style={{ color: getPaymentStatusColor(payment.status), fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>{payment.status}</Text>
            </View>
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>Payment Date:</Text>
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>{formatDate(payment.paymentDate)}</Text>
            </View>
            {payment.transactionId && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#64748b', fontSize: 14 }}>Transaction ID:</Text>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>{payment.transactionId}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}