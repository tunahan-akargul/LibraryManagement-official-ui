<script setup lang="ts">
// ── src/views/admin/components/InventoryTableMobile.vue ───
import { useI18n } from 'vue-i18n'
import { useBookStore } from '@/store/books'
import InventoryTableActions from './InventoryTableActions.vue'
import type { Book } from '@/types/book'

defineProps<{
  /** Arama filtresi uygulanmış, gösterilecek kitap listesi */
  books: Book[]
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
  <div>
    <!-- Boş Durum -->
    <div v-if="books.length === 0" class="empty-state">
      <v-icon icon="mdi-book-off-outline" size="40" color="grey-lighten-2" />
      <p>{{ t('admin.table.noResults') }}</p>
    </div>

    <!-- Kitap Kartları -->
    <div
      v-for="book in books"
      :key="book.id"
      class="book-card"
    >
      <!-- ── Üst Satır: Kapak + Bilgiler + Aksiyonlar ── -->
      <div class="book-card__row">

        <!-- Kapak -->
        <div class="book-card__cover">
          <img
            v-if="book.cover_image"
            :src="'http://localhost:8080/' + book.cover_image"
            alt="Kapak"
            class="book-card__cover-img"
          />
          <div v-else class="book-card__cover-placeholder">
            <v-icon icon="mdi-book-open-variant" size="20" color="grey-lighten-1" />
          </div>
        </div>

        <!-- Merkez: Başlık + Yazar + Tür/Yıl -->
        <!-- min-width:0 + overflow:hidden ile uzun başlıklar kırpılır -->
        <div class="book-card__body">
          <p class="book-card__title">{{ book.title }}</p>
          <p class="book-card__author">{{ book.author }}</p>
          <div class="book-card__meta">
            <v-chip size="x-small" variant="tonal" color="primary" label class="book-card__genre-chip">
              {{ book.genre }}
            </v-chip>
            <span class="book-card__year">{{ book.published_year }}</span>
          </div>
        </div>

        <!-- Sağ: Durum chip + Ayarlar menüsü (tek nokta butonu) -->
        <div class="book-card__aside">
          <v-chip
            :color="statusColor(book)"
            size="x-small"
            variant="tonal"
            label
            class="book-card__status-chip"
          >
            {{ statusLabel(book) }}
          </v-chip>

          <!-- InventoryTableActions mobil modda tek bir ⋮ butonu gösterir -->
          <InventoryTableActions
            :book="book"
            @edit="emit('edit', $event)"
            @delete="emit('delete', $event)"
            @return="emit('return', $event)"
            @detail="emit('detail', $event)"
          />
        </div>
      </div>

      <!-- ── Alt Satır: İade Chip + ISBN ── -->
      <div class="book-card__footer">
        <v-chip
          :color="returnColor(book)"
          size="x-small"
          variant="tonal"
          label
          :prepend-icon="returnIcon(book)"
          class="book-card__return-chip"
        >
          {{ returnLabel(book) }}
        </v-chip>

        <span class="book-card__isbn">{{ book.isbn }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 16px;
  color: rgba(var(--v-theme-on-surface), 0.35);
  font-size: 0.875rem;
}

/* ── Kart ── */
.book-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 12px;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.1);
  transition: background 0.15s;
}

.book-card:last-child {
  border-bottom: none;
}

.book-card:hover {
  background: rgba(var(--v-theme-on-surface), 0.025);
}

/* ── Üst satır ── */
.book-card__row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  /* Taşmayı önle: çocukların flex: 1 alabilmesi için */
  min-width: 0;
}

/* ── Kapak ── */
.book-card__cover {
  flex-shrink: 0;
}

.book-card__cover-img {
  width: 44px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid rgba(var(--v-border-color), 0.15);
  display: block;
}

.book-card__cover-placeholder {
  width: 44px;
  height: 60px;
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 6px;
  border: 1px solid rgba(var(--v-border-color), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Orta: Başlık alanı — min-width:0 kritik! ── */
.book-card__body {
  flex: 1;
  min-width: 0;          /* overflow:hidden'ın çalışması için şart */
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;
}

.book-card__title {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.35;
  color: rgb(var(--v-theme-on-surface));
  /* 2 satırda kırp, sonrasını ... yap */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  margin: 0;
}

.book-card__author {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.book-card__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  margin-top: 2px;
  overflow: hidden;
}

/* Tür chip'i de taşmayı önle */
.book-card__genre-chip {
  max-width: 90px;
  overflow: hidden;
}

.book-card__year {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Sağ: Durum + menü butonu ── */
.book-card__aside {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  /* Menü butonunun taşmasını önle */
  min-width: 52px;
}

.book-card__status-chip {
  white-space: nowrap;
}

/* ── Alt satır ── */
.book-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  /* Kapak genişliği + gap kadar içeri al */
  padding-left: 54px;
}

.book-card__return-chip {
  flex-shrink: 0;
}

.book-card__isbn {
  font-size: 0.72rem;
  font-family: monospace;
  color: rgba(var(--v-theme-on-surface), 0.35);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
  min-width: 0;
}
</style>
