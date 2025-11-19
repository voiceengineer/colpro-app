import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FileText, Save } from 'lucide-react-native';

export function ActionButtons({ saving, onViewJobsheet, onSave }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
      <TouchableOpacity
        onPress={onViewJobsheet}
        style={{
          flex: 1,
          backgroundColor: '#334155',
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FileText color="#ffffff" size={20} />
        <Text
          style={{
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 'bold',
            marginLeft: 8,
          }}
        >
          View Jobsheet
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSave}
        disabled={saving}
        style={{
          flex: 1,
          backgroundColor: saving ? '#64748b' : '#10b981',
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Save color="#ffffff" size={20} />
        <Text
          style={{
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 'bold',
            marginLeft: 8,
          }}
        >
          {saving ? 'Saving...' : 'Complete Visit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
