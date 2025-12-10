import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { ChevronDown, Image as ImageIcon } from 'lucide-react-native';

const DocumentsSection = ({ 
  documents, 
  loading, 
  expanded, 
  onToggle, 
  onDocumentPress 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  const getImageUrl = (doc) => {
    if (!doc) return null;
    
    const path = doc.filePath || doc.url || doc.fileUrl;
    if (!path) return null;
    
    if (path.startsWith('/')) {
      return `https://dev.collpro.uz${path}`;
    }
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    return `https://dev.collpro.uz/${path}`;
  };

  return (
    <>
      {/* Toggle Button */}
      {/* <TouchableOpacity
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
          <View>
            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
              Documents ({documents.length})
            </Text>
            {loading && (
              <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                Loading...
              </Text>
            )}
          </View>
        </View>
        <ChevronDown 
          color="#64748b" 
          size={20}
          style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity> */}

      {/* Documents Grid */}
      {/* {expanded && (
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
                Loading documents...
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
                No documents uploaded yet
              </Text>
            </View>
          ) : (
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              gap: 8
            }}>
              {documents.map((doc, index) => {
                const imageUrl = getImageUrl(doc);

                return (
                  <TouchableOpacity
                    key={doc.id || index}
                    onPress={() => onDocumentPress(doc)}
                    style={{
                      width: '48%',
                      aspectRatio: 1,
                      backgroundColor: '#1e293b',
                      borderRadius: 10,
                      overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: '#334155',
                    }}
                  >
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ 
                        flex: 1, 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        backgroundColor: '#334155'
                      }}>
                        <ImageIcon color="#64748b" size={32} />
                        <Text style={{ color: '#64748b', fontSize: 10, marginTop: 4 }}>
                          No preview
                        </Text>
                      </View>
                    )}
                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      padding: 8
                    }}>
                      <Text 
                        style={{ 
                          color: '#ffffff', 
                          fontSize: 11,
                          textAlign: 'center'
                        }}
                        numberOfLines={1}
                      >
                        {doc.fileName || doc.originalName || `Doc ${index + 1}`}
                      </Text>
                      {doc.createdAt && (
                        <Text 
                          style={{ 
                            color: '#94a3b8', 
                            fontSize: 9,
                            textAlign: 'center',
                            marginTop: 2
                          }}
                        >
                          {formatDate(doc.createdAt)}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )} */}
    </>
  );
};

export default DocumentsSection;