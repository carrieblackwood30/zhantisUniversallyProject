<template>
  <div>
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
              <li v-for="item in order.items" :key="item._id">
                {{ item.product.name }} (x{{ item.quantity }}) — {{ item.price.toLocaleString() }} ₸
                <div v-if="item.product.attributes" class="text-xs text-gray-500">
                  <span v-if="item.product.attributes.extension">
                    Тип выдвижения: {{ item.product.attributes.extension }}
                  </span>
                  <span v-if="item.product.attributes.fixation">
                    | Фиксация: {{ item.product.attributes.fixation ? "Да" : "Нет" }}
                  </span>
                  <span v-if="item.product.attributes.drawerType">
                    | Система: {{ item.product.attributes.drawerType }}
                  </span>
                </div>
              </li>
            </ul>
          </td>
          <td class="border p-2">{{ order.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useCartStore } from "@/stores/cart";
const cartStore = useCartStore();
</script>