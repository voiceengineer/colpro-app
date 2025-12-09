import React from 'react';
import { View, Text } from 'react-native';
import { User, FileText, CreditCard, TrendingUp } from 'lucide-react-native';

const InfoRow = ({ icon: Icon, label, value, valueColor = '#ffffff' }) => (
  <View style={{ 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  }}>
    <View style={{ 
      width: 40, 
      height: 40, 
      borderRadius: 20, 
      backgroundColor: '#334155',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
    }}>
      <Icon color="#3b82f6" size={20} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 3 }}>
        {label}
      </Text>
      <Text style={{ 
        color: valueColor, 
        fontSize: 15, 
        fontWeight: '600'
      }}>
        {value}
      </Text>
    </View>
  </View>
);

const CaseInfoSection = ({ caseData }) => {
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0';
    return Number(amount).toLocaleString('en-US');
  };

  const pinfl = caseData?.account?.pinfl || caseData?.pinfl || 'Not Available';
  const contractNumber = caseData?.account?.contractNumber || caseData?.contractNumber || 'Not Available';
  const passportNumber = caseData?.account?.passportNumber || caseData?.passportNumber || caseData?.account?.passportInfo || 'Not Available';
  const overdueAmount = caseData?.account?.overdueDebt || caseData?.overdueAmount || caseData?.currentBalance || 0;

  return (
    <>
      <InfoRow icon={User} label="PINFL (National ID)" value={pinfl} />
      <InfoRow icon={FileText} label="Contract Number" value={contractNumber} />
      <InfoRow icon={CreditCard} label="Passport Number" value={passportNumber} />
      <InfoRow 
        icon={TrendingUp} 
        label="Overdue Amount" 
        value={formatCurrency(overdueAmount)}
        valueColor="#ef4444"
      />
    </>
  );
};

export default CaseInfoSection;