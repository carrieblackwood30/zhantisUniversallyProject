<template>
  <div>
    <!-- Скелетон при загрузке -->
    <div v-if="isLoading" class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="animate-pulse border rounded-lg shadow p-4 bg-white">
        <div class="bg-gray-300 h-32 w-full rounded-md"></div>
      </div>
    </div>

    <!-- Список товаров -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="product in productsList"
        :key="product._id"
        class="border rounded-lg shadow-sm hover:shadow-md transition bg-white flex flex-col overflow-hidden"
      >
        <div class="flex items-center justify-center bg-gray-100" style="height: 140px;">
          <img :src="getImageUrl(product.image)" :alt="product.name" class="max-h-full max-w-full object-contain" />
        </div>

        <div class="p-3 flex flex-col flex-1 justify-between">
          <h3 class="text-sm font-semibold text-gray-900 truncate">{{ product.name }}</h3>
          <p class="text-xs text-gray-500">{{ product.group?.name || product.groupName || '-' }}</p>

          <!-- описание -->
          <p v-if="product.description" class="mt-1 text-xs text-gray-600 line-clamp-2">
            {{ product.description }}
          </p>

          <p class="mt-1 text-base font-bold text-green-600">{{ formatPrice(product.price) }} ₸</p>

          <!-- селект цвета -->
          <div v-if="product.colored && product.colors && product.colors.length" class="mt-1">
            <label class="block text-xs text-gray-500 mb-1">Цвет</label>
            <select v-model="selectedColors[product._id]" class="border p-1 w-full rounded text-sm">
              <option v-for="c in product.colors" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <button
            @click="addToCart(product)"
            class="mt-2 w-full bg-green-500 text-white py-1.5 rounded-md text-sm hover:bg-green-600 transition"
          >
            В корзину
          </button>
        </div>
      </div>

      <!-- Пустой список -->
      <div v-if="productsList.length === 0" class="col-span-full text-center text-gray-500 py-6 text-sm">
        Товары не найдены.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useProductsStore } from "@/stores/products";
import { useCartStore } from "@/stores/cart";

const productsStore = useProductsStore();
const cartStore = useCartStore();

const localLoading = ref(true);
const isLoading = computed(() => {
  if (typeof productsStore.loading !== "undefined") return productsStore.loading;
  return localLoading.value;
});

const productsList = computed(() => {
  if (productsStore.filteredProducts && Array.isArray(productsStore.filteredProducts)) {
    return productsStore.filteredProducts;
  }
  if (Array.isArray(productsStore.products)) {
    return productsStore.products;
  }
  if (productsStore.items && Array.isArray(productsStore.items)) {
    return productsStore.items;
  }
  return [];
});

// выбранные цвета по id товара
const selectedColors = ref({});

const getImageUrl = (path) => (!path ? "/no-image.png" : `https://zhantisuniversallyproject.onrender.com${path}`);
const formatPrice = (value) => {
  try {
    return new Intl.NumberFormat("ru-RU").format(Number(value || 0));
  } catch {
    return value;
  }
};

const addToCart = (product) => {
  let color = null;
  if (product.colored && product.colors && product.colors.length) {
    color = selectedColors.value[product._id] || product.colors[0];
  }

  cartStore.addToCart({
    ...product,
    selectedColor: color,
  });
};

// когда список товаров обновляется — проставляем первый цвет по умолчанию
watch(productsList, (list) => {
  list.forEach((p) => {
    if (p.colored && p.colors && p.colors.length) {
      if (!selectedColors.value[p._id]) {
        selectedColors.value[p._id] = p.colors[0];
      }
    }
  });
});

onMounted(async () => {
  try {
    if (productsStore.fetchGroups) await productsStore.fetchGroups();
    if (productsStore.fetchSubgroups) await productsStore.fetchSubgroups();
    if (productsStore.fetchProducts) {
      await productsStore.fetchProducts();
    } else {
      console.warn("productsStore.fetchProducts is not defined");
    }
  } catch (err) {
    console.error("Ошибка при загрузке товаров:", err);
  } finally {
    localLoading.value = false;
  }
});
</script>