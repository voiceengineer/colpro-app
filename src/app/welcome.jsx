import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../lib/authContext';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Show welcome screen for 2 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
      
      // Navigate based on auth status
      if (isAuthenticated) {
        router.replace('/(tabs)/index');
      } else {
        router.replace('/login');
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Coll Pro App</Text>
        <ActivityIndicator 
          size="large" 
          color="#3b82f6" 
          style={styles.loader}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 32,
  },
  loader: {
    marginTop: 16,
  },
});