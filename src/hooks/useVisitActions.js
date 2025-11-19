import { Alert } from 'react-native';
import * as Location from 'expo-location';

export function useVisitActions() {
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        return currentLocation.coords;
      } else {
        Alert.alert(
          'Permission denied',
          'Location permission is required for visit reports'
        );
        return null;
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
      return null;
    }
  };

  const takePicture = async (cameraRef, location, setLocation, setCapturedPhoto) => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      setCapturedPhoto(photo);

      // Get location when taking photo
      if (!location) {
        const coords = await requestLocationPermission();
        if (coords) {
          setLocation(coords);
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const savePayment = async (debtorId, paymentAmount, paymentMethod, paymentNotes) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return false;
    }

    try {
      const response = await fetch('/api/payment-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          debtor_id: debtorId,
          amount: parseFloat(paymentAmount),
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: paymentMethod,
          notes: paymentNotes,
          recorded_by: 'field_officer',
        }),
      });

      if (!response.ok) throw new Error('Failed to save payment');

      Alert.alert('Success', 'Payment recorded successfully');
      return true;
    } catch (error) {
      console.error('Error saving payment:', error);
      Alert.alert('Error', 'Failed to save payment');
      return false;
    }
  };

  const saveVisitReport = async (visitData) => {
    try {
      const response = await fetch('/api/visit-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitData),
      });

      if (!response.ok) throw new Error('Failed to save visit report');
      return true;
    } catch (error) {
      console.error('Error saving visit report:', error);
      Alert.alert('Error', 'Failed to save visit report');
      return false;
    }
  };

  return {
    requestLocationPermission,
    takePicture,
    savePayment,
    saveVisitReport,
  };
}
