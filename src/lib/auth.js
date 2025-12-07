import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://dev.collpro.uz/api";
const TOKEN_KEY = "@auth_token";
const USER_KEY = "@user_data";

export const authService = {
  async login(username, password) {
    try {
      console.log('🔐 [LOGIN] Starting login...');
      console.log('🔐 [LOGIN] Username:', username);
      console.log('🔐 [LOGIN] API URL:', `${API_URL}/auth/login`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      console.log('🔐 [LOGIN] Response status:', response.status);
      const data = await response.json();
      console.log('🔐 [LOGIN] Response data:', data);

      if (!response.ok) {
        console.error('❌ [LOGIN] Login failed:', data.message);
        throw new Error(data.message || "Invalid credentials");
      }

      const token = data.access_token;
      const user = data.user;

      if (!token) {
        console.error('❌ [LOGIN] Token missing in response');
        throw new Error("Token missing in response");
      }

      console.log('✅ [LOGIN] Token received');
      console.log('✅ [LOGIN] User data:', user);
      
      await AsyncStorage.setItem(TOKEN_KEY, token);
      if (user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      }

      console.log('✅ [LOGIN] Login successful');
      return { token, user };
    } catch (error) {
      console.error('❌ [LOGIN] Error:', error);
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

  async getCases(params = {}) {
    try {
      console.log('📋 [GET CASES] Fetching cases...');
      console.log('📋 [GET CASES] Params:', params);
      
      const token = await this.getToken();
      if (!token) {
        console.error('❌ [GET CASES] No token');
        throw new Error("UNAUTHORIZED");
      }

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
      console.log('📋 [GET CASES] URL:', url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log('📋 [GET CASES] Status:', response.status);
      
      if (response.status === 401) throw new Error("UNAUTHORIZED");
      if (response.status === 403) throw new Error("FORBIDDEN");
      if (!response.ok) throw new Error(`API Error ${response.status}`);

      const data = await response.json();
      console.log('✅ [GET CASES] Success. Items:', Array.isArray(data) ? data.length : data.items?.length || data.data?.length || 'unknown');
      return data;
    } catch (error) {
      console.error('❌ [GET CASES] Error:', error);
      throw error;
    }
  },

  async getCaseById(caseId) {
    try {
      console.log('📄 [GET CASE] Fetching case ID:', caseId);
      
      const token = await this.getToken();
      if (!token) {
        console.error('❌ [GET CASE] No token');
        throw new Error("UNAUTHORIZED");
      }

      const url = `${API_URL}/cases/${caseId}`;
      console.log('📄 [GET CASE] URL:', url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log('📄 [GET CASE] Status:', response.status);

      if (response.status === 401) throw new Error("UNAUTHORIZED");
      if (response.status === 403) throw new Error("FORBIDDEN");
      if (response.status === 404) throw new Error("Case not found");
      if (!response.ok) throw new Error(`Failed to fetch case`);

      const data = await response.json();
      console.log('✅ [GET CASE] Success:', data);
      return data;
    } catch (error) {
      console.error('❌ [GET CASE] Error:', error);
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
      console.log('✏️ [UPDATE CASE] Updating case ID:', caseId);
      console.log('✏️ [UPDATE CASE] Update data:', updateData);
      
      const token = await this.getToken();
      if (!token) {
        console.error('❌ [UPDATE CASE] No token');
        throw new Error("UNAUTHORIZED");
      }

      const url = `${API_URL}/cases/${caseId}`;
      console.log('✏️ [UPDATE CASE] URL:', url);
      
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      console.log('✏️ [UPDATE CASE] Status:', response.status);

      if (response.status === 401) throw new Error("UNAUTHORIZED");
      if (response.status === 403) throw new Error("FORBIDDEN");
      if (response.status === 502) throw new Error("SERVER_UNAVAILABLE");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [UPDATE CASE] Error:', errorData);
        throw new Error(errorData.message || "Failed to update case");
      }

      const data = await response.json();
      console.log('✅ [UPDATE CASE] Success:', data);
      return data;
    } catch (error) {
      console.error('❌ [UPDATE CASE] Error:', error);
      throw error;
    }
  },

  /**
   * Upload file to case - React Native compatible version with XMLHttpRequest
   * According to API Guide Section 5: POST /files/upload
   */
  async uploadFile(caseId, fileUri, fileName, mimeType) {
    try {
      console.log('📤 [UPLOAD] Starting upload according to API Guide Section 5...');
      console.log('📤 [UPLOAD] Case ID:', caseId);
      console.log('📤 [UPLOAD] File URI:', fileUri);
      console.log('📤 [UPLOAD] File Name:', fileName);
      console.log('📤 [UPLOAD] MIME Type:', mimeType);
      
      const token = await this.getToken();
      if (!token) {
        console.error('❌ [UPLOAD] No token found');
        throw new Error("UNAUTHORIZED");
      }
      console.log('✅ [UPLOAD] Token found');

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Progress tracking
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            console.log(`📊 [UPLOAD] Progress: ${percentComplete.toFixed(2)}%`);
          }
        };

        xhr.onload = () => {
          console.log('📡 [UPLOAD] Response received');
          console.log('📡 [UPLOAD] Status:', xhr.status);
          console.log('📡 [UPLOAD] Status Text:', xhr.statusText);
          console.log('📡 [UPLOAD] Response Headers:', xhr.getAllResponseHeaders());
          console.log('📡 [UPLOAD] Response text:', xhr.responseText);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('✅ [UPLOAD] Success! Response:', response);
              console.log('✅ [UPLOAD] Document ID:', response.id);
              console.log('✅ [UPLOAD] File Path:', response.filePath);
              resolve(response);
            } catch (e) {
              console.log('✅ [UPLOAD] Success (no JSON response)');
              resolve({ success: true, message: 'Upload successful' });
            }
          } else if (xhr.status === 404) {
            console.error('❌ [UPLOAD] Endpoint not found (404)');
            console.error('❌ [UPLOAD] Response:', xhr.responseText);
            reject(new Error("ENDPOINT_NOT_FOUND - POST /api/files/upload not available"));
          } else if (xhr.status === 502) {
            console.error('❌ [UPLOAD] Bad Gateway (502) - Backend server not responding');
            console.error('❌ [UPLOAD] This means:');
            console.error('   • File was uploaded (100% progress completed)');
            console.error('   • Backend Node.js server crashed or timeout');
            console.error('   • Nginx cannot connect to backend');
            console.error('   • File might be too large');
            console.error('❌ [UPLOAD] Response:', xhr.responseText);
            console.error('❌ [UPLOAD] Backend Team: Check server logs and restart Node.js');
            reject(new Error("SERVER_UNAVAILABLE"));
          } else if (xhr.status === 401) {
            console.error('❌ [UPLOAD] Unauthorized (401)');
            reject(new Error("UNAUTHORIZED"));
          } else if (xhr.status === 403) {
            console.error('❌ [UPLOAD] Forbidden (403)');
            reject(new Error("FORBIDDEN"));
          } else if (xhr.status === 413) {
            console.error('❌ [UPLOAD] File too large (413)');
            reject(new Error("FILE_TOO_LARGE - File exceeds backend size limit"));
          } else {
            console.error('❌ [UPLOAD] Failed with status:', xhr.status);
            try {
              const errorData = JSON.parse(xhr.responseText);
              console.error('❌ [UPLOAD] Error data:', errorData);
              reject(new Error(errorData.message || xhr.responseText || `Upload failed: ${xhr.status}`));
            } catch (e) {
              reject(new Error(xhr.responseText || `Upload failed: ${xhr.status} ${xhr.statusText}`));
            }
          }
        };

        xhr.onerror = (error) => {
          console.error('❌ [UPLOAD] Network error:', error);
          console.error('❌ [UPLOAD] This could mean:');
          console.error('   • No internet connection');
          console.error('   • Backend server is completely down');
          console.error('   • CORS issues');
          reject(new Error("NETWORK_ERROR"));
        };
        
        xhr.ontimeout = () => {
          console.error('❌ [UPLOAD] Timeout after 60 seconds');
          console.error('❌ [UPLOAD] File might be too large or backend too slow');
          reject(new Error("TIMEOUT"));
        };

        // Create FormData according to API Guide Section 5
        const formData = new FormData();
        
        // API Guide Section 5.1 - Required fields:
        // - file (File) - Required
        // - entityType (String) - "case" 
        // - entityId (Integer) - Case ID
        // - documentType (String) - Optional: "passport", "contract", "photo", "receipt", "other"
        
        formData.append('file', {
          uri: fileUri,
          name: fileName,
          type: mimeType
        });
        
        formData.append('entityType', 'case');
        formData.append('entityId', String(caseId));
        formData.append('documentType', 'photo');

        console.log('📦 [UPLOAD] FormData created according to API Guide');
        console.log('📦 [UPLOAD] FormData fields (API Guide Section 5.1):');
        console.log('   ✓ file: { uri, name, type } - REQUIRED');
        console.log('   ✓ entityType: "case" - REQUIRED');
        console.log('   ✓ entityId:', caseId, '- REQUIRED');
        console.log('   ✓ documentType: "photo" - OPTIONAL');

        // API Guide endpoint: POST /files/upload
        const uploadUrl = `${API_URL}/files/upload`;
        console.log('🌐 [UPLOAD] Upload URL (API Guide):', uploadUrl);
        console.log('🌐 [UPLOAD] Method: POST');
        console.log('🌐 [UPLOAD] Authorization: Bearer <token>');
        console.log('🌐 [UPLOAD] Content-Type: multipart/form-data (auto-set)');
        
        xhr.open('POST', uploadUrl);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.timeout = 60000; // 60 second timeout
        
        console.log('📡 [UPLOAD] Sending request...');
        console.log('📡 [UPLOAD] Expected response (API Guide Section 5.1):');
        console.log('   {');
        console.log('     "id": 555,');
        console.log('     "fileName": "passport_scan_123.jpg",');
        console.log('     "filePath": "/uploads/documents/...",');
        console.log('     "fileSize": 245680,');
        console.log('     "mimeType": "image/jpeg",');
        console.log('     "documentType": "passport",');
        console.log('     "entityType": "case",');
        console.log('     "entityId": 123');
        console.log('   }');
        
        xhr.send(formData);
      });
    } catch (error) {
      console.error('❌ [UPLOAD] Exception:', error);
      console.error('❌ [UPLOAD] Error message:', error.message);
      console.error('❌ [UPLOAD] Error stack:', error.stack);
      throw error;
    }
  },

  async getPaymentHistory(accountId) {
    try {
      console.log('💰 [PAYMENTS] Fetching payment history for account:', accountId);
      
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ [PAYMENTS] No token, returning empty array');
        return [];
      }

      const url = `${API_URL}/payments?accountId=${accountId}`;
      console.log('💰 [PAYMENTS] URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('💰 [PAYMENTS] Status:', response.status);

      if (response.status === 404 || response.status === 501) {
        console.log('⚠️ [PAYMENTS] Endpoint not available');
        return [];
      }

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [PAYMENTS] Success:', data);
        return Array.isArray(data) ? data : (data.items || data.data || []);
      }

      console.log('⚠️ [PAYMENTS] Failed, returning empty array');
      return [];
    } catch (error) {
      console.error('❌ [PAYMENTS] Error:', error);
      return [];
    }
  },

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