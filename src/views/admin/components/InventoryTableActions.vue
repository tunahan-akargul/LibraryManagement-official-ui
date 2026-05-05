<script setup lang="ts">
// ── src/views/admin/components/InventoryTableActions.vue ──
import type { Book } from '@/types/book'

defineProps<{
  book: Book
}>()

const emit = defineEmits<{
  (e: 'edit',   book: Book): void
  (e: 'delete', book: Book): void
  (e: 'return', book: Book): void
  (e: 'detail', book: Book): void
}>()
</script>

<template>
  <!-- ── Masaüstü: Yan yana butonlar ── -->
  <div class="action-cell action-cell--desktop">
    <!-- Detaylar: yalnızca ödünç kitaplarda -->
    <v-tooltip v-if="book.status === 'borrowed'" text="Detaylar" location="top">
      <template #activator="{ props: tip }">
        <v-btn
          v-bind="tip"
          icon="mdi-account-details-outline"
          size="small"
          variant="text"
          color="info"
          @click.stop="emit('detail', book)"
        />
      </template>
    </v-tooltip>

    <!-- Düzenle -->
    <v-tooltip text="Düzenle" location="top">
      <template #activator="{ props: tip }">
        <v-btn
          v-bind="tip"
          icon="mdi-pencil-outline"
          size="small"
          variant="text"
          color="primary"
          @click.stop="emit('edit', book)"
        />
      </template>
    </v-tooltip>

    <!-- Sil -->
    <v-tooltip text="Sil" location="top">
      <template #activator="{ props: tip }">
        <v-btn
          v-bind="tip"
          icon="mdi-trash-can-outline"
          size="small"
          variant="text"
          color="error"
          @click.stop="emit('delete', book)"
        />
      </template>
    </v-tooltip>

    <!-- İade Al: yalnızca ödünç kitaplarda -->
    <v-tooltip v-if="book.status === 'borrowed'" text="İade Al" location="top">
      <template #activator="{ props: tip }">
        <v-btn
          v-bind="tip"
          icon="mdi-keyboard-return"
          size="small"
          variant="text"
          color="success"
          @click.stop="emit('return', book)"
        />
      </template>
    </v-tooltip>
  </div>

  <!-- ── Mobil: Tek ayarlar menüsü ── -->
  <div class="action-cell action-cell--mobile">
    <v-menu location="bottom end" :close-on-content-click="true">
      <template #activator="{ props: menu }">
        <v-btn
          v-bind="menu"
          icon="mdi-dots-vertical"
          size="small"
          variant="text"
          color="default"
          @click.stop
        />
      </template>

      <v-list density="compact" rounded="lg" min-width="170">
        <!-- Detaylar: yalnızca ödünç kitaplarda -->
        <v-list-item
          v-if="book.status === 'borrowed'"
          prepend-icon="mdi-account-details-outline"
          title="Detaylar"
          base-color="info"
          @click.stop="emit('detail', book)"
        />

        <!-- Düzenle -->
        <v-list-item
          prepend-icon="mdi-pencil-outline"
          title="Düzenle"
          base-color="primary"
          @click.stop="emit('edit', book)"
        />

        <!-- İade Al: yalnızca ödünç kitaplarda -->
        <v-list-item
          v-if="book.status === 'borrowed'"
          prepend-icon="mdi-keyboard-return"
          title="İade Al"
          base-color="success"
          @click.stop="emit('return', book)"
        />

        <v-divider class="my-1" />

        <!-- Sil -->
        <v-list-item
          prepend-icon="mdi-trash-can-outline"
          title="Sil"
          base-color="error"
          @click.stop="emit('delete', book)"
        />
      </v-list>
    </v-menu>
  </div>
</template>

<style scoped>
.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

/* Masaüstü versiyonu: sadece md+ ekranlarda göster */
.action-cell--desktop {
  display: none;
}

/* Mobil versiyonu: varsayılan görünür */
.action-cell--mobile {
  display: flex;
}

/* md ve üzeri ekranlarda masaüstü butonlarını göster, mobil menüyü gizle */
@media (min-width: 960px) {
  .action-cell--desktop {
    display: flex;
  }
  .action-cell--mobile {
    display: none;
  }
}
</style>
