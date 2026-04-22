import { defineStore } from "pinia";
import api from "@/api";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: JSON.parse(localStorage.getItem("cartItems") || "[]"),
    customer: { _id: null, name: "", phone: "", address: "" }, // _id нужен для схемы
    orders: [],
    error: null,
  }),

  getters: {
    itemCount: (state) => state.items.length,
    totalPrice: (state) =>
      state.items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      ),
  },

  actions: {
    async fetchCustomer() {
      const res = await api.get("/customer");
      this.customer = res.data || { _id: null, name: "", phone: "", address: "" };
    },

    async setCustomerInfo({ name, phone, address }) {
      this.customer = { ...this.customer, name, phone, address };
      const res = await api.post("/customer", this.customer);
      if (res.data && res.data._id) {
        this.customer._id = res.data._id;
      }
    },

    async checkout() {
      try {
        const total = Number(this.totalPrice);
        if (!total || isNaN(total)) {
          throw new Error("Ошибка: сумма заказа не рассчитана");
        }

        const order = {
          customer: {
            name: this.customer.name,
            phone: this.customer.phone,
            address: this.customer.address,
          },
          items: this.items.map((item) => ({
            product: item._id,
            quantity: item.quantity,
            price: Number(item.price),
            color: item.color || null,
          })),
          total,
        };

        console.log("Отправляем заказ:", order);

        const res = await api.post("/orders", order);
        this.clearCart();
        return res.data;
      } catch (err) {
        console.error("Ошибка оформления заказа:", err.message);
        this.error = err;
        throw err;
      }
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
        this.items.push({
          _id: product._id,
          name: product.name,
          price: Number(product.price), // всегда число
          image: product.image,
          color: product.selectedColor || product.colors[0] || null,
          attributes: product.attributes || {},
          quantity: 1,
        });
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
