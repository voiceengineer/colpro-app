import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Animated, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../lib/authContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(30)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  
  // Dot animations
  const dot1Scale = useRef(new Animated.Value(1)).current;
  const dot2Scale = useRef(new Animated.Value(1)).current;
  const dot3Scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Tagline slide in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(taglineSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Dots fade in
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing dots animation
    setTimeout(() => {
      // Dot 1
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1Scale, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(dot1Scale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Dot 2 - delayed
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot2Scale, {
              toValue: 1.3,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 200);

      // Dot 3 - more delayed
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot3Scale, {
              toValue: 1.3,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 400);
    }, 1200);

    // Navigation logic
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Gradient Background */}
      <View style={styles.gradientContainer}>
        <View style={[styles.gradientBlob, styles.blob1]} />
        <View style={[styles.gradientBlob, styles.blob2]} />
        <View style={[styles.gradientBlob, styles.blob3]} />
      </View>

      {/* Grid Pattern Overlay */}
      <View style={styles.gridOverlay}>
        {[...Array(20)].map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLine, { top: i * (height / 20) }]} />
        ))}
        {[...Array(10)].map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLineVertical, { left: i * (width / 10) }]} />
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../assets/images/transparent-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={[
            styles.taglineContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: taglineSlide }],
            },
          ]}
        >
          <View style={styles.taglineBox}>
            <Text style={styles.tagline}>COLLECTION MANAGEMENT</Text>
            <View style={styles.divider} />
            <Text style={styles.taglineSecondary}>Professional Platform</Text>
          </View>
        </Animated.View>

        {/* Loading Section */}
        <Animated.View
          style={[
            styles.loadingSection,
            { opacity: dotsOpacity }
          ]}
        >
          <View style={styles.dotsWrapper}>
            <Animated.View
              style={[
                styles.dot,
                {
                  transform: [{ scale: dot1Scale }],
                  opacity: dot1Scale.interpolate({
                    inputRange: [1, 1.3],
                    outputRange: [0.5, 1],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  transform: [{ scale: dot2Scale }],
                  opacity: dot2Scale.interpolate({
                    inputRange: [1, 1.3],
                    outputRange: [0.5, 1],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  transform: [{ scale: dot3Scale }],
                  opacity: dot3Scale.interpolate({
                    inputRange: [1, 1.3],
                    outputRange: [0.5, 1],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Preparing your workspace</Text>
        </Animated.View>
      </View>

      {/* Decorative Elements */}
      <View style={styles.decorativeElements}>
        <View style={[styles.floatingCircle, styles.circle1]} />
        <View style={[styles.floatingCircle, styles.circle2]} />
        <View style={[styles.floatingCircle, styles.circle3]} />
        <View style={[styles.floatingCircle, styles.circle4]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  gradientContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradientBlob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blob1: {
    width: 400,
    height: 400,
    backgroundColor: '#1e40af',
    opacity: 0.08,
    top: -100,
    right: -100,
  },
  blob2: {
    width: 350,
    height: 350,
    backgroundColor: '#7c3aed',
    opacity: 0.06,
    bottom: -80,
    left: -80,
  },
  blob3: {
    width: 300,
    height: 300,
    backgroundColor: '#db2777',
    opacity: 0.05,
    top: '40%',
    right: -50,
  },
  gridOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.03,
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#3b82f6',
  },
  gridLineVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 10,
  },
  logo: {
    width: 280,
    height: 280,
  },
  taglineContainer: {
    marginBottom: 80,
    alignItems: 'center',
  },
  taglineBox: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  tagline: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
    letterSpacing: 2,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#3b82f6',
    marginVertical: 10,
    borderRadius: 1,
  },
  taglineSecondary: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  loadingSection: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  dotsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  decorativeElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 5,
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: '#3b82f6',
  },
  circle1: {
    width: 6,
    height: 6,
    top: '18%',
    left: '12%',
    opacity: 0.4,
  },
  circle2: {
    width: 8,
    height: 8,
    top: '28%',
    right: '18%',
    opacity: 0.3,
  },
  circle3: {
    width: 5,
    height: 5,
    bottom: '22%',
    left: '15%',
    opacity: 0.5,
  },
  circle4: {
    width: 7,
    height: 7,
    top: '70%',
    right: '20%',
    opacity: 0.35,
  },
});