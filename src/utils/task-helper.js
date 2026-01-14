// Color helpers
export const getPriorityColor = (priority) => {
  const p = priority?.toLowerCase();
  switch(p) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#64748b';
  }
};

export const getStatusColor = (status) => {
  const s = status?.toLowerCase();
  switch(s) {
    case 'completed': return '#10b981';
    case 'pending': return '#f59e0b';
    case 'in_progress': return '#3b82f6';
    case 'cancelled': return '#ef4444';
    default: return '#64748b';
  }
};

export const getPaymentStatusColor = (status) => {
  const s = status?.toLowerCase();
  switch(s) {
    case 'completed': return '#10b981';
    case 'pending': return '#f59e0b';
    case 'failed': return '#ef4444';
    case 'refunded': return '#64748b';
    default: return '#64748b';
  }
};

// Format helpers
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0';
  return Number(amount).toLocaleString('en-US');
};

export const formatDate = (dateString) => {
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

export const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  try {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  } catch { 
    return 'N/A'; 
  }
};

// File helpers
export const isMediaFile = (fileName) => {
  if (!fileName) return false;
  const ext = fileName.split('.').pop().toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov'].includes(ext);
};

export const getFileIcon = (fileName) => {
  const ext = fileName?.toLowerCase().split('.').pop();
  switch(ext) {
    case 'pdf': return '📄';
    case 'doc': case 'docx': return '📝';
    case 'xls': case 'xlsx': return '📊';
    case 'jpg': case 'jpeg': case 'png': return '🖼️';
    default: return '📎';
  }
};

// Constants
export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'partial_payment', label: 'Частичная оплата' },
  { value: 'aggression', label: 'Агрессия' },
  { value: 'ptp', label: 'Обещания (PTP)' },
  { value: 'skip_trace', label: 'Скипт (skipt trace)' }
];

export const PAYMENT_METHODS = [
  { value: 1, label: 'Bank Transfer' },
  { value: 2, label: 'Cash' },
  { value: 3, label: 'Credit Card' },
  { value: 4, label: 'Debit Card' },
  { value: 5, label: 'Mobile Payment' },
  { value: 6, label: 'Cheque' }
];

export const getPaymentMethodLabel = (methodId) => {
  const method = PAYMENT_METHODS.find(m => m.value === methodId);
  return method?.label || `Method ${methodId}`;
};

// Phone call helper
export const makePhoneCall = async (phoneNumber) => {
  const { Linking, Alert, Platform } = require('react-native');
  
  if (!phoneNumber) {
    Alert.alert('Error', 'No phone number available');
    return;
  }

  // Clean phone number (remove spaces, dashes, etc)
  const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
  
  // Create phone URL
  const phoneUrl = Platform.OS === 'ios' ? `telprompt:${cleanNumber}` : `tel:${cleanNumber}`;

  try {
    const supported = await Linking.canOpenURL(phoneUrl);
    
    if (supported) {
      await Linking.openURL(phoneUrl);
    } else {
      Alert.alert('Error', 'Phone calls are not supported on this device');
    }
  } catch (error) {
    console.error('Phone call error:', error);
    Alert.alert('Error', 'Could not make phone call');
  }
};