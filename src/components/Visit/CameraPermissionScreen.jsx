import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Camera } from 'lucide-react-native';

export function CameraPermissionScreen({ onRequestPermission }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <StatusBar style="light" />
      <Camera color="#64748b" size={64} />
      <Text
        style={{
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 'bold',
          marginTop: 16,
          textAlign: 'center',
        }}
      >
        Camera Permission Required
      </Text>
      <Text
        style={{
          color: '#94a3b8',
          fontSize: 14,
          marginTop: 8,
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        We need camera access to take photos for visit reports
      </Text>
      <TouchableOpacity
        onPress={onRequestPermission}
        style={{
          backgroundColor: '#3b82f6',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
          Grant Permission
        </Text>
      </TouchableOpacity>
    </View>
  );
}
