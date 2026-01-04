import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { X, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { casesService } from '../../lib/services/casesService';
import { documentsService } from '../../lib/services/documentsService';
import { paymentsService } from '../../lib/services/paymentsService';
import { useAuth } from '../../lib/authContext';
import DocumentPreviewModal from './DocumentPreviewModal';
import CaseInfoSection from './CaseInfoSection';
import DocumentsSection from './DocumentsSection';
import PaymentHistorySection from './PaymentHistorySection';
import CaseUpdateForm from './CaseUpdateForm';

const CaseDetailsModal = ({ visible, caseId, onClose, onUpdate }) => {
  const { canEditCases, canUploadDocuments, canViewPayments } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  
  const [caseData, setCaseData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  const [selectedStatusId, setSelectedStatusId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (visible && caseId) {
      resetState();
      fetchAllData();
    }
  }, [visible, caseId]);

  const resetState = () => {
    setLoading(true);
    setCaseData(null);
    setPayments([]);
    setStatuses([]);
    setDocuments([]);
    setSelectedStatusId(null);
    setRemarks('');
    setShowStatusPicker(false);
    setShowPaymentHistory(false);
    setShowDocuments(false);
    setPreviewDocument(null);
    setShowPreview(false);
  };

  const fetchAllData = async () => {
    try {
      const [caseResponse, statusesResponse] = await Promise.all([
        casesService.getCaseById(caseId),
        casesService.getCaseStatuses()
      ]);
      
      setCaseData(caseResponse);
      setStatuses(statusesResponse || []);
      setSelectedStatusId(caseResponse.status?.id || caseResponse.statusId);
      setRemarks(caseResponse.notes || caseResponse.remarks || '');
      setLoading(false);

      fetchDocuments();
      
      if (caseResponse.accountId && canViewPayments()) {
        fetchPaymentHistory(caseResponse.accountId);
      }
    } catch (error) {
      showError(error.message || 'Failed to load case details');
      onClose();
    }
  };

  const fetchDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const [taskDocs, localDocs] = await Promise.all([
        documentsService.getTaskAttachments(caseId).catch(() => []),
        documentsService.getLocalUploads(caseId).catch(() => [])
      ]);
      
      const allDocs = [...taskDocs, ...localDocs];
      const uniqueDocs = allDocs.filter((doc, index, self) => 
        index === self.findIndex(d => d.fileName === doc.fileName)
      );
      
      setDocuments(uniqueDocs);
    } catch (error) {
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchPaymentHistory = async (accountId) => {
    try {
      const paymentData = await paymentsService.getPaymentHistory(accountId);
      setPayments(paymentData);
    } catch (error) {
      setPayments([]);
    }
  };

  const handleUpdateCase = async () => {
    if (!canEditCases()) {
      Alert.alert('Permission Required', 'You do not have permission to update cases.');
      return;
    }
    
    const currentStatusId = caseData?.status?.id || caseData?.statusId;
    const currentRemarks = caseData?.notes || caseData?.remarks || '';
    
    const hasChanges = 
      (selectedStatusId && selectedStatusId !== currentStatusId) ||
      (remarks.trim() !== currentRemarks);

    if (!hasChanges) {
      Alert.alert('No Changes', 'Please make changes before saving');
      return;
    }

    setUpdating(true);
    try {
      const updateData = {};
      if (selectedStatusId !== currentStatusId) updateData.statusId = selectedStatusId;
      if (remarks.trim() !== currentRemarks) updateData.notes = remarks.trim();

      await casesService.updateCase(caseId, updateData);
      Alert.alert('Success', 'Case updated successfully');
      onUpdate?.();
      onClose();
    } catch (error) {
      showError(error.message || 'Failed to update case');
    } finally {
      setUpdating(false);
    }
  };

  const convertImageToJPEG = async (uri) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1920 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG
        }
      );
      
      return manipulatedImage.uri;
    } catch (error) {
      throw new Error('Failed to process image');
    }
  };

  const handleTakePhoto = async () => {
    if (!canUploadDocuments()) {
      Alert.alert('Permission Required', 'You do not have permission to take photos.');
      return;
    }
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadDocument(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const uploadDocument = async (asset) => {
    setUploading(true);
    
    try {
      // Convert image to JPEG
      const convertedUri = await convertImageToJPEG(asset.uri);
      
      const fileName = `case_${caseId}_${Date.now()}.jpg`;
      const mimeType = 'image/jpeg';
      
      // Convert to base64
      const base64 = await FileSystem.readAsStringAsync(convertedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const base64DataUrl = `data:${mimeType};base64,${base64}`;
      const fileInfo = await FileSystem.getInfoAsync(convertedUri);
      
      // Save locally first
      await documentsService.saveLocalUpload(caseId, {
        fileName: fileName,
        filePath: base64DataUrl,
        fileSize: fileInfo.size || 0,
        mimeType: mimeType,
        createdAt: new Date().toISOString(),
        isBase64: true
      });
      
      // Show immediately in UI
      await fetchDocuments();
      setShowDocuments(true);
      setUploading(false);
      
      // Upload to server in background (silently, no UI refresh)
      documentsService.uploadTaskAttachment(caseId, convertedUri, fileName, mimeType)
        .catch((err) => {
          if (err.message === 'TASK_NOT_FOUND') {
            return documentsService.uploadFile(caseId, convertedUri, fileName, mimeType);
          }
          throw err;
        })
        .then((response) => {
          // Silently replace local version with server version
          if (response) {
            documentsService.replaceLocalWithServer(caseId, fileName, response);
          }
        })
        .catch((err) => {
          console.log('Background upload failed:', err.message);
        });
      
    } catch (error) {
      setUploading(false);
      showError(error.message || 'Failed to save photo');
    }
  };

  const handleDocumentDelete = async (doc) => {
    try {
      if (doc.id?.startsWith('local_')) {
        await documentsService.deleteLocalUpload(caseId, doc.id);
      } else if (doc.taskId) {
        await documentsService.deleteTaskAttachment(doc.taskId, doc.id);
      } else {
        throw new Error('Cannot determine document type');
      }
      
      await fetchDocuments();
    } catch (error) {
      showError(error.message || 'Failed to delete photo');
    }
  };

  const showError = (message) => {
    const errorMessages = {
      'UNAUTHORIZED': 'Your session has expired. Please log in again.',
      'FORBIDDEN': 'You do not have permission to perform this action.',
      'FILE_TOO_LARGE': 'File is too large. Please choose a smaller file.',
      'TIMEOUT': 'Request timeout. Please try again.',
      'NETWORK_ERROR': 'Network error. Please check your connection.',
    };

    Alert.alert('Error', errorMessages[message] || message);
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
          <View style={{ 
            backgroundColor: '#1e293b',
            paddingTop: 50,
            paddingBottom: 16,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#334155',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: 'bold' }}>
                Case #{caseId}
              </Text>
              {caseData?.account?.fullName && (
                <Text style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
                  {caseData.account.fullName}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#334155',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <X color="#ffffff" size={22} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : (
            <ScrollView 
              style={{ flex: 1, backgroundColor: '#0f172a' }}
              contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
            >
              {caseData && (
                <>
                  <CaseInfoSection caseData={caseData} />

                  <TouchableOpacity
                    onPress={handleTakePhoto}
                    disabled={uploading || !canUploadDocuments()}
                    style={{
                      backgroundColor: '#1e293b',
                      borderRadius: 10,
                      padding: 16,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: '#334155',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: (uploading || !canUploadDocuments()) ? 0.6 : 1
                    }}
                  >
                    {uploading ? (
                      <>
                        <ActivityIndicator size="small" color="#3b82f6" />
                        <Text style={{ color: '#3b82f6', fontSize: 15, marginLeft: 10 }}>
                          Saving...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Camera color="#3b82f6" size={20} />
                        <Text style={{ 
                          color: '#3b82f6', 
                          fontSize: 15, 
                          fontWeight: '600',
                          marginLeft: 10
                        }}>
                          Take Photo
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <DocumentsSection
                    documents={documents}
                    loading={loadingDocuments}
                    expanded={showDocuments}
                    onToggle={() => setShowDocuments(!showDocuments)}
                    onDocumentPress={(doc) => {
                      setPreviewDocument(doc);
                      setShowPreview(true);
                    }}
                    onDocumentDelete={handleDocumentDelete}
                  />

                  {canViewPayments() && (
                    <PaymentHistorySection
                      payments={payments}
                      expanded={showPaymentHistory}
                      onToggle={() => setShowPaymentHistory(!showPaymentHistory)}
                    />
                  )}

                  <CaseUpdateForm
                    statuses={statuses}
                    selectedStatusId={selectedStatusId}
                    onStatusChange={(statusId) => {
                      setSelectedStatusId(statusId);
                      setShowStatusPicker(false);
                    }}
                    remarks={remarks}
                    onRemarksChange={setRemarks}
                    showStatusPicker={showStatusPicker}
                    onToggleStatusPicker={() => setShowStatusPicker(!showStatusPicker)}
                    canEdit={canEditCases()}
                    onSubmit={handleUpdateCase}
                    submitting={updating}
                  />
                </>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>

      <DocumentPreviewModal
        visible={showPreview}
        document={previewDocument}
        onClose={() => {
          setShowPreview(false);
          setPreviewDocument(null);
        }}
      />
    </>
  );
};

export default CaseDetailsModal;