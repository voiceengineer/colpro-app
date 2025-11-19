import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Just hide splash screen without auth check
    setTimeout(() => {
      setIsReady(true);
      SplashScreen.hideAsync();
    }, 100);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Index redirects to tabs */}
          <Stack.Screen name="index" />
          
          {/* Auth Screens */}
          <Stack.Screen 
            name="login" 
            options={{ 
              headerShown: false, 
              animation: 'slide_from_right',
              presentation: 'card'
            }} 
          />
          <Stack.Screen 
            name="signup" 
            options={{ 
              headerShown: false, 
              animation: 'slide_from_right',
              presentation: 'card'
            }} 
          />
          
          {/* Main App Tabs */}
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }} 
          />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}