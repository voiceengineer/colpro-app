import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

export function CustomerContactSection({ customerContacted, onToggle }) {
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
      <Text
        style={{
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 12,
        }}
      >
        Customer Contact
      </Text>
      <TouchableOpacity
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#334155',
          borderRadius: 8,
          padding: 12,
        }}
      >
        <CheckCircle
          color={customerContacted ? '#10b981' : '#64748b'}
          size={20}
        />
        <Text
          style={{
            color: customerContacted ? '#10b981' : '#94a3b8',
            fontSize: 14,
            marginLeft: 8,
            fontWeight: customerContacted ? '600' : '500',
          }}
        >
          Customer was contacted during visit
        </Text>
      </TouchableOpacity>
    </View>
  );
}
