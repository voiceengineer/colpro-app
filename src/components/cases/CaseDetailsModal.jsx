import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
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

  // Convert image to PNG format (better quality for photos)
  const convertImageToPNG = async (uri) => {
    try {
      console.log('Converting image to PNG format...');
      
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1920 } }], // Resize to max width 1920px
        {
          compress: 1, // Maximum quality for PNG
          format: ImageManipulator.SaveFormat.PNG
        }
      );
      
      console.log('Image converted successfully:', manipulatedImage.uri);
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Image conversion failed:', error);
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
        quality: 1, // Maximum quality
      });

      if (!result.canceled && result.assets[0]) {
        await uploadDocument(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const uploadDocument = async (asset) => {
    setUploading(true);
    
    try {
      // Convert image to PNG format
      console.log('Starting image conversion...');
      const convertedUri = await convertImageToPNG(asset.uri);
      
      const fileName = `case_${caseId}_${Date.now()}.png`;
      const mimeType = 'image/png';
      
      // Check if FileSystem is available
      if (!FileSystem || !FileSystem.readAsStringAsync) {
        throw new Error('FileSystem is not available. Please restart the app.');
      }
      
      // Convert to base64 using FileSystem
      console.log('Converting PNG to base64...');
      console.log('FileSystem available:', !!FileSystem);
      
      // Use legacy FileSystem API
      const base64 = await FileSystem.readAsStringAsync(convertedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Create data URL
      const base64DataUrl = `data:${mimeType};base64,${base64}`;
      
      console.log('Base64 conversion complete');
      console.log('Base64 length:', base64.length);
      console.log('Data URL prefix:', base64DataUrl.substring(0, 50));
      
      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(convertedUri);
      const fileSize = fileInfo.size || 0;
      
      console.log('File size:', fileSize);
      
      // Save locally with base64
      await documentsService.saveLocalUpload(caseId, {
        fileName: fileName,
        filePath: base64DataUrl,
        fileSize: fileSize,
        mimeType: mimeType,
        createdAt: new Date().toISOString(),
        isBase64: true
      });
      
      console.log('Image saved locally successfully');
      
      // Try to upload to server in background (non-blocking)
      documentsService.uploadTaskAttachment(caseId, convertedUri, fileName, mimeType)
        .then(() => {
          console.log('Background upload to server succeeded');
          // Refresh documents after successful upload
          fetchDocuments();
        })
        .catch((err) => {
          console.log('Task attachment upload failed:', err.message);
          if (err.message === 'TASK_NOT_FOUND') {
            return documentsService.uploadFile(caseId, convertedUri, fileName, mimeType);
          }
          throw err;
        })
        .then(() => {
          console.log('Background upload to files endpoint succeeded');
          fetchDocuments();
        })
        .catch((err) => {
          console.log('Background upload failed (ignored):', err.message);
        });
      
      Alert.alert('Success', 'Photo saved successfully');
      await fetchDocuments();
      setShowDocuments(true);
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error stack:', error.stack);
      showError(error.message || 'Failed to save photo');
    } finally {
      setUploading(false);
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
      
      Alert.alert('Success', 'Photo deleted successfully');
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
          {/* Header */}
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
                          Processing...
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
        onClose={() => setShowPreview(false)}
      />
    </>
  );
};

export default CaseDetailsModal;