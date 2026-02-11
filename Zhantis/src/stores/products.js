// src/stores/products.js
import { defineStore } from "pinia";
import api from "@/api";

export const useProductsStore = defineStore("products", {
  state: () => ({
    products: [],
    groups: [],
    subgroups: [],
    attributes: [],
    attributeCache: {},
    filters: {},
    loading: false,
    error: null,
    total: 0,
  }),

  getters: {
    filteredProducts: (state) => {
      return state.products.filter((p) => {
        if (state.filters.group && String(p.group?._id || p.group) !== String(state.filters.group)) return false;
        if (state.filters.subgroup && String(p.subgroup?._id || p.subgroup) !== String(state.filters.subgroup)) return false;

        if (state.filters.extension) {
          const ext = p.attributes?.extension ?? (p.dynamicAttributes && p.dynamicAttributes.extension);
          if (state.filters.extension === "фиксаторы") {
            if (!p.attributes?.fixation && !p.dynamicAttributes?.fixation) return false;
          } else if (ext !== state.filters.extension) return false;
        }

        for (const [key, val] of Object.entries(state.filters)) {
          if (["group", "subgroup", "extension"].includes(key)) continue;
          const productVal = p.attributes?.[key] ?? (p.dynamicAttributes && p.dynamicAttributes[key]);
          if (val && productVal !== val) return false;
        }
        return true;
      });
    },
  },

  actions: {
    handleError(err, defaultMessage = "Ошибка") {
      try { this.error = err?.response?.data?.error || defaultMessage; } catch (e) { this.error = defaultMessage; }
      console.error(err?.response?.data || err);
    },

    // PRODUCTS
    async fetchProducts() {
      this.loading = true; this.error = null;
      try {
        const res = await api.get("/products");
        const payload = res.data;
        let items = [];
        if (Array.isArray(payload)) { items = payload; this.total = items.length; }
        else if (payload && Array.isArray(payload.items)) { items = payload.items; this.total = payload.total || items.length; }
        else { items = []; this.total = 0; }
        this.products = items;
      } catch (err) { this.handleError(err, "Ошибка загрузки товаров"); }
      finally { this.loading = false; }
    },

    async addProduct(product) {
      try { await api.post("/products", product); await this.fetchProducts(); }
      catch (err) { this.handleError(err, "Ошибка добавления товара"); throw err; }
    },

    async updateProduct(id, payload) {
      try { await api.put(`/products/${id}`, payload); await this.fetchProducts(); }
      catch (err) { this.handleError(err, "Ошибка обновления товара"); throw err; }
    },

    async deleteProduct(id) {
      try { await api.delete(`/products/${id}`); await this.fetchProducts(); }
      catch (err) { this.handleError(err, "Ошибка удаления товара"); throw err; }
    },

    // GROUPS
    async fetchGroups() {
      try { const res = await api.get("/groups"); this.groups = res.data || []; }
      catch (err) { this.handleError(err, "Ошибка загрузки групп"); }
    },

    async addGroup(name) {
      try { await api.post("/groups", { name }); await this.fetchGroups(); }
      catch (err) { this.handleError(err, "Ошибка добавления группы"); throw err; }
    },

    async updateGroup(id, payload) {
      try { await api.put(`/groups/${id}`, payload); await this.fetchGroups(); }
      catch (err) { this.handleError(err, "Ошибка обновления группы"); throw err; }
    },

    async deleteGroup(id) {
      try { await api.delete(`/groups/${id}`); await this.fetchGroups(); }
      catch (err) { this.handleError(err, "Ошибка удаления группы"); throw err; }
    },

    // SUBGROUPS
    async fetchSubgroups(params = {}) {
      try {
        const res = await api.get("/subgroups", { params });
        this.subgroups = res.data || [];
      } catch (err) {
        this.handleError(err, "Ошибка загрузки подгрупп");
      }
    },

    async addSubgroup({ name, parentGroup }) {
      try {
        const payload = { name };
        if (parentGroup) { payload.parentGroup = parentGroup; payload.group = parentGroup; }
        await api.post("/subgroups", payload);
        await this.fetchSubgroups({ parentGroup });
      } catch (err) {
        this.handleError(err, "Ошибка добавления подгруппы");
        throw err;
      }
    },

    async updateSubgroup(id, { name, parentGroup }) {
      try {
        const payload = {};
        if (name !== undefined) payload.name = name;
        if (parentGroup !== undefined) { payload.parentGroup = parentGroup; payload.group = parentGroup; }
        await api.put(`/subgroups/${id}`, payload);
        await this.fetchSubgroups(parentGroup ? { parentGroup } : {});
      } catch (err) {
        this.handleError(err, "Ошибка обновления подгруппы");
        throw err;
      }
    },

    async deleteSubgroup(id) {
      try { await api.delete(`/subgroups/${id}`); await this.fetchSubgroups(); }
      catch (err) { this.handleError(err, "Ошибка удаления подгруппы"); throw err; }
    },

    // ATTRIBUTES
    async fetchAttributes() {
      try { const res = await api.get("/attributes"); this.attributes = res.data || []; return this.attributes; }
      catch (err) { this.handleError(err, "Ошибка загрузки атрибутов"); return []; }
    },

    async fetchAttributeDefinitions(groupId = null, subgroupId = null) {
      const groupKey = groupId || "global";
      const subgroupKey = subgroupId || "none";
      const cacheKey = `${groupKey}|${subgroupKey}`;
      if (this.attributeCache[cacheKey]) return this.attributeCache[cacheKey];

      try {
        let attrs = [];
        if (subgroupId) {
          const resSub = await api.get("/attributes", { params: { subgroup: subgroupId } });
          attrs = resSub.data || [];
        }
        if (groupId) {
          const resGroup = await api.get("/attributes", { params: { group: groupId } });
          const groupAttrs = resGroup.data || [];
          const existingKeys = new Set(attrs.map(a => a.key));
          for (const a of groupAttrs) if (!existingKeys.has(a.key)) attrs.push(a);
        }
        const resGlobal = await api.get("/attributes", { params: { global: true } }).catch(async () => {
          const r = await api.get("/attributes"); return r;
        });
        const globalAttrs = (resGlobal && resGlobal.data) || [];
        const existingKeys2 = new Set(attrs.map(a => a.key));
        for (const a of globalAttrs) if (!existingKeys2.has(a.key)) attrs.push(a);

        attrs.sort((a, b) => (a.order || 0) - (b.order || 0));
        this.attributeCache[cacheKey] = attrs;
        return attrs;
      } catch (err) {
        this.handleError(err, "Ошибка загрузки определений атрибутов");
        return [];
      }
    },

    invalidateAttributeCache() { this.attributeCache = {}; },

    async createAttribute(def) {
      try { const res = await api.post("/attributes", def); this.invalidateAttributeCache(); return res.data; }
      catch (err) { this.handleError(err, "Ошибка создания атрибута"); throw err; }
    },

    async updateAttribute(id, def) {
      try { const res = await api.put(`/attributes/${id}`, def); this.invalidateAttributeCache(); return res.data; }
      catch (err) { this.handleError(err, "Ошибка обновления атрибута"); throw err; }
    },

    async deleteAttribute(id) {
      try { await api.delete(`/attributes/${id}`); this.invalidateAttributeCache(); return true; }
      catch (err) { this.handleError(err, "Ошибка удаления атрибута"); throw err; }
    },

    async uploadImage(file) {
      try {
        const formData = new FormData(); formData.append("image", file);
        const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
        return res.data?.imageUrl || res.data?.path || res.data;
      } catch (err) {
        this.handleError(err, "Ошибка загрузки изображения");
        throw err;
      }
    },
  },
});