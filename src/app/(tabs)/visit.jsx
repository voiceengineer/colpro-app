import React from 'react';
import { View, Text, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import { useVisitState } from '@/hooks/useVisitState';
import { useVisitActions } from '@/hooks/useVisitActions';
import {
  formatCurrency,
  generateJobsheet,
  formatJobsheetText,
} from '@/utils/visitHelpers';
import { CameraPermissionScreen } from '@/components/Visit/CameraPermissionScreen';
import { CameraScreen } from '@/components/Visit/CameraScreen';
import { VisitReportScreen } from '@/components/Visit/VisitReportScreen';

export default function Visit() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Debtor information from params
  const debtorInfo = {
    id: params.debtorId,
    name: params.debtorName,
    address: params.debtorAddress,
    phone: params.debtorPhone,
    totalAmount: parseFloat(params.totalAmount || 0),
    remainingAmount: parseFloat(params.remainingAmount || 0),
    pinfl: params.pinfl,
  };

  const [permission, requestPermission] = useCameraPermissions();
  const visitState = useVisitState();
  const visitActions = useVisitActions();

  const handleTakePicture = async () => {
    await visitActions.takePicture(
      visitState.cameraRef,
      visitState.location,
      visitState.setLocation,
      visitState.setCapturedPhoto
    );
  };

  const handlePaymentRecord = () => {
    visitState.setShowPaymentModal(true);
  };

  const handleSavePayment = async () => {
    const success = await visitActions.savePayment(
      debtorInfo.id,
      visitState.paymentAmount,
      visitState.paymentMethod,
      visitState.paymentNotes
    );

    if (success) {
      visitState.setShowPaymentModal(false);
      visitState.setPaymentAmount('');
      visitState.setPaymentNotes('');
    }
  };

  const jobsheet = generateJobsheet(
    debtorInfo,
    visitState.visitStartTime,
    visitState.outcome,
    visitState.customerContacted,
    visitState.paymentAmount,
    visitState.nextAction,
    visitState.notes,
    visitState.location,
    visitState.capturedPhoto
  );

  const handleShareJobsheet = async () => {
    const jobsheetText = formatJobsheetText(jobsheet, formatCurrency);

    try {
      await Share.share({
        message: jobsheetText,
        title: `Visit Report - ${jobsheet.debtor.name}`,
      });
    } catch (error) {
      console.error('Error sharing jobsheet:', error);
      Alert.alert('Error', 'Failed to share jobsheet');
    }
  };

  const handleSaveVisitReport = async () => {
    if (!visitState.capturedPhoto) {
      Alert.alert('Error', 'Please take a photo first');
      return;
    }

    if (!visitState.outcome.trim()) {
      Alert.alert('Error', 'Please enter visit outcome');
      return;
    }

    visitState.setSaving(true);
    try {
      const visitData = {
        debtor_id: debtorInfo.id,
        visit_outcome: visitState.outcome,
        debtor_contacted: visitState.customerContacted,
        payment_received: visitState.paymentAmount
          ? parseFloat(visitState.paymentAmount)
          : 0,
        next_action: visitState.nextAction,
        remarks: visitState.notes,
        officer_id: 'field_officer',
        location_lat: visitState.location?.latitude,
        location_lng: visitState.location?.longitude,
      };

      const success = await visitActions.saveVisitReport(visitData);

      if (success) {
        Alert.alert('Success', 'Visit report saved successfully', [
          {
            text: 'Share Jobsheet',
            onPress: () => handleShareJobsheet(),
          },
          {
            text: 'OK',
            onPress: () => {
              visitState.resetVisitState();
              router.back();
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error saving visit report:', error);
      Alert.alert('Error', 'Failed to save visit report');
    } finally {
      visitState.setSaving(false);
    }
  };

  if (!permission) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0f172a',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 16 }}>
          Loading camera...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return <CameraPermissionScreen onRequestPermission={requestPermission} />;
  }

  if (visitState.capturedPhoto) {
    return (
      <VisitReportScreen
        insets={insets}
        debtorInfo={debtorInfo}
        customerContacted={visitState.customerContacted}
        setCustomerContacted={visitState.setCustomerContacted}
        paymentAmount={visitState.paymentAmount}
        paymentMethod={visitState.paymentMethod}
        paymentNotes={visitState.paymentNotes}
        outcome={visitState.outcome}
        setOutcome={visitState.setOutcome}
        nextAction={visitState.nextAction}
        setNextAction={visitState.setNextAction}
        notes={visitState.notes}
        setNotes={visitState.setNotes}
        location={visitState.location}
        saving={visitState.saving}
        showPaymentModal={visitState.showPaymentModal}
        setShowPaymentModal={visitState.setShowPaymentModal}
        showJobsheetModal={visitState.showJobsheetModal}
        setShowJobsheetModal={visitState.setShowJobsheetModal}
        setPaymentAmount={visitState.setPaymentAmount}
        setPaymentMethod={visitState.setPaymentMethod}
        setPaymentNotes={visitState.setPaymentNotes}
        jobsheet={jobsheet}
        onBack={() => router.back()}
        onRetakePicture={visitState.retakePicture}
        onRecordPayment={handlePaymentRecord}
        onSavePayment={handleSavePayment}
        onShareJobsheet={handleShareJobsheet}
        onSaveVisitReport={handleSaveVisitReport}
      />
    );
  }

  return (
    <CameraScreen
      insets={insets}
      facing={visitState.facing}
      flash={visitState.flash}
      cameraRef={visitState.cameraRef}
      onToggleFlash={visitState.toggleFlash}
      onTakePicture={handleTakePicture}
      onToggleFacing={visitState.toggleCameraFacing}
    />
  );
}
