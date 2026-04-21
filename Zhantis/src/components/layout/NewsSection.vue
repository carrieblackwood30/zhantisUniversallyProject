<template>
  <section id="news" class="bg-green-50 border-b border-green-200 py-2">
    <!-- Карусель -->
    <div
      class="relative overflow-hidden select-none"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
    >
      <div
        class="flex"
        :style="{
          transform: `translateX(${translateX}%)`,
          transition: isDragging ? 'none' : 'transform 0.4s ease'
        }"
      >
        <div
          v-for="(item, index) in news"
          :key="index"
          class="shrink-0 w-full flex items-center justify-center relative"
        >
          <!-- Фото -->
          <img
            :src="item.image"
            :alt="item.title"
            class="w-full max-h-125 object-contain mx-auto"
            draggable="false"
          />

          <!-- Белый блок поверх фото -->
          <div
            class="absolute bottom-6 right-6 w-1/4 bg-white rounded-lg p-4 shadow-lg"
          >
            <p class="text-gray-800 font-semibold">📰 {{ item.title }}</p>
            <p class="mt-2 text-gray-600">{{ item.content }}</p>

            <div class="flex justify-end" v-if ="item.buttonText">
              <a
                class="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                :href="item.link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ item.buttonText }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Индикаторы -->
    <div class="flex justify-center mt-4 space-x-2">
      <span
        v-for="(item, index) in news"
        :key="index"
        class="w-3 h-3 rounded-full"
        :class="index === currentIndex ? 'bg-green-500' : 'bg-gray-300'"
      ></span>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const news = ref([
  {
    title: "Сэкономьте 5%",
    content: "При заказе через конфигуратор BLUM, вы сэкономите 5%",
    image: new URL("@/assets/imgs/BlumConfig.jpg", import.meta.url).href,
    link: "https://e-services.blum.com/main/",
    buttonText: "перейти к конфигуратору",
  },
  {
    title: "Система зонирования REVEGO",
    content: "REVEGO duo + duo: комбинация из двух двух дверных конструкций в спальне – гардеробная",
    image: new URL("@/assets/imgs/BlumRevego.jpg", import.meta.url).href,
    link: "#",
  },
  {
    title: "Новость 3",
    content: "Третья новость для демонстрации карусели.",
    image: new URL("@/assets/imgs/BlumConfig.jpg", import.meta.url).href,
    link: "#",
  },
]);

const currentIndex = ref(0);
const translateX = ref(0);
let startX = 0;
let isDragging = false;

function startDrag(e) {
  isDragging = true;
  startX = e.clientX;
}

function onDrag(e) {
  if (!isDragging) return;
  const delta = e.clientX - startX;
  // переводим смещение в проценты
  translateX.value =
    -currentIndex.value * 100 + (delta / window.innerWidth) * 100;
}

function endDrag(e) {
  if (!isDragging) return;
  isDragging = false;
  const delta = e.clientX - startX;

  if (delta > 100 && currentIndex.value > 0) {
    currentIndex.value--;
  } else if (delta < -100 && currentIndex.value < news.value.length - 1) {
    currentIndex.value++;
  }

  // возвращаем к позиции выбранного слайда
  translateX.value = -currentIndex.value * 100;
}
</script>