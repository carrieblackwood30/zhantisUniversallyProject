<template>
  <header class="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-20">
    <nav class="flex items-center space-x-6">
      <a href="#news" class="text-gray-700 hover:text-green-600 font-medium transition">Новости</a>
      <a href="#products" class="text-gray-700 hover:text-green-600 font-medium transition">Товары</a>
      <template v-if="authStore.user?.role === 'admin'">
        <router-link to="/admin" class="text-gray-700 hover:text-green-600 font-medium transition">
          Панель управления
        </router-link>
      </template>
      <a href="#about" class="text-gray-700 hover:text-green-600 font-medium transition">О нас</a>
      <a href="#footer" class="text-gray-700 hover:text-green-600 font-medium transition">Контакты</a>
    </nav>

    <div class="flex items-center space-x-6">
      <router-link to="/cart" class="relative flex items-center text-gray-700 hover:text-green-600 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7a1 1 0 00.9 1.45h12.9M7 13h10m-6 8a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
        <span v-if="cartStore.itemCount > 0"
              class="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
          {{ cartStore.itemCount }}
        </span>
      </router-link>

      <template v-if="authStore.user">
        <span class="font-semibold text-gray-800">👤 {{ authStore.user.username }}</span>
        <button @click="authStore.logout()"
                class="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600 transition">
          Выйти
        </button>
      </template>
      <template v-else>
        <router-link to="/login" class="text-gray-700 hover:text-green-600 font-medium transition">Войти</router-link>
        <router-link to="/register" class="text-gray-700 hover:text-green-600 font-medium transition">Регистрация</router-link>
      </template>
    </div>
  </header>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  cartStore: Object,
  authStore: Object
});
</script>