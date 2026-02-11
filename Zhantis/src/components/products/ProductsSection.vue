<template>
  <section id="products" class="p-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Наши товары</h1>

      <div class="flex items-center gap-3">
        <button
          @click="$emit('open-aventos')"
          class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          title="Рассчитать подъемник AVENTOS"
        >
          Рассчитать подъемник AVENTOS
        </button>
      </div>
    </div>

    <ProductFilters />

    <ProductList />
  </section>
</template>

<script setup>
import ProductFilters from "@/components/products/ProductFilters.vue";
import ProductList from "@/components/products/ProductList.vue";
</script>