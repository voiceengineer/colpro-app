import { Tabs } from 'expo-router';
import { 
  BarChart3, 
  Settings, 
  Users,
  User
} from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopWidth: 1,
          borderTopColor: '#334155',
          paddingTop: 4,
          height: 85,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => (
            <BarChart3 color={color} size={22} />
          ),
        }}
      />

      <Tabs.Screen
        name="debtors"
        options={{
          title: 'Debtors',
          tabBarIcon: ({ color }) => (
            <Users color={color} size={22} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Settings color={color} size={22} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <User color={color} size={22} />
          ),
        }}
      />

      {/* Hidden screen */}
      <Tabs.Screen 
        name="debtor/[id]" 
        options={{ 
          href: null,
        }} 
      />
    </Tabs>
  );
}