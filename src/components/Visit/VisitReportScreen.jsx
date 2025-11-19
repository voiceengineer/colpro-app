import React from 'react';
import { ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';
import { VisitReportHeader } from './VisitReportHeader';
import { PhotoPreviewSection } from './PhotoPreviewSection';
import { CustomerContactSection } from './CustomerContactSection';
import { PaymentSection } from './PaymentSection';
import { VisitOutcomeSection } from './VisitOutcomeSection';
import { NextActionsSection } from './NextActionsSection';
import { RemarksSection } from './RemarksSection';
import { LocationSection } from './LocationSection';
import { ActionButtons } from './ActionButtons';
import { PaymentModal } from './PaymentModal';
import { JobsheetModal } from './JobsheetModal';

export function VisitReportScreen({
  insets,
  debtorInfo,
  customerContacted,
  setCustomerContacted,
  paymentAmount,
  paymentMethod,
  paymentNotes,
  outcome,
  setOutcome,
  nextAction,
  setNextAction,
  notes,
  setNotes,
  location,
  saving,
  showPaymentModal,
  setShowPaymentModal,
  showJobsheetModal,
  setShowJobsheetModal,
  setPaymentAmount,
  setPaymentMethod,
  setPaymentNotes,
  jobsheet,
  onBack,
  onRetakePicture,
  onRecordPayment,
  onSavePayment,
  onShareJobsheet,
  onSaveVisitReport,
}) {
  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      behavior="padding"
    >
      <StatusBar style="light" />

      <VisitReportHeader
        insets={insets}
        debtorInfo={debtorInfo}
        onBack={onBack}
        onViewJobsheet={() => setShowJobsheetModal(true)}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <PhotoPreviewSection onRetake={onRetakePicture} />

        <CustomerContactSection
          customerContacted={customerContacted}
          onToggle={() => setCustomerContacted(!customerContacted)}
        />

        <PaymentSection
          paymentAmount={paymentAmount}
          paymentMethod={paymentMethod}
          paymentNotes={paymentNotes}
          onRecordPayment={onRecordPayment}
        />

        <VisitOutcomeSection outcome={outcome} onChangeOutcome={setOutcome} />

        <NextActionsSection
          nextAction={nextAction}
          onChangeNextAction={setNextAction}
        />

        <RemarksSection notes={notes} onChangeNotes={setNotes} />

        <LocationSection location={location} />

        <ActionButtons
          saving={saving}
          onViewJobsheet={() => setShowJobsheetModal(true)}
          onSave={onSaveVisitReport}
        />
      </ScrollView>

      <PaymentModal
        visible={showPaymentModal}
        paymentAmount={paymentAmount}
        paymentMethod={paymentMethod}
        paymentNotes={paymentNotes}
        onChangeAmount={setPaymentAmount}
        onChangeMethod={setPaymentMethod}
        onChangeNotes={setPaymentNotes}
        onCancel={() => setShowPaymentModal(false)}
        onSave={onSavePayment}
      />

      <JobsheetModal
        visible={showJobsheetModal}
        insets={insets}
        jobsheet={jobsheet}
        onClose={() => setShowJobsheetModal(false)}
        onShare={onShareJobsheet}
      />
    </KeyboardAvoidingAnimatedView>
  );
}
