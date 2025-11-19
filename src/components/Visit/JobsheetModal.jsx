import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ArrowLeft, Share2 } from 'lucide-react-native';
import { formatCurrency } from '@/utils/visitHelpers';

export function JobsheetModal({
  visible,
  insets,
  jobsheet,
  onClose,
  onShare,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.9)',
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <TouchableOpacity onPress={onClose} style={{ marginRight: 16 }}>
            <ArrowLeft color="#ffffff" size={24} />
          </TouchableOpacity>
          <Text
            style={{
              color: '#ffffff',
              fontSize: 18,
              fontWeight: 'bold',
              flex: 1,
            }}
          >
            Visit Jobsheet
          </Text>
          <TouchableOpacity
            onPress={onShare}
            style={{
              backgroundColor: '#3b82f6',
              borderRadius: 8,
              padding: 8,
            }}
          >
            <Share2 color="#ffffff" size={16} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 12,
              padding: 20,
              borderWidth: 1,
              borderColor: '#334155',
            }}
          >
            {/* Header */}
            <Text
              style={{
                color: '#ffffff',
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              FIELD VISIT REPORT
            </Text>

            {/* Visit Info */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: '#94a3b8',
                  fontSize: 12,
                  fontWeight: '600',
                  marginBottom: 8,
                }}
              >
                VISIT INFORMATION
              </Text>
              <View
                style={{
                  backgroundColor: '#334155',
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Text style={{ color: '#ffffff', marginBottom: 4 }}>
                  <Text style={{ color: '#94a3b8' }}>Date:</Text>{' '}
                  {jobsheet.visitDate}
                </Text>
                <Text style={{ color: '#ffffff', marginBottom: 4 }}>
                  <Text style={{ color: '#94a3b8' }}>Officer:</Text>{' '}
                  {jobsheet.officer}
                </Text>
                <Text style={{ color: '#ffffff' }}>
                  <Text style={{ color: '#94a3b8' }}>Duration:</Text>{' '}
                  {jobsheet.visitDuration}
                </Text>
              </View>
            </View>

            {/* Debtor Info */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: '#94a3b8',
                  fontSize: 12,
                  fontWeight: '600',
                  marginBottom: 8,
                }}
              >
                DEBTOR INFORMATION
              </Text>
              <View
                style={{
                  backgroundColor: '#334155',
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Text style={{ color: '#ffffff', marginBottom: 4 }}>
                  <Text style={{ color: '#94a3b8' }}>Name:</Text>{' '}
                  {jobsheet.debtor.name}
                </Text>
                <Text style={{ color: '#ffffff', marginBottom: 4 }}>
                  <Text style={{ color: '#94a3b8' }}>PINFL:</Text>{' '}
                  {jobsheet.debtor.pinfl}
                </Text>
                <Text style={{ color: '#ffffff', marginBottom: 4 }}>
                  <Text style={{ color: '#94a3b8' }}>Phone:</Text>{' '}
                  {jobsheet.debtor.phone}
                </Text>
                <Text style={{ color: '#ffffff', marginBottom: 4 }}>
                  <Text style={{ color: '#94a3b8' }}>Address:</Text>{' '}
                  {jobsheet.debtor.address}
                </Text>
                <Text style={{ color: '#ef4444', marginBottom: 4 }}>
                  <Text style={{ color: '#94a3b8' }}>Total Debt:</Text>{' '}
                  {formatCurrency(jobsheet.debtor.totalAmount)}
                </Text>
                <Text style={{ color: '#f59e0b' }}>
                  <Text style={{ color: '#94a3b8' }}>Remaining:</Text>{' '}
                  {formatCurrency(jobsheet.debtor.remainingAmount)}
                </Text>
              </View>
            </View>

            {/* Visit Details */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: '#94a3b8',
                  fontSize: 12,
                  fontWeight: '600',
                  marginBottom: 8,
                }}
              >
                VISIT DETAILS
              </Text>
              <View
                style={{
                  backgroundColor: '#334155',
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Text style={{ color: '#ffffff', marginBottom: 4 }}>
                  <Text style={{ color: '#94a3b8' }}>Outcome:</Text>{' '}
                  {jobsheet.outcome || 'Not specified'}
                </Text>
                <Text style={{ color: '#ffffff', marginBottom: 4 }}>
                  <Text style={{ color: '#94a3b8' }}>Customer Contacted:</Text>{' '}
                  {jobsheet.customerContacted ? 'Yes' : 'No'}
                </Text>
                <Text
                  style={{
                    color: jobsheet.paymentReceived > 0 ? '#10b981' : '#ffffff',
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ color: '#94a3b8' }}>Payment Received:</Text>{' '}
                  {formatCurrency(jobsheet.paymentReceived)}
                </Text>
                <Text style={{ color: '#ffffff' }}>
                  <Text style={{ color: '#94a3b8' }}>Photo Evidence:</Text>{' '}
                  {jobsheet.photoTaken ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>

            {/* Next Actions */}
            {jobsheet.nextAction && (
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: '#94a3b8',
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 8,
                  }}
                >
                  NEXT ACTIONS
                </Text>
                <View
                  style={{
                    backgroundColor: '#334155',
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <Text style={{ color: '#ffffff' }}>
                    {jobsheet.nextAction}
                  </Text>
                </View>
              </View>
            )}

            {/* Remarks */}
            {jobsheet.remarks && (
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: '#94a3b8',
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 8,
                  }}
                >
                  REMARKS
                </Text>
                <View
                  style={{
                    backgroundColor: '#334155',
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <Text style={{ color: '#ffffff' }}>{jobsheet.remarks}</Text>
                </View>
              </View>
            )}

            {/* Location */}
            {jobsheet.location && (
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: '#94a3b8',
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 8,
                  }}
                >
                  LOCATION
                </Text>
                <View
                  style={{
                    backgroundColor: '#334155',
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <Text style={{ color: '#ffffff' }}>
                    Lat: {jobsheet.location.lat}, Lng: {jobsheet.location.lng}
                  </Text>
                </View>
              </View>
            )}

            {/* Footer */}
            <Text
              style={{
                color: '#64748b',
                fontSize: 10,
                textAlign: 'center',
                marginTop: 20,
              }}
            >
              Generated by CollPro Field App
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
