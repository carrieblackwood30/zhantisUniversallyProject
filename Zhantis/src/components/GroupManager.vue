<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded shadow max-w-full">
      <h3 class="text-lg font-semibold mb-4">Редактировать группы</h3>

      <div class="mb-3 text-sm text-gray-600">Измените имена групп, добавьте новые или удалите ненужные. Нажмите «Сохранить», чтобы применить изменения.</div>

      <ul>
        <li
          v-for="(group, index) in localGroups"
          :key="group._id || group._tmpId || index"
          class="flex items-center gap-2 mb-2"
        >
          <input
            v-model="group.name"
            class="border px-2 py-1 rounded flex-1"
            :placeholder="'Группа ' + (index + 1)"
            @keydown.enter.prevent="focusNext(index)"
          />
          <button
            @click="confirmDelete(index)"
            class="bg-red-500 text-white px-3 py-1 rounded"
            title="Удалить группу"
          >
            Удалить
          </button>
        </li>
      </ul>

      <!-- Добавить новую группу -->
      <div class="mt-4 flex gap-2">
        <input v-model="newGroupName" placeholder="Новая группа" class="border p-2 rounded flex-1" @keydown.enter.prevent="addGroupFromInput" />
        <button @click="addGroupFromInput" class="bg-blue-500 text-white px-4 py-1 rounded">Добавить</button>
      </div>

      <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-500">
          <span v-if="hasChanges">Есть несохранённые изменения</span>
          <span v-else>Изменений нет</span>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="saveGroups"
            :disabled="saving || !hasChanges"
            class="bg-green-500 text-white px-4 py-1 rounded disabled:opacity-60"
          >
            <span v-if="!saving">Сохранить</span>
            <span v-else>Сохранение...</span>
          </button>
          <button @click="onClose" class="bg-gray-400 text-white px-4 py-1 rounded">Закрыть</button>
        </div>
      </div>
    </div>

    <div v-if="showConfirm" class="fixed inset-0 flex items-center justify-center z-60">
      <div class="bg-white p-4 rounded shadow w-80">
        <div class="mb-3">Удалить группу «<strong>{{ groupToDelete?.name }}</strong>»? Это действие нельзя отменить.</div>
        <div class="flex justify-end gap-2">
          <button @click="cancelDelete" class="px-3 py-1 rounded bg-gray-200">Отмена</button>
          <button @click="performDelete" class="px-3 py-1 rounded bg-red-500 text-white">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from "vue";
import { useProductsStore } from "@/stores/products";

const props = defineProps({ show: Boolean });
const emit = defineEmits(["close"]);
const productsStore = useProductsStore();

const localGroups = ref([]);
const originalSnapshot = ref([]);
const newGroupName = ref("");
const saving = ref(false);

// delete confirm
const showConfirm = ref(false);
const groupToDelete = ref(null);
const groupToDeleteIndex = ref(null);

watch(
  () => props.show,
  async (val) => {
    if (val) {
      // ensure latest groups from store
      await productsStore.fetchGroups();
      // создаём копию только нужных полей
      localGroups.value = productsStore.groups.map(g => ({
        _id: g._id,
        name: g.name
      }));
      // snapshot для определения изменений
      originalSnapshot.value = JSON.stringify(localGroups.value);
      newGroupName.value = "";
    }
  },
  { immediate: true }
);

// вычисляем, есть ли изменения
const hasChanges = computed(() => {
  // compare by JSON (order matters)
  return JSON.stringify(localGroups.value) !== originalSnapshot.value;
});

// добавить новую группу (через кнопку)
const addGroupFromInput = () => {
  const name = (newGroupName.value || "").trim();
  if (!name) return;
  addGroup(name);
  newGroupName.value = "";
};

// добавление новой группы (локально)
const addGroup = (name = "") => {
  // временный id, чтобы Vue мог отличать новые элементы
  const tmpId = `tmp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  localGroups.value.push({ _tmpId: tmpId, name: name });
  // фокус на последнем input
  nextTick(() => {
    const inputs = document.querySelectorAll("input[placeholder^='Группа']");
    if (inputs.length) inputs[inputs.length - 1].focus();
  });
};

// подтверждение удаления
const confirmDelete = (index) => {
  groupToDeleteIndex.value = index;
  groupToDelete.value = localGroups.value[index];
  showConfirm.value = true;
};

const cancelDelete = () => {
  showConfirm.value = false;
  groupToDelete.value = null;
  groupToDeleteIndex.value = null;
};

// выполнить удаление (локально и на сервере если нужно)
const performDelete = async () => {
  const idx = groupToDeleteIndex.value;
  const g = localGroups.value[idx];
  showConfirm.value = false;
  groupToDelete.value = null;
  groupToDeleteIndex.value = null;

  if (g._id) {
    // удаляем сразу на сервере, но не блокируем UI сильно
    try {
      saving.value = true;
      await productsStore.deleteGroup(g._id);
      // обновим store и локальный список
      await productsStore.fetchGroups();
      localGroups.value = productsStore.groups.map(g => ({ _id: g._id, name: g.name }));
      originalSnapshot.value = JSON.stringify(localGroups.value);
    } catch (err) {

    } finally {
      saving.value = false;
    }
  } else {
    // просто удалить локально (новая группа)
    localGroups.value.splice(idx, 1);
  }
};

// фокус на следующем input при Enter
const focusNext = (index) => {
  const inputs = Array.from(document.querySelectorAll("input[placeholder^='Группа']"));
  if (inputs[index + 1]) inputs[index + 1].focus();
};

// сохранение групп: если в store есть bulk-метод — используем его, иначе fallback на последовательные вызовы с concurrency
const saveGroups = async () => {
  // валидация: имена не пустые и уникальные
  const names = localGroups.value.map(g => (g.name || "").trim());
  if (names.some(n => !n)) {
    return alert("Все группы должны иметь имя.");
  }
  const dup = names.find((n, i) => names.indexOf(n) !== i);
  if (dup) {
    return alert(`Найдено дублирующее имя группы: "${dup}". Переименуйте или удалите дубликат.`);
  }

  saving.value = true;
  try {
    // если есть метод bulk в store — используем его (оптимально)
    if (typeof productsStore.updateGroupsBulk === "function") {
      // формируем payload: groups: [{_id?, name, slug?}]
      const payload = { groups: localGroups.value.map(g => ({ _id: g._id, name: g.name })) };
      await productsStore.updateGroupsBulk(payload);
    } else {
      // fallback: обновляем/создаём по очереди с ограничением concurrency
      const tasks = [];
      for (const g of localGroups.value) {
        if (g._id) {
          tasks.push(() => productsStore.updateGroup(g._id, { name: g.name }));
        } else {
          tasks.push(() => productsStore.addGroup(g.name));
        }
      }
      // run with small concurrency to avoid spamming server
      await runWithLimit(tasks, 5);
    }

    // обновляем store и локальную копию
    await productsStore.fetchGroups();
    localGroups.value = productsStore.groups.map(g => ({ _id: g._id, name: g.name }));
    originalSnapshot.value = JSON.stringify(localGroups.value);
    emit("close");
  } catch (err) {
    alert("Ошибка при сохранении групп. Проверьте консоль.");
  } finally {
    saving.value = false;
  }
};

// простой concurrency runner
async function runWithLimit(tasks, limit = 5) {
  const results = [];
  const pool = [];
  for (const task of tasks) {
    const p = task().then(r => {
      pool.splice(pool.indexOf(p), 1);
      return r;
    });
    pool.push(p);
    results.push(p);
    if (pool.length >= limit) {
      await Promise.race(pool);
    }
  }
  return Promise.all(results);
}

const onClose = () => {
  // если есть несохранённые изменения — спросим подтверждение
  if (hasChanges.value && !saving.value) {
    if (!confirm("Есть несохранённые изменения. Закрыть без сохранения?")) return;
  }
  emit("close");
};
</script>