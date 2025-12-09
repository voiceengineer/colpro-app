import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { X, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '../../lib/auth';
import { useAuth } from '../../lib/authContext';
import DocumentPreviewModal from './DocumentPreviewModal';
import CaseInfoSection from './CaseInfoSection';
import DocumentsSection from './DocumentsSection';
import PaymentHistorySection from './PaymentHistorySection';
import CaseUpdateForm from './CaseUpdateForm';

const CaseDetailsModal = ({ visible, caseId, onClose, onUpdate }) => {
  const { canEditCases, canUploadDocuments, canViewPayments } = useAuth();
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  
  // Data states
  const [caseData, setCaseData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  // UI states
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
    } else {
      resetState();
    }
  }, [visible, caseId]);

  const resetState = () => {
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
    setLoading(true);
    try {
      const [caseResponse, statusesResponse] = await Promise.all([
        authService.getCaseById(caseId),
        authService.getCaseStatuses()
      ]);
      
      setCaseData(caseResponse);
      setStatuses(statusesResponse || []);
      setSelectedStatusId(caseResponse.status?.id || caseResponse.statusId);
      setRemarks(caseResponse.notes || caseResponse.remarks || '');

      // Fetch documents and payments in parallel
      await Promise.all([
        fetchDocuments(),
        caseResponse.accountId && canViewPayments() 
          ? fetchPaymentHistory(caseResponse.accountId)
          : Promise.resolve()
      ]);
      
    } catch (error) {
      handleError(error);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setLoadingDocuments(true);
    try {
      console.log('🔍 Fetching documents for case:', caseId);
      const docs = await authService.getCaseDocuments(caseId);
      console.log('✅ Documents fetched:', docs.length);
      setDocuments(docs || []);
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchPaymentHistory = async (accountId) => {
    try {
      const paymentData = await authService.getPaymentHistory(accountId);
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
    
    const hasStatusChange = selectedStatusId && selectedStatusId !== currentStatusId;
    const hasRemarksChange = remarks.trim() !== currentRemarks;

    if (!hasStatusChange && !hasRemarksChange) {
      Alert.alert('No Changes', 'Please make changes before saving');
      return;
    }

    setUpdating(true);
    try {
      const updateData = {};
      if (hasStatusChange) updateData.statusId = selectedStatusId;
      if (hasRemarksChange) updateData.notes = remarks.trim();

      await authService.updateCase(caseId, updateData);
      Alert.alert('Success', 'Case updated successfully');
      onUpdate?.();
      onClose();
    } catch (error) {
      handleError(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadImage = () => {
    if (!canUploadDocuments()) {
      Alert.alert('Permission Required', 'You do not have permission to upload documents.');
      return;
    }
    
    Alert.alert(
      'Upload Document',
      'Choose source',
      [
        { text: 'Camera', onPress: pickFromCamera },
        { text: 'Gallery', onPress: pickFromGallery },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const pickFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        uploadDocument(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is needed');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        uploadDocument(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const uploadDocument = async (asset) => {
    setUploading(true);
    
    try {
      const uriParts = asset.uri.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();
      const fileName = `case_${caseId}_${Date.now()}.${fileType}`;
      const mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;

      console.log('📤 Starting upload:', { fileName, mimeType });
      
      await authService.uploadFile(caseId, asset.uri, fileName, mimeType);
      
      Alert.alert('Success', 'Document uploaded successfully');
      
      // Refresh documents
      await fetchDocuments();
      
      // Auto-expand documents section
      setShowDocuments(true);
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      handleError(error);
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = (doc) => {
    setPreviewDocument(doc);
    setShowPreview(true);
  };

  const handleError = (error) => {
    const messages = {
      'SERVER_UNAVAILABLE': 'Server is unavailable. Please try again later.',
      'UNAUTHORIZED': 'Your session has expired. Please log in again.',
      'FORBIDDEN': 'You do not have permission to perform this action.',
      'NETWORK_ERROR': 'Network error. Please check your connection.',
      'ENDPOINT_NOT_FOUND': 'Upload feature is not available on the server.',
      'FILE_TOO_LARGE': 'File is too large. Please choose a smaller file.',
      'TIMEOUT': 'Upload timeout. Please try again.'
    };

    Alert.alert('Error', messages[error.message] || error.message || 'An error occurred');
  };

  const SkeletonLoader = () => (
    <View style={{ padding: 20 }}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={{
          backgroundColor: '#1e293b',
          borderRadius: 10,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: '#334155',
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155' }} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ backgroundColor: '#334155', height: 12, width: '40%', borderRadius: 4, marginBottom: 6 }} />
            <View style={{ backgroundColor: '#334155', height: 16, width: '70%', borderRadius: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );

  const debtorName = caseData?.account?.fullName || caseData?.debtorName;

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
              {debtorName && (
                <Text style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
                  {debtorName}
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
            <SkeletonLoader />
          ) : (
            <ScrollView 
              style={{ flex: 1, backgroundColor: '#0f172a' }}
              contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
            >
              {caseData && (
                <>
                  {/* Case Information */}
                  <CaseInfoSection caseData={caseData} />

                  {/* Upload Button */}
                  <TouchableOpacity
                    onPress={handleUploadImage}
                    disabled={uploading || !canUploadDocuments()}
                    style={{
                      backgroundColor: '#1e293b',
                      borderRadius: 10,
                      padding: 16,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: canUploadDocuments() ? '#334155' : '#422006',
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
                          Uploading...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Upload color={canUploadDocuments() ? "#3b82f6" : "#fbbf24"} size={20} />
                        <Text style={{ 
                          color: canUploadDocuments() ? '#3b82f6' : '#fbbf24', 
                          fontSize: 15, 
                          fontWeight: '600',
                          marginLeft: 10
                        }}>
                          {canUploadDocuments() ? 'Upload Document' : 'Upload Restricted'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Documents Section */}
                  <DocumentsSection
                    documents={documents}
                    loading={loadingDocuments}
                    expanded={showDocuments}
                    onToggle={() => setShowDocuments(!showDocuments)}
                    onDocumentPress={handleViewDocument}
                  />

                  {/* Payment History */}
                  {canViewPayments() && (
                    <PaymentHistorySection
                      payments={payments}
                      expanded={showPaymentHistory}
                      onToggle={() => setShowPaymentHistory(!showPaymentHistory)}
                    />
                  )}

                  {/* Update Form */}
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