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

  async getAllPermissions() {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_URL}/permissions`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch permissions: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async hasPermission(permissionSlug) {
    try {
      const user = await this.getUser();
      
      if (!user) {
        return false;
      }

      if (user.permissions && Array.isArray(user.permissions)) {
        return user.permissions.some(p => 
          p.slug === permissionSlug || p === permissionSlug
        );
      }

      if (user.role && user.role.permissions && Array.isArray(user.role.permissions)) {
        return user.role.permissions.some(p => 
          p.slug === permissionSlug || p === permissionSlug
        );
      }
      
      return false;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get all cases with filters
   * According to documentation: GET /cases
   * Query params: page, limit, search, statusId, priority, collectionStage, sortBy, sortOrder, agentId
   */
  async getCases(params = {}) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("No authentication token found");

      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add all supported query parameters from documentation
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

      // Handle error responses
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      if (response.status === 403) {
        throw new Error("FORBIDDEN - Missing view_hard_collection permission");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      // Parse JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single case by ID
   * According to documentation: GET /cases/{id}
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
        throw new Error("FORBIDDEN - Missing view_hard_collection permission");
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
   * According to documentation: GET /cases/statuses
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
   * Count user's cases by filtering with agentId
   * Uses GET /cases with agentId parameter
   */
  async getUserCasesCount(userId) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("No authentication token found");

      // Fetch cases filtered by agentId with high limit
      const response = await this.getCases({ 
        agentId: userId, 
        limit: 1000 
      });

      let count = 0;
      
      // Handle different response structures - FIXED TO INCLUDE items
      if (Array.isArray(response)) {
        count = response.length;
      } else if (response?.items && Array.isArray(response.items)) {
        // YOUR API FORMAT - items property
        count = response.items.length;
      } else if (response?.data && Array.isArray(response.data)) {
        count = response.data.length;
      } else if (response?.meta?.total !== undefined) {
        count = response.meta.total;
      } else if (response?.total !== undefined) {
        count = response.total;
      }

      return count;
    } catch (error) {
      throw error;
    }
  },
};