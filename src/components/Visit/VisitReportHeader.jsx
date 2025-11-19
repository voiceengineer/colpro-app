import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Eye } from 'lucide-react-native';
import { formatCurrency } from '@/utils/visitHelpers';

export function VisitReportHeader({
  insets,
  debtorInfo,
  onBack,
  onViewJobsheet,
}) {
  return (
    <View
      style={{
        paddingTop: insets.top + 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#1e293b',
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <TouchableOpacity onPress={onBack}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>
          Visit Report
        </Text>
        <TouchableOpacity
          onPress={onViewJobsheet}
          style={{
            backgroundColor: '#334155',
            borderRadius: 8,
            padding: 8,
          }}
        >
          <Eye color="#ffffff" size={16} />
        </TouchableOpacity>
      </View>

      {/* Debtor Info */}
      <View
        style={{ backgroundColor: '#334155', borderRadius: 8, padding: 12 }}
      >
        <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
          {debtorInfo.name}
        </Text>
        <Text style={{ color: '#94a3b8', fontSize: 12 }}>
          {debtorInfo.address} •{' '}
          {formatCurrency(debtorInfo.remainingAmount)} remaining
        </Text>
      </View>
    </View>
  );
}
