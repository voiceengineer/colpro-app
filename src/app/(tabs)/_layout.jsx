import { Tabs } from "expo-router";
import { Home, Settings, User } from "lucide-react-native";
import { Platform, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true, 
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopWidth: 1.5,
          borderTopColor: '#334155',
          
          height: Platform.OS === 'ios' 
            ? 65 + insets.bottom 
            : 60 + insets.bottom, 
            
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 4,
          
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
        },
        tabBarActiveTintColor: '#60a5fa',
        tabBarInactiveTintColor: '#94a3b8',
        
        // Text styling 
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 0,
        },
        
        // Icon alignment
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />

    

      <Tabs.Screen
        name="debtor/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}