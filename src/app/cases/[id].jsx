import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  ActivityIndicator, Alert, Dimensions, RefreshControl,
  Linking, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  ArrowLeft, User, Phone, MapPin, CreditCard, 
  Calendar, DollarSign, AlertCircle, FileText,
  Package, Receipt, Mic, Copy, CheckCircle, Camera, Image as ImageIcon,
  Eye, EyeOff, Download,
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { casesService } from '../../lib/services/casesService';
import { authService } from '../../lib/services/authService';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function CaseDetailsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  
  const TABS = [
    { id: 'info', label: t('caseDetails.tabs.info'), icon: User },
    { id: 'products', label: t('caseDetails.tabs.products'), icon: Package },
    { id: 'payments', label: t('caseDetails.tabs.payments'), icon: Receipt },
    { id: 'documents', label: t('caseDetails.tabs.docs'), icon: FileText },
    { id: 'recordings', label: t('caseDetails.tabs.audio'), icon: Mic },
  ];

  const [activeTab, setActiveTab] = useState('info');
  const [refreshing, setRefreshing] = useState(false);
  const [sensitiveDataVisible, setSensitiveDataVisible] = useState({
    passport: false,
    pinfl: false,
    phone: false,
  });

  const { data: caseData, isLoading, error, refetch } = useQuery({
    queryKey: ['case', id],
    queryFn: () => casesService.getCaseById(id),
    enabled: !!id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const toggleSensitiveData = (field) => {
    setSensitiveDataVisible(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <AlertCircle color="#ef4444" size={48} />
        <Text style={{ color: '#ffffff', fontSize: 18, marginTop: 16 }}>{t('caseDetails.failedToLoad')}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#3b82f6', borderRadius: 8 }}
          accessibilityLabel="Go back to cases list"
          accessibilityRole="button"
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>{t('common.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#64748b', fontSize: 16, marginTop: 16 }}>{t('caseDetails.loading')}</Text>
      </View>
    );
  }

  const account = caseData?.account || {};
  const agent = caseData?.agent || {};
  const status = caseData?.status || {};

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0';
    return Number(amount).toLocaleString('en-US');
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.notAvailable');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return t('common.notAvailable'); }
  };

  const getPriorityColor = (priority) => {
    const p = priority?.toLowerCase();
    switch(p) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert(t('common.copied'), `${label} ${t('common.copiedMsg')}`);
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to copy');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={{ 
        paddingTop: insets.top + 16, 
        paddingHorizontal: 20, 
        paddingBottom: 16,
        backgroundColor: '#1e293b',
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 16, padding: 8 }}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ArrowLeft color="#ffffff" size={24} />
            </TouchableOpacity>
            
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>
                Case #{caseData?.id}
              </Text>
              <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                {account.fullName || t('common.notAvailable')}
              </Text>
            </View>
          </View>

          <View style={{
            backgroundColor: `${getPriorityColor(caseData?.priority)}20`,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
          }}
          accessibilityLabel={`Priority: ${caseData?.priority || 'Unknown'}`}
          accessibilityRole="text"
          >
            <Text style={{ 
              color: getPriorityColor(caseData?.priority), 
              fontSize: 12, 
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              {caseData?.priority ? t(`cases.priority.${caseData.priority.toLowerCase()}`, { defaultValue: caseData.priority }) : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={{ 
          flexDirection: 'row', 
          marginTop: 16, 
          gap: 12,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: '#334155',
        }}>
          <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>{t('cases.balance').toUpperCase()}</Text>
            <Text 
              style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}
              accessibilityLabel={`Balance: ${formatCurrency(caseData?.currentBalance)}`}
            >
              {formatCurrency(caseData?.currentBalance)}
            </Text>
          </View>
          
          <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>{t('caseDetails.info.overdueDebt').toUpperCase()}</Text>
            <Text 
              style={{ color: '#ef4444', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}
              accessibilityLabel={`Days overdue: ${caseData?.daysPastDue || '0'}`}
            >
              {caseData?.daysPastDue || '0'} days
            </Text>
          </View>

          <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>{t('common.status').toUpperCase()}</Text>
            <Text 
              style={{ 
                color: status.color || '#64748b', 
                fontSize: 13, 
                fontWeight: 'bold', 
                marginTop: 4 
              }}
              accessibilityLabel={`Status: ${status.description || 'Unknown'}`}
            >
              {status.description || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Button-Style Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{ 
          backgroundColor: '#1e293b',
          borderBottomWidth: 1,
          borderBottomColor: '#334155',
          maxHeight: 60, 
        }}
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingVertical: 10, 
          gap: 10 
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                backgroundColor: isActive ? '#3b82f6' : '#0f172a',
                paddingHorizontal: 10, 
                borderRadius: 8,       
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderWidth: 1,
                borderColor: isActive ? '#3b82f6' : '#334155',
                shadowColor: isActive ? '#3b82f6' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isActive ? 0.3 : 0,
                shadowRadius: 4,
                elevation: isActive ? 4 : 0,
              }}
              accessibilityLabel={`${tab.label} tab`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Icon 
                color={isActive ? '#ffffff' : '#64748b'} 
                size={18}
              />
              <Text style={{ 
                color: isActive ? '#ffffff' : '#64748b',
                fontSize: 14,
                fontWeight: isActive ? '700' : '600',
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
          />
        }
        accessibilityRole="scrollview"
      >
        {activeTab === 'info' && (
          <ClientInfoTab 
            account={account} 
            caseData={caseData}
            status={status}
            agent={agent}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            copyToClipboard={copyToClipboard}
            sensitiveDataVisible={sensitiveDataVisible}
            toggleSensitiveData={toggleSensitiveData}
            t={t}
          />
        )}
        
        {activeTab === 'products' && (
          <ProductsTab caseId={id} account={account} formatCurrency={formatCurrency} t={t} />
        )}
        
        {activeTab === 'payments' && (
          <PaymentsTab caseId={id} account={account} formatCurrency={formatCurrency} formatDate={formatDate} t={t} />
        )}
        
        {activeTab === 'documents' && (
          <DocumentsTab caseId={id} t={t} />
        )}
        
        {activeTab === 'recordings' && (
          <RecordingsTab caseId={id} formatDate={formatDate} t={t} />
        )}
      </ScrollView>
    </View>
  );
}

// Client Info Tab Component
function ClientInfoTab({ 
  account, 
  caseData, 
  status, 
  agent, 
  formatCurrency, 
  formatDate, 
  copyToClipboard,
  sensitiveDataVisible,
  toggleSensitiveData,
  t
}) {
  const InfoCard = ({ icon: Icon, label, value, onCopy, sensitive, sensitiveKey }) => {
    const isSensitive = sensitive && !sensitiveDataVisible[sensitiveKey];
    const displayValue = isSensitive ? '••••••••' : value;
    
    return (
      <View style={{ 
        backgroundColor: '#1e293b', 
        borderRadius: 10, 
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
      }}
      accessible={true}
      accessibilityLabel={`${label}: ${isSensitive ? 'Hidden' : value || 'Not available'}`}
      accessibilityRole="text"
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Icon color="#64748b" size={16} />
              <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', marginLeft: 8 }}>
                {label}
              </Text>
            </View>
            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '500' }}>
              {displayValue || 'N/A'}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8, marginLeft: 8 }}>
            {sensitive && (
              <TouchableOpacity
                onPress={() => toggleSensitiveData(sensitiveKey)}
                style={{ padding: 8 }}
                accessibilityLabel={isSensitive ? `Show ${label}` : `Hide ${label}`}
                accessibilityRole="button"
              >
                {isSensitive ? (
                  <Eye color="#64748b" size={16} />
                ) : (
                  <EyeOff color="#64748b" size={16} />
                )}
              </TouchableOpacity>
            )}
            
            {onCopy && value && (
              <TouchableOpacity
                onPress={() => onCopy(value, label)}
                style={{ padding: 8 }}
                accessibilityLabel={`Copy ${label}`}
                accessibilityRole="button"
              >
                <Copy color="#64748b" size={16} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        {t('caseDetails.info.clientInfo')}
      </Text>

      <InfoCard 
        icon={User} 
        label={t('caseDetails.info.fullName')} 
        value={account.fullName}
        onCopy={copyToClipboard}
      />

      <InfoCard 
        icon={CreditCard} 
        label={t('caseDetails.info.passport')} 
        value={account.passportInfo}
        onCopy={copyToClipboard}
        sensitive={true}
        sensitiveKey="passport"
      />

      <InfoCard 
        icon={CreditCard} 
        label={t('caseDetails.info.pinfl')} 
        value={account.pinfl}
        onCopy={copyToClipboard}
        sensitive={true}
        sensitiveKey="pinfl"
      />

      <InfoCard 
        icon={Phone} 
        label={t('caseDetails.info.phone')} 
        value={account.phone1}
        onCopy={copyToClipboard}
        sensitive={true}
        sensitiveKey="phone"
      />

      {account.phone2 && (
        <InfoCard 
          icon={Phone} 
          label={t('caseDetails.info.phone2')} 
          value={account.phone2}
          onCopy={copyToClipboard}
          sensitive={true}
          sensitiveKey="phone"
        />
      )}

      <InfoCard 
        icon={MapPin} 
        label={t('caseDetails.info.address')} 
        value={account.address || account.region}
      />

      <InfoCard 
        icon={DollarSign} 
        label={t('caseDetails.info.totalDue')} 
        value={formatCurrency(account.totalDebt || account.totalAmount)}
      />

      <InfoCard 
        icon={DollarSign} 
        label={t('caseDetails.info.overdueDebt')} 
        value={formatCurrency(account.overdueDebt)}
      />

      <InfoCard 
        icon={Calendar} 
        label={t('caseDetails.info.daysOverdue')} 
        value={`${account.daysOverdue || caseData?.daysPastDue || '0'} days`}
      />

      <InfoCard 
        icon={Calendar} 
        label={t('caseDetails.info.lastPaymentDate')} 
        value={formatDate(account.lastPaymentDate || caseData?.lastPaymentDate)}
      />

      <InfoCard 
        icon={DollarSign} 
        label={t('caseDetails.info.lastPaymentAmount')} 
        value={formatCurrency(account.lastPaymentAmount)}
      />

      <View style={{ 
        backgroundColor: '#1e293b', 
        borderRadius: 10, 
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <CheckCircle color="#64748b" size={16} />
          <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', marginLeft: 8 }}>
            {t('caseDetails.info.status')}
          </Text>
        </View>
        <View style={{
          backgroundColor: `${status.color || '#64748b'}20`,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 6,
          alignSelf: 'flex-start',
        }}>
          <Text style={{ 
            color: status.color || '#64748b', 
            fontSize: 14, 
            fontWeight: '600' 
          }}>
            {status.description || 'N/A'}
          </Text>
        </View>
      </View>

      {caseData?.notes && (
        <View style={{ 
          backgroundColor: '#1e293b', 
          borderRadius: 10, 
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#334155',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <FileText color="#64748b" size={16} />
            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', marginLeft: 8 }}>
              {t('caseDetails.info.notes')}
            </Text>
          </View>
          <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 20 }}>
            {caseData.notes}
          </Text>
        </View>
      )}

      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 16 }}>
        {t('caseDetails.info.additionalInfo')}
      </Text>

      <InfoCard 
        icon={FileText} 
        label={t('caseDetails.info.contractNumber')} 
        value={account.contractNumber}
      />

      <InfoCard 
        icon={FileText} 
        label={t('caseDetails.info.customerId')} 
        value={account.customerId}
      />

      <InfoCard 
        icon={Calendar} 
        label={t('caseDetails.info.dob')} 
        value={formatDate(account.dateOfBirth)}
      />

      <InfoCard 
        icon={User} 
        label={t('caseDetails.info.age')} 
        value={account.age ? `${account.age} years` : 'N/A'}
      />

      <InfoCard 
        icon={MapPin} 
        label={t('caseDetails.info.region')} 
        value={account.region}
      />

      <InfoCard 
        icon={FileText} 
        label={t('caseDetails.info.sourceOfDebt')} 
        value={account.sourceOfDebt}
      />

      <InfoCard 
        icon={FileText} 
        label={t('caseDetails.info.collectionStage')} 
        value={caseData?.collectionStage?.replace(/_/g, ' ').toUpperCase()}
      />

      {agent?.name && (
        <InfoCard 
          icon={User} 
          label={t('caseDetails.info.assignedAgent')} 
          value={agent.name}
        />
      )}
    </View>
  );
}

// Products Tab Component
function ProductsTab({ caseId, account, formatCurrency, t }) {
  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        {t('caseDetails.products.title')}
      </Text>

      <View style={{ 
        backgroundColor: '#1e293b', 
        borderRadius: 10, 
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Package color="#3b82f6" size={20} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
            {account.sourceOfDebt || 'Product Information'}
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>{t('caseDetails.products.contractNumber')}:</Text>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
              {account.contractNumber || 'N/A'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>{t('caseDetails.products.totalAmount')}:</Text>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
              {account.totalAmount ? formatCurrency(account.totalAmount) : 'N/A'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>{t('caseDetails.products.fees')}:</Text>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
              {account.fees ? formatCurrency(account.fees) : '0'}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
        <Package color="#64748b" size={48} />
        <Text style={{ color: '#64748b', fontSize: 14, marginTop: 16, textAlign: 'center' }}>
          {t('caseDetails.products.emptyMsg')}
        </Text>
      </View>
    </View>
  );
}

// Payments Tab Component
function PaymentsTab({ caseId, account, formatCurrency, formatDate, t }) {
  const payments = [
    {
      id: 1,
      amount: account.lastPaymentAmount || '0',
      date: account.lastPaymentDate,
      method: 'N/A',
      status: 'Completed',
    }
  ].filter(p => p.date);

  if (payments.length === 0) {
    return (
      <View>
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          {t('caseDetails.payments.title')}
        </Text>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
          <Receipt color="#64748b" size={48} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
            {t('caseDetails.payments.noPayments')}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
            {t('caseDetails.payments.noPaymentsMsg')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        {t('caseDetails.payments.title')} ({payments.length})
      </Text>

      {payments.map((payment) => (
        <View 
          key={payment.id}
          style={{ 
            backgroundColor: '#1e293b', 
            borderRadius: 10, 
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#334155',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>
              {formatCurrency(payment.amount)}
            </Text>
            <View style={{
              backgroundColor: '#10b98120',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 6,
            }}>
              <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '600' }}>
                {payment.status}
              </Text>
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>{t('common.date')}:</Text>
              <Text style={{ color: '#ffffff', fontSize: 14 }}>
                {formatDate(payment.date)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>{t('caseDetails.payments.method')}:</Text>
              <Text style={{ color: '#ffffff', fontSize: 14 }}>
                {payment.method}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// Documents Tab Component - NOW INCLUDES ALL FILES (IMAGES + DOCUMENTS)
function DocumentsTab({ caseId, t }) {
  const [documents, setDocuments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false); // New State
  const [downloadingIds, setDownloadingIds] = React.useState({});

  React.useEffect(() => {
    fetchDocuments();
  }, [caseId]);

  const fetchDocuments = async () => {
    try {
      const docs = await casesService.getCaseDocuments(caseId);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Camera Logic ---
  const handleLaunchCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) { 
        Alert.alert(t('common.permissionRequired'), "Camera access is needed to take photos."); 
        return; 
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, 
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleUpload(result.assets[0]);
      }
    } catch (error) { 
      console.error("Camera Error:", error);
      Alert.alert(t('common.error'), "Could not open camera."); 
    }
  };

  // --- NEW: Upload Logic ---
  const handleUpload = async (photo) => {
    setUploading(true);
    try {
      // We pass the URI directly to the service
      await casesService.uploadCaseDocument(caseId, photo.uri);

      Alert.alert(t('common.success'), "Document uploaded successfully!");
      
      // Refresh list
      setLoading(true);
      await fetchDocuments();

    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Upload Failed", error.message || "Could not upload document.");
    } finally {
      setUploading(false);
    }
  };

const handleDownload = async (doc) => {
  setDownloadingIds(prev => ({ ...prev, [doc.id]: true }));
  try {
    const token = await authService.getToken();
    if (!token) throw new Error("Unauthorized");

    // 1. Sanitize Filename & Handle Extensions (Logic synced with Task function)
    let fileName = doc.originalName || doc.fileName || `case_doc_${doc.id}`;
    fileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    const hasExtension = fileName.includes('.');
    if (!hasExtension && doc.mimeType) {
      const mimeMap = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg', 'image/png': 'png', 'image/jpg': 'jpg', 'image/webp': 'webp',
        'application/msword': 'doc', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      };
      const ext = mimeMap[doc.mimeType];
      if (ext) fileName += `.${ext}`;
    }

    // Determine if it is an image (Inline check or use your isMediaFile helper if available)
    const isImage = ['jpg', 'png', 'jpeg', 'webp', 'gif', 'bmp', 'heic'].some(
      ext => fileName.toLowerCase().endsWith(ext)
    );

    // 2. Pre-download Permission Check for Images (Android)
    if (isImage && Platform.OS === 'android') {
      try {
        const { status, canAskAgain, granted } = await MediaLibrary.requestPermissionsAsync(
          false,
          ['photo'] // Granular permission
        );

        if (!granted) {
          if (canAskAgain) {
            Alert.alert(
              t('common.permissionRequired'),
              "Gallery permission is needed to save images. Please allow it when prompted.",
              [{ text: "OK" }]
            );
          } else {
            Alert.alert(
              t('common.permissionDenied'),
              "Gallery permission was denied. Please enable it in your device settings to save images.",
              [
                { text: t('common.cancel'), style: "cancel" },
                { text: "Open Settings", onPress: () => Linking.openSettings() }
              ]
            );
          }
          setDownloadingIds(prev => ({ ...prev, [doc.id]: false }));
          return;
        }
      } catch (permError) {
        console.error('Permission error:', permError);
        Alert.alert(t('common.permissionDenied'), "Could not request gallery permission.");
        setDownloadingIds(prev => ({ ...prev, [doc.id]: false }));
        return;
      }
    }

    // 3. Download the file (Using Cases Service)
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    // Ensure caseId is available in scope
    const downloadUrl = casesService.getDocumentDownloadUrl(caseId, doc.id);

    const downloadResumable = FileSystem.createDownloadResumable(
      downloadUrl,
      fileUri,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result || !result.uri) throw new Error("Download failed");

    // 4. Save Logic (Synced with Task function)
    if (isImage) {
      // Image: Save to gallery directly
      try {
        await MediaLibrary.saveToLibraryAsync(result.uri);
        Alert.alert(t('common.success'), "Image saved to your Gallery.");
      } catch (saveError) {
        console.error('Save to gallery error:', saveError);
        Alert.alert("Save Failed", "Could not save image to gallery. Please check app permissions in settings.");
      }
    } else if (Platform.OS === 'android') {
      // 5. Android Document: Show the "Choose Location" Dialog
      Alert.alert(
        "Save File",
        `Save "${fileName}" to your device?`,
        [
          {
            text: t('common.cancel'),
            style: "cancel",
            onPress: () => {
              setDownloadingIds(prev => ({ ...prev, [doc.id]: false }));
            }
          },
          {
            text: "Choose Location",
            onPress: async () => {
              try {
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (permissions.granted) {
                  const base64Data = await FileSystem.readAsStringAsync(result.uri, { encoding: FileSystem.EncodingType.Base64 });
                  const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    fileName,
                    doc.mimeType || 'application/octet-stream'
                  );
                  await FileSystem.writeAsStringAsync(newFileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
                  Alert.alert(t('common.success'), "File saved successfully.");
                } else {
                  Alert.alert("Cancelled", "File save cancelled.");
                }
              } catch (e) {
                console.error('SAF error:', e);
                Alert.alert(t('common.error'), "Could not save file. Please try again.");
              }
              setDownloadingIds(prev => ({ ...prev, [doc.id]: false }));
            }
          }
        ],
        { cancelable: false }
      );
      return; // Return here so we don't hit the finally block immediately if using SAF logic inside callback
    } else {
      // iOS
      await Sharing.shareAsync(result.uri, {
        UTI: doc.mimeType,
        dialogTitle: 'Save File',
        mimeType: doc.mimeType
      });
    }
  } catch (error) {
    console.error('Download error:', error);
    Alert.alert('Download Failed', error.message || 'Could not download file.');
  } finally {
    // Only turn off loading if we aren't waiting for the Android Alert interaction
    if (Platform.OS !== 'android' || isMediaFile(doc.fileName)) { 
        // Note: You might need to adjust logic here. 
        // In the Task function, the `finally` runs, but the Android Alert handles its own state setting inside the callbacks.
        // For safety/simplicity to match your Task code, I will keep the simple finally:
        setDownloadingIds(prev => ({ ...prev, [doc.id]: false }));
    }
  }
};

  const getFileIcon = (fileName) => {
    const ext = fileName?.toLowerCase().split('.').pop();
    switch(ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'txt': return '📃';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'bmp': return '🖼️';
      case 'mp4':
      case 'mov':
      case 'avi': return '🎥';
      default: return '📎';
    }
  };

  const getFileType = (fileName) => {
    const ext = fileName?.toLowerCase().split('.').pop();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    if (imageExts.includes(ext)) return 'Image';
    
    switch(ext) {
      case 'pdf': return 'PDF Document';
      case 'doc':
      case 'docx': return 'Word Document';
      case 'xls':
      case 'xlsx': return 'Excel Spreadsheet';
      case 'txt': return 'Text File';
      case 'mp4':
      case 'mov':
      case 'avi': return 'Video';
      default: return 'File';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

 
 return (
    <View>
       {/* --- NEW: ADD ATTACHMENT BUTTON --- */}
       <TouchableOpacity 
        onPress={handleLaunchCamera} 
        disabled={uploading}
        style={{ 
          backgroundColor: '#3b82f6', 
          borderRadius: 12, 
          paddingVertical: 18, 
          flexDirection: 'row', 
          justifyContent: 'center', 
          alignItems: 'center', 
          marginBottom: 24,
          gap: 12,
          borderWidth: 2,
          borderColor: '#60a5fa',
          shadowColor: '#3b82f6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8
        }}
      >
        {uploading ? (
          <>
            <ActivityIndicator color="#ffffff" size="small" />
            <Text style={{ color: '#ffffff', fontSize: 17, fontWeight: '700' }}>{t('common.uploading')}</Text>
          </>
        ) : (
          <>
            <Camera color="#ffffff" size={28} strokeWidth={2.5} />
            <Text style={{ color: '#ffffff', fontSize: 17, fontWeight: '700' }}>{t('caseDetails.docs.addDocument')}</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        {t('caseDetails.docs.title')} ({documents.length})
      </Text>

      {/* Empty State */}
      {documents.length === 0 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
          <FileText color="#64748b" size={48} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
            {t('caseDetails.docs.noDocs')}
          </Text>
        </View>
      )}

      {/* Documents List */}
      {documents.map((doc, index) => {
        const docName = doc.originalName || doc.fileName || `Document ${index + 1}`;
        return (
          <View
            key={doc.id ? `doc-${doc.id}-${index}` : `doc-index-${index}`}
            style={{ 
              backgroundColor: '#1e293b', 
              borderRadius: 10, 
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#334155',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginRight: 12 }}>
                {getFileIcon(docName)}
              </Text>
              
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '500' }}>
                  {docName}
                </Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
                  {getFileType(docName)}
                  {doc.fileSize && ` • ${formatFileSize(doc.fileSize)}`}
                  {doc.mimeType && !doc.fileSize && ` • ${doc.mimeType}`}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDownload(doc)}
                disabled={downloadingIds[doc.id]}
                style={{
                  backgroundColor: downloadingIds[doc.id] ? '#1e293b' : '#3b82f6',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginLeft: 12,
                }}
                accessibilityLabel={`Download ${docName}`}
                accessibilityRole="button"
              >
                {downloadingIds[doc.id] ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : (
                  <>
                    <Download color="#ffffff" size={16} />
                    <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600' }}>
                      {t('common.download')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Recordings Tab Component
function RecordingsTab({ caseId, formatDate, t }) {
  const [recordings, setRecordings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchRecordings();
  }, [caseId]);

  const fetchRecordings = async () => {
    try {
      const recs = await casesService.getCaseRecordings(caseId);
      setRecordings(recs);
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (recordings.length === 0) {
    return (
      <View>
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          {t('caseDetails.audio.title')}
        </Text>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
          <Mic color="#64748b" size={48} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
            {t('caseDetails.audio.noRecordings')}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
            {t('caseDetails.audio.noRecordingsMsg')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        {t('caseDetails.audio.title')} ({recordings.length})
      </Text>

      {recordings.map((recording, index) => (
        <TouchableOpacity
          key={index}
          style={{ 
            backgroundColor: '#1e293b', 
            borderRadius: 10, 
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#334155',
          }}
          accessibilityLabel={`Recording: ${recording.title || `Call Recording ${index + 1}`}`}
          accessibilityRole="button"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              backgroundColor: '#3b82f620',
              padding: 10,
              borderRadius: 8,
            }}>
              <Mic color="#3b82f6" size={20} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '500' }}>
                {recording.title || `Call Recording #${index + 1}`}
              </Text>
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                {formatDate(recording.date || recording.createdAt)}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#64748b', fontSize: 13 }}>
              {t('caseDetails.audio.duration')}: {recording.duration || '00:00'}
            </Text>
            <View style={{
              backgroundColor: '#3b82f6',
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 6,
            }}>
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                {t('caseDetails.audio.play')}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
