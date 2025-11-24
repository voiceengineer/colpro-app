import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://dev.collpro.uz/api";
const TOKEN_KEY = "@auth_token";
const USER_KEY = "@user_data";

export const authService = {
  /**
   * Login user with username and password
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<{token: string, user: object}>} Token and user data
   */
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

      // Extract token and user from response
      const token = data.access_token;
      const user = data.user;

      if (!token) {
        throw new Error("Token missing in response");
      }

      // Save token and user data to AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, token);
      if (user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      }

      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user and clear stored data
   * Calls API logout endpoint and removes token/user from storage
   */
  async logout() {
    try {
      const token = await this.getToken();

      // Call API logout endpoint if token exists
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
      // Continue with logout even if API call fails
    } finally {
      // Always clear stored data
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    }
  },

  /**
   * Get stored authentication token
   * @returns {Promise<string|null>} Authentication token or null
   */
  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      return null;
    }
  },

  /**
   * Get stored user data
   * @returns {Promise<object|null>} User data object or null
   */
  async getUser() {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} True if user has valid token
   */
  async isAuthenticated() {
    try {
      const token = await this.getToken();
      return token !== null && token !== undefined && token !== '';
    } catch (error) {
      return false;
    }
  },

  /**
   * Get user's assigned cases
   * @param {number} userId - ID of the user
   * @returns {Promise<object>} Case data object
   * @throws {Error} If authentication fails or request fails
   */
  async getUserCases(userId) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Make API request to get cases
      const response = await fetch(`${API_URL}/cases/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Handle unauthorized error (expired token)
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch cases: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);
      return data;
    } catch (error) {
      throw error;
    }
  },
};