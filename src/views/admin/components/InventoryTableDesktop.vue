<script setup lang="ts">
// ── src/views/admin/components/InventoryTableDesktop.vue ──
import { useI18n } from 'vue-i18n'
import { useBookStore } from '@/store/books'
import InventoryTableActions from './InventoryTableActions.vue'
import type { Book } from '@/types/book'

const props = defineProps<{
  books:   Book[]
  search:  string
  headers: { title: string; key: string; sortable?: boolean; width?: string; align?: 'start' | 'center' | 'end' }[]
}>()

const emit = defineEmits<{
  (e: 'edit',   book: Book): void
  (e: 'delete', book: Book): void
  (e: 'return', book: Book): void
  (e: 'detail', book: Book): void
}>()

const { t }     = useI18n()
const bookStore = useBookStore()

function statusLabel(book: Book): string {
  switch (book.status) {
    case 'available': return t('status.available')
    case 'borrowed':  return t('status.borrowed')
    case 'lost':      return t('status.lost')
    case 'damaged':   return t('status.damaged')
    default:          return book.status
  }
}

function statusColor(book: Book): string {
  switch (book.status) {
    case 'available': return 'success'
    case 'borrowed':  return 'warning'
    case 'lost':      return 'error'
    case 'damaged':   return 'orange'
    default:          return 'grey'
  }
}

function returnLabel(book: Book): string {
  if (book.status !== 'borrowed') {
    const days = book.standard_return_days ?? 15
    return t('admin.table.loanPeriod', { days })
  }
  const remaining = bookStore.getRemainingDays(book.due_date)
  if (remaining < 0)   return t('admin.table.overdue',  { days: Math.abs(remaining) })
  if (remaining === 0) return t('admin.table.dueToday')
  return t('admin.table.daysLeft', { days: remaining })
}

function returnColor(book: Book): string {
  if (book.status !== 'borrowed') return 'primary'
  return bookStore.getReturnDayColor(book.due_date)
}

function returnIcon(book: Book): string {
  if (book.status !== 'borrowed') return 'mdi-calendar-check-outline'
  const remaining = bookStore.getRemainingDays(book.due_date)
  if (remaining < 0)   return 'mdi-alert-circle-outline'
  if (remaining === 0) return 'mdi-clock-alert-outline'
  return 'mdi-calendar-clock-outline'
}
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="books"
    :search="search"
    :items-per-page="10"
    items-per-page-text="Sayfa başına kayıt:"
    density="comfortable"
    hover
  >
    <!-- Kapak Hücresi -->
    <template #item.cover="{ item }">
      <div class="cover-cell">
        <img
          v-if="item.cover_image"
          :src="'http://localhost:8080/' + item.cover_image"
          class="cover-cell__img"
          alt="Kapak"
        />
        <div v-else class="cover-cell__placeholder">
          <v-icon icon="mdi-book-open-variant" size="18" color="grey-lighten-1" />
        </div>
      </div>
    </template>

    <!-- Başlık Hücresi -->
    <template #item.title="{ item }">
      <span class="font-weight-medium">{{ item.title }}</span>
    </template>

    <!-- İade Bilgisi Hücresi -->
    <template #item.returnInfo="{ item }">
      <v-chip
        :color="returnColor(item)"
        size="small"
        variant="tonal"
        label
        :prepend-icon="returnIcon(item)"
      >
        {{ returnLabel(item) }}
      </v-chip>
    </template>

    <!-- Durum Hücresi -->
    <template #item.status="{ item }">
      <v-chip :color="statusColor(item)" size="small" variant="tonal" label>
        {{ statusLabel(item) }}
      </v-chip>
    </template>

    <!-- İşlemler Hücresi -->
    <template #item.actions="{ item }">
      <InventoryTableActions
        :book="item"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
        @return="emit('return', $event)"
        @detail="emit('detail', $event)"
      />
    </template>

    <!-- Boş Durum -->
    <template #no-data>
      <div class="empty-state">
        <v-icon icon="mdi-book-off-outline" size="40" color="grey-lighten-2" />
        <p>{{ t('admin.table.empty') }}</p>
      </div>
    </template>
  </v-data-table>
</template>

<style scoped>
.cover-cell {
  padding: 6px 0;
}

.cover-cell__img {
  width: 38px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  display: block;
  border: 1px solid rgba(var(--v-border-color), 0.15);
}

.cover-cell__placeholder {
  width: 38px;
  height: 50px;
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 0;
  color: rgba(var(--v-theme-on-surface), 0.35);
  font-size: 0.875rem;
}
</style>
