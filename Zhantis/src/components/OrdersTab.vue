<template>
  <section>
    <h2 class="text-2xl font-semibold mb-6">Заказы</h2>
    <table class="w-full border-collapse border bg-white rounded shadow">
      <thead class="bg-gray-100">
        <tr>
          <th class="border p-2">Дата</th>
          <th class="border p-2">Покупатель</th>
          <th class="border p-2">Товары</th>
          <th class="border p-2">Статус</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in ordersStore.orders" :key="order._id">
          <td class="border p-2">{{ new Date(order.createdAt).toLocaleString() }}</td>
          <td class="border p-2">
            <div v-if="order.customer">
              {{ order.customer.name }}<br />
              {{ order.customer.phone }}<br />
              {{ order.customer.address }}
            </div>
            <div v-else class="text-gray-500">Нет данных о покупателе</div>
          </td>
          <td class="border p-2">
            <ul>
              <li v-for="item in order.items" :key="item.productId">
                {{ item.name }} (x{{ item.quantity }})
              </li>
            </ul>
          </td>
          <td class="border p-2">{{ order.status || "В обработке" }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { onMounted } from "vue";
import { useOrdersStore } from "@/stores/orders";

const ordersStore = useOrdersStore();

onMounted(async () => {
  await ordersStore.fetchOrdersAdmin(); // для админки
});
</script>