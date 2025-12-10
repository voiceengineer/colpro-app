import React, { useState, useEffect } from 'react';
import { 
  View, Text, Modal, TouchableOpacity, ScrollView, 
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { 
  X, User, FileText, CreditCard, Upload, 
  DollarSign, ChevronDown, Check, TrendingUp, AlertCircle
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '../lib/auth';
import { useAuth } from '../lib/authContext';

const CaseDetailsModal = ({ visible, caseId, onClose, onUpdate }) => {
  const { userRole, canEditCases, canUploadDocuments, canViewPayments } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [caseData, setCaseData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [statuses, setStatuses] = useState([]);
  
  const [selectedStatusId, setSelectedStatusId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  useEffect(() => {
    if (visible && caseId) {
      fetchAllData();
    } else {
      resetState();
    }
  }, [visible, caseId]);

  const resetState = () => {
    setCaseData(null);
    setPayments([]);
    setStatuses([]);
    setSelectedStatusId(null);
    setRemarks('');
    setShowStatusPicker(false);
    setShowPaymentHistory(false);
  };

  const fetchAllData = async () => {
    console.log('🔄 [FETCH DATA] Starting data fetch for case:', caseId);
    setLoading(true);
    try {
      console.log('🔄 [FETCH DATA] Fetching case and statuses...');
      const [caseResponse, statusesResponse] = await Promise.all([
        authService.getCaseById(caseId),
        authService.getCaseStatuses()
      ]);
      
      console.log('✅ [FETCH DATA] Case data received:', caseResponse);
      console.log('✅ [FETCH DATA] Statuses received:', statusesResponse);
      
      setCaseData(caseResponse);
      setStatuses(statusesResponse || []);
      setSelectedStatusId(caseResponse.status?.id || caseResponse.statusId);
      setRemarks(caseResponse.notes || caseResponse.remarks || '');

      if (caseResponse.accountId && canViewPayments()) {
        console.log('🔄 [FETCH DATA] Fetching payment history...');
        fetchPaymentHistory(caseResponse.accountId);
      } else {
        console.log('⚠️ [FETCH DATA] Skipping payment history - no accountId or no permission');
      }
      
    } catch (error) {
      console.error('❌ [FETCH DATA] Error:', error);
      handleError(error);
      onClose();
    } finally {
      setLoading(false);
      console.log('🔄 [FETCH DATA] Fetch complete');
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
    console.log('✏️ [UPDATE] Starting case update...');
    
    if (!canEditCases()) {
      console.log('⚠️ [UPDATE] No permission to edit');
      Alert.alert(
        'Permission Required',
        'You need "edit_hard_collection" and "manage_hard_collection" permissions to update cases.'
      );
      return;
    }
    
    const currentStatusId = caseData?.status?.id || caseData?.statusId;
    const currentRemarks = caseData?.notes || caseData?.remarks || '';
    
   
    
    const hasStatusChange = selectedStatusId && selectedStatusId !== currentStatusId;
    const hasRemarksChange = remarks.trim() !== currentRemarks;

 

    if (!hasStatusChange && !hasRemarksChange) {
      console.log('⚠️ [UPDATE] No changes detected');
      Alert.alert('No Changes', 'Please make changes before saving');
      return;
    }

    setUpdating(true);
    try {
      const updateData = {};
      
      if (hasStatusChange) {
        updateData.statusId = selectedStatusId;
      }
      
      if (hasRemarksChange) {
        updateData.notes = remarks.trim();
      }

   

      const result = await authService.updateCase(caseId, updateData);

      console.log('✅ [UPDATE] Update successful:', result);
      Alert.alert('Success', 'Case updated successfully');
      onUpdate?.();
      onClose();
      
    } catch (error) {
      console.error('❌ [UPDATE] Update failed:', error);
      handleError(error);
    } finally {
      setUpdating(false);
      console.log('✏️ [UPDATE] Update process finished');
    }
  };

  const handleUploadImage = async () => {
    console.log('📤 [UPLOAD BTN] Upload button pressed');
    
    if (!canUploadDocuments()) {
      console.log('⚠️ [UPLOAD BTN] No permission');
      Alert.alert(
        'Permission Required',
        'You need "view_hard_collection" permission to upload documents.'
      );
      return;
    }
    
    // Check if backend endpoint is available
    console.log('🔍 [UPLOAD BTN] Checking backend availability...');
    Alert.alert(
     
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Try Upload', 
          onPress: () => {
            Alert.alert(
              'Upload Document',
              'Choose source',
              [
                { text: 'Camera', onPress: () => pickFromCamera() },
                { text: 'Gallery', onPress: () => pickFromGallery() },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }
        }
      ]
    );
  };

  const pickFromCamera = async () => {
    console.log('📷 [CAMERA] Requesting camera permission...');
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('📷 [CAMERA] Permission status:', status);
      
      if (status !== 'granted') {
        console.log('⚠️ [CAMERA] Permission denied');
        Alert.alert('Permission Required', 'Camera permission is needed');
        return;
      }

      console.log('📷 [CAMERA] Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      console.log('📷 [CAMERA] Result:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('📷 [CAMERA] Image captured, starting upload...');
        uploadDocument(result.assets[0]);
      } else {
        console.log('📷 [CAMERA] Camera canceled');
      }
    } catch (error) {
      console.error('❌ [CAMERA] Error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const pickFromGallery = async () => {
    console.log('🖼️ [GALLERY] Requesting gallery permission...');
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('🖼️ [GALLERY] Permission status:', status);
      
      if (status !== 'granted') {
        console.log('⚠️ [GALLERY] Permission denied');
        Alert.alert('Permission Required', 'Gallery permission is needed');
        return;
      }

      console.log('🖼️ [GALLERY] Launching gallery...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      console.log('🖼️ [GALLERY] Result:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('🖼️ [GALLERY] Image selected, starting upload...');
        uploadDocument(result.assets[0]);
      } else {
        console.log('🖼️ [GALLERY] Gallery canceled');
      }
    } catch (error) {
      console.error('❌ [GALLERY] Error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const uploadDocument = async (asset) => {
    console.log('📸 [UPLOAD DOC] Starting upload process...');
    console.log('📸 [UPLOAD DOC] Asset:', asset);
    
    setUploading(true);
    
    try {
      const uriParts = asset.uri.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();
      const fileName = `case_${caseId}_${Date.now()}.${fileType}`;
      const mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;

   

      const result = await authService.uploadFile(caseId, asset.uri, fileName, mimeType);
      
      console.log('✅ [UPLOAD DOC] Upload successful:', result);
      Alert.alert('Success', 'Document uploaded successfully');
      
    } catch (error) {
      console.error('❌ [UPLOAD DOC] Upload failed:', error);
      handleError(error);
    } finally {
      setUploading(false);
      console.log('📸 [UPLOAD DOC] Upload process finished');
    }
  };

  const handleError = (error) => {
    console.error('🚨 [ERROR HANDLER] Processing error:', error);
    let title = 'Error';
    let message = 'An error occurred';

    

    console.error('🚨 [ERROR HANDLER] Display message:', message);
    Alert.alert(title, message);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0';
    return Number(amount).toLocaleString('en-US');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  const InfoRow = ({ icon: Icon, label, value, valueColor = '#ffffff' }) => (
    <View style={{ 
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1e293b',
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#334155',
    }}>
      <View style={{ 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        backgroundColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
      }}>
        <Icon color="#3b82f6" size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 3 }}>
          {label}
        </Text>
        <Text style={{ 
          color: valueColor, 
          fontSize: 15, 
          fontWeight: '600'
        }}>
          {value}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.95)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{ 
            backgroundColor: '#1e293b',
            borderRadius: 16,
            padding: 32,
            alignItems: 'center'
          }}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={{ color: '#ffffff', marginTop: 16, fontSize: 15 }}>
              Loading...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!caseData) return null;

  const pinfl = caseData.account?.pinfl || caseData.pinfl || 'Not Available';
  const contractNumber = caseData.account?.contractNumber || caseData.contractNumber || 'Not Available';
  const passportNumber = caseData.account?.passportNumber || caseData.passportNumber || caseData.account?.passportInfo || 'Not Available';
  const overdueAmount = caseData.account?.overdueDebt || caseData.overdueAmount || caseData.currentBalance || 0;
  const debtorName = caseData.account?.fullName || caseData.debtorName;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
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
              Case #{caseData.id}
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

        <ScrollView 
          style={{ flex: 1, backgroundColor: '#0f172a' }}
          contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Case Information */}
          <InfoRow 
            icon={User} 
            label="PINFL (National ID)" 
            value={pinfl}
          />
          
          <InfoRow 
            icon={FileText} 
            label="Contract Number" 
            value={contractNumber}
          />
          
          <InfoRow 
            icon={CreditCard} 
            label="Passport Number" 
            value={passportNumber}
          />
          
          <InfoRow 
            icon={TrendingUp} 
            label="Overdue Amount" 
            value={formatCurrency(overdueAmount)}
            valueColor="#ef4444"
          />

          {/* Upload Document Button */}
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

          {/* Payment History */}
          <TouchableOpacity
            onPress={() => canViewPayments() && setShowPaymentHistory(!showPaymentHistory)}
            disabled={!canViewPayments()}
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 10,
              padding: 16,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: canViewPayments() ? '#334155' : '#422006',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: !canViewPayments() ? 0.6 : 1
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: '#334155',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12
              }}>
                <DollarSign color={canViewPayments() ? "#3b82f6" : "#fbbf24"} size={20} />
              </View>
              <Text style={{ color: canViewPayments() ? '#ffffff' : '#fbbf24', fontSize: 15, fontWeight: '600' }}>
                {canViewPayments() 
                  ? `Payment History (${payments.length})`
                  : 'Payment History'}
              </Text>
            </View>
            {canViewPayments() && (
              <ChevronDown 
                color="#64748b" 
                size={20}
                style={{ transform: [{ rotate: showPaymentHistory ? '180deg' : '0deg' }] }}
              />
            )}
          </TouchableOpacity>

          {showPaymentHistory && canViewPayments() && (
            <View style={{ marginBottom: 10 }}>
              {payments.length === 0 ? (
                <View style={{
                  backgroundColor: '#1e293b',
                  borderRadius: 10,
                  padding: 20,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#334155',
                }}>
                  <AlertCircle color="#64748b" size={24} />
                  <Text style={{ color: '#64748b', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                    No payment history available
                  </Text>
                </View>
              ) : (
                payments.map((payment, index) => (
                  <View
                    key={payment.id || index}
                    style={{
                      backgroundColor: '#1e293b',
                      borderRadius: 10,
                      padding: 14,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: '#334155'
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ color: '#10b981', fontSize: 16, fontWeight: '700' }}>
                        {formatCurrency(payment.amount)}
                      </Text>
                      <Text style={{ color: '#64748b', fontSize: 12 }}>
                        {formatDate(payment.paymentDate)}
                      </Text>
                    </View>
                    {payment.paymentMethod && (
                      <Text style={{ color: '#ffffff', fontSize: 13 }}>
                        {payment.paymentMethod}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          )}

          <View style={{ height: 1, backgroundColor: '#334155', marginVertical: 20 }} />

          {/* Update Case Section */}
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
            Update Case
          </Text>

          {!canEditCases() && (
            <View style={{
              backgroundColor: '#422006',
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#78350f',
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <AlertCircle color="#fbbf24" size={20} />
              <Text style={{ color: '#fbbf24', fontSize: 13, marginLeft: 10, flex: 1 }}>
                Update restricted - missing required permissions
              </Text>
            </View>
          )}

          {/* Status Picker */}
          <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>
            Status
          </Text>
          <TouchableOpacity
            onPress={() => canEditCases() && setShowStatusPicker(!showStatusPicker)}
            disabled={!canEditCases()}
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 10,
              padding: 16,
              borderWidth: 1,
              borderColor: '#334155',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
              opacity: !canEditCases() ? 0.6 : 1
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '500' }}>
              {statuses.find(s => s.id === selectedStatusId)?.name || 
               statuses.find(s => s.id === selectedStatusId)?.description ||
               caseData.status?.description || 
               'Select Status'}
            </Text>
            {canEditCases() && (
              <ChevronDown 
                color="#64748b" 
                size={20}
                style={{ transform: [{ rotate: showStatusPicker ? '180deg' : '0deg' }] }}
              />
            )}
          </TouchableOpacity>

          {showStatusPicker && statuses.length > 0 && canEditCases() && (
            <View style={{ 
              backgroundColor: '#1e293b',
              borderRadius: 10,
              marginBottom: 12,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#334155'
            }}>
              {statuses.map((status, index) => (
                <TouchableOpacity
                  key={status.id}
                  onPress={() => {
                    setSelectedStatusId(status.id);
                    setShowStatusPicker(false);
                  }}
                  style={{
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottomWidth: index < statuses.length - 1 ? 1 : 0,
                    borderBottomColor: '#334155'
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 15, flex: 1 }}>
                    {status.name || status.description || 'Unknown Status'}
                  </Text>
                  {selectedStatusId === status.id && (
                    <Check color="#10b981" size={20} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Remarks Field */}
          <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>
            Remarks / Notes
          </Text>
          <TextInput
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 10,
              padding: 16,
              color: '#ffffff',
              fontSize: 15,
              borderWidth: 1,
              borderColor: '#334155',
              minHeight: 100,
              textAlignVertical: 'top',
              marginBottom: 20,
              opacity: !canEditCases() ? 0.6 : 1
            }}
            placeholder="Add your notes here..."
            placeholderTextColor="#64748b"
            multiline
            value={remarks}
            onChangeText={setRemarks}
            editable={canEditCases()}
          />

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleUpdateCase}
            disabled={updating || !canEditCases()}
            style={{
              backgroundColor: canEditCases() ? '#3b82f6' : '#334155',
              borderRadius: 10,
              padding: 18,
              alignItems: 'center',
              opacity: (updating || !canEditCases()) ? 0.6 : 1
            }}
          >
            {updating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
                {canEditCases() ? 'Save Changes' : 'Update Restricted'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default CaseDetailsModal;