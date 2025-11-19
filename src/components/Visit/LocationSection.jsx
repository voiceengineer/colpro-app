import React from 'react';
import { View, Text } from 'react-native';
import { MapPin } from 'lucide-react-native';

export function LocationSection({ location }) {
  if (!location) return null;

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
          marginBottom: 8,
        }}
      >
        <MapPin color="#10b981" size={20} />
        <Text
          style={{
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 'bold',
            marginLeft: 8,
          }}
        >
          Location Captured
        </Text>
      </View>
      <Text style={{ color: '#94a3b8', fontSize: 14 }}>
        Lat: {location.latitude.toFixed(6)}, Lng:{' '}
        {location.longitude.toFixed(6)}
      </Text>
    </View>
  );
}
