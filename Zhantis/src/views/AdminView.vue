<template>
  <div class="flex">
    <aside
      class="fixed top-0 left-0 h-screen bg-gray-900 text-white flex flex-col justify-between p-4 transition-all duration-300"
      :class="isExpanded ? 'w-64' : 'w-16'"
      @mouseenter="isExpanded = true"
      @mouseleave="isExpanded = false"
    >
      <div>
        <h2 v-if="isExpanded" class="text-xl font-bold mb-4">Админ‑панель</h2>
        <nav>
          <ul class="space-y-2">
            <li>
              <button 
                @click="activeTab = 'products'" 
                :class="['flex items-center w-full text-left px-2 py-1 rounded', activeTab === 'products' ? 'bg-green-600' : 'hover:bg-gray-700']">
                📦
                <span v-if="isExpanded" class="ml-2">Товары</span>
              </button>
            </li>
            <li>
              <button 
                @click="activeTab = 'orders'" 
                :class="['flex items-center w-full text-left px-2 py-1 rounded', activeTab === 'orders' ? 'bg-green-600' : 'hover:bg-gray-700']">
                🧾
                <span v-if="isExpanded" class="ml-2">Заказы</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div>
        <RouterLink 
          to="/" 
          class="flex items-center justify-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded">
          ⬅️
          <span v-if="isExpanded" class="ml-2">На главную</span>
        </RouterLink>
      </div>
    </aside>

    <main :class="isExpanded ? 'ml-64' : 'ml-16'" class="flex-1 p-6 transition-all duration-300">
      <ProductsTab v-if="activeTab === 'products'" />
      <OrdersTab v-if="activeTab === 'orders'" />
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import ProductsTab from "@/components/ProductsTab.vue";
import OrdersTab from "@/components/OrdersTab.vue";

const activeTab = ref("products");
const isExpanded = ref(false);
</script>