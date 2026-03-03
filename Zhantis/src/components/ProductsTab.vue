<template>
  <section class="p-4">
    <div class="mb-6">
      <ProductForm @saved="onSaved" />
    </div>

    <div class="mb-4 flex justify-end gap-2">
      <button @click="showGroupManager = true" class="bg-blue-500 text-white px-4 py-2 rounded">
        Управление группами
      </button>
      <button @click="showSubgroupManager = true" class="bg-green-500 text-white px-4 py-2 rounded">
        Управление подгруппами
      </button>
    </div>

    <table class="w-full border-collapse border bg-white rounded shadow text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="border p-2">Фото</th>
          <th class="border p-2">Название</th>
          <th class="border p-2">Цена</th>
          <th class="border p-2">Группа</th>
          <th class="border p-2">Описание</th>
          <th class="border p-2">Есть ли цвета</th>
          <th class="border p-2">Цвета</th>
          <th class="border p-2">Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in productsStore.products" :key="product._id">
          <td class="border p-2">
            <img
              v-if="!isEditing(product._id)"
              :src="getImageUrl(product.image)"
              class="w-16 h-16 object-cover rounded"
            />
            <input v-else type="file" @change="handleEditFile($event, product._id)" />
          </td>
          {{ console.log(product.image) }}

          <td class="border p-2">
            <span v-if="!isEditing(product._id)">{{ product.name }}</span>
            <input v-else v-model="editForms[product._id].name" class="border p-1 rounded w-full" />
          </td>

          <td class="border p-2">
            <span v-if="!isEditing(product._id)">{{ formatPrice(product.price) }} ₸</span>
            <input v-else v-model.number="editForms[product._id].price" type="number" class="border p-1 rounded w-full" />
          </td>

          <td class="border p-2">
            <span v-if="!isEditing(product._id)">{{ product.group?.name || "-" }}</span>
            <select v-else v-model="editForms[product._id].group" class="border p-1 rounded w-full">
              <option :value="null">—</option>
              <option v-for="group in productsStore.groups" :key="group._id" :value="group._id">
                {{ group.name }}
              </option>
            </select>
          </td>

          <td class="border p-2">
            <span v-if="!isEditing(product._id)">{{ product.description || "-" }}</span>
            <textarea v-else v-model="editForms[product._id].description" class="border p-1 rounded w-full text-xs"></textarea>
          </td>

          <td class="border p-2 text-center">
            <span v-if="!isEditing(product._id)">{{ product.colored ? "Да" : "Нет" }}</span>
            <input v-else type="checkbox" v-model="editForms[product._id].colored" />
          </td>

          <td class="border p-2">
            <span v-if="!isEditing(product._id)">
              <span v-if="product.colored && product.colors?.length">{{ product.colors.join(", ") }}</span>
              <span v-else>—</span>
            </span>
            <input
              v-else
              v-model="editForms[product._id].colorsInput"
              placeholder="Белый, Серый, Чёрный"
              class="border p-1 rounded w-full text-xs"
            />
          </td>

          <!-- Действия -->
          <td class="border p-2 space-x-2">
            <template v-if="!isEditing(product._id)">
              <button @click="startEdit(product)" class="bg-gray-300 px-2 py-1 rounded">Редактировать</button>
              <button @click="deleteProduct(product._id)" class="bg-red-500 text-white px-2 py-1 rounded">Удалить</button>
            </template>
            <template v-else>
              <button @click="saveEdit(product._id)" class="bg-green-500 text-white px-2 py-1 rounded">Сохранить</button>
              <button @click="cancelEdit(product._id)" class="bg-gray-400 text-white px-2 py-1 rounded">Отменить</button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Модалы -->
    <GroupManager :show="showGroupManager" @close="onCloseGroupManager" />
    <SubgroupManager :show="showSubgroupManager" @close="onCloseSubgroupManager" />
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useProductsStore } from "@/stores/products";
import ProductForm from "@/components/ProductForm.vue";
import GroupManager from "@/components/GroupManager.vue";
import SubgroupManager from "@/components/admin/SubgroupManager.vue";

const productsStore = useProductsStore();

const editForms = ref({});
const editFiles = ref({});

const showGroupManager = ref(false);
const showSubgroupManager = ref(false);

const isEditing = (id) => !!editForms.value[id];

const startEdit = (product) => {
  editForms.value[product._id] = {
    name: product.name,
    price: product.price,
    group: product.group?._id || null,
    subgroup: product.subgroup?._id || null,
    description: product.description || "",
    colored: product.colored || false,
    colorsInput: Array.isArray(product.colors) ? product.colors.join(", ") : "",
    attributes: { ...(product.attributes || {}) },
    image: product.image || null,
    stock: product.stock || 0,
  };
};

const cancelEdit = (id) => {
  delete editForms.value[id];
  delete editFiles.value[id];
};

const handleEditFile = (e, id) => {
  const file = e.target.files?.[0];
  if (file) editFiles.value[id] = file;
};

const saveEdit = async (id) => {
  const form = editForms.value[id];
  if (!form) return;

  let imageUrl = form.image;
  if (editFiles.value[id]) {
    imageUrl = await productsStore.uploadImage(editFiles.value[id]);
  }

  const colors = form.colored
    ? form.colorsInput.split(",").map(c => c.trim()).filter(Boolean)
    : [];

  const payload = {
    name: form.name,
    price: form.price,
    group: form.group,
    subgroup: form.subgroup,
    description: form.description,
    colored: form.colored,
    colors,
    attributes: form.attributes,
    image: imageUrl,
    stock: form.stock,
  };

  await productsStore.updateProduct(id, payload);
  cancelEdit(id);
};

const deleteProduct = async (id) => {
  await productsStore.deleteProduct(id);
};

const getImageUrl = (path) => (!path ? "/no-image.png" : `https://zhantisuniversallyproject.onrender.com${path}`);
const formatPrice = (v) => new Intl.NumberFormat("ru-RU").format(v);

const onSaved = async () => {
  await productsStore.fetchProducts();
};

const onCloseGroupManager = async () => {
  showGroupManager.value = false;
  await productsStore.fetchGroups();
};

const onCloseSubgroupManager = async () => {
  showSubgroupManager.value = false;
  await productsStore.fetchSubgroups();
};

onMounted(async () => {
  await productsStore.fetchGroups();
  await productsStore.fetchSubgroups();
  await productsStore.fetchProducts();
});
</script>