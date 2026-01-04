import * as SecureStore from 'expo-secure-store';
import { authService } from './authService';

const API_URL = "https://dev.collpro.uz/api";
const BASE_URL = "https://dev.collpro.uz";

export const documentsService = {
  // Get attachments for field visit task
  async getTaskAttachments(taskId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/field-visit/tasks/${taskId}/attachments`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) return [];
    if (!response.ok) return [];

    const data = await response.json();
    
    return Array.isArray(data) ? data.map(doc => ({
      id: doc.id,
      fileName: doc.fileName,
      originalName: doc.originalName,
      filePath: doc.filePath,
      downloadUrl: `${API_URL}/field-visit/attachments/${doc.id}/download`,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      attachmentType: doc.attachmentType,
      description: doc.description,
      taskId: doc.taskId,
      uploadedBy: doc.uploadedBy,
      uploader: doc.uploader,
      uploadedByName: doc.uploader?.name || 'Unknown',
      createdAt: doc.createdAt
    })) : [];
  },

  // Upload to field visit task
  async uploadTaskAttachment(taskId, fileUri, fileName, mimeType) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const timeout = setTimeout(() => {
        xhr.abort();
        reject(new Error("TIMEOUT"));
      }, 60000);

      xhr.onload = () => {
        clearTimeout(timeout);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Upload successful:', response);
            resolve(response);
          } catch (e) {
            resolve({ success: true });
          }
        } else if (xhr.status === 404) {
          reject(new Error("TASK_NOT_FOUND"));
        } else if (xhr.status === 413) {
          reject(new Error("FILE_TOO_LARGE"));
        } else {
          reject(new Error(`Upload failed: HTTP ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("NETWORK_ERROR"));
      };

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: mimeType
      });

      xhr.open('POST', `${API_URL}/field-visit/tasks/${taskId}/attachments`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  },

  // Upload to files endpoint (fallback)
  async uploadFile(caseId, fileUri, fileName, mimeType) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const timeout = setTimeout(() => {
        xhr.abort();
        reject(new Error("TIMEOUT"));
      }, 60000);

      xhr.onload = () => {
        clearTimeout(timeout);

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Upload successful:', response);
            resolve(response);
          } catch (e) {
            resolve({ success: true });
          }
        } else if (xhr.status === 413) {
          reject(new Error("FILE_TOO_LARGE"));
        } else {
          reject(new Error(`Upload failed: HTTP ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("NETWORK_ERROR"));
      };

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: mimeType
      });
      formData.append('entityType', 'case');
      formData.append('entityId', String(caseId));
      formData.append('documentType', 'photo');

      xhr.open('POST', `${API_URL}/files/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  },

  // Delete attachment
  async deleteTaskAttachment(taskId, attachmentId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/field-visit/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (response.status === 404) throw new Error("NOT_FOUND");
    if (!response.ok) throw new Error("Failed to delete attachment");

    return true;
  },

  // Delete local upload
  async deleteLocalUpload(caseId, uploadId) {
    try {
      const key = `case_uploads_${caseId}`;
      const data = await SecureStore.getItemAsync(key);
      if (!data) return false;
      
      const uploads = JSON.parse(data);
      const filtered = uploads.filter(u => u.id !== uploadId);
      
      await SecureStore.setItemAsync(key, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete local upload:', error);
      return false;
    }
  },

  // Local storage methods
  async saveLocalUpload(caseId, fileInfo) {
    try {
      const key = `case_uploads_${caseId}`;
      const existing = await SecureStore.getItemAsync(key);
      const uploads = existing ? JSON.parse(existing) : [];
      
      uploads.push({
        ...fileInfo,
        id: `local_${Date.now()}`,
        uploadedAt: new Date().toISOString()
      });
      
      await SecureStore.setItemAsync(key, JSON.stringify(uploads));
    } catch (error) {
      console.error('Failed to save local upload:', error);
    }
  },

  async getLocalUploads(caseId) {
    try {
      const key = `case_uploads_${caseId}`;
      const data = await SecureStore.getItemAsync(key);
      if (!data) return [];
      
      const uploads = JSON.parse(data);
      
      return uploads.map(upload => ({
        id: upload.id,
        fileName: upload.fileName,
        originalName: upload.fileName,
        filePath: upload.filePath,
        fileSize: upload.fileSize,
        mimeType: upload.mimeType,
        documentType: 'photo',
        isBase64: upload.isBase64,
        createdAt: upload.createdAt || upload.uploadedAt,
        uploadedByName: 'You'
      }));
    } catch (error) {
      return [];
    }
  },

  // Build multiple possible image URLs
  buildImageUrls(doc) {
    if (!doc) return [];
    
    // Check if it's a base64 image stored locally
    if (doc.isBase64 && doc.filePath?.startsWith('data:')) {
      return [doc.filePath]; // Return base64 directly
    }
    
    // Priority 1: Download URL (for field visit attachments)
    if (doc.downloadUrl) {
      return [doc.downloadUrl];
    }
    
    // Priority 2: Direct path
    const path = doc.filePath || doc.url;
    if (!path) return [];
    
    // Already a full URL
    if (path.startsWith('http')) {
      return [path];
    }
    
    // Base64 data URL
    if (path.startsWith('data:')) {
      return [path];
    }
    
    const urls = [];
    
    // For server uploaded files - build proper URLs
    if (path.startsWith('uploads/field-visits/')) {
      // Pattern 1: Direct static file access
      urls.push(`${BASE_URL}/${path}`);
      
      // Pattern 2: API endpoint
      const filename = path.split('/').pop();
      urls.push(`${BASE_URL}/api/files/${filename}`);
    } else if (path.startsWith('uploads/')) {
      // Generic uploads folder
      urls.push(`${BASE_URL}/${path}`);
      urls.push(`${BASE_URL}/api/files/${path}`);
    } else if (path.startsWith('/')) {
      urls.push(`${BASE_URL}${path}`);
    } else {
      urls.push(`${BASE_URL}/${path}`);
    }
    
    return urls;
  },

  // Build image URL (synchronous for component use) - returns first URL to try
  buildImageUrl(doc) {
    const urls = this.buildImageUrls(doc);
    return urls.length > 0 ? urls[0] : null;
  },
};