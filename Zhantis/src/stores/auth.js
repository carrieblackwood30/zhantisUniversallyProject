// stores/auth.js
import { defineStore } from "pinia";
import api from "@/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    error: null,
  }),

  actions: {
    // Регистрация
    async register(name, username, email, password) {
      try {
        const res = await api.post("/auth/register", {
          name,
          username,
          email,
          password,
        });

        this.user = res.data.user;
        this.accessToken = res.data.accessToken;
        this.refreshToken = res.data.refreshToken;

        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("accessToken", this.accessToken);
        localStorage.setItem("refreshToken", this.refreshToken);

        return true;
      } catch (err) {
        this.error = err.response?.data?.error || "Ошибка регистрации";
        return false;
      }
    },

    // Логин
    async login(email, password) {
      try {
        const res = await api.post("/auth/login", {
          email,
          password,
        });

        this.user = res.data.user;
        this.accessToken = res.data.accessToken;
        this.refreshToken = res.data.refreshToken;

        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("accessToken", this.accessToken);
        localStorage.setItem("refreshToken", this.refreshToken);

        return true;
      } catch (err) {
        this.error = err.response?.data?.error || "Ошибка входа";
        return false;
      }
    },

    // Обновление accessToken
    async refreshAccessToken() {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("Нет refreshToken");

        const res = await api.post("/auth/refresh", { refreshToken });

        this.accessToken = res.data.accessToken;
        localStorage.setItem("accessToken", this.accessToken);
      } catch (err) {
        console.error("Ошибка обновления токена", err.response?.data || err);
        this.logout();
      }
    },

    // Выход
    logout() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },

    // Восстановление пользователя из localStorage
    restoreUser() {
      const user = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (user && accessToken && refreshToken) {
        this.user = JSON.parse(user);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
      }
    },
  },
});