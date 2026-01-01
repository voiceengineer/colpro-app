import * as SecureStore from 'expo-secure-store';

const API_URL = "https://dev.collpro.uz/api";
const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export const apiService = {
  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      const token = data.access_token;
      const user = data.user;

      if (!token) {
        throw new Error("Token missing in response");
      }

      await SecureStore.setItemAsync(TOKEN_KEY, token);
      if (user) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      }

      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      const token = await this.getToken();
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (e) {
      // Continue with local cleanup
    } finally {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  },

  async getToken() {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      return null;
    }
  },

  async getUser() {
    try {
      const data = await SecureStore.getItemAsync(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },

  async isAuthenticated() {
    try {
      const token = await this.getToken();
      return token !== null && token !== undefined && token !== '';
    } catch (error) {
      return false;
    }
  },

  async hasPermission(permissionSlug) {
    try {
      const user = await this.getUser();
      if (!user) return false;

      if (user.permissions && Array.isArray(user.permissions)) {
        return user.permissions.includes(permissionSlug);
      }

      if (user.role && user.role.permissions && Array.isArray(user.role.permissions)) {
        if (user.role.permissions.some(p => typeof p === 'string')) {
          return user.role.permissions.includes(permissionSlug);
        }
        return user.role.permissions.some(p => 
          typeof p === 'object' && p.slug === permissionSlug
        );
      }
      
      return false;
    } catch (error) {
      return false;
    }
  },

  async getDebtors(params = {}) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("UNAUTHORIZED");

      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      queryParams.append('limit', params.limit || '50');

      const url = `${API_URL}/debtors?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) throw new Error("UNAUTHORIZED");
      if (!response.ok) throw new Error("Failed to fetch debtors");

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  async getDebtorById(debtorId) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("UNAUTHORIZED");

      const url = `${API_URL}/debtors/${debtorId}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) throw new Error("UNAUTHORIZED");
      if (response.status === 404) throw new Error("Debtor not found");
      if (!response.ok) throw new Error("Failed to fetch debtor details");

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  async getCases(params = {}) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("UNAUTHORIZED");

      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.statusId) queryParams.append('statusId', params.statusId);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.collectionStage) queryParams.append('collectionStage', params.collectionStage);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const queryString = queryParams.toString();
      const url = `${API_URL}/cases${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) throw new Error("UNAUTHORIZED");
      if (response.status === 403) throw new Error("FORBIDDEN");
      if (!response.ok) throw new Error(`API Error ${response.status}`);

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  async getCaseById(caseId) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("UNAUTHORIZED");

      const response = await fetch(`${API_URL}/cases/${caseId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) throw new Error("UNAUTHORIZED");
      if (response.status === 403) throw new Error("FORBIDDEN");
      if (response.status === 404) throw new Error("Case not found");
      if (!response.ok) throw new Error(`Failed to fetch case`);

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  async getCaseStatuses() {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("UNAUTHORIZED");

      const response = await fetch(`${API_URL}/cases/statuses`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) throw new Error("UNAUTHORIZED");
      if (response.status === 403) throw new Error("FORBIDDEN");
      if (!response.ok) throw new Error(`Failed to fetch statuses`);

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  async updateCase(caseId, updateData) {
    try {
      const token = await this.getToken();
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
    } catch (error) {
      throw error;
    }
  },

  async uploadFile(caseId, fileUri, fileName, mimeType) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("UNAUTHORIZED");

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        let uploadTimeout = setTimeout(() => {
          xhr.abort();
          reject(new Error("TIMEOUT"));
        }, 60000);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
          }
        };

        xhr.onload = () => {
          clearTimeout(uploadTimeout);

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              resolve({ success: true, message: 'Upload successful' });
            }
          } else if (xhr.status === 401) {
            reject(new Error("UNAUTHORIZED"));
          } else if (xhr.status === 403) {
            reject(new Error("FORBIDDEN"));
          } else if (xhr.status === 404) {
            reject(new Error("ENDPOINT_NOT_FOUND"));
          } else if (xhr.status === 413) {
            reject(new Error("FILE_TOO_LARGE"));
          } else if (xhr.status === 502) {
            reject(new Error("SERVER_UNAVAILABLE"));
          } else {
            reject(new Error(`Upload failed: HTTP ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          clearTimeout(uploadTimeout);
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
    } catch (error) {
      throw error;
    }
  },

  async getCaseDocuments(caseId) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("UNAUTHORIZED");

      const url = `${API_URL}/files?entityType=case&entityId=${caseId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) throw new Error("UNAUTHORIZED");
      if (response.status === 403) throw new Error("FORBIDDEN");
      
      if (response.status === 404 || response.status === 501) {
        return [];
      }
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      let documents = [];
      
      if (Array.isArray(data)) {
        documents = data;
      } else if (data.items && Array.isArray(data.items)) {
        documents = data.items;
      } else if (data.data && Array.isArray(data.data)) {
        documents = data.data;
      }
      
      return documents.map(doc => ({
        id: doc.id,
        fileName: doc.fileName || 'document',
        originalName: doc.originalName || doc.fileName,
        filePath: doc.filePath,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        documentType: doc.documentType,
        entityType: doc.entityType,
        entityId: doc.entityId,
        createdAt: doc.createdAt,
        uploadedBy: doc.uploadedBy,
        uploadedByName: doc.uploadedByName
      }));
      
    } catch (error) {
      if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
        throw error;
      }
      
      return [];
    }
  },

  async getPaymentHistory(accountId) {
    try {
      const token = await this.getToken();
      if (!token) return [];

      const response = await fetch(`${API_URL}/payments?accountId=${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404 || response.status === 501) return [];
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : (data.items || data.data || []);
      }

      return [];
    } catch (error) {
      return [];
    }
  },

  async getUserCasesCount(userId) {
    try {
      const response = await this.getCases({ 
        limit: 1000
      });

      if (Array.isArray(response)) {
        return response.length;
      } else if (response?.items && Array.isArray(response.items)) {
        return response.items.length;
      } else if (response?.data && Array.isArray(response.data)) {
        return response.data.length;
      } else if (response?.meta?.total !== undefined) {
        return response.meta.total;
      } else if (response?.total !== undefined) {
        return response.total;
      }

      return 0;
    } catch (error) {
      throw error;
    }
  },
};