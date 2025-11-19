import React from 'react';
import { View, Text, TextInput } from 'react-native';

export function NextActionsSection({ nextAction, onChangeNextAction }) {
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
        Next Actions
      </Text>
      <TextInput
        style={{
          backgroundColor: '#334155',
          borderRadius: 8,
          padding: 12,
          color: '#ffffff',
          fontSize: 16,
          minHeight: 60,
          textAlignVertical: 'top',
        }}
        placeholder="What should be done next..."
        placeholderTextColor="#64748b"
        value={nextAction}
        onChangeText={onChangeNextAction}
        multiline
      />
    </View>
  );
}
