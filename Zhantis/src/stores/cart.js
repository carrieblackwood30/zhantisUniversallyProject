import { defineStore } from "pinia";
import api from "@/api";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: JSON.parse(localStorage.getItem("cartItems") || "[]"),
    customer: { name: "", phone: "", address: "" },
    orders: [], // 🔑 список заказов
    error: null,
  }),

  getters: {
    itemCount: (state) => state.items.length,
    totalPrice: (state) =>
      state.items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
  },

  actions: {
    async fetchCustomer() {
      const res = await api.get("/customer");
      this.customer = res.data || { name: "", phone: "", address: "" };
    },

    async setCustomerInfo({ name, phone, address }) {
      this.customer = { name, phone, address };
      await api.post("/customer", this.customer);
    },

    async checkout() {
      const res = await api.post("/orders", {
        items: this.items,
        customer: this.customer,
      });
      this.clearCart();
      return res.data;
    },

    async fetchOrders() {
      const res = await api.get("/orders");
      this.orders = res.data;
    },

    saveCart() {
      localStorage.setItem("cartItems", JSON.stringify(this.items));
    },

    addToCart(product) {
      const idx = this.items.findIndex((i) => i._id === product._id);
      if (idx !== -1) {
        this.items[idx].quantity += 1;
      } else {
        this.items.push({ ...product, quantity: 1 });
      }
      this.saveCart();
    },

    decreaseQuantity(id) {
      const idx = this.items.findIndex((i) => i._id === id);
      if (idx === -1) return;
      this.items[idx].quantity -= 1;
      if (this.items[idx].quantity <= 0) this.items.splice(idx, 1);
      this.saveCart();
    },

    removeFromCart(id) {
      this.items = this.items.filter((i) => i._id !== id);
      this.saveCart();
    },

    clearCart() {
      this.items = [];
      this.saveCart();
    },
  },
});