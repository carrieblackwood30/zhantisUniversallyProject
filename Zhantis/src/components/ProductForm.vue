<template>
  <div class="bg-white p-4 rounded shadow">
    <h2 class="text-lg font-semibold mb-3">{{ product ? "Редактировать товар" : "Добавить новый товар" }}</h2>

    <div class="grid grid-cols-2 gap-3">
      <input v-model="form.name" placeholder="Название" class="border p-2" />
      <input v-model.number="form.price" type="number" placeholder="Цена" class="border p-2" />
    </div>

    <div class="mt-3 grid grid-cols-2 gap-3">
      <div class="flex items-center gap-2">
        <select v-model="form.group" @change="onGroupChange" class="border p-2 flex-1">
          <option :value="null">Выберите группу</option>
          <option v-for="g in groups" :key="g._id" :value="g._id">{{ g.name }}</option>
        </select>
        <button @click="openSubgroupManager" class="bg-gray-200 px-2 py-1 rounded">Подгруппы</button>
      </div>

      <select v-model="form.subgroup" @change="onSubgroupChange" class="border p-2">
        <option :value="null">Все подгруппы</option>
        <option v-for="s in filteredSubgroups" :key="s._id" :value="s._id">{{ s.name }}</option>
      </select>
    </div>

    <!-- динамические атрибуты -->
    <div v-if="attributesList.length" class="mt-4">
      <h3 class="font-medium mb-2">Параметры подгруппы</h3>
      <div v-for="attr in attributesList" :key="attr._id || attr.key" class="mb-3">
        <label class="block mb-1">{{ attr.label }}</label>

        <div v-if="attr.type === 'enum'">
          <div class="flex gap-2 flex-wrap mb-2">
            <button
              v-for="opt in attr.values"
              :key="opt.value"
              type="button"
              @click="setDynamic(attr.key, opt.value)"
              :class="{'ring-2 ring-blue-400': dynamic[attr.key] === opt.value}"
              class="px-2 py-1 border rounded flex items-center gap-2"
            >
              <span v-if="opt.meta?.hex" :style="{background: opt.meta.hex}" class="w-4 h-4 rounded-sm inline-block"></span>
              <span>{{ opt.label }}</span>
            </button>
          </div>

          <div class="flex gap-2 items-center">
            <input v-model="newOption[attr.key]" placeholder="Добавить опцию" class="border p-2 flex-1" />
            <button @click="addLocalOption(attr)" class="bg-blue-500 text-white px-3 py-1 rounded">Добавить</button>
            <button @click="openAttributeManager(attr)" class="bg-gray-200 px-3 py-1 rounded">Редактировать опции</button>
          </div>
        </div>

        <div v-else-if="attr.type === 'number'">
          <input type="number" :min="attr.min" :max="attr.max" v-model.number="dynamic[attr.key]" class="border p-2 w-full" />
          <div class="text-sm text-gray-500">{{ attr.min ?? '' }} — {{ attr.max ?? '' }} {{ attr.unit ?? '' }}</div>
        </div>

        <div v-else-if="attr.type === 'boolean'">
          <input type="checkbox" v-model="dynamic[attr.key]" />
        </div>

        <div v-else>
          <input type="text" v-model="dynamic[attr.key]" class="border p-2 w-full" />
        </div>
      </div>
    </div>

    <div class="mt-3">
      <label class="block mb-1">Описание</label>
      <textarea v-model="form.description" class="border p-2 w-full" rows="3"></textarea>
    </div>

    <div class="mt-3">
      <label class="block mb-1">Есть ли цвета?</label>
      <input type="checkbox" v-model="form.colored" />
    </div>

    <div v-if="form.colored" class="mt-2">
      <label class="block mb-1">Доступные цвета (через запятую)</label>
      <input v-model="colorsInput" placeholder="Белый, Серый, Чёрный" class="border p-2 w-full" />
    </div>

    <div class="mt-3 flex items-center gap-3">
      <input type="file" @change="onFileChange" />
      <button @click="save" :disabled="saving" class="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-60">
        <span v-if="!saving">{{ product ? "Сохранить" : "Добавить товар" }}</span>
        <span v-else>Сохранение...</span>
      </button>
      <button v-if="product" @click="emit('close')" class="bg-gray-200 px-4 py-2 rounded">Закрыть</button>
    </div>

    <SubgroupManager :show="showSubgroupManager" :initial-group="form.group" @close="showSubgroupManager = false" @updated="onSubgroupsUpdated" />
    <AttributeManager :show="showAttributeManager" :attribute="editingAttribute" @close="showAttributeManager = false" @saved="onAttributeSaved" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useProductsStore } from "@/stores/products";
import SubgroupManager from "@/components/admin/SubgroupManager.vue";
import AttributeManager from "@/components/admin/AttributeManager.vue";

const props = defineProps({ product: { type: Object, default: null } });
const emit = defineEmits(["saved", "close", "add-group", "edit-groups"]);

const productsStore = useProductsStore();

const groups = ref([]);
const subgroups = ref([]);
const saving = ref(false);

const form = ref({
  name: "",
  price: 0,
  group: null,
  subgroup: null,
  description: "",
  attributes: {},
  image: null,
  stock: 0,
  colored: false,
  colors: [],
  _file: null,
  dynamicAttributes: {},
});

const attributesList = ref([]);
const dynamic = ref({});
const newOption = ref({});
const colorsInput = ref("");
const showSubgroupManager = ref(false);
const showAttributeManager = ref(false);
const editingAttribute = ref(null);

const parseColors = (input) => String(input || "").split(",").map(c => c.trim()).filter(Boolean);

const getParentId = (s) => s?.parentGroup?._id || s?.parentGroup || s?.group || s?.parent || null;

onMounted(async () => {
  if (!productsStore.groups?.length) await productsStore.fetchGroups();
  if (!productsStore.subgroups?.length) await productsStore.fetchSubgroups();
  groups.value = productsStore.groups;
  subgroups.value = productsStore.subgroups;
  if (props.product) loadProduct(props.product);
});

watch(() => productsStore.groups, () => { groups.value = productsStore.groups; });
watch(() => productsStore.subgroups, () => { subgroups.value = productsStore.subgroups; });
watch(() => props.product, (p) => { if (p) loadProduct(p); });

const filteredSubgroups = computed(() => {
  if (!form.value.group) return subgroups.value;
  return subgroups.value.filter(s => String(getParentId(s)) === String(form.value.group));
});

const isHiddenMountSelected = computed(() => {
  const group = groups.value.find(g => g._id === form.value.group);
  return group?.name?.toLowerCase().includes("направляющие скрытого монтажа");
});

function loadProduct(p) {
  form.value.name = p.name || "";
  form.value.price = p.price || 0;
  form.value.group = p.group?._id || p.group || null;
  form.value.subgroup = p.subgroup?._id || p.subgroup || null;
  form.value.description = p.description || "";
  form.value.attributes = p.attributes || {};
  form.value.image = p.image || null;
  form.value.stock = p.stock || 0;
  form.value.colored = p.colored || false;
  form.value.colors = Array.isArray(p.colors) ? p.colors : [];
  colorsInput.value = form.value.colors.join(", ");
  form.value._file = null;

  if (p.dynamicAttributes) {
    if (typeof p.dynamicAttributes.get === "function") {
      const obj = {};
      for (const [k, v] of p.dynamicAttributes) obj[k] = v;
      form.value.dynamicAttributes = obj;
    } else {
      form.value.dynamicAttributes = { ...p.dynamicAttributes };
    }
  } else {
    form.value.dynamicAttributes = {};
  }

  if (form.value.subgroup) loadAttributes();
}

const onGroupChange = () => {
  form.value.subgroup = null;
  if (form.value.attributes) form.value.attributes.extension = null;
  if (form.value.group) productsStore.fetchSubgroups({ parentGroup: form.value.group }).then(() => subgroups.value = productsStore.subgroups);
  else productsStore.fetchSubgroups().then(() => subgroups.value = productsStore.subgroups);
};

const onSubgroupChange = async () => {
  if (form.value.attributes) form.value.attributes.extension = null;
  await loadAttributes();
};

const onFileChange = (e) => { const file = e.target.files?.[0]; if (file) form.value._file = file; };
const openSubgroupManager = () => { showSubgroupManager.value = true; };
const onSubgroupsUpdated = async () => { await productsStore.fetchSubgroups({ parentGroup: form.value.group || undefined }); subgroups.value = productsStore.subgroups; };

async function loadAttributes() {
  attributesList.value = await productsStore.fetchAttributeDefinitions(form.value.group, form.value.subgroup);
  attributesList.value.forEach(a => {
    if (props.product?.dynamicAttributes && props.product.dynamicAttributes[a.key] !== undefined) {
      dynamic.value[a.key] = props.product.dynamicAttributes[a.key];
    } else if (form.value.dynamicAttributes && form.value.dynamicAttributes[a.key] !== undefined) {
      dynamic.value[a.key] = form.value.dynamicAttributes[a.key];
    } else if (a.type === "boolean") dynamic.value[a.key] = false;
    else dynamic.value[a.key] = dynamic.value[a.key] ?? null;
    newOption.value[a.key] = "";
  });
}

function setDynamic(key, value) { dynamic.value[key] = value; }

function addLocalOption(attr) {
  const val = (newOption.value[attr.key] || "").trim();
  if (!val) return;
  attr.values = attr.values || [];
  const option = { value: val.toLowerCase().replace(/\s+/g, "-"), label: val, meta: {} };
  attr.values.push(option);
  dynamic.value[attr.key] = option.value;
  newOption.value[attr.key] = "";
}

function openAttributeManager(attr) { editingAttribute.value = attr; showAttributeManager.value = true; }

async function onAttributeSaved(updatedAttr) {
  showAttributeManager.value = false;
  productsStore.invalidateAttributeCache();
  await loadAttributes();
}

const save = async () => {
  if (!form.value.name || !form.value.group) return alert("Введите название и выберите группу");
  saving.value = true;
  try {
    let imageUrl = form.value.image;
    if (form.value._file) imageUrl = await productsStore.uploadImage(form.value._file);

    const colors = form.value.colored ? parseColors(colorsInput.value) : [];
    const payload = {
      name: form.value.name,
      price: form.value.price,
      group: form.value.group,
      subgroup: form.value.subgroup,
      description: form.value.description,
      attributes: form.value.attributes,
      image: imageUrl,
      stock: form.value.stock,
      colored: form.value.colored,
      colors,
      dynamicAttributes: Object.keys(dynamic.value || {}).length ? dynamic.value : undefined,
    };

    if (props.product && props.product._id) await productsStore.updateProduct(props.product._id, payload);
    else await productsStore.addProduct(payload);

    emit("saved"); emit("close");

    form.value = { name: "", price: 0, group: null, subgroup: null, description: "", attributes: {}, image: null, stock: 0, colored: false, colors: [], _file: null, dynamicAttributes: {} };
    colorsInput.value = ""; attributesList.value = []; dynamic.value = {};
  } catch (err) {
    console.error("ProductForm save error", err);
    alert("Ошибка при сохранении товара");
  } finally {
    saving.value = false;
  }
};
</script>