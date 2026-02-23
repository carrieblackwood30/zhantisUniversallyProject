<template>
  <div class="bg-white p-4 rounded shadow mb-6">
    <h3 class="text-lg font-semibold mb-4">Данные покупателя</h3>

    <!-- вывод данных -->
    <div v-if="cartStore.customer.name || cartStore.customer.phone || cartStore.customer.address">
      <table class="w-full border-collapse mb-4">
        <tbody>
          <tr><td class="border p-2 font-semibold">Имя:</td><td class="border p-2">{{ cartStore.customer.name }}</td></tr>
          <tr><td class="border p-2 font-semibold">Телефон:</td><td class="border p-2">{{ cartStore.customer.phone }}</td></tr>
          <tr><td class="border p-2 font-semibold">Адрес доставки:</td><td class="border p-2">{{ cartStore.customer.address }}</td></tr>
        </tbody>
      </table>
      <button @click="editing = true" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">✏️ Изменить</button>
    </div>

    <!-- если данных нет -->
    <div v-else>
      <p class="text-gray-500 mb-2">Нет сохранённых данных</p>
      <button @click="editing = true" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">➕ Добавить информацию</button>
    </div>

    <!-- форма редактирования -->
    <div v-if="editing" class="mt-4">
      <input v-model="customer.name" placeholder="Ваше имя" class="border p-2 w-full mb-2" />
      <input v-model="customer.phone" placeholder="Телефон" class="border p-2 w-full mb-2" />
      <textarea v-model="customer.address" placeholder="Адрес доставки" class="border p-2 w-full mb-2"></textarea>
      <button @click="saveCustomer" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">💾 Сохранить</button>
      <button @click="editing = false" class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Отмена</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useCartStore } from "@/stores/cart";

const cartStore = useCartStore();
const editing = ref(false);
const customer = reactive({ ...cartStore.customer });

const saveCustomer = async () => {
  await cartStore.setCustomerInfo(customer);
  editing.value = false;
};
</script>