import { Tabs } from "expo-router";
import { Home, Settings, User } from "lucide-react-native";
import { Platform, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Labels (Naam) dikhane ke liye setting
        tabBarShowLabel: true, 
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopWidth: 1.5,
          borderTopColor: '#334155',
          
          // Height ko dynamic rakha hai taaki safe area cover ho jaye
          // Android aur iOS dono pe insets add kiye hain
          height: Platform.OS === 'ios' 
            ? 65 + insets.bottom 
            : 70 + insets.bottom, 
            
          // Padding bottom se content ko upar push karega taaki 
          // navigation bar ke peeche text/icon na chupe
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
          
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
        },
        tabBarActiveTintColor: '#60a5fa',
        tabBarInactiveTintColor: '#94a3b8',
        
        // Text styling - Naam saaf dikhne ke liye
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4, // Icon aur text ke beech gap
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
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
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