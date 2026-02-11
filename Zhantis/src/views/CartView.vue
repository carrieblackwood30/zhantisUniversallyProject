<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <!-- Кнопка назад -->
    <router-link
      to="/"
      class="inline-flex items-center text-gray-700 hover:text-green-600 mb-4"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 19l-7-7 7-7" />
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
      <div v-if="cartStore.items.length > 0" class="bg-white p-4 rounded shadow mb-6">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-2">Фото</th>
              <th class="border p-2">Название</th>
              <th class="border p-2">Цена</th>
              <th class="border p-2">Кол-во</th>
              <th class="border p-2">Удалить</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cartStore.items" :key="item._id">
              <td class="border p-2">
                <img :src="getImageUrl(item.image)" class="w-16 h-16 object-cover rounded" />
              </td>
              <td class="border p-2">{{ item.name }}</td>
              <td class="border p-2">{{ item.price }} ₸</td>

              <!-- Количество -->
              <td class="border p-2">
                <div class="flex items-center space-x-2">
                  <button
                    @click="cartStore.decreaseQuantity(item._id)"
                    class="bg-gray-300 px-2 rounded hover:bg-gray-400"
                  >-</button>

                  <input
                    type="number"
                    v-model.number="item.quantity"
                    @change="updateQuantity(item)"
                    min="1"
                    class="w-16 border text-center"
                  />

                  <button
                    @click="cartStore.addToCart(item)"
                    class="bg-gray-300 px-2 rounded hover:bg-gray-400"
                  >+</button>
                </div>
              </td>

              <td class="border p-2">
                <button @click="cartStore.removeFromCart(item._id)" class="bg-red-500 text-white px-2 py-1 rounded">
                  ✖
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-4 text-right font-semibold">
          Итого: {{ cartStore.totalPrice }} ₸
        </div>
      </div>

      <!-- Данные покупателя -->
      <div class="bg-white p-4 rounded shadow mb-6">
        <h3 class="text-lg font-semibold mb-4">Данные покупателя</h3>

        <!-- Таблица с данными -->
        <div v-if="cartStore.customer.name || cartStore.customer.phone || cartStore.customer.address">
          <table class="w-full border-collapse mb-4">
            <tbody>
              <tr>
                <td class="border p-2 font-semibold">Имя:</td>
                <td class="border p-2">{{ cartStore.customer.name }}</td>
              </tr>
              <tr>
                <td class="border p-2 font-semibold">Телефон:</td>
                <td class="border p-2">{{ cartStore.customer.phone }}</td>
              </tr>
              <tr>
                <td class="border p-2 font-semibold">Адрес доставки:</td>
                <td class="border p-2">{{ cartStore.customer.address }}</td>
              </tr>
            </tbody>
          </table>

          <button
            @click="editing = true"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            ✏️ Изменить
          </button>
        </div>

        <!-- Если данных нет -->
        <div v-else>
          <p class="text-gray-500 mb-2">Нет сохранённых данных</p>
          <button
            @click="editing = true"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            ➕ Добавить информацию
          </button>
        </div>

        <!-- Форма редактирования -->
        <div v-if="editing" class="mt-4">
          <input v-model="customer.name" placeholder="Ваше имя" class="border p-2 w-full mb-2" />
          <input v-model="customer.phone" placeholder="Телефон" class="border p-2 w-full mb-2" />
          <textarea v-model="customer.address" placeholder="Адрес доставки" class="border p-2 w-full mb-2"></textarea>

          <button
            @click="saveCustomer"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
          >
            💾 Сохранить
          </button>
          <button
            @click="editing = false"
            class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Отмена
          </button>
        </div>
      </div>

      <!-- Кнопка оформления заказа -->
      <div class="text-right">
        <button
          @click="checkoutOrder"
          class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          ✅ Оформить заказ
        </button>
      </div>
    </div>

    <!-- Вкладка заказов -->
    <div v-if="activeTab === 'orders'">
      <h3 class="text-lg font-semibold mb-4">Ваши заказы</h3>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2">Дата</th>
            <th class="border p-2">Товары</th>
            <th class="border p-2">Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in cartStore.orders" :key="order._id">
            <td class="border p-2">{{ new Date(order.createdAt).toLocaleString() }}</td>
            <td class="border p-2">
              <ul>
                <li v-for="item in order.items" :key="item.productId">
                  {{ item.name }} (x{{ item.quantity }})
                </li>
              </ul>
            </td>
            <td class="border p-2">{{ order.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useCartStore } from "@/stores/cart";

const cartStore = useCartStore();
const activeTab = ref("cart");
const editing = ref(false);
const customer = reactive({ ...cartStore.customer });

onMounted(async () => {
  await cartStore.fetchCustomer();
  Object.assign(customer, cartStore.customer);
  await cartStore.fetchOrders();
});

const saveCustomer = async () => {
  await cartStore.setCustomerInfo(customer);
  editing.value = false;
};

const checkoutOrder = async () => {
  await cartStore.checkout();
  activeTab.value = "orders";
};

const updateQuantity = (item) => {
  if (item.quantity < 1) item.quantity = 1;
  cartStore.saveCart();
};

const getImageUrl = (path) => {
  if (!path) return "/no-image.png";
  return `http://localhost:3000${path}`;
};

const tabClass = (tab) =>
  `px-4 py-2 rounded ${activeTab.value === tab ? "bg-blue-500 text-white" : "bg-gray-200"}`;
</script>