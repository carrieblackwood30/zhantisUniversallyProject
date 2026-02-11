<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Хэдер -->
    <Header :cartStore="cartStore" :authStore="authStore" />

    <NewsSection />

    <ProductsSection @open-aventos="showAventos = true" />

    <section id="about" class="bg-white p-8 border-t">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">О нас</h2>
      <p class="text-gray-700 leading-relaxed">
        Мы — современный магазин, который предлагает лучшие товары и сервис.
      </p>
    </section>

    <Footer />

    <AventosCalculator
      :show="showAventos"
      @update:show="showAventos = $event"
      @added-to-cart="handleAventosAdded"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";

import Header from "@/components/layout/Header.vue";
import Footer from "@/components/layout/Footer.vue";
import NewsSection from "@/components/layout/NewsSection.vue";
import ProductsSection from "@/components/products/ProductsSection.vue";

import AventosCalculator from "@/components/aventos/Calculator.vue";

const cartStore = useCartStore();
const authStore = useAuthStore();

const showAventos = ref(false);

function handleAventosAdded(item) {
  cartStore.addToCart(item);
  showAventos.value = false;
}
</script>

<style>
html {
  scroll-behavior: smooth;
}
</style>