import React, { useState, useMemo } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, 
  TextInput, RefreshControl, Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  Search, ClipboardList, Calendar, DollarSign, 
  AlertCircle, User, Phone, Copy, MapPin, Clock 
} from 'lucide-react-native';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { tasksService } from '../../lib/services/tasksService';
import { useAuth } from '../../lib/authContext';
import { useDebounce } from '../../hooks/useDebounce';

const TaskCard = React.memo(({ item, onPress }) => {
  const router = useRouter();

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

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0';
    return Number(amount).toLocaleString('en-US');
  };

  const handleCopyData = async () => {
    const taskData = `
Task #${item.id}
Priority: ${item.priority || 'N/A'}
Status: ${item.status || 'N/A'}
Debtor: ${item.debtorName || 'N/A'}
Phone: ${item.debtorPhone || 'N/A'}
Address: ${item.debtorAddress || 'N/A'}
Scheduled Date: ${formatDate(item.scheduledDate)}
Scheduled Time: ${formatTime(item.scheduledTime)}
Expected Amount: ${formatCurrency(item.expectedAmount)}
Visit Type: ${item.visitType || 'N/A'}
Assigned Agent: ${item.assignedAgent || 'N/A'}
    `.trim();

    try {
      await Clipboard.setStringAsync(taskData);
      Alert.alert('Copied', 'Task data copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy task data');
    }
  };

  const handlePress = () => {
    router.push(`/tasks/${item.id}`);
  };
  
  return (
    <TouchableOpacity
      onPress={handlePress}
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
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <ClipboardList color="#3b82f6" size={18} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
            Task #{item.id}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={handleCopyData}
            style={{
              padding: 6,
              borderRadius: 6,
              backgroundColor: '#334155',
            }}
          >
            <Copy color="#64748b" size={16} />
          </TouchableOpacity>
          
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
        
        {item.debtorPhone && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Phone color="#64748b" size={14} />
            <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 6 }}>
              {item.debtorPhone}
            </Text>
          </View>
        )}

        {item.debtorAddress && (
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 }}>
            <MapPin color="#64748b" size={14} style={{ marginTop: 2 }} />
            <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 6, flex: 1 }} numberOfLines={2}>
              {item.debtorAddress}
            </Text>
          </View>
        )}
      </View>

      <View style={{ gap: 8, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Calendar color="#64748b" size={16} />
          <Text style={{ color: '#64748b', fontSize: 13, marginLeft: 6 }}>
            Scheduled: 
          </Text>
          <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '500', marginLeft: 4 }}>
            {formatDate(item.scheduledDate)} at {formatTime(item.scheduledTime)}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <DollarSign color="#64748b" size={16} />
          <Text style={{ color: '#64748b', fontSize: 13, marginLeft: 6 }}>
            Expected Amount: 
          </Text>
          <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '500', marginLeft: 4 }}>
            {formatCurrency(item.expectedAmount)}
          </Text>
        </View>

        {item.estimatedDuration && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Clock color="#64748b" size={16} />
            <Text style={{ color: '#64748b', fontSize: 13, marginLeft: 6 }}>
              Duration: 
            </Text>
            <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '500', marginLeft: 4 }}>
              {item.estimatedDuration} mins
            </Text>
          </View>
        )}
      </View>

      <View style={{ 
        paddingTop: 12, 
        borderTopWidth: 1, 
        borderTopColor: '#334155',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {item.visitType && (
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#64748b', fontSize: 12 }}>
              Type: <Text style={{ color: '#3b82f6', fontWeight: '500', textTransform: 'capitalize' }}>
                {item.visitType}
              </Text>
            </Text>
          </View>
        )}
        
        {item.status && (
          <View style={{
            backgroundColor: `${getStatusColor(item.status)}20`,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}>
            <Text style={{ 
              color: getStatusColor(item.status), 
              fontSize: 11, 
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {item.status.replace(/_/g, ' ')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

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

export default function Tasks() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['tasks', debouncedSearch, user?.id],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { 
        page: pageParam, 
        limit: 20,
        search: debouncedSearch.trim(),
        assignedAgentId: user?.id,
      };
      const response = await tasksService.getTasks(params);

      if (response?.items && Array.isArray(response.items)) {
        return response;
      }
      if (Array.isArray(response)) {
        return { items: response, meta: { totalPages: 1 } };
      }
      if (response?.data && Array.isArray(response.data)) {
        return { items: response.data, meta: response.meta };
      }
      return { items: [], meta: { totalPages: 1 } };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = lastPage.meta?.currentPage || allPages.length;
      const totalPages = lastPage.meta?.totalPages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!user?.id,
  });

  if (error) {
    const errorMessage = error.message;
    if (errorMessage === 'UNAUTHORIZED') {
      Alert.alert('Session Expired', 'Please login again', [{ text: 'OK', onPress: () => router.replace('/login') }]);
    } else if (errorMessage.includes('FORBIDDEN')) {
      Alert.alert('Permission Denied', 'You do not have permission to view tasks');
    } else {
      Alert.alert('Error', 'Failed to load tasks');
    }
  }
  
  const tasks = useMemo(() => data?.pages.flatMap(page => page.items) ?? [], [data]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
        <ClipboardList color="#64748b" size={48} />
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '600', marginTop: 16 }}>
          No Tasks Found
        </Text>
        <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
          {debouncedSearch ? 'Try a different search term' : 'No tasks available'}
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
          Field Tasks
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
            placeholder="Search by name, phone, or address..."
            placeholderTextColor="#64748b"
            value={searchInput}
            onChangeText={setSearchInput}
            returnKeyType="search"
          />
        </View>
      </View>

      {isLoading && !isRefetching ? (
        <View style={{ paddingHorizontal: 24 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={({ item }) => <TaskCard item={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ 
            paddingHorizontal: 24, 
            paddingBottom: insets.bottom + 24 
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={refetch}
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