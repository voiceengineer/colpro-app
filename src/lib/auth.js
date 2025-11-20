import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://dev.collpro.uz/api";
const TOKEN_KEY = "@auth_token";
const USER_KEY = "@user_data";

export const authService = {
  // Login
  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Extract token and user
      const token = data.access_token;
      const user = data.user;

      if (!token) {
        throw new Error("Token missing in response");
      }

      // Save to storage
      await AsyncStorage.setItem(TOKEN_KEY, token);
      if (user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      }

      return { token, user };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Logout
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
      console.log("Logout error:", e);
    } finally {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    }
  },

  // Get token
  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  // Get user
  async getUser() {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  // Check auth
  async isAuthenticated() {
    try {
      const token = await this.getToken();
      return token !== null && token !== undefined && token !== '';
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  },
};