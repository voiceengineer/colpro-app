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

export function TaskInfoTab({ taskData, sensitiveDataVisible, toggleSensitiveData, t }) {
  const agent = taskData?.agent || {};

  const copyToClipboard = async (text, label) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert(t('common.copied'), `${label} ${t('common.copiedMsg')}`);
    } catch (error) {
      Alert.alert(t('common.error'), t('tasks.failedToCopy'));
    }
  };

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>{t('taskDetails.info.title')}</Text>

      <InfoCard icon={User} label={t('taskDetails.info.debtorName')} value={taskData.debtorName} onCopy={copyToClipboard} />
      <InfoCard icon={User} label={t('taskDetails.info.pinfl')} value={taskData.pinfl || taskData.debtorPinfl} onCopy={copyToClipboard} sensitive={true} sensitiveKey="pinfl" sensitiveDataVisible={sensitiveDataVisible} toggleSensitiveData={toggleSensitiveData} />
      <InfoCard icon={Phone} label={t('taskDetails.info.phoneNumber')} value={taskData.debtorPhone} onCopy={copyToClipboard} isPhone={true} />
      <InfoCard icon={MapPin} label={t('taskDetails.info.address')} value={taskData.debtorAddress || taskData.address} sensitive={true} sensitiveKey="address" sensitiveDataVisible={sensitiveDataVisible} toggleSensitiveData={toggleSensitiveData} />
      <InfoCard icon={Calendar} label={t('taskDetails.info.scheduledDate')} value={formatDate(taskData.scheduledDate)} />
      <InfoCard icon={Clock} label={t('taskDetails.info.scheduledTime')} value={formatTime(taskData.scheduledTime)} />
      <InfoCard icon={DollarSign} label={t('taskDetails.info.expectedAmount')} value={formatCurrency(taskData.expectedAmount)} />
      <InfoCard icon={DollarSign} label={t('taskDetails.info.amountCollected')} value={formatCurrency(taskData.actualAmountCollected || 0)} />
      <InfoCard icon={Clock} label={t('taskDetails.info.estimatedDuration')} value={taskData.estimatedDuration ? `${taskData.estimatedDuration} mins` : t('common.notAvailable')} />
      {taskData.actualDuration && <InfoCard icon={Clock} label={t('taskDetails.info.actualDuration')} value={`${taskData.actualDuration} mins`} />}
      <InfoCard icon={ClipboardList} label={t('taskDetails.info.visitType')} value={taskData.visitType ? taskData.visitType.replace(/_/g, ' ').toUpperCase() : t('common.notAvailable')} />
      <InfoCard icon={CheckCircle} label={t('taskDetails.info.status')} value={taskData.status ? taskData.status.replace(/_/g, ' ').toUpperCase() : t('common.notAvailable')} />

      {taskData.instructions && (
        <View style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <FileText color="#64748b" size={16} />
            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', marginLeft: 8 }}>{t('taskDetails.info.instructions')}</Text>
          </View>
          <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 20 }}>{taskData.instructions}</Text>
        </View>
      )}

      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 16 }}>{t('taskDetails.info.timingInfo')}</Text>
      {taskData.actualStartTime && <InfoCard icon={Clock} label={t('taskDetails.info.startTime')} value={formatTime(taskData.actualStartTime)} />}
      {taskData.actualEndTime && <InfoCard icon={Clock} label={t('taskDetails.info.endTime')} value={formatTime(taskData.actualEndTime)} />}
      <InfoCard icon={Calendar} label={t('taskDetails.info.createdDate')} value={formatDate(taskData.createdDate)} />
      <InfoCard icon={Calendar} label={t('taskDetails.info.lastUpdated')} value={formatDate(taskData.updatedDate)} />

      {agent?.name && (
        <View>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 16 }}>{t('taskDetails.info.assignedAgent')}</Text>
          <InfoCard icon={User} label={t('taskDetails.info.agentName')} value={agent.name} />
          {agent.phoneNumber && <InfoCard icon={Phone} label={t('taskDetails.info.agentPhone')} value={agent.phoneNumber} isPhone={true} />}
          {agent.staffNo && <InfoCard icon={FileText} label={t('taskDetails.info.staffNumber')} value={agent.staffNo} />}
        </View>
      )}
    </View>
  );
}

// ============================================
// VISIT TAB
// ============================================
export function VisitTab({ taskData, t }) {
  const isVisitCompleted = taskData?.status?.toLowerCase() === 'completed';
  const isVisitActive = taskData?.status?.toLowerCase() === 'in_progress';

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>{t('taskDetails.visit.title')}</Text>

      {isVisitActive && (
        <View style={{ backgroundColor: '#3b82f620', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#3b82f6' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#3b82f6' }} />
            <Text style={{ color: '#3b82f6', fontSize: 16, fontWeight: '700' }}>{t('taskDetails.visit.inProgress')}</Text>
          </View>
        </View>
      )}

      {isVisitCompleted && (
        <View style={{ backgroundColor: '#10b98120', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#10b981' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <CheckCircle color="#10b981" size={24} />
            <Text style={{ color: '#10b981', fontSize: 18, fontWeight: '700' }}>{t('taskDetails.visit.completed')}</Text>
          </View>
          {taskData?.actualEndTime && (
            <Text style={{ color: '#64748b', fontSize: 14, marginLeft: 34 }}>
              {t('taskDetails.visit.completedAt')}: <Text style={{ color: '#ffffff', fontWeight: '600' }}>{formatTime(taskData.actualEndTime)}</Text>
            </Text>
          )}
        </View>
      )}

      <View style={{ backgroundColor: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Navigation color="#3b82f6" size={20} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>{t('taskDetails.visit.infoTitle')}</Text>
        </View>

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>{t('taskDetails.info.visitType')}:</Text>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500', textTransform: 'uppercase' }}>
              {taskData?.visitType?.replace(/_/g, ' ') || t('common.notAvailable')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>{t('taskDetails.info.status')}:</Text>
            <Text style={{ color: getStatusColor(taskData?.status), fontSize: 14, fontWeight: '600', textTransform: 'uppercase' }}>
              {taskData?.status?.replace(/_/g, ' ') || t('common.notAvailable')}
            </Text>
          </View>
          {taskData?.expectedAmount && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>{t('taskDetails.info.expectedAmount')}:</Text>
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>{formatCurrency(taskData.expectedAmount)}</Text>
            </View>
          )}
          {taskData?.actualAmountCollected != null && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>{t('taskDetails.info.amountCollected')}:</Text>
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
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>{t('taskDetails.visit.summaryTitle')}</Text>
          </View>

          {taskData.outcome && (
            <View style={{ marginBottom: taskData.notes ? 12 : 0 }}>
              <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>{t('taskDetails.visit.outcome')}</Text>
              <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 20 }}>{taskData.outcome}</Text>
            </View>
          )}

          {taskData.notes && (
            <View>
              <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>{t('taskDetails.visit.notes')}</Text>
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
export function ProductsTab({ caseId, t }) {
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['case-products', caseId],
    queryFn: () => casesService.getCaseProducts(caseId),
    enabled: !!caseId,
  });

  if (!caseId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
        <Package color="#64748b" size={48} />
        <Text style={{ color: '#64748b', fontSize: 14, marginTop: 16 }}>{t('taskDetails.products.noCaseId')}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ paddingVertical: 40, alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#64748b', marginTop: 12 }}>{t('taskDetails.products.loading')}</Text>
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
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginTop: 16 }}>{t('taskDetails.products.noProducts')}</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>{t('taskDetails.products.title')} ({productList.length})</Text>
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
              <Text style={{ color: '#64748b', fontSize: 14 }}>{t('taskDetails.products.contract')}:</Text>
              <Text style={{ color: '#ffffff', fontSize: 14 }}>{product.contractNumber}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>{t('taskDetails.products.totalAmount')}:</Text>
              <Text style={{ color: '#ffffff', fontSize: 14 }}>{formatCurrency(product.totalAmount || product.amount)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>{t('taskDetails.products.fees')}:</Text>
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
export function DocumentsTab({ taskId, t }) {
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
          Alert.alert(t('taskDetails.docs.cameraPermissionRequired'), t('taskDetails.docs.cameraPermissionMsg'), [
            { text: t('common.deny'), onPress: () => resolve(false), style: "cancel" },
            { text: t('common.allow'), onPress: async () => { const { status } = await ImagePicker.requestCameraPermissionsAsync(); resolve(status === 'granted'); } }
          ], { cancelable: false });
        });
        if (!granted) {
          Alert.alert(t('common.permissionDenied'), t('taskDetails.docs.cameraPermissionMsg'), [
            { text: t('common.cancel'), style: "cancel" },
            { text: t('common.openSettings'), onPress: () => Linking.openSettings() }
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
      Alert.alert(t('common.error'), t('taskDetails.docs.cameraError'));
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
      Alert.alert(t('common.success'), "Photo uploaded successfully!");
      setLoading(true);
      await fetchDocuments();
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert(t('taskDetails.docs.uploadFailed'), error.message || "Could not upload photo.");
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
          Alert.alert(t('common.permissionDenied'), "Gallery permission was denied.");
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
        Alert.alert(t('common.success'), t('taskDetails.docs.imageSaved'));
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
            <Text style={{ color: '#ffffff', fontSize: 17, fontWeight: '700' }}>{t('common.uploading')}</Text>
          </>
        ) : (
          <>
            <Camera color="#ffffff" size={28} strokeWidth={2.5} />
            <Text style={{ color: '#ffffff', fontSize: 17, fontWeight: '700' }}>{t('taskDetails.docs.addAttachment')}</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>{t('taskDetails.docs.title')} ({documents.length})</Text>

      {documents.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 40, opacity: 0.8 }}>
          <FileText color="#64748b" size={48} />
          <Text style={{ color: '#64748b', marginTop: 16, fontSize: 15 }}>{t('taskDetails.docs.noAttachments')}</Text>
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
                      <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600' }}>{isMedia ? t('taskDetails.docs.gallery') : t('taskDetails.docs.saveFile')}</Text>
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
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>{t('taskDetails.docs.addRemarks')}</Text>
              <TouchableOpacity onPress={() => { setShowRemarksModal(false); setPendingPhoto(null); setPhotoRemarks(''); }}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              <TextInput style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: 15, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 20, minHeight: 120, textAlignVertical: 'top' }} placeholder={t('taskDetails.docs.remarksPlaceholder')} placeholderTextColor="#64748b" multiline numberOfLines={5} value={photoRemarks} onChangeText={setPhotoRemarks} autoFocus />
              <TouchableOpacity onPress={async () => { setShowRemarksModal(false); await handleUpload(pendingPhoto, photoRemarks); setPendingPhoto(null); setPhotoRemarks(''); }} disabled={uploading} style={{ backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, opacity: uploading ? 0.7 : 1, marginBottom: 12 }}>
                <Camera color="#ffffff" size={20} />
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>{t('taskDetails.docs.uploadPhoto')}</Text>
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
export function PaymentsTab({ payments, onAddPayment, t }) {
  if (payments.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 60 }}>
        <CreditCard color="#64748b" size={64} />
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '600', marginTop: 16 }}>{t('taskDetails.payments.noPayments')}</Text>
        <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 32 }}>{t('taskDetails.payments.noPaymentsMsg')}</Text>
        <TouchableOpacity onPress={onAddPayment} style={{ backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <CreditCard color="#ffffff" size={20} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>{t('taskDetails.payments.addPayment')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>{t('taskDetails.payments.title')} ({payments.length})</Text>
        <TouchableOpacity onPress={onAddPayment} style={{ backgroundColor: '#3b82f6', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <CreditCard color="#ffffff" size={16} />
          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>{t('taskDetails.payments.add')}</Text>
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
              <Text style={{ color: '#64748b', fontSize: 14 }}>{t('taskDetails.payments.date')}:</Text>
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>{formatDate(payment.paymentDate)}</Text>
            </View>
            {payment.transactionId && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#64748b', fontSize: 14 }}>{t('taskDetails.payments.transactionId')}:</Text>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>{payment.transactionId}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}