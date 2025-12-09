import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { X, FileIcon, AlertCircle } from 'lucide-react-native';

const DocumentPreviewModal = ({ visible, document, onClose }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!document) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getImageUrl = () => {
    // Check multiple possible URL fields
    const path = document.filePath || document.url || document.fileUrl;
    if (!path) return null;
    
    console.log('Processing path:', path);
    
    // If path starts with /, prepend API URL
    if (path.startsWith('/')) {
      const url = `https://dev.collpro.uz${path}`;
      console.log('Generated URL:', url);
      return url;
    }
    
    // If it's already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      console.log('Using full URL:', path);
      return path;
    }
    
    // Otherwise, prepend API URL
    const url = `https://dev.collpro.uz/${path}`;
    console.log('Generated URL with prefix:', url);
    return url;
  };

  const imageUrl = getImageUrl();
  const isImage = document.mimeType?.startsWith('image/') || 
                  document.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (error) => {
    console.error('Image load error:', error.nativeEvent?.error || error);
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.98)',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(51, 65, 85, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10
          }}
        >
          <X color="#ffffff" size={24} />
        </TouchableOpacity>

        {/* Document Info */}
        <View style={{
          position: 'absolute',
          top: 50,
          left: 20,
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          padding: 14,
          borderRadius: 10,
          maxWidth: '65%',
          borderWidth: 1,
          borderColor: '#334155'
        }}>
          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700', marginBottom: 6 }}>
            {document.fileName || document.originalName || 'Document'}
          </Text>
          
          {document.fileSize && (
            <Text style={{ color: '#94a3b8', fontSize: 11, marginBottom: 3 }}>
              Size: {formatFileSize(document.fileSize)}
            </Text>
          )}
          
          {(document.uploadedAt || document.createdAt) && (
            <Text style={{ color: '#94a3b8', fontSize: 11, marginBottom: 3 }}>
              Uploaded: {formatDate(document.uploadedAt || document.createdAt)}
            </Text>
          )}
          
          {document.uploadedByName && (
            <Text style={{ color: '#94a3b8', fontSize: 11 }}>
              By: {document.uploadedByName}
            </Text>
          )}
          
          {document.documentType && (
            <View style={{
              marginTop: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: '#3b82f6',
              borderRadius: 6,
              alignSelf: 'flex-start'
            }}>
              <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' }}>
                {document.documentType}
              </Text>
            </View>
          )}
        </View>

        {/* Document Content */}
        <View style={{ width: '100%', height: '80%', justifyContent: 'center', alignItems: 'center' }}>
          {imageUrl && isImage && !imageError ? (
            <View style={{ width: '90%', height: '100%', position: 'relative' }}>
              {imageLoading && (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#1e293b',
                  borderRadius: 12
                }}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 12 }}>
                    Loading image...
                  </Text>
                </View>
              )}
              <Image
                source={{ 
                  uri: imageUrl,
                  headers: {
                    'Accept': 'image/*'
                  }
                }}
                style={{ 
                  width: '100%', 
                  height: '100%',
                  borderRadius: 12
                }}
                resizeMode="contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </View>
          ) : (
            <View style={{
              backgroundColor: '#1e293b',
              padding: 40,
              borderRadius: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#334155',
              minWidth: 280
            }}>
              {imageError ? (
                <>
                  <AlertCircle color="#ef4444" size={64} />
                  <Text style={{ color: '#ffffff', fontSize: 16, marginTop: 16, fontWeight: '600' }}>
                    Failed to load image
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 }}>
                    The image could not be displayed. It may have been deleted or the URL is invalid.
                  </Text>
                  {imageUrl && (
                    <View style={{
                      marginTop: 12,
                      backgroundColor: '#0f172a',
                      padding: 10,
                      borderRadius: 8,
                      maxWidth: '100%'
                    }}>
                      <Text style={{ color: '#64748b', fontSize: 10, fontFamily: 'monospace' }} numberOfLines={2}>
                        {imageUrl}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <FileIcon color="#64748b" size={64} />
                  <Text style={{ color: '#ffffff', fontSize: 16, marginTop: 16, fontWeight: '600' }}>
                    No preview available
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                    {!imageUrl 
                      ? 'Document URL not available'
                      : !isImage 
                        ? 'This file type cannot be previewed' 
                        : 'Unable to display this document'}
                  </Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 12, textAlign: 'center', paddingHorizontal: 20 }}>
                    {document.fileName || document.originalName || 'Document'}
                  </Text>
                </>
              )}
            </View>
          )}
        </View>

        {/* Debug Info (remove in production) */}
        {__DEV__ && (
          <View style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#334155'
          }}>
            <Text style={{ color: '#fbbf24', fontSize: 10, fontWeight: '700', marginBottom: 4 }}>
              DEBUG INFO:
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}>
              URL: {imageUrl || 'None'}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}>
              Type: {document.mimeType || 'Unknown'}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}>
              Path: {document.filePath || 'None'}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}>
              Error: {imageError ? 'Yes' : 'No'} | Loading: {imageLoading ? 'Yes' : 'No'}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default DocumentPreviewModal;