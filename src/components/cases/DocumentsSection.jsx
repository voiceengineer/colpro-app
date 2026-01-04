import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { ChevronDown, Image as ImageIcon, AlertCircle, Trash2 } from 'lucide-react-native';
import { documentsService } from '../../lib/services/documentsService';

const DocumentImage = ({ imageUrl, doc, onPress, onDelete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [allUrls] = useState(() => documentsService.buildImageUrls(doc));

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return '';
    }
  };

  const handleImageError = (e) => {
    console.log(`Image error for ${doc.fileName} at URL ${currentUrlIndex + 1}/${allUrls.length}`);
    
    // Try next URL if available
    if (currentUrlIndex < allUrls.length - 1) {
      console.log('Trying next URL...');
      setCurrentUrlIndex(currentUrlIndex + 1);
      setLoading(true);
      setError(false);
    } else {
      console.log('All URLs failed for:', doc.fileName);
      setLoading(false);
      setError(true);
    }
  };

  const handleImageLoad = () => {
    console.log(`Image loaded successfully from URL ${currentUrlIndex + 1}`);
    setLoading(false);
    setError(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await onDelete(doc);
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const currentUrl = allUrls[currentUrlIndex];
  const isBase64 = currentUrl?.startsWith('data:');

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={deleting}
      style={{
        width: '31.5%',
        aspectRatio: 1,
        backgroundColor: '#1e293b',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: error ? '#ef4444' : '#334155',
        opacity: deleting ? 0.5 : 1,
      }}
    >
      {currentUrl ? (
        <>
          {loading && !error && !isBase64 && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#334155',
              zIndex: 1
            }}>
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          )}
          {error ? (
            <View style={{ 
              flex: 1, 
              justifyContent: 'center', 
              alignItems: 'center',
              backgroundColor: '#334155'
            }}>
              <AlertCircle color="#ef4444" size={24} />
              <Text style={{ color: '#ef4444', fontSize: 8, marginTop: 4, textAlign: 'center', paddingHorizontal: 4 }}>
                Load Failed
              </Text>
            </View>
          ) : (
            <Image
              key={`${currentUrlIndex}-${isBase64 ? 'base64' : 'url'}`}
              source={{ uri: currentUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              onLoadStart={() => !isBase64 && setLoading(true)}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          
          {/* Delete Button */}
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2
            }}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Trash2 color="#ffffff" size={14} />
            )}
          </TouchableOpacity>

          {/* Date Label */}
          {!error && doc.createdAt && (
            <View style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: 4
            }}>
              <Text 
                style={{ 
                  color: '#ffffff', 
                  fontSize: 9,
                  textAlign: 'center'
                }}
              >
                {formatDate(doc.createdAt)}
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#334155'
        }}>
          <ImageIcon color="#64748b" size={24} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const DocumentsSection = ({ 
  documents, 
  loading, 
  expanded, 
  onToggle, 
  onDocumentPress,
  onDocumentDelete
}) => {
  return (
    <>
      {/* Toggle Button */}
      <TouchableOpacity
        onPress={onToggle}
        style={{
          backgroundColor: '#1e293b',
          borderRadius: 10,
          padding: 16,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: '#334155',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 20, 
            backgroundColor: '#334155',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12
          }}>
            <ImageIcon color="#3b82f6" size={20} />
          </View>
          <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
            Photos ({documents.length})
          </Text>
        </View>
        <ChevronDown 
          color="#64748b" 
          size={20}
          style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {/* Documents Grid */}
      {expanded && (
        <View style={{ marginBottom: 10 }}>
          {loading ? (
            <View style={{
              backgroundColor: '#1e293b',
              borderRadius: 10,
              padding: 20,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#334155',
            }}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
                Loading photos...
              </Text>
            </View>
          ) : documents.length === 0 ? (
            <View style={{
              backgroundColor: '#1e293b',
              borderRadius: 10,
              padding: 20,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#334155',
            }}>
              <ImageIcon color="#64748b" size={24} />
              <Text style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
                No photos uploaded yet
              </Text>
            </View>
          ) : (
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              gap: 6
            }}>
              {documents.map((doc, index) => {
                return (
                  <DocumentImage
                    key={doc.id || index}
                    doc={doc}
                    onPress={() => onDocumentPress(doc)}
                    onDelete={onDocumentDelete}
                  />
                );
              })}
            </View>
          )}
        </View>
      )}
    </>
  );
};

export default DocumentsSection;