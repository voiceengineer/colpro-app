import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera, RotateCcw } from 'lucide-react-native';

export function PhotoPreviewSection({ onRetake }) {
  return (
    <View
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
          Photo Evidence
        </Text>
        <TouchableOpacity
          onPress={onRetake}
          style={{
            backgroundColor: '#334155',
            borderRadius: 6,
            padding: 6,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <RotateCcw color="#3b82f6" size={14} />
          <Text style={{ color: '#3b82f6', fontSize: 12, marginLeft: 4 }}>
            Retake
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          height: 160,
          backgroundColor: '#334155',
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Camera color="#64748b" size={32} />
        <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>
          Photo captured successfully
        </Text>
      </View>
    </View>
  );
}
