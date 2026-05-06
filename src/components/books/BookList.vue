<script setup lang="ts">
// ── src/components/books/BookList.vue ─────────────────────
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBookStore } from '@/store/books'
import BorrowDialog from '@/components/books/BorrowDialog.vue'
import type { Book } from '@/types/book'

const props = defineProps<{
  books:   Book[]
  loading: boolean
  error:   string | null
}>()

const router    = useRouter()
const { t }     = useI18n()
const bookStore = useBookStore()

// ── Dialog & Snackbar state ───────────────────────────────
const dialogOpen    = ref(false)
const selectedBook  = ref<Book | null>(null)
const snackbar      = ref(false)
const snackbarText  = ref('')

// ── Actions ───────────────────────────────────────────────
function goDetail(id: number) {
  router.push(`/books/${id}`)
}

/**
 * Ödünç Al butonuna tıklandığında:
 * kartın kendi click event'ini durdurup sadece dialog'u açar.
 */
function openBorrowDialog(event: MouseEvent, book: Book) {
  event.stopPropagation()
  selectedBook.value = book
  dialogOpen.value   = true
}

function onBorrowSuccess() {
  dialogOpen.value  = false
  snackbarText.value = t('borrowDialog.successMessage')
  snackbar.value    = true
}

function onBorrowCancel() {
  dialogOpen.value = false
}

/** Kart üzerinde gösterilecek iade/süre chip bilgisi */
function returnChip(book: Book): { label: string; color: string; icon: string } | null {
  // Müsait kitaplarda standart ödünç alma süresini göster
  if (book.status === 'available') {
    const days = book.standard_return_days ?? 15
    return {
      label: t('bookDetail.loanPeriod', { days }),
      color: 'success',
      icon:  'mdi-calendar-check-outline',
    }
  }

  // Ödünç verilmiş kitaplarda due_date üzerinden kalan gün hesabı
  if (book.status === 'borrowed' && book.due_date) {
    const today     = new Date()
    today.setHours(0, 0, 0, 0)
    const due       = new Date(book.due_date)
    due.setHours(0, 0, 0, 0)
    const remaining = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (remaining < 0) {
      return {
        label: t('bookDetail.overdue', { days: Math.abs(remaining) }),
        color: 'error',
        icon:  'mdi-alert-circle-outline',
      }
    }
    if (remaining === 0) {
      return {
        label: t('bookDetail.dueToday'),
        color: 'warning',
        icon:  'mdi-clock-alert-outline',
      }
    }
    return {
      label: t('bookDetail.daysLeft', { days: remaining }),
      color: remaining <= 7 ? 'warning' : 'success',
      icon:  'mdi-calendar-clock-outline',
    }
  }

  // Kayıp veya hasarlı kitaplar
  if (book.status === 'lost') {
    return {
      label: t('status.lost'),
      color: 'error',
      icon:  'mdi-book-remove-outline',
    }
  }

  if (book.status === 'damaged') {
    return {
      label: t('status.damaged'),
      color: 'warning',
      icon:  'mdi-book-alert-outline',
    }
  }

  return null
}

/** Durum rozetinin CSS sınıfı */
function statusBadgeClass(status: Book['status']): string {
  switch (status) {
    case 'available':      return 'book-card__status-badge--ok'
    case 'borrow_pending': return 'book-card__status-badge--pending'
    case 'borrowed':       return 'book-card__status-badge--no'
    case 'return_pending': return 'book-card__status-badge--pending'
    case 'lost':           return 'book-card__status-badge--lost'
    case 'damaged':        return 'book-card__status-badge--damaged'
    default:               return ''
  }
}

/** Durum rozeti metni */
function statusLabel(status: Book['status']): string {
  return t(`status.${status}`)
}

const skeletonItems = Array.from({ length: 8 })
</script>

<template>
  <div class="book-list-root">
  <!-- Hata -->
  <div v-if="error" class="state-box">
    <v-icon size="48" color="error" style="opacity:0.4">mdi-alert-circle-outline</v-icon>
    <p>{{ error }}</p>
  </div>

  <!-- Yükleniyor: iskelet grid -->
  <div v-else-if="loading" class="book-grid">
    <v-skeleton-loader
      v-for="(_, i) in skeletonItems"
      :key="i"
      type="card"
      rounded="xl"
      class="book-skeleton"
    />
  </div>

  <!-- Boş -->
  <div v-else-if="!books.length" class="state-box">
    <v-icon size="48" color="grey-lighten-2">mdi-book-off-outline</v-icon>
    <p>{{ t('catalog.noResults') }}</p>
  </div>

  <!-- Kitap kartları -->
  <div v-else class="book-grid">
    <div
      v-for="book in books"
      :key="book.id"
      class="book-card"
      @click="goDetail(book.id)"
    >
      <!-- Kapak -->
      <div class="book-card__cover">
        <img
          v-if="book.cover_image"
          :src="'http://localhost:8080/' + book.cover_image"
          :alt="book.title"
          class="book-card__cover-img"
          loading="lazy"
        />
        <div v-else class="book-card__cover-fallback">
          <v-icon size="32" color="grey-lighten-2">mdi-book-open-page-variant</v-icon>
        </div>

        <!-- Durum rozeti -->
        <div
          class="book-card__status-badge"
          :class="statusBadgeClass(book.status)"
        >
          {{ statusLabel(book.status) }}
        </div>

        <!-- Ödünç Al overlay butonu (sadece available kitaplarda) -->
        <Transition name="borrow-btn-fade">
          <button
            v-if="book.status === 'available'"
            class="book-card__borrow-overlay"
            @click.stop="openBorrowDialog($event, book)"
          >
            <v-icon size="16" class="me-1">mdi-hand-extended-outline</v-icon>
            {{ t('bookDetail.borrowBook') }}
          </button>
        </Transition>
      </div>

      <!-- Bilgiler -->
      <div class="book-card__body">
        <div class="book-card__genre">{{ book.genre }}</div>
        <h3 class="book-card__title">{{ book.title }}</h3>
        <p class="book-card__author">{{ book.author }}</p>

        <!-- Yıldız -->
        <div v-if="book.rating" class="book-card__rating">
          <v-icon size="13" color="#FFB300">mdi-star</v-icon>
          <span>{{ Number(book.rating).toFixed(1) }}</span>
        </div>

        <!-- İade bilgisi chip -->
        <div class="book-card__return-row">
          <template v-if="returnChip(book)">
            <v-chip
              :color="returnChip(book)!.color"
              size="x-small"
              variant="tonal"
              label
              :prepend-icon="returnChip(book)!.icon"
              class="book-card__return-chip"
            >
              {{ returnChip(book)!.label }}
            </v-chip>
          </template>
        </div>
      </div>
    </div>
  </div>

  <!-- ── BorrowDialog ── -->
  <v-dialog
    v-model="dialogOpen"
    :max-width="480"
    :fullscreen="false"
    rounded="xl"
    persistent
  >
    <!-- Mobilde tam ekran -->
    <v-responsive
      class="borrow-dialog-responsive"
    >
      <BorrowDialog
        v-if="selectedBook"
        :book="selectedBook"
        @success="onBorrowSuccess"
        @cancel="onBorrowCancel"
      />
    </v-responsive>
  </v-dialog>

  <!-- ── Başarı Snackbar ── -->
  <v-snackbar
    v-model="snackbar"
    :timeout="3000"
    location="bottom center"
    rounded="xl"
    color="success"
    variant="flat"
    class="borrow-snackbar"
  >
    <div class="snackbar-content">
      <v-icon size="18" class="me-2">mdi-check-circle-outline</v-icon>
      {{ snackbarText }}
    </div>
  </v-snackbar>
  </div>
</template>

<style scoped>
/* ── Root wrapper ── */
.book-list-root {
  display: contents;
}

/* ── Grid ── */
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

@media (max-width: 480px) {
  .book-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
}

/* ── Kart ── */
.book-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.12);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.1);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

/* Hover'da Ödünç Al butonunu göster */
.book-card:hover .book-card__borrow-overlay {
  opacity: 1;
  transform: translateY(0);
}

/* Kapak */
.book-card__cover {
  position: relative;
  aspect-ratio: 2/3;
  background: rgba(var(--v-theme-on-surface), 0.05);
  overflow: hidden;
}

.book-card__cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.book-card:hover .book-card__cover-img {
  transform: scale(1.04);
}

.book-card__cover-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-card__status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  backdrop-filter: blur(6px);
}

.book-card__status-badge--ok {
  background: rgba(56, 161, 105, 0.85);
  color: #fff;
}

.book-card__status-badge--no {
  background: rgba(229, 62, 62, 0.82);
  color: #fff;
}

.book-card__status-badge--lost {
  background: rgba(113, 63, 18, 0.85);
  color: #fff;
}

.book-card__status-badge--damaged {
  background: rgba(214, 158, 46, 0.9);
  color: #fff;
}

.book-card__status-badge--pending {
  background: rgba(180, 83, 9, 0.88);
  color: #fff;
}

/* ── Ödünç Al Overlay Butonu ── */
.book-card__borrow-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 12px;
  background: rgba(var(--v-theme-primary), 0.92);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.book-card__borrow-overlay:hover {
  background: rgba(var(--v-theme-primary), 1);
}

/* Touch cihazlar: overlay her zaman görünür ama daha küçük */
@media (hover: none) {
  .book-card__borrow-overlay {
    opacity: 1;
    transform: translateY(0);
    padding: 8px;
    font-size: 0.65rem;
  }
}

/* Body */
.book-card__body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.book-card__genre {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 2px;
}

.book-card__title {
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.3;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-card__author {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-card__rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-top: 2px;
}

/* İade chip */
.book-card__return-row {
  margin-top: 6px;
  min-height: 22px;
}

.book-card__return-chip {
  font-size: 0.65rem !important;
  font-weight: 600 !important;
}

/* ── Durum kutuları ── */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 24px;
  color: rgba(var(--v-theme-on-surface), 0.4);
  font-size: 0.875rem;
  text-align: center;
}

.book-skeleton {
  border-radius: 16px;
  aspect-ratio: unset;
  min-height: 280px;
}

/* ── Borrow overlay fade ── */
.borrow-btn-fade-enter-active,
.borrow-btn-fade-leave-active {
  transition: opacity 0.2s ease;
}
.borrow-btn-fade-enter-from,
.borrow-btn-fade-leave-to {
  opacity: 0;
}

/* ── Snackbar ── */
.snackbar-content {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 600;
}

/* ── Dialog responsive ── */
.borrow-dialog-responsive {
  width: 100%;
}
</style>