import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView } from 'expo-camera';
import { Camera, RotateCcw, Zap, ZapOff } from 'lucide-react-native';

export function CameraScreen({
  insets,
  facing,
  flash,
  cameraRef,
  onToggleFlash,
  onTakePicture,
  onToggleFacing,
}) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: '#1e293b',
          borderBottomWidth: 1,
          borderBottomColor: '#334155',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold' }}>
          Field Visit
        </Text>
      </View>

      {/* Camera View */}
      <CameraView
        style={{ flex: 1, marginTop: insets.top + 80 }}
        facing={facing}
        flash={flash}
        ref={cameraRef}
      >
        {/* Camera Controls */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            paddingBottom: insets.bottom + 20,
            paddingTop: 20,
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Flash Toggle */}
            <TouchableOpacity
              onPress={onToggleFlash}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 25,
                padding: 12,
              }}
            >
              {flash === 'on' ? (
                <Zap color="#ffffff" size={24} />
              ) : (
                <ZapOff color="#ffffff" size={24} />
              )}
            </TouchableOpacity>

            {/* Capture Button */}
            <TouchableOpacity
              onPress={onTakePicture}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 40,
                padding: 20,
                borderWidth: 4,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              <Camera color="#000000" size={32} />
            </TouchableOpacity>

            {/* Camera Flip */}
            <TouchableOpacity
              onPress={onToggleFacing}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 25,
                padding: 12,
              }}
            >
              <RotateCcw color="#ffffff" size={24} />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              color: '#ffffff',
              fontSize: 14,
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            Take a photo to document your field visit
          </Text>
        </View>
      </CameraView>
    </View>
  );
}
