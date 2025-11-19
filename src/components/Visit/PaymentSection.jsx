import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DollarSign } from 'lucide-react-native';
import { formatCurrency } from '@/utils/visitHelpers';

export function PaymentSection({
  paymentAmount,
  paymentMethod,
  paymentNotes,
  onRecordPayment,
}) {
  return (
    <View
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
      }}
    >
      <Text
        style={{
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 12,
        }}
      >
        Payment Collection
      </Text>

      {paymentAmount ? (
        <View
          style={{
            backgroundColor: '#334155',
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text
            style={{ color: '#10b981', fontSize: 16, fontWeight: 'bold' }}
          >
            {formatCurrency(parseFloat(paymentAmount))} collected
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>
            Method: {paymentMethod} • {paymentNotes || 'No notes'}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        onPress={onRecordPayment}
        style={{
          backgroundColor: '#10b981',
          borderRadius: 8,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <DollarSign color="#ffffff" size={16} />
        <Text
          style={{
            color: '#ffffff',
            fontSize: 14,
            fontWeight: '600',
            marginLeft: 8,
          }}
        >
          {paymentAmount ? 'Update Payment' : 'Record Payment'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
