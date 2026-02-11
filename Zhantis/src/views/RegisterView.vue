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

      <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Регистрация</h1>

      <!-- Поле ошибки -->
      <div v-if="localError || auth.error" class="mb-4 bg-red-100 text-red-700 p-3 rounded">
        {{ localError || auth.error }}
      </div>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <input
          v-model="name"
          placeholder="Имя (необязательно)"
          autocomplete="name"
          class="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <input
          v-model="username"
          placeholder="Логин (никнейм)"
          autocomplete="username"
          class="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          autocomplete="email"
          class="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Пароль"
          autocomplete="new-password"
          class="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          type="submit"
          class="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-700 transition"
        >
          Зарегистрироваться
        </button>
      </form>

      <!-- Дополнительные кнопки -->
      <div class="mt-6 flex flex-col space-y-3">
        <router-link
          to="/login"
          class="w-full text-center bg-gray-200 text-gray-800 py-3 rounded hover:bg-gray-300 transition"
        >
          Войти
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const name = ref("");
const username = ref("");
const email = ref("");
const password = ref("");
const localError = ref("");
const auth = useAuthStore();
const router = useRouter();

async function onSubmit() {
  localError.value = "";

  // Вызов в правильном порядке: name, username, email, password
  const success = await auth.register(name.value, username.value, email.value, password.value);

  if (success) {
    router.push("/");
  } else {
    // Показываем реальную ошибку от стора, если есть
    localError.value = auth.error || "Ошибка регистрации";
  }
}
</script>