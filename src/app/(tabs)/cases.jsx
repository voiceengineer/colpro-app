import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, 
  TextInput, RefreshControl, Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Search, Briefcase, Calendar, DollarSign, AlertCircle, User, Phone } from 'lucide-react-native';
import { authService } from '../../lib/auth';
import { useAuth } from '../../lib/authContext';

export default function Cases() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchCases(1, true);
    }
  }, [user?.id, search]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setPage(1);
        setCases([]);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  const fetchCases = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const params = { 
        page: pageNum, 
        limit: 20
      };
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const response = await authService.getCases(params);
      
      let casesData = [];
      let totalPages = 1;
      
      if (response?.items && Array.isArray(response.items)) {
        casesData = response.items;
        totalPages = response.meta?.totalPages || 1;
      } else if (Array.isArray(response)) {
        casesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        casesData = response.data;
        totalPages = response.meta?.totalPages || 1;
      }
      
      if (reset || pageNum === 1) {
        setCases(casesData);
      } else {
        setCases(prev => [...prev, ...casesData]);
      }
      
      setHasMore(pageNum < totalPages);
      setPage(pageNum);
      
    } catch (error) {
      console.error('Error fetching cases:', error);
      
      if (error.message === 'UNAUTHORIZED') {
        Alert.alert('Session Expired', 'Please login again');
        router.replace('/login');
        return;
      }
      
      if (error.message.includes('FORBIDDEN')) {
        Alert.alert('Permission Denied', 'You do not have permission to view cases');
        return;
      }
      
      Alert.alert('Error', `Failed to load cases: ${error.message}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchCases(1, true);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      fetchCases(page + 1, false);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0';
    return amount.toLocaleString('en-US');
  };

  const SkeletonCard = () => (
    <View style={{
      backgroundColor: '#1e293b',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#334155',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ backgroundColor: '#334155', width: 100, height: 20, borderRadius: 4 }} />
        <View style={{ backgroundColor: '#334155', width: 60, height: 20, borderRadius: 4 }} />
      </View>
      <View style={{ backgroundColor: '#334155', width: '80%', height: 16, borderRadius: 4, marginBottom: 8 }} />
      <View style={{ backgroundColor: '#334155', width: '60%', height: 14, borderRadius: 4, marginBottom: 12 }} />
      <View style={{ backgroundColor: '#334155', width: '100%', height: 14, borderRadius: 4, marginBottom: 6 }} />
      <View style={{ backgroundColor: '#334155', width: '90%', height: 14, borderRadius: 4 }} />
    </View>
  );

  const CaseCard = ({ item }) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Briefcase color="#3b82f6" size={18} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
            Case #{item.id}
          </Text>
        </View>
        
        <View style={{
          backgroundColor: `${getPriorityColor(item.priority)}20`,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 6,
        }}>
          <Text style={{ 
            color: getPriorityColor(item.priority), 
            fontSize: 12, 
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            {item.priority || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 12 }}>
        {item.debtorName && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <User color="#64748b" size={16} />
            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '500', marginLeft: 6 }}>
              {item.debtorName}
            </Text>
          </View>
        )}
        
        {item.accountNumber && (
          <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 22 }}>
            Account: {item.accountNumber}
          </Text>
        )}
        
        {item.debtorPhone && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Phone color="#64748b" size={14} />
            <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 6 }}>
              {item.debtorPhone}
            </Text>
          </View>
        )}
      </View>

      <View style={{ gap: 8, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <DollarSign color="#64748b" size={16} />
          <Text style={{ color: '#64748b', fontSize: 13, marginLeft: 6 }}>
            Balance: 
          </Text>
          <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '500', marginLeft: 4 }}>
            {formatCurrency(item.currentBalance || item.totalAmountDue)}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AlertCircle color="#64748b" size={16} />
          <Text style={{ color: '#64748b', fontSize: 13, marginLeft: 6 }}>
            Days Overdue: 
          </Text>
          <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '600', marginLeft: 4 }}>
            {item.daysPastDue || item.daysOverdue || '0'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Calendar color="#64748b" size={16} />
          <Text style={{ color: '#64748b', fontSize: 13, marginLeft: 6 }}>
            Last Payment: 
          </Text>
          <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '500', marginLeft: 4 }}>
            {formatDate(item.lastPaymentDate)}
          </Text>
        </View>
      </View>

      <View style={{ 
        paddingTop: 12, 
        borderTopWidth: 1, 
        borderTopColor: '#334155',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {item.collectionStage && (
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#64748b', fontSize: 12 }}>
              Stage: <Text style={{ color: '#3b82f6', fontWeight: '500' }}>
                {item.collectionStage.replace(/_/g, ' ').toUpperCase()}
              </Text>
            </Text>
          </View>
        )}
        
        {item.status?.description && (
          <View style={{
            backgroundColor: item.status.color ? `${item.status.color}20` : '#64748b20',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}>
            <Text style={{ 
              color: item.status.color || '#64748b', 
              fontSize: 11, 
              fontWeight: '600' 
            }}>
              {item.status.description}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
        <Briefcase color="#64748b" size={48} />
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '600', marginTop: 16 }}>
          No Cases Found
        </Text>
        <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
          {search ? 'Try a different search term' : 'No cases available'}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />
      
      <View style={{ 
        paddingTop: insets.top + 24, 
        paddingHorizontal: 24, 
        paddingBottom: 16 
      }}>
        <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>
          Cases
        </Text>

        <View style={{
          backgroundColor: '#1e293b',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#334155',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}>
          <Search color="#64748b" size={20} />
          <TextInput
            style={{
              flex: 1,
              color: '#ffffff',
              fontSize: 15,
              paddingVertical: 12,
              marginLeft: 12,
            }}
            placeholder="Search by name, account, or ID..."
            placeholderTextColor="#64748b"
            value={searchInput}
            onChangeText={setSearchInput}
            returnKeyType="search"
          />
        </View>
      </View>

      {loading && page === 1 ? (
        <View style={{ paddingHorizontal: 24 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={cases}
          renderItem={({ item }) => <CaseCard item={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ 
            paddingHorizontal: 24, 
            paddingBottom: insets.bottom + 24 
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
}