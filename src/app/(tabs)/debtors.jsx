import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Filter, Plus, User, Phone, DollarSign,
  ChevronRight, Users, Activity
} from 'lucide-react-native';
import { debtorsService } from '../../lib/services/debtorsService';
import { useDebounce } from '../../hooks/useDebounce';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = (date) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active': return '#10b981';
    case 'overdue': return '#ef4444';
    case 'paid': return '#3b82f6';
    case 'defaulted': return '#7c3aed';
    default: return '#6b7280';
  }
};

const StatusBadge = ({ status }) => (
  <View style={{
    backgroundColor: getStatusColor(status) + '20',
    borderColor: getStatusColor(status),
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  }}>
    <Text style={{
      color: getStatusColor(status),
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase'
    }}>{status}</Text>
  </View>
);

const DebtorItem = React.memo(({ debtor, onSelect }) => (
  <TouchableOpacity
    onPress={() => onSelect(debtor.id)}
    style={{
      backgroundColor: '#1e293b',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#334155',
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    <View style={{ backgroundColor: '#334155', borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
      <User color="#94a3b8" size={20} />
    </View>
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', flex: 1 }} numberOfLines={1}>{debtor.full_name}</Text>
        <StatusBadge status={debtor.status} />
      </View>
      <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>PINFL: {debtor.pinfl}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <DollarSign color="#ef4444" size={14} />
          <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: 'bold', marginLeft: 4 }}>
            {formatCurrency(debtor.total_amount)}
          </Text>
        </View>
        {debtor.phone && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Phone color="#64748b" size={12} />
            <Text style={{ color: '#94a3b8', fontSize: 12, marginLeft: 4 }}>{debtor.phone?.slice(-4)}</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Calendar color="#64748b" size={12} />
          <Text style={{ color: '#94a3b8', fontSize: 12, marginLeft: 4 }}>{formatDate(debtor.last_payment_date)}</Text>
        </View>
      </View>
    </View>
    <ChevronRight color="#64748b" size={20} />
  </TouchableOpacity>
));

const FilterButton = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: isActive ? '#3b82f6' : '#334155',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginRight: 8,
    }}
  >
    <Text style={{ color: isActive ? '#ffffff' : '#94a3b8', fontSize: 12, fontWeight: isActive ? '600' : '500' }}>{label}</Text>
  </TouchableOpacity>
);

export default function Debtors() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: debtors = [], isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: ['debtors', debouncedSearchQuery, filterStatus],
    queryFn: () => debtorsService.getDebtors({ search: debouncedSearchQuery, status: filterStatus }),
    onError: (err) => {
      if (err.message === 'UNAUTHORIZED') {
        Alert.alert('Session Expired', 'Please login again', [{ text: 'OK', onPress: () => router.replace('/login') }]);
      } else {
        Alert.alert('Error', 'Failed to fetch debtors.');
      }
    },
  });

  const totalDebt = useMemo(() => 
    debtors.reduce((sum, debtor) => sum + parseFloat(debtor.total_amount || 0), 0),
    [debtors]
  );

  const onRefresh = () => {
    refetch();
  };

  const EmptyState = () => (
    <View style={{ alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 }}>
      <Users color="#64748b" size={48} />
      <Text style={{ color: '#94a3b8', fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
        {debouncedSearchQuery ? 'No debtors found' : 'No debtors yet'}
      </Text>
      <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
        {debouncedSearchQuery ? 'Try adjusting your search or filters' : 'Add your first debtor to get started'}
      </Text>
    </View>
  );

  const LoadingState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 64 }}>
      <Activity color="#3b82f6" size={32} />
      <Text style={{ color: '#94a3b8', marginTop: 16 }}>Loading debtors...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold' }}>Debtors</Text>
          <TouchableOpacity style={{ backgroundColor: '#3b82f6', borderRadius: 8, padding: 8 }}>
            <Plus color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: '#334155', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
          <Search color="#94a3b8" size={18} />
          <TextInput
            style={{ flex: 1, color: '#ffffff', fontSize: 16, marginLeft: 12 }}
            placeholder="Search by name, PINFL, or phone"
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Status Filters */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton label="All" isActive={filterStatus === ''} onPress={() => setFilterStatus('')} />
          <FilterButton label="Active" isActive={filterStatus === 'active'} onPress={() => setFilterStatus('active')} />
          <FilterButton label="Overdue" isActive={filterStatus === 'overdue'} onPress={() => setFilterStatus('overdue')} />
          <FilterButton label="Paid" isActive={filterStatus === 'paid'} onPress={() => setFilterStatus('paid')} />
          <FilterButton label="Defaulted" isActive={filterStatus === 'defaulted'} onPress={() => setFilterStatus('defaulted')} />
        </ScrollView>
      </View>

      {/* Summary Stats */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <View style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#334155' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Users color="#3b82f6" size={16} />
              <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>{debtors.length}</Text>
              <Text style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>Total Debtors</Text>
            </View>
            <View style={{ width: 1, backgroundColor: '#334155', marginHorizontal: 16 }} />
            <View style={{ alignItems: 'center', flex: 1 }}>
              <DollarSign color="#ef4444" size={16} />
              <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>{formatCurrency(totalDebt)}</Text>
              <Text style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>Total Debt</Text>
            </View>
          </View>
        </View>
      </View>

      {isLoading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={debtors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <DebtorItem debtor={item} onSelect={(id) => router.push(`/(tabs)/debtor/${id}`)} />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isLoading}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
            />
          }
        />
      )}
    </View>
  );
}