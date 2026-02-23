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
          <th class="border p-2">Действия</th>
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
              <li v-for="item in order.items" :key="item._id">
                {{ item.product.name }} (x{{ item.quantity }}) — {{ item.price.toLocaleString() }} ₸
              </li>
            </ul>
          </td>
          <td class="border p-2">{{ stageLabel(order.status) }}</td>
          <td class="border p-2 text-center">
            <button
              v-if="nextStage(order.status)"
              @click="advanceStage(order)"
              class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Перевести в "{{ stageLabel(nextStage(order.status)) }}"
            </button>
            <span v-else class="text-green-600 font-semibold">Завершено</span>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { onMounted } from "vue";
import { useOrdersStore } from "@/stores/orders";

const ordersStore = useOrdersStore();

// Стадии заказа
const stages = ["обработка", "согласование", "отгрузка", "доставка", "товар получен"];

const stageLabel = (status) => {
  if (!status) return "обработка";
  return status;
};

const nextStage = (status) => {
  const idx = stages.indexOf(status);
  if (idx === -1) return stages[0];
  return stages[idx + 1] || null;
};

const advanceStage = async (order) => {
  const newStatus = nextStage(order.status);
  if (!newStatus) return;
  await ordersStore.updateOrderStatus(order._id, newStatus);
};

onMounted(async () => {
  await ordersStore.fetchOrdersAdmin(); // для админки
});
</script>