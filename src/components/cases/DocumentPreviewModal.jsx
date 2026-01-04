import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { X, AlertCircle } from 'lucide-react-native';
import { documentsService } from '../../lib/services/documentsService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DocumentPreviewModal = ({ visible, document, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [allUrls] = useState(() => document ? documentsService.buildImageUrls(document) : []);

  const handleImageError = () => {
    console.log(`Preview error at URL ${currentUrlIndex + 1}/${allUrls.length}`);
    
    if (currentUrlIndex < allUrls.length - 1) {
      console.log('Trying next URL in preview...');
      setCurrentUrlIndex(currentUrlIndex + 1);
      setLoading(true);
      setError(false);
    } else {
      console.log('All preview URLs failed');
      setLoading(false);
      setError(true);
    }
  };

  const handleImageLoad = () => {
    console.log('Preview image loaded successfully');
    setLoading(false);
    setError(false);
  };

  const handleClose = () => {
    setLoading(true);
    setError(false);
    setCurrentUrlIndex(0);
    onClose();
  };

  if (!document) return null;

  const currentUrl = allUrls[currentUrlIndex];
  const isBase64 = currentUrl?.startsWith('data:');

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={{ 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.98)',
      }}>
        {/* Header */}
        <View style={{
          paddingTop: 50,
          paddingBottom: 16,
          paddingHorizontal: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#334155',
        }}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text 
              style={{ 
                color: '#ffffff', 
                fontSize: 18, 
                fontWeight: '600',
              }}
              numberOfLines={1}
            >
              {document.originalName || document.fileName || 'Photo'}
            </Text>
            <Text style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
              {formatFileSize(document.fileSize)} • {formatDate(document.createdAt)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#334155',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <X color="#ffffff" size={22} />
          </TouchableOpacity>
        </View>

        {/* Image Container */}
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 20,
        }}>
          {currentUrl ? (
            <>
              {loading && !error && !isBase64 && (
                <View style={{
                  position: 'absolute',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text style={{ color: '#64748b', fontSize: 14, marginTop: 12 }}>
                    Loading image...
                  </Text>
                </View>
              )}
              {error ? (
                <View style={{ 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  padding: 40,
                }}>
                  <AlertCircle color="#ef4444" size={48} />
                  <Text style={{ 
                    color: '#ef4444', 
                    fontSize: 16, 
                    marginTop: 16,
                    textAlign: 'center'
                  }}>
                    Failed to load image
                  </Text>
                  <Text style={{ 
                    color: '#64748b', 
                    fontSize: 13, 
                    marginTop: 8,
                    textAlign: 'center'
                  }}>
                    The image may be corrupted or unavailable
                  </Text>
                </View>
              ) : (
                <Image
                  key={`preview-${currentUrlIndex}-${isBase64 ? 'base64' : 'url'}`}
                  source={{ uri: currentUrl }}
                  style={{
                    width: SCREEN_WIDTH - 40,
                    height: SCREEN_HEIGHT - 200,
                  }}
                  resizeMode="contain"
                  onLoadStart={() => !isBase64 && setLoading(true)}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
            </>
          ) : (
            <View style={{ 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: 40,
            }}>
              <AlertCircle color="#64748b" size={48} />
              <Text style={{ 
                color: '#64748b', 
                fontSize: 16, 
                marginTop: 16,
                textAlign: 'center'
              }}>
                No preview available
              </Text>
            </View>
          )}
        </View>

        {/* Footer Info */}
        {document.uploadedByName && (
          <View style={{
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderTopWidth: 1,
            borderTopColor: '#334155',
          }}>
            <Text style={{ color: '#64748b', fontSize: 13 }}>
              Uploaded by: <Text style={{ color: '#ffffff' }}>{document.uploadedByName}</Text>
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default DocumentPreviewModal;