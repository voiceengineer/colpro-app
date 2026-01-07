import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  ActivityIndicator, Alert, Image, Dimensions, RefreshControl,
  Modal, FlatList
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  ArrowLeft, User, Phone, MapPin, Calendar, 
  DollarSign, AlertCircle, FileText, Package,
  Copy, CheckCircle, Eye, EyeOff, X, Download,
  Clock, ClipboardList
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { tasksService } from '../../lib/services/tasksService';
import { casesService } from '../../lib/services/casesService';

const { width } = Dimensions.get('window');

const TABS = [
  { id: 'info', label: 'Info', icon: User },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'documents', label: 'Docs', icon: FileText },
];

export default function TaskDetailsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [activeTab, setActiveTab] = useState('info');
  const [refreshing, setRefreshing] = useState(false);
  const [sensitiveDataVisible, setSensitiveDataVisible] = useState({
    phone: false,
    address: false,
  });

  const { data: taskData, isLoading, error, refetch } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksService.getTaskById(id),
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
        <Text style={{ color: '#ffffff', fontSize: 18, marginTop: 16 }}>Failed to load task</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#3b82f6', borderRadius: 8 }}
          accessibilityLabel="Go back to tasks list"
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
        <Text style={{ color: '#64748b', fontSize: 16, marginTop: 16 }}>Loading task details...</Text>
      </View>
    );
  }

  const agent = taskData?.agent || {};

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

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
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

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch(s) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'cancelled': return '#ef4444';
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
                Task #{taskData?.id}
              </Text>
              <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                {taskData?.debtorName || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={{
            backgroundColor: `${getPriorityColor(taskData?.priority)}20`,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
          }}
          accessibilityLabel={`Priority: ${taskData?.priority || 'Unknown'}`}
          accessibilityRole="text"
          >
            <Text style={{ 
              color: getPriorityColor(taskData?.priority), 
              fontSize: 12, 
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              {taskData?.priority || 'N/A'}
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
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>EXPECTED</Text>
            <Text 
              style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}
              accessibilityLabel={`Expected amount: ${formatCurrency(taskData?.expectedAmount)}`}
            >
              {formatCurrency(taskData?.expectedAmount)}
            </Text>
          </View>
          
          <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>COLLECTED</Text>
            <Text 
              style={{ color: '#10b981', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}
              accessibilityLabel={`Collected amount: ${formatCurrency(taskData?.actualAmountCollected || 0)}`}
            >
              {formatCurrency(taskData?.actualAmountCollected || 0)}
            </Text>
          </View>

          <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>STATUS</Text>
            <Text 
              style={{ 
                color: getStatusColor(taskData?.status), 
                fontSize: 13, 
                fontWeight: 'bold', 
                marginTop: 4,
                textTransform: 'uppercase'
              }}
              accessibilityLabel={`Status: ${taskData?.status || 'Unknown'}`}
            >
              {taskData?.status?.replace(/_/g, ' ') || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
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
          <TaskInfoTab 
            taskData={taskData}
            agent={agent}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            formatTime={formatTime}
            copyToClipboard={copyToClipboard}
            sensitiveDataVisible={sensitiveDataVisible}
            toggleSensitiveData={toggleSensitiveData}
          />
        )}
        
        {activeTab === 'products' && (
          <ProductsTab caseId={taskData?.caseId} formatCurrency={formatCurrency} />
        )}
        
        {activeTab === 'documents' && (
          <DocumentsTab taskId={id} />
        )}
      </ScrollView>
    </View>
  );
}

// Task Info Tab Component
function TaskInfoTab({ 
  taskData, 
  agent, 
  formatCurrency, 
  formatDate, 
  formatTime,
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
        Task Information
      </Text>

      <InfoCard 
        icon={User} 
        label="Debtor Name" 
        value={taskData.debtorName}
        onCopy={copyToClipboard}
      />

      <InfoCard 
        icon={Phone} 
        label="Phone Number" 
        value={taskData.debtorPhone}
        onCopy={copyToClipboard}
        sensitive={true}
        sensitiveKey="phone"
      />

      <InfoCard 
        icon={MapPin} 
        label="Address" 
        value={taskData.debtorAddress || taskData.address}
        sensitive={true}
        sensitiveKey="address"
      />

      <InfoCard 
        icon={Calendar} 
        label="Scheduled Date" 
        value={formatDate(taskData.scheduledDate)}
      />

      <InfoCard 
        icon={Clock} 
        label="Scheduled Time" 
        value={formatTime(taskData.scheduledTime)}
      />

      <InfoCard 
        icon={DollarSign} 
        label="Expected Amount" 
        value={formatCurrency(taskData.expectedAmount)}
      />

      <InfoCard 
        icon={DollarSign} 
        label="Amount Collected" 
        value={formatCurrency(taskData.actualAmountCollected || 0)}
      />

      <InfoCard 
        icon={Clock} 
        label="Estimated Duration" 
        value={taskData.estimatedDuration ? `${taskData.estimatedDuration} mins` : 'N/A'}
      />

      {taskData.actualDuration && (
        <InfoCard 
          icon={Clock} 
          label="Actual Duration" 
          value={`${taskData.actualDuration} mins`}
        />
      )}

      <InfoCard 
        icon={ClipboardList} 
        label="Visit Type" 
        value={taskData.visitType ? taskData.visitType.replace(/_/g, ' ').toUpperCase() : 'N/A'}
      />

      <InfoCard 
        icon={CheckCircle} 
        label="Status" 
        value={taskData.status ? taskData.status.replace(/_/g, ' ').toUpperCase() : 'N/A'}
      />

      {taskData.instructions && (
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
              Instructions
            </Text>
          </View>
          <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 20 }}>
            {taskData.instructions}
          </Text>
        </View>
      )}

      {taskData.notes && (
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
            {taskData.notes}
          </Text>
        </View>
      )}

      {taskData.outcome && (
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
              Outcome
            </Text>
          </View>
          <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 20 }}>
            {taskData.outcome}
          </Text>
        </View>
      )}

      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 16 }}>
        Timing Information
      </Text>

      {taskData.actualStartTime && (
        <InfoCard 
          icon={Clock} 
          label="Start Time" 
          value={formatTime(taskData.actualStartTime)}
        />
      )}

      {taskData.actualEndTime && (
        <InfoCard 
          icon={Clock} 
          label="End Time" 
          value={formatTime(taskData.actualEndTime)}
        />
      )}

      <InfoCard 
        icon={Calendar} 
        label="Created Date" 
        value={formatDate(taskData.createdDate)}
      />

      <InfoCard 
        icon={Calendar} 
        label="Last Updated" 
        value={formatDate(taskData.updatedDate)}
      />

      {agent?.name && (
        <View>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 16 }}>
            Assigned Agent
          </Text>

          <InfoCard 
            icon={User} 
            label="Agent Name" 
            value={agent.name}
          />

          {agent.phoneNumber && (
            <InfoCard 
              icon={Phone} 
              label="Agent Phone" 
              value={agent.phoneNumber}
            />
          )}

          {agent.staffNo && (
            <InfoCard 
              icon={FileText} 
              label="Staff Number" 
              value={agent.staffNo}
            />
          )}
        </View>
      )}
    </View>
  );
}

// Products Tab Component
function ProductsTab({ caseId, formatCurrency }) {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['case-products', caseId],
    queryFn: () => casesService.getCaseProducts(caseId),
    enabled: !!caseId,
  });

  if (!caseId) {
    return (
      <View>
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Products
        </Text>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
          <Package color="#64748b" size={48} />
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 16, textAlign: 'center' }}>
            No case ID associated with this task
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#64748b', fontSize: 14, marginTop: 16 }}>Loading products...</Text>
      </View>
    );
  }

  if (error || !products || (Array.isArray(products) && products.length === 0)) {
    return (
      <View>
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Products
        </Text>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
          <Package color="#64748b" size={48} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
            No Products
          </Text>
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
            No products found for this case
          </Text>
        </View>
      </View>
    );
  }

  const productList = Array.isArray(products) ? products : [products];

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Products ({productList.length})
      </Text>

      {productList.map((product, index) => (
        <View 
          key={product.id || index}
          style={{ 
            backgroundColor: '#1e293b', 
            borderRadius: 10, 
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#334155',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Package color="#3b82f6" size={20} />
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
              {product.name || product.productName || product.sourceOfDebt || 'Product'}
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            {product.contractNumber && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#64748b', fontSize: 14 }}>Contract Number:</Text>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
                  {product.contractNumber}
                </Text>
              </View>
            )}

            {product.totalAmount !== undefined && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#64748b', fontSize: 14 }}>Total Amount:</Text>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
                  {formatCurrency(product.totalAmount)}
                </Text>
              </View>
            )}

            {product.fees !== undefined && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#64748b', fontSize: 14 }}>Fees:</Text>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
                  {formatCurrency(product.fees)}
                </Text>
              </View>
            )}

            {product.description && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>Description:</Text>
                <Text style={{ color: '#ffffff', fontSize: 13, lineHeight: 18 }}>
                  {product.description}
                </Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// Documents Tab Component - Now shows both documents and photos
function DocumentsTab({ taskId }) {
  const [allFiles, setAllFiles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [previewFile, setPreviewFile] = React.useState(null);
  const [loadingPreview, setLoadingPreview] = React.useState(false);

  React.useEffect(() => {
    fetchAllFiles();
  }, [taskId]);

  const fetchAllFiles = async () => {
    try {
      const docs = await tasksService.getTaskAttachments(taskId);
      // Show all files - both documents and images
      const fileList = Array.isArray(docs) ? docs : [];
      setAllFiles(fileList);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const isImageFile = (fileName) => {
    const ext = fileName?.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
  };

  const handleFilePress = async (file) => {
    setLoadingPreview(true);
    try {
      const details = await tasksService.getAttachmentDetails(taskId, file.id);
      setPreviewFile({ ...file, ...details, isImage: isImageFile(file.name) });
    } catch (error) {
      Alert.alert('Error', 'Failed to load file preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return '🖼️';
    switch(ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'txt': return '📃';
      default: return '📎';
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (allFiles.length === 0) {
    return (
      <View>
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Documents & Photos
        </Text>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
          <FileText color="#64748b" size={48} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
            No Files
          </Text>
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
            No documents or photos have been uploaded for this task
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Documents & Photos ({allFiles.length})
      </Text>

      {allFiles.map((file, index) => {
        const isImage = isImageFile(file.name);
        return (
          <TouchableOpacity
            key={file.id || index}
            onPress={() => handleFilePress(file)}
            style={{ 
              backgroundColor: '#1e293b', 
              borderRadius: 10, 
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#334155',
              flexDirection: 'row',
              alignItems: 'center',
            }}
            accessibilityLabel={`${isImage ? 'Photo' : 'Document'}: ${file.name || `File ${index + 1}`}`}
            accessibilityRole="button"
          >
            <Text style={{ fontSize: 32, marginRight: 12 }}>
              {getFileIcon(file.name)}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '500' }}>
                {file.name || `File ${index + 1}`}
              </Text>
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                {isImage ? 'Image' : (file.type || file.mimeType || 'Document')} {file.size ? `• ${file.size}` : ''}
              </Text>
            </View>
            {isImage ? (
              <Eye color="#3b82f6" size={20} />
            ) : (
              <Download color="#3b82f6" size={20} />
            )}
          </TouchableOpacity>
        );
      })}

      {/* File Preview Modal */}
      <Modal
        visible={!!previewFile}
        transparent={true}
        animationType="fade"
        onRequestClose={closePreview}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.95)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{ 
            position: 'absolute',
            top: 40,
            right: 20,
            zIndex: 10
          }}>
            <TouchableOpacity
              onPress={closePreview}
              style={{
                backgroundColor: '#1e293b',
                padding: 12,
                borderRadius: 8,
              }}
              accessibilityLabel="Close preview"
              accessibilityRole="button"
            >
              <X color="#ffffff" size={24} />
            </TouchableOpacity>
          </View>

          {loadingPreview ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : previewFile?.isImage && previewFile?.url ? (
            <ScrollView
              contentContainerStyle={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 80,
              }}
              maximumZoomScale={3}
              minimumZoomScale={1}
            >
              <Image
                source={{ uri: previewFile.url }}
                style={{ 
                  width: width - 40,
                  height: width - 40,
                }}
                resizeMode="contain"
              />
              <Text style={{ 
                color: '#ffffff', 
                fontSize: 14, 
                marginTop: 20,
                textAlign: 'center'
              }}>
                {previewFile.name}
              </Text>
            </ScrollView>
          ) : (
            <View style={{ width: '90%', height: '80%', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#ffffff', fontSize: 16, marginBottom: 20 }}>
                {previewFile?.name}
              </Text>
              <Text style={{ color: '#64748b', fontSize: 14 }}>
                Document preview not available
              </Text>
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
                Please download the file to view
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}