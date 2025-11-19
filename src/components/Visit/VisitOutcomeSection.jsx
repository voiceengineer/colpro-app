import React from 'react';
import { View, Text, TextInput } from 'react-native';

export function VisitOutcomeSection({ outcome, onChangeOutcome }) {
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
        Visit Outcome *
      </Text>
      <TextInput
        style={{
          backgroundColor: '#334155',
          borderRadius: 8,
          padding: 12,
          color: '#ffffff',
          fontSize: 16,
          minHeight: 80,
          textAlignVertical: 'top',
        }}
        placeholder="Describe what happened during the visit..."
        placeholderTextColor="#64748b"
        value={outcome}
        onChangeText={onChangeOutcome}
        multiline
      />
    </View>
  );
}
