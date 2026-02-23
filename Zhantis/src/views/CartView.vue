<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <!-- Кнопка назад -->
    <router-link to="/" class="inline-flex items-center text-gray-700 hover:text-green-600 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Вернуться назад
    </router-link>

    <!-- Табы -->
    <div class="flex space-x-4 mb-6">
      <button @click="activeTab = 'cart'" :class="tabClass('cart')">🛒 Корзина</button>
      <button @click="activeTab = 'orders'" :class="tabClass('orders')">📦 Мои заказы</button>
    </div>

    <!-- Вкладка корзины -->
    <div v-if="activeTab === 'cart'">
      <h2 class="text-2xl font-semibold mb-6">Ваша корзина</h2>

      <!-- Список товаров -->
      <CartItems />

      <!-- Данные покупателя -->
      <CustomerInfo />

      <!-- Кнопка оформления заказа -->
      <div class="text-right">
        <button @click="checkoutOrder" class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
          ✅ Оформить заказ
        </button>
      </div>
    </div>

    <!-- Вкладка заказов -->
    <div v-if="activeTab === 'orders'">
      <OrdersList />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCartStore } from "@/stores/cart";
import CartItems from "@/components/cart/CartItems.vue";
import CustomerInfo from "@/components/cart/CustomerInfo.vue";
import OrdersList from "@/components/cart/OrdersList.vue";

const cartStore = useCartStore();
const activeTab = ref("cart");

onMounted(async () => {
  await cartStore.fetchCustomer();
  await cartStore.fetchOrders();
});

const checkoutOrder = async () => {
  await cartStore.checkout();
  activeTab.value = "orders";
};

const tabClass = (tab) =>
  `px-4 py-2 rounded ${activeTab.value === tab ? "bg-blue-500 text-white" : "bg-gray-200"}`;
</script>