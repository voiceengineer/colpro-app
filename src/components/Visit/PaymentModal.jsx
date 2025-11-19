import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';

export function PaymentModal({
  visible,
  paymentAmount,
  paymentMethod,
  paymentNotes,
  onChangeAmount,
  onChangeMethod,
  onChangeNotes,
  onCancel,
  onSave,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.8)',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: '#1e293b',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: '#334155',
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 16,
            }}
          >
            Record Payment
          </Text>

          <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>
            Payment Amount
          </Text>
          <TextInput
            style={{
              backgroundColor: '#334155',
              borderRadius: 8,
              padding: 12,
              color: '#ffffff',
              fontSize: 16,
              marginBottom: 16,
            }}
            placeholder="Enter amount..."
            placeholderTextColor="#64748b"
            value={paymentAmount}
            onChangeText={onChangeAmount}
            keyboardType="numeric"
          />

          <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>
            Payment Method
          </Text>
          <View style={{ flexDirection: 'row', marginBottom: 16, gap: 8 }}>
            {['cash', 'card', 'transfer'].map((method) => (
              <TouchableOpacity
                key={method}
                onPress={() => onChangeMethod(method)}
                style={{
                  backgroundColor:
                    paymentMethod === method ? '#3b82f6' : '#334155',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: paymentMethod === method ? '#ffffff' : '#94a3b8',
                    fontSize: 12,
                    textTransform: 'capitalize',
                  }}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>
            Notes (Optional)
          </Text>
          <TextInput
            style={{
              backgroundColor: '#334155',
              borderRadius: 8,
              padding: 12,
              color: '#ffffff',
              fontSize: 16,
              marginBottom: 20,
              minHeight: 60,
              textAlignVertical: 'top',
            }}
            placeholder="Payment notes..."
            placeholderTextColor="#64748b"
            value={paymentNotes}
            onChangeText={onChangeNotes}
            multiline
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={onCancel}
              style={{
                flex: 1,
                backgroundColor: '#334155',
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#94a3b8', fontWeight: '600' }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSave}
              style={{
                flex: 1,
                backgroundColor: '#10b981',
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                Save Payment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
