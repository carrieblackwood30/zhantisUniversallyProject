<template>
  <div class="border rounded shadow p-4">
    <img :src="product.image" alt="" class="w-full aspect-square object-cover rounded" />
    <h3 class="text-lg font-semibold mt-2">{{ product.name }}</h3>
    <p class="text-gray-600">{{ product.price }} ₸</p>
    <button @click="$emit('add-to-cart', product)" class="mt-2 w-full bg-pink-600 text-white py-2 rounded">
      Добавить в корзину
    </button>
  </div>
</template>

<script setup>
defineProps({ product: Object });
</script>