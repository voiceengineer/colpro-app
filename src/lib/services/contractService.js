import * as SecureStore from 'expo-secure-store';

const API_URL = "https://dev.collpro.uz/api";
const TOKEN_KEY = "auth_token";

export const contractService = {
  async getToken() {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async getContractDocuments(userId) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_URL}/contract-documents?userId=${userId}`, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch contract documents");
      }

      return data;
    } catch (error) {
      console.error('Error fetching contract documents:', error);
      throw error;
    }
  },

  async getContractDocumentById(documentId) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_URL}/contract-documents/${documentId}`, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch contract document");
      }

      return data;
    } catch (error) {
      console.error('Error fetching contract document:', error);
      throw error;
    }
  },

  async downloadContractPDF(storageUrl) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Construct full URL if needed
      const fullUrl = storageUrl.startsWith('http') 
        ? storageUrl 
        : `${API_URL.replace('/api', '')}/${storageUrl}`;

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      return response.blob();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  },
};