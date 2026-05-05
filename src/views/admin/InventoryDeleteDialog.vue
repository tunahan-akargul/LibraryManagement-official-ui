<script setup lang="ts">
// ── src/views/admin/InventoryDeleteDialog.vue ─────────────
import type { Book } from '@/types/book'

defineProps<{
  open: boolean
  book: Book | null
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'):  void
}>()
</script>

<template>
  <v-dialog
    :model-value="open"
    max-width="420"
    persistent
    rounded="xl"
    @update:model-value="!$event && emit('cancel')"
  >
    <v-card elevation="0" border rounded="xl">

      <!-- Başlık -->
      <div class="delete-header">
        <div class="delete-header__icon-wrap">
          <v-icon icon="mdi-trash-can-outline" color="error" size="20" />
        </div>
        <div>
          <p class="delete-header__title">Kitabı Sil</p>
          <p class="delete-header__sub">Bu işlem geri alınamaz</p>
        </div>
      </div>

      <v-divider />

      <!-- İçerik -->
      <v-card-text class="pa-5">
        <p class="delete-body__text">
          <template v-if="book">
            <strong class="delete-body__book-name">"{{ book.title }}"</strong>
            kitabını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </template>
          <template v-else>
            Bu kitabı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </template>
        </p>
        <p class="delete-body__warn">
          Kitaba ait tüm veriler kalıcı olarak silinecektir.
        </p>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 gap-2">
        <v-spacer />
        <v-btn
          variant="text"
          rounded="lg"
          @click="emit('cancel')"
        >
          İptal
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          rounded="lg"
          prepend-icon="mdi-trash-can-outline"
          @click="emit('confirm')"
        >
          Sil
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<style scoped>
.delete-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
}

.delete-header__icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(var(--v-theme-error), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.delete-header__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 3px;
}

.delete-header__sub {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin: 0;
}

.delete-body__text {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.75);
  margin: 0 0 10px;
  line-height: 1.6;
}

.delete-body__book-name {
  color: rgb(var(--v-theme-on-surface));
}

.delete-body__warn {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-error), 0.8);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.delete-body__warn::before {
  content: '⚠';
  font-size: 0.75rem;
}
</style>
