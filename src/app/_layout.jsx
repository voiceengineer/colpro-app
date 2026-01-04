import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../lib/authContext';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuth();

  // Handle navigation - only for protected routes, not index
  useEffect(() => {
    if (isLoading) return;
    
    // Don't interfere with index, login, or register screens
    if (segments[0] === undefined || segments[0] === 'index' || segments[0] === 'login' || segments[0] === 'register') {
      return;
    }

    const inTabsGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && inTabsGroup) {
      // User not authenticated but trying to access tabs
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, segments]);

  // Prevent direct access to +not-found page
  useEffect(() => {
    if (segments[0] === '+not-found') {
      if (isAuthenticated) {
        router.replace("/(tabs)/index");
      } else {
        router.replace("/login");
      }
    }
  }, [segments, isAuthenticated]);

  // Hide splash screen when ready
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}