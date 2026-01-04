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

  async getUserCasesCount() {
    try {
      const response = await this.getCases({ limit: 1000 });

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
};