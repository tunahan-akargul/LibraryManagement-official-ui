<script setup lang="ts">
// ── src/views/admin/InventoryHeader.vue ───────────────────
import { useDisplay } from 'vuetify'

const emit = defineEmits<{
  (e: 'add'): void
}>()

const { smAndDown } = useDisplay()
</script>

<template>
  <div class="inventory-header">
    <div class="inventory-header__text">
      <h1 class="inventory-header__title">Kitap Envanteri</h1>
      <p class="inventory-header__sub">Tüm kitapları yönetin, ekleyin ve düzenleyin</p>
    </div>

    <!-- Masaüstü: metin + ikon -->
    <v-btn
      v-if="!smAndDown"
      color="primary"
      variant="flat"
      prepend-icon="mdi-plus"
      rounded="lg"
      elevation="0"
      @click="emit('add')"
    >
      Kitap Ekle
    </v-btn>

    <!-- Mobil: sadece ikon -->
    <v-btn
      v-else
      color="primary"
      variant="flat"
      icon="mdi-plus"
      rounded="lg"
      elevation="0"
      size="default"
      @click="emit('add')"
    />
  </div>
</template>

<style scoped>
.inventory-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.inventory-header__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
}

.inventory-header__sub {
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin: 0;
}
</style>
