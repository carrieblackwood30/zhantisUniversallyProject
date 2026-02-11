<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white shadow-lg rounded-lg p-8 relative">

      <!-- Кнопка назад -->
      <router-link
        to="/"
        class="absolute top-4 left-4 text-gray-600 hover:text-gray-800 transition"
      >
        <span class="text-2xl">&larr;</span>
      </router-link>

      <!-- Заголовок -->
      <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Вход</h1>

      <!-- Ошибка -->
      <div v-if="error" class="mb-4 bg-red-100 text-red-700 p-3 rounded">
        {{ error }}
      </div>

      <!-- Форма -->
      <form @submit.prevent="login" class="space-y-4">
        <input
          v-model="email"
          autocomplete="email"
          type="email"
          placeholder="Email"
          class="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <input
          v-model="password"
          autocomplete="current-password"
          type="password"
          placeholder="Пароль"
          class="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          type="submit"
          class="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-700 transition"
        >
          Войти
        </button>
      </form>

      <!-- Дополнительные кнопки -->
      <div class="mt-6 flex flex-col space-y-3">
        <router-link
          to="/register"
          class="w-full text-center bg-gray-200 text-gray-800 py-3 rounded hover:bg-gray-300 transition"
        >
          Зарегистрироваться
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const error = ref("");
const authStore = useAuthStore();
const router = useRouter();

const login = async () => {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push("/"); // переход только при успешной авторизации
  } else {
    error.value = "Ошибка входа: неверный email или пароль";
  }
};
</script>