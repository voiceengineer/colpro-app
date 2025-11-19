import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  FileText,
  Download,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react-native';

export default function Reports() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [reportData, setReportData] = useState({
    totalCollections: 15750000,
    totalVisits: 28,
    successfulVisits: 18,
    pendingTasks: 12,
    completedTasks: 16,
    averageCollection: 562500,
    collectionRate: 64.3
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = '#3b82f6', trend }) => (
    <View
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View
          style={{
            backgroundColor: '#334155',
            borderRadius: 8,
            padding: 8,
            marginRight: 12,
          }}
        >
          <Icon color={color} size={20} />
        </View>
        <Text style={{ color: '#94a3b8', fontSize: 14, flex: 1 }}>
          {title}
        </Text>
        {trend && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TrendingUp color="#10b981" size={16} />
            <Text style={{ color: '#10b981', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
              +{trend}%
            </Text>
          </View>
        )}
      </View>
      <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
        {value}
      </Text>
      {subtitle && (
        <Text style={{ color: '#64748b', fontSize: 12 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  const ReportItem = ({ icon: Icon, title, description, onPress, color = '#ffffff' }) => (
    <TouchableOpacity
      onPress={onPress}
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
      <View
        style={{
          backgroundColor: '#334155',
          borderRadius: 10,
          padding: 10,
          marginRight: 16,
        }}
      >
        <Icon color={color} size={20} />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 2 }}>
          {title}
        </Text>
        <Text style={{ color: '#94a3b8', fontSize: 14 }}>
          {description}
        </Text>
      </View>
      
      <ChevronRight color="#64748b" size={20} />
    </TouchableOpacity>
  );

  const PeriodButton = ({ period, label, isSelected, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: isSelected ? '#3b82f6' : '#334155',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
      }}
    >
      <Text style={{ 
        color: isSelected ? '#ffffff' : '#94a3b8', 
        fontSize: 14, 
        fontWeight: isSelected ? '600' : '500' 
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />
      
      {/* Header */}
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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold' }}>
            Reports
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#334155',
              borderRadius: 8,
              padding: 8,
            }}
          >
            <Filter color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
      >
        {/* Period Selection */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
            TIME PERIOD
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row' }}>
              <PeriodButton
                period="day"
                label="Today"
                isSelected={selectedPeriod === 'day'}
                onPress={() => setSelectedPeriod('day')}
              />
              <PeriodButton
                period="week"
                label="This Week"
                isSelected={selectedPeriod === 'week'}
                onPress={() => setSelectedPeriod('week')}
              />
              <PeriodButton
                period="month"
                label="This Month"
                isSelected={selectedPeriod === 'month'}
                onPress={() => setSelectedPeriod('month')}
              />
              <PeriodButton
                period="quarter"
                label="Quarter"
                isSelected={selectedPeriod === 'quarter'}
                onPress={() => setSelectedPeriod('quarter')}
              />
            </View>
          </ScrollView>
        </View>

        {/* Key Metrics */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ 
            color: '#94a3b8', 
            fontSize: 14, 
            fontWeight: '600', 
            marginLeft: 16, 
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            KEY METRICS
          </Text>
          
          <StatCard
            icon={DollarSign}
            title="Total Collections"
            value={formatCurrency(reportData.totalCollections)}
            subtitle="This week"
            color="#10b981"
            trend={12.5}
          />
          
          <StatCard
            icon={Users}
            title="Field Visits"
            value={`${reportData.successfulVisits}/${reportData.totalVisits}`}
            subtitle="Successful visits"
            color="#3b82f6"
            trend={8.3}
          />
          
          <StatCard
            icon={CheckCircle}
            title="Collection Rate"
            value={`${reportData.collectionRate}%`}
            subtitle="Success rate this period"
            color="#f59e0b"
            trend={5.2}
          />
          
          <StatCard
            icon={BarChart3}
            title="Average Collection"
            value={formatCurrency(reportData.averageCollection)}
            subtitle="Per successful visit"
            color="#8b5cf6"
          />
        </View>

        {/* Task Summary */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ 
            color: '#94a3b8', 
            fontSize: 14, 
            fontWeight: '600', 
            marginLeft: 16, 
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            TASK SUMMARY
          </Text>
          
          <View
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 12,
              padding: 16,
              marginHorizontal: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#334155',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Clock color="#f59e0b" size={16} />
                  <Text style={{ color: '#f59e0b', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
                    PENDING
                  </Text>
                </View>
                <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>
                  {reportData.pendingTasks}
                </Text>
              </View>
              
              <View style={{ width: 1, backgroundColor: '#334155', marginHorizontal: 16 }} />
              
              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <CheckCircle color="#10b981" size={16} />
                  <Text style={{ color: '#10b981', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
                    COMPLETED
                  </Text>
                </View>
                <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>
                  {reportData.completedTasks}
                </Text>
              </View>
            </View>
            
            <View style={{ backgroundColor: '#334155', height: 4, borderRadius: 2 }}>
              <View
                style={{
                  backgroundColor: '#10b981',
                  height: 4,
                  borderRadius: 2,
                  width: `${(reportData.completedTasks / (reportData.completedTasks + reportData.pendingTasks)) * 100}%`,
                }}
              />
            </View>
            
            <Text style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
              {Math.round((reportData.completedTasks / (reportData.completedTasks + reportData.pendingTasks)) * 100)}% completion rate
            </Text>
          </View>
        </View>

        {/* Report Actions */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ 
            color: '#94a3b8', 
            fontSize: 14, 
            fontWeight: '600', 
            marginLeft: 16, 
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            DETAILED REPORTS
          </Text>
          
          <ReportItem
            icon={BarChart3}
            title="Collection Analytics"
            description="Detailed collection performance and trends"
            onPress={() => console.log('Collection analytics pressed')}
            color="#06b6d4"
          />
          
          <ReportItem
            icon={Users}
            title="Debtor Performance"
            description="Individual debtor payment history and status"
            onPress={() => console.log('Debtor performance pressed')}
            color="#8b5cf6"
          />
          
          <ReportItem
            icon={Calendar}
            title="Visit Reports"
            description="Field visit outcomes and documentation"
            onPress={() => console.log('Visit reports pressed')}
            color="#10b981"
          />
          
          <ReportItem
            icon={FileText}
            title="Officer Performance"
            description="Individual officer collection statistics"
            onPress={() => console.log('Officer performance pressed')}
            color="#f59e0b"
          />
          
          <ReportItem
            icon={Download}
            title="Export Data"
            description="Download reports in PDF or Excel format"
            onPress={() => console.log('Export data pressed')}
            color="#64748b"
          />
        </View>

        {/* Quick Insights */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ 
            color: '#94a3b8', 
            fontSize: 14, 
            fontWeight: '600', 
            marginLeft: 16, 
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            QUICK INSIGHTS
          </Text>
          
          <View
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 12,
              padding: 16,
              marginHorizontal: 16,
              borderWidth: 1,
              borderColor: '#334155',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <AlertCircle color="#3b82f6" size={20} />
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                Performance Insights
              </Text>
            </View>
            
            <Text style={{ color: '#94a3b8', fontSize: 14, lineHeight: 20, marginBottom: 8 }}>
              • Collection rate increased by 12.5% compared to last week
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 14, lineHeight: 20, marginBottom: 8 }}>
              • 3 high-priority debtors require immediate attention
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 14, lineHeight: 20, marginBottom: 8 }}>
              • Best collection time: Tuesday-Thursday, 10 AM - 2 PM
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 14, lineHeight: 20 }}>
              • 85% of successful collections happen during field visits
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}