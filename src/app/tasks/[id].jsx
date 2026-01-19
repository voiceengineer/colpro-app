import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, AlertCircle, User, Package, FileText, Navigation, CreditCard, Play } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { tasksService } from '../../lib/services/tasksService';
import { TaskInfoTab, VisitTab, ProductsTab, DocumentsTab, PaymentsTab } from '../../components/tasks-page-comp/all-tabs';
import { CompleteVisitModal, VisitRemarksModal, PaymentDetailsModal } from '../../components/tasks-page-comp/all-modals';
import { formatCurrency, getStatusColor, getPriorityColor } from '../../utils/task-helper';
import { useTranslation } from 'react-i18next';

export default function TaskDetailsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  
  const TABS = [
    { id: 'info', label: t('taskDetails.tabs.info'), icon: User },
    { id: 'products', label: t('taskDetails.tabs.products'), icon: Package },
    { id: 'documents', label: t('taskDetails.tabs.docs'), icon: FileText },
    { id: 'visit', label: t('taskDetails.tabs.visit'), icon: Navigation },
    { id: 'payments', label: t('taskDetails.tabs.payments'), icon: CreditCard },
  ];

  const [activeTab, setActiveTab] = useState('info');
  const [refreshing, setRefreshing] = useState(false);
  const [sensitiveDataVisible, setSensitiveDataVisible] = useState({ phone: false, address: false, pinfl: false });
  
  // Modal states
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [showVisitRemarksModal, setShowVisitRemarksModal] = useState(false);
  
  // Form states
  const [visitForm, setVisitForm] = useState({ status: 'completed', notes: '', actualAmountCollected: '' });
  const [paymentDetails, setPaymentDetails] = useState({ amount: '', paymentMethodId: 1, paymentDate: new Date().toISOString().split('T')[0], transactionId: '' });
  
  // Loading states
  const [completingVisit, setCompletingVisit] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [addingPayment, setAddingPayment] = useState(false);
  
  // Photo upload states
  const [visitPhotoRemarks, setVisitPhotoRemarks] = useState('');

  // Fetch task data
  const { data: taskData, isLoading, error, refetch } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksService.getTaskById(id),
    enabled: !!id,
  });

  // Fetch payments
  const { data: paymentsData, refetch: refetchPayments } = useQuery({
    queryKey: ['case-payments', taskData?.caseId],
    queryFn: () => tasksService.getCasePayments(taskData.caseId),
    enabled: !!taskData?.caseId,
  });

  const payments = Array.isArray(paymentsData) ? paymentsData : [];
  const hasPayments = payments.length > 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchPayments()]);
    setRefreshing(false);
  };

  const toggleSensitiveData = (field) => {
    setSensitiveDataVisible(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleOpenPaymentModal = () => {
    setPaymentDetails({
      amount: visitForm.actualAmountCollected || taskData?.expectedAmount?.toString() || '',
      paymentMethodId: 1,
      paymentDate: new Date().toISOString().split('T')[0],
      transactionId: ''
    });
    setShowPaymentDetailsModal(true);
  };

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <AlertCircle color="#ef4444" size={48} />
        <Text style={{ color: '#ffffff', fontSize: 18, marginTop: 16 }}>{t('taskDetails.failedToLoad')}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#3b82f6', borderRadius: 8 }}>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>{t('common.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#64748b', fontSize: 16, marginTop: 16 }}>{t('taskDetails.loading')}</Text>
      </View>
    );
  }

  const canStartVisit = taskData?.status?.toLowerCase() === 'pending';
  const isTaskCompleted = taskData?.status?.toLowerCase() === 'completed';
  const showAddPaymentButton = isTaskCompleted && !hasPayments;

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 8 }}>
              <ArrowLeft color="#ffffff" size={24} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>{t('tasks.taskNumber')} {taskData?.id}</Text>
              <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{taskData?.debtorName || t('common.notAvailable')}</Text>
            </View>
          </View>
          <View style={{ backgroundColor: `${getPriorityColor(taskData?.priority)}20`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
            <Text style={{ color: getPriorityColor(taskData?.priority), fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>
              {taskData?.priority ? t(`cases.priority.${taskData.priority.toLowerCase()}`, { defaultValue: taskData.priority }) : t('common.notAvailable')}
            </Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', marginTop: 16, gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#334155' }}>
          <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>{t('taskDetails.summary.expected')}</Text>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>{formatCurrency(taskData?.expectedAmount)}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>{t('taskDetails.summary.collected')}</Text>
            <Text style={{ color: '#10b981', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>{formatCurrency(taskData?.actualAmountCollected || 0)}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>{t('taskDetails.summary.status')}</Text>
            <Text style={{ color: getStatusColor(taskData?.status), fontSize: 13, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' }}>
              {taskData?.status?.replace(/_/g, ' ') || t('common.notAvailable')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {canStartVisit && (
          <TouchableOpacity onPress={() => setShowVisitRemarksModal(true)} disabled={uploadingEvidence} style={{ backgroundColor: uploadingEvidence ? '#059669' : '#10b981', borderRadius: 10, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 8, opacity: uploadingEvidence ? 0.7 : 1 }}>
            {uploadingEvidence ? (
              <>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>{t('common.uploading')}</Text>
              </>
            ) : (
              <>
                <Play color="#ffffff" size={18} strokeWidth={2.5} />
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>{t('taskDetails.actions.startVisit')}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {showAddPaymentButton && (
          <TouchableOpacity onPress={handleOpenPaymentModal} style={{ backgroundColor: '#3b82f6', borderRadius: 10, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 8, borderWidth: 2, borderColor: '#60a5fa' }}>
            <CreditCard color="#ffffff" size={18} strokeWidth={2.5} />
            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>{t('taskDetails.actions.addPayment')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Navigation */}
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

      {/* Tab Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}>
        {activeTab === 'info' && <TaskInfoTab taskData={taskData} sensitiveDataVisible={sensitiveDataVisible} toggleSensitiveData={toggleSensitiveData} t={t} />}
        {activeTab === 'visit' && <VisitTab taskData={taskData} t={t} />}
        {activeTab === 'products' && <ProductsTab caseId={taskData?.caseId} t={t} />}
        {activeTab === 'documents' && <DocumentsTab taskId={id} t={t} />}
        {activeTab === 'payments' && <PaymentsTab payments={payments} onAddPayment={handleOpenPaymentModal} t={t} />}
      </ScrollView>

      {/* Modals */}
      <CompleteVisitModal visible={showCompleteModal} onClose={() => setShowCompleteModal(false)} visitForm={visitForm} setVisitForm={setVisitForm} completingVisit={completingVisit} setCompletingVisit={setCompletingVisit} taskId={id} onOpenPaymentModal={handleOpenPaymentModal} refetch={refetch} insets={insets} t={t} />
      
      <VisitRemarksModal visible={showVisitRemarksModal} onClose={() => { setShowVisitRemarksModal(false); setVisitPhotoRemarks(''); }} visitPhotoRemarks={visitPhotoRemarks} setVisitPhotoRemarks={setVisitPhotoRemarks} uploadingEvidence={uploadingEvidence} setUploadingEvidence={setUploadingEvidence} taskId={id} onSuccess={() => { setVisitForm({ status: 'completed', notes: '', actualAmountCollected: taskData?.expectedAmount?.toString() || '' }); setShowCompleteModal(true); }} insets={insets} t={t} />
      
      <PaymentDetailsModal visible={showPaymentDetailsModal} onClose={() => setShowPaymentDetailsModal(false)} paymentDetails={paymentDetails} setPaymentDetails={setPaymentDetails} addingPayment={addingPayment} setAddingPayment={setAddingPayment} caseId={taskData?.caseId} onSuccess={async () => { await refetchPayments(); setActiveTab('payments'); }} insets={insets} t={t} />
    </View>
  );
}