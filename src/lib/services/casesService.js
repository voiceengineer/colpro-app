import { authService } from './authService';

const API_URL = "https://dev.collpro.uz/api";

export const casesService = {
  async getCases(params = {}) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const url = `${API_URL}/cases${queryParams.toString() ? '?' + queryParams : ''}`;
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (!response.ok) throw new Error(`API Error ${response.status}`);

    return await response.json();
  },

  async getCaseById(caseId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/cases/${caseId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (response.status === 404) throw new Error("Case not found");
    if (!response.ok) throw new Error("Failed to fetch case");

    return await response.json();
  },

  async getCaseStatuses() {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/cases/statuses`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (!response.ok) throw new Error("Failed to fetch statuses");

    return await response.json();
  },

  async updateCase(caseId, updateData) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/cases/${caseId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (response.status === 502) throw new Error("SERVER_UNAVAILABLE");
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update case");
    }

    return await response.json();
  },

  async getUserCasesCount(userId) {
    try {
      const response = await this.getCases({ limit: 1000, agentId: userId });

      if (Array.isArray(response)) return response.length;
      if (response?.items) return response.items.length;
      if (response?.data) return response.data.length;
      if (response?.meta?.total) return response.meta.total;
      if (response?.total) return response.total;

      return 0;
    } catch (error) {
      throw error;
    }
  },

  // Documents endpoints
  async getCaseDocuments(caseId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/cases/${caseId}/documents`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (!response.ok) throw new Error("Failed to fetch documents");

    return await response.json();
  },
// REPLACE the old uploadCaseDocument with this one:
  async uploadCaseDocument(caseId, fileUri) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    // Correct Endpoint for Cases
    const url = `${API_URL}/cases/${caseId}/documents`;

    // 1. Prepare File Details
    const uri = fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`;
    const fileType = uri.endsWith('png') ? 'image/png' : 'image/jpeg';
    const fileName = `upload_${Date.now()}.${uri.endsWith('png') ? 'png' : 'jpg'}`;

    // 2. Use XMLHttpRequest (Matches tasksService implementation)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      
      // Headers
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Accept', 'application/json');
      // CRITICAL: Do NOT set Content-Type here. 
      // The browser/native layer sets it automatically with the boundary.

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.response);
            resolve(response);
          } catch (e) {
            resolve({}); // Handle empty success response
          }
        } else {
          console.error("XHR Failed:", xhr.responseText);
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || `Upload failed: ${xhr.status}`));
          } catch (e) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = (e) => {
        console.error("XHR Network Error:", e);
        reject(new Error("Network request failed"));
      };

      // 3. Construct FormData
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: fileName,
        type: fileType,
      });

      // Optional: Add description if your API supports it for cases
      // formData.append('description', 'Uploaded via Mobile App');

      // 4. Send
      xhr.send(formData);
    });
  },
// In casesService.js
getDocumentDownloadUrl(caseId, documentId) {
    return `${API_URL}/cases/${caseId}/documents/${documentId}/download`;
},
  async downloadCaseDocument(caseId, documentId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/cases/${caseId}/documents/${documentId}/download`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (response.status === 404) throw new Error("Document not found");
    if (!response.ok) throw new Error("Failed to download document");

    return await response.blob();
  },

  // NEW: Get document details with preview URL
  async getDocumentDetails(caseId, documentId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    try {
      const blob = await this.downloadCaseDocument(caseId, documentId);
      const url = URL.createObjectURL(blob);
      return { blob, url, type: blob.type };
    } catch (error) {
      console.error('Failed to get document details:', error);
      throw error;
    }
  },

  async deleteCaseDocument(caseId, documentId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/cases/${caseId}/documents/${documentId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (!response.ok) throw new Error("Failed to delete document");

    return await response.json();
  },

  // Payments endpoints (if available)
  async getCasePayments(caseId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/cases/${caseId}/payments`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (!response.ok) throw new Error("Failed to fetch payments");

    return await response.json();
  },

  // Products endpoints (if available)
  async getCaseProducts(caseId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/cases/${caseId}/products`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (!response.ok) throw new Error("Failed to fetch products");

    return await response.json();
  },

  // Recordings endpoints (if available)
  async getCaseRecordings(caseId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/cases/${caseId}/recordings`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (!response.ok) throw new Error("Failed to fetch recordings");

    return await response.json();
  },
};