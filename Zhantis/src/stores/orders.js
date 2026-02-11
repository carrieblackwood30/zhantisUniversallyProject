import { defineStore } from "pinia";
import api from "@/api";

export const useOrdersStore = defineStore("orders", {
  state: () => ({
    orders: [],
  }),
  actions: {
    async fetchOrdersAdmin() {
      const res = await api.get("/orders/all"); // 👈 админский маршрут
      this.orders = res.data;
    },
    async fetchOrdersUser() {
      const res = await api.get("/orders"); // 👈 обычный маршрут
      this.orders = res.data;
    },
  },
});