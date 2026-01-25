import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Fingerprint, Sparkles, ScanFace } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function BiometricEnrollmentModal({ 
  visible, 
  biometricType = 'Biometric',
  onEnable, 
  onSkip 
}) {
  const isFaceID = biometricType === 'Face ID';
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onSkip}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              {isFaceID ? (
                <ScanFace color="#ffffff" size={48} strokeWidth={2} />
              ) : (
                <Fingerprint color="#ffffff" size={48} strokeWidth={2} />
              )}
            </View>
            <View style={styles.sparkleTopRight}>
              <Sparkles color="#c084fc" size={20} />
            </View>
            <View style={styles.sparkleBottomLeft}>
              <Sparkles color="#d8b4fe" size={16} />
            </View>
          </View>
          
          <Text style={styles.title}>
            {t('biometric.enableTitle', { type: biometricType })}
          </Text>
          
          <Text style={styles.description}>
            {t('biometric.enableDesc', { type: biometricType })}
          </Text>

          <View style={styles.benefitsContainer}>
            <BenefitItem text={t('biometric.benefit1')} />
            <BenefitItem text={t('biometric.benefit2')} />
            <BenefitItem text={t('biometric.benefit3')} />
          </View>

          <TouchableOpacity
            onPress={onEnable}
            style={styles.enableButton}
            activeOpacity={0.8}
            accessibilityLabel={t('biometric.enableButton', { type: biometricType })}
            accessibilityRole="button"
          >
            {isFaceID ? (
              <ScanFace color="#ffffff" size={20} strokeWidth={2.5} />
            ) : (
              <Fingerprint color="#ffffff" size={20} strokeWidth={2.5} />
            )}
            <Text style={styles.enableButtonText}>
              {t('biometric.enableButton', { type: biometricType })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSkip}
            style={styles.skipButton}
            activeOpacity={0.7}
            accessibilityLabel={t('biometric.skipButton')}
            accessibilityRole="button"
          >
            <Text style={styles.skipButtonText}>
              {t('biometric.skipButton')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function BenefitItem({ text }) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.checkmark}>
        <Text style={styles.checkmarkText}>✓</Text>
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  iconBackground: {
    backgroundColor: '#9333ea',
    borderRadius: 24,
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  sparkleTopRight: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  sparkleBottomLeft: {
    position: 'absolute',
    bottom: 4,
    left: -4,
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  benefitsContainer: {
    marginBottom: 28,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  benefitText: {
    color: '#94a3b8',
    fontSize: 14,
    flex: 1,
  },
  enableButton: {
    backgroundColor: '#9333ea',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  enableButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  skipButton: {
    backgroundColor: '#334155',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
});