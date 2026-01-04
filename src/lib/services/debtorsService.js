import { authService } from './authService';

const API_URL = "https://dev.collpro.uz/api";

export const debtorsService = {
  async getDebtors(params = {}) {
    const token = await authService.getToken();
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
  },

  async getDebtorById(debtorId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/debtors/${debtorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 404) throw new Error("Debtor not found");
    if (!response.ok) throw new Error("Failed to fetch debtor details");

    return await response.json();
  },
};