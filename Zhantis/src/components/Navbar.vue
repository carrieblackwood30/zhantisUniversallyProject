<template>
  <nav class="bg-gray-800 text-white p-4 flex justify-between">
    <div class="space-x-4">
      <router-link to="/" class="hover:underline">Товары</router-link>
      <router-link to="/cart" class="hover:underline">Корзина</router-link>
      <router-link to="/admin" class="hover:underline">Админ</router-link>
    </div>
    <div class="space-x-4">
      <router-link to="/login" class="hover:underline">Войти</router-link>
      <router-link to="/register" class="hover:underline">Регистрация</router-link>
    </div>
  </nav>
</template>

<script setup>

</script>