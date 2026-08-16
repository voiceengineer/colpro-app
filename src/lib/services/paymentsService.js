import { authService } from './authService';

const API_URL = "https://mercantile-varahi.wm4tech.com/api";

export const paymentsService = {
  async getPaymentHistory(accountId) {
    try {
      const token = await authService.getToken();
      if (!token) return [];

      const response = await fetch(`${API_URL}/payments?accountId=${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404 || response.status === 501) return [];
      if (!response.ok) return [];

      const data = await response.json();
      return Array.isArray(data) ? data : (data.items || data.data || []);
    } catch (error) {
      return [];
    }
  },
};