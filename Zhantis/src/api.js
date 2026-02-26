import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Добавляем токен в каждый запрос
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  const token = authStore.accessToken || localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Если сервер вернул 401 → пробуем обновить токен
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await authStore.refreshAccessToken();
      const newToken = authStore.accessToken;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;