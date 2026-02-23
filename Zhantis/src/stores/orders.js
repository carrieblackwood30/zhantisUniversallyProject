// stores/orders.js
import { defineStore } from "pinia";
import api from "@/api";

export const useOrdersStore = defineStore("orders", {
  state: () => ({
    orders: [],
    stages: ["обработка", "согласование", "отгрузка", "доставка", "товар получен"],
  }),

  getters: {
    // Получаем следующую стадию для заказа
    nextStage: (state) => {
      return (currentStatus) => {
        const idx = state.stages.indexOf(currentStatus);
        if (idx === -1) return state.stages[0]; // если статус пустой → начинаем с "обработка"
        return state.stages[idx + 1] || null;   // если достигнут конец → null
      };
    },
  },

  actions: {
    async fetchOrdersAdmin() {
      const res = await api.get("/orders/all");
      this.orders = res.data;
    },

    async updateOrderStatus(orderId, status) {
      const res = await api.patch(`/orders/${orderId}`, { status });
      // обновляем локально
      const idx = this.orders.findIndex(o => o._id === orderId);
      if (idx !== -1) {
        this.orders[idx].status = res.data.status;
      }
    },

    // Продвигаем заказ на следующую стадию
    async advanceOrderStage(order) {
      const newStatus = this.nextStage(order.status);
      if (!newStatus) return; // заказ уже завершён
      await this.updateOrderStatus(order._id, newStatus);
    }
  }
});