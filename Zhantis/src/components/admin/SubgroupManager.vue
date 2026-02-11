<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded shadow max-w-full">
      <h3 class="text-lg font-semibold mb-2">Менеджер подгрупп</h3>

      <div class="mb-2 text-sm text-gray-600">Групп: <strong>{{ groups.length }}</strong> · Подгрупп для текущей группы: <strong>{{ localSubgroups.length }}</strong></div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm mb-1">Выберите группу</label>
          <select v-model="selectedGroup" @change="onGroupSelect" class="border p-2 w-full">
            <option :value="null">-- Выберите группу --</option>
            <option v-for="g in groups" :key="g._id" :value="g._id">{{ g.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm mb-1">Новая подгруппа</label>
          <div class="flex gap-2">
            <input v-model="newSubgroupName" placeholder="Название подгруппы" class="border p-2 flex-1" />
            <button @click="addSubgroup" :disabled="adding || !selectedGroup || !newSubgroupName.trim()"
                    class="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-60">
              <span v-if="!adding">Добавить</span><span v-else>Добавление...</span>
            </button>
          </div>
          <div class="text-xs text-gray-500 mt-1">Подгруппы будут привязаны к выбранной группе.</div>
        </div>
      </div>

      <div class="mb-3 text-sm text-gray-600">Список подгрупп для выбранной группы</div>

      <table class="w-full table-auto border-collapse">
        <thead><tr class="text-left"><th class="pb-2">Название</th><th class="pb-2">Slug</th><th class="pb-2">Действия</th></tr></thead>
        <tbody>
          <tr v-if="!selectedGroup" class="text-gray-500"><td colspan="3" class="py-4">Выберите группу, чтобы увидеть её подгруппы.</td></tr>

          <tr v-for="(s, idx) in localSubgroups" :key="s._id || s._tmpId" class="border-t">
            <td class="py-2"><input v-model="s.name" class="border p-1 w-full" /></td>
            <td class="py-2"><input v-model="s.slug" class="border p-1 w-full" /></td>
            <td class="py-2 flex gap-2">
              <button @click="saveSubgroup(s)" :disabled="savingId === s._id || savingTmp === s._tmpId" class="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-60">Сохранить</button>
              <button @click="confirmDelete(s, idx)" class="bg-red-500 text-white px-3 py-1 rounded">Удалить</button>
            </td>
          </tr>

          <tr v-if="localSubgroups.length === 0 && selectedGroup" class="text-gray-500"><td colspan="3" class="py-4">У выбранной группы пока нет подгрупп.</td></tr>
        </tbody>
      </table>

      <div class="flex justify-end mt-4 gap-2">
        <button @click="refresh" class="bg-gray-200 px-4 py-1 rounded">Обновить</button>
        <button @click="close" class="bg-gray-400 text-white px-4 py-1 rounded">Закрыть</button>
      </div>
    </div>

    <div v-if="showConfirm" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-60">
      <div class="bg-white p-4 rounded shadow w-80">
        <div class="mb-3">Удалить подгруппу «<strong>{{ subgroupToDelete?.name }}</strong>»?</div>
        <div class="flex justify-end gap-2">
          <button @click="cancelDelete" class="px-3 py-1 rounded bg-gray-200">Отмена</button>
          <button @click="performDelete" class="px-3 py-1 rounded bg-red-500 text-white">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import { useProductsStore } from "@/stores/products";

const props = defineProps({ show: Boolean, initialGroup: { type: [String, null], default: null } });
const emit = defineEmits(["close", "updated"]);
const store = useProductsStore();

const groups = ref([]);
const selectedGroup = ref(props.initialGroup || null);
const newSubgroupName = ref("");
const adding = ref(false);
const localSubgroups = ref([]);
const savingId = ref(null);
const savingTmp = ref(null);

const showConfirm = ref(false);
const subgroupToDelete = ref(null);
const subgroupToDeleteIndex = ref(null);

function getParentIdFromDoc(s) {
  if (!s) return null;
  if (s.parentGroup && typeof s.parentGroup === "object") return s.parentGroup._id || s.parentGroup.id || s.parentGroup;
  return s.parentGroup || s.group || s.parent || null;
}

watch(() => props.show, async (val) => {
  if (val) {
    await store.fetchGroups();
    groups.value = store.groups || [];
    selectedGroup.value = props.initialGroup || (groups.value.length ? groups.value[0]._id : null);
    await loadSubgroupsForSelected();
  }
}, { immediate: true });

watch(() => props.initialGroup, async (g) => { if (g) { selectedGroup.value = g; await loadSubgroupsForSelected(); } });
watch(selectedGroup, async (val) => { if (val) await loadSubgroupsForSelected(); else localSubgroups.value = []; });

async function loadSubgroupsForSelected() {
  if (!selectedGroup.value) { localSubgroups.value = []; return; }
  try {
    await store.fetchSubgroups({ parentGroup: selectedGroup.value });
    let items = store.subgroups || [];
    if (!items || items.length === 0) {
      await store.fetchSubgroups();
      items = store.subgroups || [];
    }
    localSubgroups.value = items
      .filter(s => String(getParentIdFromDoc(s)) === String(selectedGroup.value))
      .map(s => ({ _id: s._id, name: s.name, slug: s.slug || "" }));
  } catch (err) { console.error("loadSubgroupsForSelected error", err); localSubgroups.value = []; }
}

const onGroupSelect = async () => { newSubgroupName.value = ""; await loadSubgroupsForSelected(); nextTick(() => { const el = document.querySelector('input[placeholder="Название подгруппы"]'); if (el) el.focus(); }); };

async function addSubgroup() {
  if (!selectedGroup.value || !newSubgroupName.value.trim()) return;
  adding.value = true;
  const name = newSubgroupName.value.trim();
  try {
    const tmpId = `tmp_${Date.now()}`;
    localSubgroups.value.unshift({ _tmpId: tmpId, name, slug: name.toLowerCase().replace(/\s+/g, "-") });
    newSubgroupName.value = "";
    await store.addSubgroup({ name, parentGroup: selectedGroup.value });
    await loadSubgroupsForSelected();
    emit("updated");
  } catch (err) { console.error("addSubgroup error", err); } finally { adding.value = false; }
}

async function saveSubgroup(s) {
  if (s._tmpId) {
    savingTmp.value = s._tmpId;
    try { await store.addSubgroup({ name: s.name, parentGroup: selectedGroup.value }); await loadSubgroupsForSelected(); emit("updated"); }
    catch (err) { console.error("saveSubgroup tmp error", err); } finally { savingTmp.value = null; }
    return;
  }
  if (!s._id) return;
  savingId.value = s._id;
  try { await store.updateSubgroup(s._id, { name: s.name, parentGroup: selectedGroup.value }); await loadSubgroupsForSelected(); emit("updated"); }
  catch (err) { console.error("saveSubgroup error", err); } finally { savingId.value = null; }
}

function confirmDelete(s, idx) { subgroupToDelete.value = s; subgroupToDeleteIndex.value = idx; showConfirm.value = true; }
function cancelDelete() { showConfirm.value = false; subgroupToDelete.value = null; subgroupToDeleteIndex.value = null; }

async function performDelete() {
  const s = subgroupToDelete.value; const idx = subgroupToDeleteIndex.value;
  showConfirm.value = false; subgroupToDelete.value = null; subgroupToDeleteIndex.value = null;
  if (!s) return;
  if (s._tmpId) { localSubgroups.value.splice(idx, 1); return; }
  try { await store.deleteSubgroup(s._id); await loadSubgroupsForSelected(); emit("updated"); } catch (err) { console.error("performDelete error", err); }
}

async function refresh() { await store.fetchGroups(); groups.value = store.groups; await loadSubgroupsForSelected(); }
function close() { emit("close"); }
</script>

<style scoped>
.z-60 { z-index: 60; }
</style>