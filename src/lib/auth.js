import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://dev.collpro.uz/api";
const TOKEN_KEY = "@auth_token";
const USER_KEY = "@user_data";

export const authService = {
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

      await AsyncStorage.setItem(TOKEN_KEY, token);
      if (user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
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
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    }
  },

  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      return null;
    }
  },

  async getUser() {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
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

  /**
   * Check if user has a specific permission
   */
  async hasPermission(permissionSlug) {
    try {
      const user = await this.getUser();
      
      if (!user) {
        return false;
      }

      // Handle permissions as array of strings (your API format)
      if (user.permissions && Array.isArray(user.permissions)) {
        return user.permissions.includes(permissionSlug);
      }

      // Fallback: Check role permissions
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

  /**
   * Get all cases with filters
   */
  async getCases(params = {}) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("No authentication token found");

      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.statusId) queryParams.append('statusId', params.statusId);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.collectionStage) queryParams.append('collectionStage', params.collectionStage);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.agentId) queryParams.append('agentId', params.agentId);

      const queryString = queryParams.toString();
      const url = `${API_URL}/cases${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      if (response.status === 403) {
        throw new Error("FORBIDDEN");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single case by ID
   */
  async getCaseById(caseId) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_URL}/cases/${caseId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      if (response.status === 403) {
        throw new Error("FORBIDDEN");
      }

      if (response.status === 404) {
        throw new Error("Case not found");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch case: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get case statuses
   */
  async getCaseStatuses() {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_URL}/cases/statuses`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      if (response.status === 403) {
        throw new Error("FORBIDDEN");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch statuses: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update case (status and/or remarks)
   */
  async updateCase(caseId, updateData) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_URL}/cases/${caseId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      if (response.status === 403) {
        throw new Error("FORBIDDEN");
      }

      if (response.status === 502) {
        throw new Error("SERVER_UNAVAILABLE");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update case");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload file to case
   */
  async uploadFile(caseId, fileUri, fileName, mimeType) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("No authentication token found");

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              resolve({ success: true });
            }
          } else if (xhr.status === 502) {
            reject(new Error("SERVER_UNAVAILABLE"));
          } else if (xhr.status === 401) {
            reject(new Error("UNAUTHORIZED"));
          } else if (xhr.status === 403) {
            reject(new Error("FORBIDDEN"));
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || `Upload failed: ${xhr.status}`));
            } catch (e) {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error("NETWORK_ERROR"));
        xhr.ontimeout = () => reject(new Error("TIMEOUT"));

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

  /**
   * Get payment history for account
   * Returns empty array if endpoint is not available
   */
  async getPaymentHistory(accountId) {
    try {
      const token = await this.getToken();
      if (!token) return [];

      const response = await fetch(
        `${API_URL}/payments?accountId=${accountId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // If endpoint not ready, return empty array
      if (response.status === 404 || response.status === 501) {
        console.log('Payment endpoint not available yet');
        return [];
      }

      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : (data.items || data.data || []);
      }

      return [];
    } catch (error) {
      console.log('Payment history error:', error);
      return [];
    }
  },

  /**
   * Count user's cases
   */
  async getUserCasesCount(userId) {
    try {
      const response = await this.getCases({ 
        agentId: userId, 
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