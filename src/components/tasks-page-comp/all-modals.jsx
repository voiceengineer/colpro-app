import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, ActivityIndicator, Alert, Linking } from 'react-native';
import { X, ChevronDown, Save, CreditCard, FileText, Camera, Calendar } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { tasksService } from '../../lib/services/tasksService';
import { authService } from '../../lib/services/authService';
import { STATUS_OPTIONS, PAYMENT_METHODS } from '../../utils/task-helper';

// ============================================
// COMPLETE VISIT MODAL
// ============================================
export function CompleteVisitModal({ visible, onClose, visitForm, setVisitForm, completingVisit, setCompletingVisit, taskId, onOpenPaymentModal, refetch, insets }) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const handleCompleteVisit = async () => {
    if (!visitForm.notes.trim()) {
      Alert.alert("Validation Error", "Please add notes about the visit.");
      return;
    }
    if (!visitForm.actualAmountCollected) {
      Alert.alert("Validation Error", "Please enter the amount collected (enter 0 if none).");
      return;
    }

    Alert.alert('Update Status', 'Are you sure you want to complete this visit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Update',
        onPress: async () => {
          try {
            setCompletingVisit(true);
            const updateData = { status: visitForm.status, notes: visitForm.notes, actualAmountCollected: parseFloat(visitForm.actualAmountCollected) || 0 };
            await tasksService.updateTask(taskId, updateData);
            Alert.alert("Success!", `Update Status successfully!\n\n• Status: ${visitForm.status.replace(/_/g, ' ').toUpperCase()}\n• Amount: ${visitForm.actualAmountCollected}`, [{ text: "OK", onPress: async () => { onClose(); await refetch(); } }]);
          } catch (error) {
            console.error("update status Error:", error);
            Alert.alert("Error", error.message || "Could not update status.");
          } finally {
            setCompletingVisit(false);
          }
        }
      }
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={() => !completingVisit && onClose()}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => !completingVisit && onClose()} />
        <View style={{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: insets.bottom }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#334155' }}>
            <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>Complete Visit</Text>
            <TouchableOpacity onPress={() => !completingVisit && onClose()} disabled={completingVisit}>
              <X color="#64748b" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: '75%' }} contentContainerStyle={{ padding: 20 }}>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Status</Text>
            <TouchableOpacity onPress={() => setShowStatusDropdown(!showStatusDropdown)} disabled={completingVisit} style={{ backgroundColor: '#0f172a', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: '#ffffff', fontSize: 15 }}>{STATUS_OPTIONS.find(s => s.value === visitForm.status)?.label || 'Select Status'}</Text>
              <ChevronDown color="#64748b" size={20} />
            </TouchableOpacity>

            {showStatusDropdown && (
              <View style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 20, overflow: 'hidden' }}>
                {STATUS_OPTIONS.map((option, index) => (
                  <TouchableOpacity key={option.value} onPress={() => { setVisitForm(prev => ({ ...prev, status: option.value })); setShowStatusDropdown(false); }} style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: visitForm.status === option.value ? '#334155' : 'transparent', borderBottomWidth: index < STATUS_OPTIONS.length - 1 ? 1 : 0, borderBottomColor: '#334155' }}>
                    <Text style={{ color: visitForm.status === option.value ? '#3b82f6' : '#ffffff', fontSize: 15, fontWeight: visitForm.status === option.value ? '600' : '400' }}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!showStatusDropdown && <View style={{ marginBottom: 20 }} />}

            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Amount Collected</Text>
            <TextInput style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: 16, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 20 }} placeholder="Enter amount collected" placeholderTextColor="#64748b" keyboardType="numeric" value={visitForm.actualAmountCollected} onChangeText={(text) => setVisitForm(prev => ({ ...prev, actualAmountCollected: text }))} editable={!completingVisit} />

            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Notes</Text>
            <TextInput style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: 15, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 20, minHeight: 100, textAlignVertical: 'top' }} placeholder="Add notes about the visit..." placeholderTextColor="#64748b" multiline numberOfLines={4} value={visitForm.notes} onChangeText={(text) => setVisitForm(prev => ({ ...prev, notes: text }))} editable={!completingVisit} />
          </ScrollView>

          <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#334155', gap: 12 }}>
            <TouchableOpacity onPress={() => { onClose(); onOpenPaymentModal(); }} disabled={completingVisit} style={{ backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
              <CreditCard color="#ffffff" size={20} />
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Add Payment Details</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCompleteVisit} disabled={completingVisit} style={{ backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
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

            <TouchableOpacity onPress={onClose} disabled={completingVisit} style={{ backgroundColor: '#334155', borderRadius: 12, paddingVertical: 16, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// VISIT REMARKS MODAL
// ============================================
export function VisitRemarksModal({ visible, onClose, visitPhotoRemarks, setVisitPhotoRemarks, uploadingEvidence, setUploadingEvidence, taskId, onSuccess, insets }) {
  const handleStartVisit = async () => {
    try {
      const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
      if (existingStatus !== 'granted') {
        const granted = await new Promise((resolve) => {
          Alert.alert("Camera Permission Required", "CollPro needs access to your camera to take evidence photos.", [
            { text: "Deny", onPress: () => resolve(false), style: "cancel" },
            { text: "Allow", onPress: async () => { const { status } = await ImagePicker.requestCameraPermissionsAsync(); resolve(status === 'granted'); } }
          ], { cancelable: false });
        });
        if (!granted) {
          Alert.alert("Permission Denied", "Camera permission is required. Please enable it in your device settings.", [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]);
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.8 });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadEvidencePhoto(result.assets[0], visitPhotoRemarks);
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
      Alert.alert("Success", "Evidence photo uploaded successfully!");
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Upload Failed", error.message || "Could not upload evidence photo.");
    } finally {
      setUploadingEvidence(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: insets.bottom + 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#334155' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <FileText color="#10b981" size={24} />
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>Add Evidence Remarks</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={uploadingEvidence}>
              <X color="#64748b" size={24} />
            </TouchableOpacity>
          </View>

          <Text style={{ color: '#64748b', fontSize: 14, paddingHorizontal: 20, paddingTop: 16 }}>Add remarks to justify this evidence photo for the visit.</Text>

          <View style={{ padding: 20 }}>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Remarks / Notes</Text>
            <TextInput style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: 15, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 20, minHeight: 120, textAlignVertical: 'top' }} placeholder="E.g., Debtor not at home, Property entrance, Meeting evidence, etc." placeholderTextColor="#64748b" multiline numberOfLines={5} value={visitPhotoRemarks} onChangeText={setVisitPhotoRemarks} autoFocus editable={!uploadingEvidence} />

            <View style={{ gap: 12 }}>
              <TouchableOpacity onPress={handleStartVisit} disabled={uploadingEvidence} style={{ backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, opacity: uploadingEvidence ? 0.7 : 1 }}>
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

              <TouchableOpacity onPress={onClose} disabled={uploadingEvidence} style={{ backgroundColor: '#334155', borderRadius: 12, paddingVertical: 16, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// PAYMENT DETAILS MODAL
// ============================================
export function PaymentDetailsModal({ visible, onClose, paymentDetails, setPaymentDetails, addingPayment, setAddingPayment, caseId, onSuccess, insets }) {
  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = useState(false);

  const handleAddPaymentDetails = async () => {
    if (!paymentDetails.amount || parseFloat(paymentDetails.amount) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid payment amount.");
      return;
    }
    if (!paymentDetails.paymentDate) {
      Alert.alert("Validation Error", "Please select a payment date.");
      return;
    }

    try {
      setAddingPayment(true);
      const paymentData = { amount: parseFloat(paymentDetails.amount), paymentMethodId: paymentDetails.paymentMethodId, paymentDate: paymentDetails.paymentDate, transactionId: paymentDetails.transactionId || undefined };
      await tasksService.addCasePayment(caseId, paymentData);
      Alert.alert("Success!", "Payment added successfully!", [{ text: "OK", onPress: async () => { onClose(); setPaymentDetails({ amount: '', paymentMethodId: 1, paymentDate: new Date().toISOString().split('T')[0], transactionId: '' }); await onSuccess(); } }]);
    } catch (error) {
      console.error("Add Payment Error:", error);
      Alert.alert("Error", error.message || "Could not add payment.");
    } finally {
      setAddingPayment(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={() => !addingPayment && onClose()}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => !addingPayment && onClose()} />
        <View style={{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: insets.bottom }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#334155' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <CreditCard color="#3b82f6" size={24} />
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>Add New Payment</Text>
            </View>
            <TouchableOpacity onPress={() => !addingPayment && onClose()} disabled={addingPayment}>
              <X color="#64748b" size={24} />
            </TouchableOpacity>
          </View>

          <Text style={{ color: '#64748b', fontSize: 14, paddingHorizontal: 20, paddingTop: 16 }}>Enter the payment details for this debtor.</Text>

          <ScrollView style={{ maxHeight: '75%' }} contentContainerStyle={{ padding: 20 }}>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Amount (UZS) <Text style={{ color: '#ef4444' }}>*</Text></Text>
            <View style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 20, flexDirection: 'row', alignItems: 'center', paddingRight: 14 }}>
              <TextInput style={{ flex: 1, color: '#ffffff', fontSize: 16, padding: 14 }} placeholder="0" placeholderTextColor="#64748b" keyboardType="numeric" value={paymentDetails.amount} onChangeText={(text) => setPaymentDetails(prev => ({ ...prev, amount: text }))} editable={!addingPayment} />
              <View style={{ backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>UZS</Text>
              </View>
            </View>

            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Payment Method</Text>
            <TouchableOpacity onPress={() => setShowPaymentMethodDropdown(!showPaymentMethodDropdown)} disabled={addingPayment} style={{ backgroundColor: '#0f172a', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#3b82f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: '#3b82f6', fontSize: 15 }}>{PAYMENT_METHODS.find(m => m.value === paymentDetails.paymentMethodId)?.label || 'Select Method'}</Text>
              <ChevronDown color="#3b82f6" size={20} />
            </TouchableOpacity>

            {showPaymentMethodDropdown && (
              <View style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 20, overflow: 'hidden' }}>
                {PAYMENT_METHODS.map((method, index) => (
                  <TouchableOpacity key={method.value} onPress={() => { setPaymentDetails(prev => ({ ...prev, paymentMethodId: method.value })); setShowPaymentMethodDropdown(false); }} style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: paymentDetails.paymentMethodId === method.value ? '#334155' : 'transparent', borderBottomWidth: index < PAYMENT_METHODS.length - 1 ? 1 : 0, borderBottomColor: '#334155' }}>
                    <Text style={{ color: paymentDetails.paymentMethodId === method.value ? '#3b82f6' : '#ffffff', fontSize: 15, fontWeight: paymentDetails.paymentMethodId === method.value ? '600' : '400' }}>{method.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!showPaymentMethodDropdown && <View style={{ marginBottom: 20 }} />}

            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Date <Text style={{ color: '#ef4444' }}>*</Text></Text>
            <View style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14 }}>
              <Text style={{ color: '#3b82f6', fontSize: 16, flex: 1 }}>{paymentDetails.paymentDate}</Text>
              <Calendar color="#3b82f6" size={20} />
            </View>

            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Transaction ID</Text>
            <TextInput style={{ backgroundColor: '#0f172a', color: '#3b82f6', fontSize: 16, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 20 }} placeholder="Optional" placeholderTextColor="#64748b" value={paymentDetails.transactionId} onChangeText={(text) => setPaymentDetails(prev => ({ ...prev, transactionId: text }))} editable={!addingPayment} />
          </ScrollView>

          <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#334155', gap: 12 }}>
            <TouchableOpacity onPress={handleAddPaymentDetails} disabled={addingPayment} style={{ backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, opacity: addingPayment ? 0.7 : 1 }}>
              {addingPayment ? (
                <>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Adding...</Text>
                </>
              ) : (
                <>
                  <Save color="#ffffff" size={20} />
                  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Add Payment</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} disabled={addingPayment} style={{ backgroundColor: '#334155', borderRadius: 12, paddingVertical: 16, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}