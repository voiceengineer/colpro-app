import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DollarSign, ChevronDown, AlertCircle } from 'lucide-react-native';

const PaymentHistorySection = ({ 
  payments, 
  expanded, 
  onToggle 
}) => {
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

  return (
    <>
      <TouchableOpacity
        onPress={onToggle}
        style={{
          backgroundColor: '#1e293b',
          borderRadius: 10,
          padding: 16,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: '#334155',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
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
            <DollarSign color="#3b82f6" size={20} />
          </View>
          <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
            Payment History ({payments.length})
          </Text>
        </View>
        <ChevronDown 
          color="#64748b" 
          size={20}
          style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {expanded && (
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
              <Text style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
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
    </>
  );
};

export default PaymentHistorySection;