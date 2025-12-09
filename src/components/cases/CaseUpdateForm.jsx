import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { ChevronDown, Check, AlertCircle } from 'lucide-react-native';

const CaseUpdateForm = ({
  statuses,
  selectedStatusId,
  onStatusChange,
  remarks,
  onRemarksChange,
  showStatusPicker,
  onToggleStatusPicker,
  canEdit,
  onSubmit,
  submitting
}) => {
  return (
    <>
      <View style={{ height: 1, backgroundColor: '#334155', marginVertical: 20 }} />

      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
        Update Case
      </Text>

      {!canEdit && (
        <View style={{
          backgroundColor: '#422006',
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#78350f',
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <AlertCircle color="#fbbf24" size={20} />
          <Text style={{ color: '#fbbf24', fontSize: 13, marginLeft: 10, flex: 1 }}>
            Update restricted - missing required permissions
          </Text>
        </View>
      )}

      {/* Status Picker */}
      <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>
        Status
      </Text>
      <TouchableOpacity
        onPress={() => canEdit && onToggleStatusPicker()}
        disabled={!canEdit}
        style={{
          backgroundColor: '#1e293b',
          borderRadius: 10,
          padding: 16,
          borderWidth: 1,
          borderColor: '#334155',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          opacity: !canEdit ? 0.6 : 1
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '500' }}>
          {statuses.find(s => s.id === selectedStatusId)?.name || 
           statuses.find(s => s.id === selectedStatusId)?.description ||
           'Select Status'}
        </Text>
        {canEdit && (
          <ChevronDown 
            color="#64748b" 
            size={20}
            style={{ transform: [{ rotate: showStatusPicker ? '180deg' : '0deg' }] }}
          />
        )}
      </TouchableOpacity>

      {showStatusPicker && statuses.length > 0 && canEdit && (
        <View style={{ 
          backgroundColor: '#1e293b',
          borderRadius: 10,
          marginBottom: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#334155'
        }}>
          {statuses.map((status, index) => (
            <TouchableOpacity
              key={status.id}
              onPress={() => onStatusChange(status.id)}
              style={{
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomWidth: index < statuses.length - 1 ? 1 : 0,
                borderBottomColor: '#334155'
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, flex: 1 }}>
                {status.name || status.description || 'Unknown Status'}
              </Text>
              {selectedStatusId === status.id && (
                <Check color="#10b981" size={20} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Remarks Field */}
      <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>
        Remarks / Notes
      </Text>
      <TextInput
        style={{
          backgroundColor: '#1e293b',
          borderRadius: 10,
          padding: 16,
          color: '#ffffff',
          fontSize: 15,
          borderWidth: 1,
          borderColor: '#334155',
          minHeight: 100,
          textAlignVertical: 'top',
          marginBottom: 20,
          opacity: !canEdit ? 0.6 : 1
        }}
        placeholder="Add your notes here..."
        placeholderTextColor="#64748b"
        multiline
        value={remarks}
        onChangeText={onRemarksChange}
        editable={canEdit}
      />

      {/* Save Button */}
      <TouchableOpacity
        onPress={onSubmit}
        disabled={submitting || !canEdit}
        style={{
          backgroundColor: canEdit ? '#3b82f6' : '#334155',
          borderRadius: 10,
          padding: 18,
          alignItems: 'center',
          opacity: (submitting || !canEdit) ? 0.6 : 1
        }}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
            {canEdit ? 'Save Changes' : 'Update Restricted'}
          </Text>
        )}
      </TouchableOpacity>
    </>
  );
};

export default CaseUpdateForm;