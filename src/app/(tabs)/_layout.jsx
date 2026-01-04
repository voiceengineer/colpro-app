import { Tabs } from "expo-router";
import { Home, Settings, User } from "lucide-react-native";
import { theme } from "../../theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingTop: theme.spacing.xs,
          height: 85,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: theme.font.size.sm,
          fontWeight: theme.font.weight.semibold,
          marginBottom: theme.spacing.sm,
        },
        tabBarIconStyle: {
          marginTop: theme.spacing.xs,
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

      {/* Hidden screens - commented out for future use */}
      {/* 
      <Tabs.Screen
        name="reports"
        options={{
          href: null,
          title: "Reports",
          tabBarIcon: ({ color }) => <BarChart3 color={color} size={22} />,
        }}
      />

      <Tabs.Screen
        name="debtors"
        options={{
          href: null,
          title: "Debtors",
          tabBarIcon: ({ color }) => <Users color={color} size={22} />,
        }}
      />
      */}

      <Tabs.Screen
        name="cases"
        options={{
          href: null, // Hidden from tab bar
        }}
      />

      <Tabs.Screen
        name="debtor/[id]"
        options={{
          href: null, // Hidden from tab bar
        }}
      />
    </Tabs>
  );
}