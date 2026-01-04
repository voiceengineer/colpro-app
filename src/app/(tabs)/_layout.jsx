import { Tabs } from "expo-router";
import { Home, Settings, User } from "lucide-react-native";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopWidth: 1.5,
          borderTopColor: '#334155',
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 16,
          height:  70,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
        },
        tabBarActiveTintColor: '#60a5fa',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -4,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: -8,
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings color={color} size={22} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={22} />,
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen
        name="cases"
        options={{
          href: null,
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