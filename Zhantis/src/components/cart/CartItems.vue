<template>
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
          <td class="border p-2">
            {{ item.name }}
            <div v-if="item.attributes" class="text-xs text-gray-500 mt-1">
              <span v-if="item.attributes.extension">Тип выдвижения: {{ item.attributes.extension }}</span>
              <span v-if="item.attributes.fixation"> | Фиксация: {{ item.attributes.fixation ? "Да" : "Нет" }}</span>
              <span v-if="item.color"> Цвет: {{ item.color }}</span>
              <span v-if="item.attributes.drawerType"> | Система: {{ item.attributes.drawerType }}</span>
            </div>
          </td>
          <!-- Цена выводится как число с форматированием -->
          <td class="border p-2">{{ item.price.toLocaleString() }} ₸</td>
          <td class="border p-2">
            <div class="flex items-center space-x-2">
              <button @click="cartStore.decreaseQuantity(item._id)" class="bg-gray-300 px-2 rounded hover:bg-gray-400">-</button>
              <input
                type="number"
                v-model.number="item.quantity"
                @change="updateQuantity(item)"
                min="1"
                class="w-16 border text-center"
              />
              <button @click="cartStore.addToCart(item)" class="bg-gray-300 px-2 rounded hover:bg-gray-400">+</button>
            </div>
          </td>
          <td class="border p-2">
            <button @click="cartStore.removeFromCart(item._id)" class="bg-red-500 text-white px-2 py-1 rounded">✖</button>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Итог тоже форматируется -->
    <div class="mt-4 text-right font-semibold">Итого: {{ cartStore.totalPrice.toLocaleString() }} ₸</div>
  </div>

</template>

<script setup>
import { useCartStore } from "@/stores/cart";
const cartStore = useCartStore();

const updateQuantity = (item) => {
  if (item.quantity < 1) item.quantity = 1;
  cartStore.saveCart();
};

const getImageUrl = (path) => (!path ? "/no-image.png" : `http://localhost:3000${path}`);
</script>