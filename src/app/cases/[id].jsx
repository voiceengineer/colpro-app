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
  Package, Receipt, Mic, Copy, CheckCircle,
  Eye, EyeOff, Download,
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { casesService } from '../../lib/services/casesService';
import { authService } from '../../lib/services/authService';

const { width } = Dimensions.get('window');

const TABS = [
  { id: 'info', label: 'Info', icon: User },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'payments', label: 'Payments', icon: Receipt },
  { id: 'documents', label: 'Docs', icon: FileText },
  { id: 'recordings', label: 'Audio', icon: Mic },
];

export default function CaseDetailsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
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
        <Text style={{ color: '#ffffff', fontSize: 18, marginTop: 16 }}>Failed to load case</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#3b82f6', borderRadius: 8 }}
          accessibilityLabel="Go back to cases list"
          accessibilityRole="button"
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#64748b', fontSize: 16, marginTop: 16 }}>Loading case details...</Text>
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
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return 'N/A'; }
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
      Alert.alert('Copied', `${label} copied to clipboard`);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy');
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
                {account.fullName || 'N/A'}
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
              {caseData?.priority || 'N/A'}
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
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>BALANCE</Text>
            <Text 
              style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}
              accessibilityLabel={`Balance: ${formatCurrency(caseData?.currentBalance)}`}
            >
              {formatCurrency(caseData?.currentBalance)}
            </Text>
          </View>
          
          <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>OVERDUE</Text>
            <Text 
              style={{ color: '#ef4444', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}
              accessibilityLabel={`Days overdue: ${caseData?.daysPastDue || '0'}`}
            >
              {caseData?.daysPastDue || '0'} days
            </Text>
          </View>

          <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>STATUS</Text>
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
          />
        )}
        
        {activeTab === 'products' && (
          <ProductsTab caseId={id} account={account} formatCurrency={formatCurrency} />
        )}
        
        {activeTab === 'payments' && (
          <PaymentsTab caseId={id} account={account} formatCurrency={formatCurrency} formatDate={formatDate} />
        )}
        
        {activeTab === 'documents' && (
          <DocumentsTab caseId={id} />
        )}
        
        {activeTab === 'recordings' && (
          <RecordingsTab caseId={id} formatDate={formatDate} />
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
  toggleSensitiveData 
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
        Client Information
      </Text>

      <InfoCard 
        icon={User} 
        label="Full Name" 
        value={account.fullName}
        onCopy={copyToClipboard}
      />

      <InfoCard 
        icon={CreditCard} 
        label="Passport" 
        value={account.passportInfo}
        onCopy={copyToClipboard}
        sensitive={true}
        sensitiveKey="passport"
      />

      <InfoCard 
        icon={CreditCard} 
        label="PINFL" 
        value={account.pinfl}
        onCopy={copyToClipboard}
        sensitive={true}
        sensitiveKey="pinfl"
      />

      <InfoCard 
        icon={Phone} 
        label="Phone Number" 
        value={account.phone1}
        onCopy={copyToClipboard}
        sensitive={true}
        sensitiveKey="phone"
      />

      {account.phone2 && (
        <InfoCard 
          icon={Phone} 
          label="Phone Number 2" 
          value={account.phone2}
          onCopy={copyToClipboard}
          sensitive={true}
          sensitiveKey="phone"
        />
      )}

      <InfoCard 
        icon={MapPin} 
        label="Address" 
        value={account.address || account.region}
      />

      <InfoCard 
        icon={DollarSign} 
        label="Total Amount Due" 
        value={formatCurrency(account.totalDebt || account.totalAmount)}
      />

      <InfoCard 
        icon={DollarSign} 
        label="Overdue Debt" 
        value={formatCurrency(account.overdueDebt)}
      />

      <InfoCard 
        icon={Calendar} 
        label="Days Overdue" 
        value={`${account.daysOverdue || caseData?.daysPastDue || '0'} days`}
      />

      <InfoCard 
        icon={Calendar} 
        label="Last Payment Date" 
        value={formatDate(account.lastPaymentDate || caseData?.lastPaymentDate)}
      />

      <InfoCard 
        icon={DollarSign} 
        label="Last Payment Amount" 
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
            Status
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
              Notes
            </Text>
          </View>
          <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 20 }}>
            {caseData.notes}
          </Text>
        </View>
      )}

      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 16 }}>
        Additional Information
      </Text>

      <InfoCard 
        icon={FileText} 
        label="Contract Number" 
        value={account.contractNumber}
      />

      <InfoCard 
        icon={FileText} 
        label="Customer ID" 
        value={account.customerId}
      />

      <InfoCard 
        icon={Calendar} 
        label="Date of Birth" 
        value={formatDate(account.dateOfBirth)}
      />

      <InfoCard 
        icon={User} 
        label="Age" 
        value={account.age ? `${account.age} years` : 'N/A'}
      />

      <InfoCard 
        icon={MapPin} 
        label="Region" 
        value={account.region}
      />

      <InfoCard 
        icon={FileText} 
        label="Source of Debt" 
        value={account.sourceOfDebt}
      />

      <InfoCard 
        icon={FileText} 
        label="Collection Stage" 
        value={caseData?.collectionStage?.replace(/_/g, ' ').toUpperCase()}
      />

      {agent?.name && (
        <InfoCard 
          icon={User} 
          label="Assigned Agent" 
          value={agent.name}
        />
      )}
    </View>
  );
}

// Products Tab Component
function ProductsTab({ caseId, account, formatCurrency }) {
  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Products
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
            <Text style={{ color: '#64748b', fontSize: 14 }}>Contract Number:</Text>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
              {account.contractNumber || 'N/A'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>Total Amount:</Text>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
              {account.totalAmount ? formatCurrency(account.totalAmount) : 'N/A'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>Fees:</Text>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
              {account.fees ? formatCurrency(account.fees) : '0'}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
        <Package color="#64748b" size={48} />
        <Text style={{ color: '#64748b', fontSize: 14, marginTop: 16, textAlign: 'center' }}>
          Detailed product information will be displayed here
        </Text>
      </View>
    </View>
  );
}

// Payments Tab Component
function PaymentsTab({ caseId, account, formatCurrency, formatDate }) {
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
          Payment History
        </Text>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
          <Receipt color="#64748b" size={48} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
            No Payments
          </Text>
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
            No payment records found for this case
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Payment History ({payments.length})
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
              <Text style={{ color: '#64748b', fontSize: 14 }}>Date:</Text>
              <Text style={{ color: '#ffffff', fontSize: 14 }}>
                {formatDate(payment.date)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748b', fontSize: 14 }}>Method:</Text>
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
function DocumentsTab({ caseId }) {
  const [documents, setDocuments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [downloadingIds, setDownloadingIds] = React.useState({});

  React.useEffect(() => {
    fetchDocuments();
  }, [caseId]);

  const fetchDocuments = async () => {
    try {
      const docs = await casesService.getCaseDocuments(caseId);
      // Now we show ALL documents (including images)
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = async (doc) => {
    setDownloadingIds(prev => ({ ...prev, [doc.id]: true }));

    try {
        const token = await authService.getToken();
        if (!token) throw new Error("Unauthorized");

        // --- FIX IS HERE ---
        if (Platform.OS === 'android') {
            // Pass 'true' (boolean) for write-only permission. 
            // Do NOT pass an object like { writeOnly: true }.
            const { status } = await MediaLibrary.requestPermissionsAsync(true);
            
            if (status !== 'granted') {
                Alert.alert("Permission needed", "We need access to save this file.");
                setDownloadingIds(prev => ({ ...prev, [doc.id]: false }));
                return;
            }
        }
        // -------------------

        let fileName = doc.originalName || doc.fileName || `document_${doc.id}`;
        fileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        
        const hasExtension = fileName.includes('.');
        if (!hasExtension && doc.mimeType) {
            const mimeMap = {
                'application/pdf': 'pdf',
                'image/jpeg': 'jpg', 'image/png': 'png',
                'application/msword': 'doc', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
                'application/vnd.ms-excel': 'xls', 
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            };
            const ext = mimeMap[doc.mimeType];
            if (ext) fileName += `.${ext}`;
        }

        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        const downloadUrl = casesService.getDocumentDownloadUrl(caseId, doc.id);

        const downloadResumable = FileSystem.createDownloadResumable(
            downloadUrl,
            fileUri,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        const result = await downloadResumable.downloadAsync();
        if (!result || !result.uri) throw new Error("Download failed");

        // Handle Saving based on Type
        const isImageOrVideo = ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'webp'].some(ext => fileName.toLowerCase().endsWith(ext));

        if (isImageOrVideo) {
            await MediaLibrary.saveToLibraryAsync(result.uri);
            Alert.alert("Saved!", "Image saved to your Gallery.");
        } 
        else if (Platform.OS === 'android') {
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
                    Alert.alert("Success", "File saved to selected folder.");
                } else {
                    await Sharing.shareAsync(result.uri);
                }
            } catch (e) {
                await Sharing.shareAsync(result.uri);
            }
        } 
        else {
            await Sharing.shareAsync(result.uri, { UTI: doc.mimeType, dialogTitle: fileName });
        }

    } catch (error) {
        console.error('Download error:', error);
        Alert.alert('Error', 'Failed to download document.');
    } finally {
        setDownloadingIds(prev => ({ ...prev, [doc.id]: false }));
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

  if (documents.length === 0) {
    return (
      <View>
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Documents & Files
        </Text>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
          <FileText color="#64748b" size={48} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
            No Documents
          </Text>
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
            No documents or files have been uploaded for this case
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Documents & Files ({documents.length})
      </Text>

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
                      Download
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
function RecordingsTab({ caseId, formatDate }) {
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
          Call Recordings
        </Text>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
          <Mic color="#64748b" size={48} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
            No Recordings
          </Text>
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
            No call recordings available for this case
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Call Recordings ({recordings.length})
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
              Duration: {recording.duration || '00:00'}
            </Text>
            <View style={{
              backgroundColor: '#3b82f6',
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 6,
            }}>
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                Play
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}