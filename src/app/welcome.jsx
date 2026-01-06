import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../lib/authContext';
import { Lock } from 'lucide-react-native';

export default function Welcome() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Wait for auth to load then redirect
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Gradients */}
      <View style={styles.backgroundContainer}>
        <View style={styles.blueBlob} />
        <View style={styles.purpleBlob} />
        <View style={styles.orangeBlob} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Lock color="#ffffff" size={48} strokeWidth={2} />
        </View>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.appName}>Coll Pro</Text>
        
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Initializing secure connection...</Text>
        </View>
      </Animated.View>
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
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blueBlob: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: '#3b82f6',
    opacity: 0.1,
    borderRadius: 150,
  },
  purpleBlob: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 250,
    height: 250,
    backgroundColor: '#8b5cf6',
    opacity: 0.08,
    borderRadius: 125,
  },
  orangeBlob: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    width: 200,
    height: 200,
    backgroundColor: '#f59e0b',
    opacity: 0.05,
    borderRadius: 100,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    backgroundColor: '#2563eb',
    borderRadius: 24,
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 24,
    color: '#94a3b8',
    marginBottom: 4,
    fontWeight: '500',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 48,
    letterSpacing: 1,
  },
  loaderContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 16,
    fontWeight: '500',
  },
});
