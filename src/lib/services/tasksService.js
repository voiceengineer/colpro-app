import { authService } from './authService';

const API_URL = "https://dev.collpro.uz/api";

export const tasksService = {
  async getTasks(params = {}) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const url = `${API_URL}/field-visit/tasks${queryParams.toString() ? '?' + queryParams : ''}`;
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

  async getTaskById(taskId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/field-visit/tasks/${taskId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (response.status === 404) throw new Error("Task not found");
    if (!response.ok) throw new Error("Failed to fetch task");

    return await response.json();
  },

  async updateTask(taskId, updateData) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/field-visit/tasks/${taskId}`, {
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
      throw new Error(errorData.message || "Failed to update task");
    }

    return await response.json();
  },

  async getTaskAttachments(taskId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/field-visit/tasks/${taskId}/attachments`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (!response.ok) throw new Error("Failed to fetch attachments");

    return await response.json();
  },

  async uploadTaskAttachment(taskId, formData) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/field-visit/tasks/${taskId}/attachments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (!response.ok) throw new Error("Failed to upload attachment");

    return await response.json();
  },

  async downloadTaskAttachment(taskId, attachmentId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/field-visit/tasks/${taskId}/attachments/${attachmentId}/download`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (response.status === 404) throw new Error("Attachment not found");
    if (!response.ok) throw new Error("Failed to download attachment");

    return await response.blob();
  },

  async getAttachmentDetails(taskId, attachmentId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    try {
      const blob = await this.downloadTaskAttachment(taskId, attachmentId);
      const url = URL.createObjectURL(blob);
      return { blob, url, type: blob.type };
    } catch (error) {
      console.error('Failed to get attachment details:', error);
      throw error;
    }
  },

  async deleteTaskAttachment(taskId, attachmentId) {
    const token = await authService.getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const response = await fetch(`${API_URL}/field-visit/tasks/${taskId}/attachments/${attachmentId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (!response.ok) throw new Error("Failed to delete attachment");

    return await response.json();
  },
};