<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useBookStore } from '@/store/books'
import { useAuthStore } from '@/store/auth'
import type { Book } from '@/types/book'

const { t, locale } = useI18n()
const router    = useRouter()
const bookStore = useBookStore()
const auth      = useAuthStore()

onMounted(() => {
  if (!bookStore.books.length) bookStore.fetchBooks()
})

// Kullanıcının üzerine atanmış tüm kitaplar (onay bekleyen, ödünç alınan, iade onayı bekleyen).
const myBorrowedBooks = computed<Book[]>(() => {
  const myId = auth.currentUser?.id
  if (!myId) return []
  const ACTIVE: Book['status'][] = ['borrow_pending', 'borrowed', 'return_pending']
  return bookStore.books.filter(
    (b) => b.borrower_id === myId && ACTIVE.includes(b.status),
  )
})

const formatDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '—'

const daysLeft = (due: string) =>
  Math.ceil((new Date(due).getTime() - Date.now()) / 86400000)

const dueStatus = (book: Book) => {
  if (book.status === 'borrow_pending') {
    return { label: t('status.borrow_pending'), cls: 'due--pending', icon: 'mdi-clock-time-eight-outline' }
  }
  if (book.status === 'return_pending') {
    return { label: t('status.return_pending'), cls: 'due--pending', icon: 'mdi-clock-time-eight-outline' }
  }
  if (!book.due_date) return { label: '—', cls: 'due--ok', icon: 'mdi-clock-outline' }
  const d = daysLeft(book.due_date)
  if (d <= 0)  return { label: t('myBooks.overdue'),                   cls: 'due--danger',  icon: 'mdi-alert-circle-outline' }
  if (d <= 3)  return { label: `${d} ${t('myBooks.daysLeft')}`,        cls: 'due--danger',  icon: 'mdi-clock-alert-outline' }
  if (d <= 7)  return { label: `${d} ${t('myBooks.daysLeft')}`,        cls: 'due--warning', icon: 'mdi-clock-outline' }
  return         { label: `${d} ${t('myBooks.daysLeft')}`,             cls: 'due--ok',      icon: 'mdi-check-circle-outline' }
}

const coverUrl = (book: Book): string | null => {
  if (book.cover_image) {
    return book.cover_image.startsWith('http')
      ? book.cover_image
      : `http://localhost:8080/${book.cover_image}`
  }
  if (book.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-S.jpg`
  return null
}

async function handleReturn(book: Book) {
  if (!confirm(`"${book.title}" kitabını iade etmek istediğinize emin misiniz?`)) return
  await bookStore.returnBook(book.id)
}

function canRequestReturn(book: Book): boolean {
  return book.status === 'borrowed'
}

function goToBook(id: number) {
  router.push(`/books/${id}`)
}
</script>

<template>
  <div class="my-books-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('myBooks.title') }}</h1>
        <p class="page-sub">
          {{ myBorrowedBooks.length }} {{ t('myBooks.activeLoans', myBorrowedBooks.length) }}
        </p>
      </div>
    </div>

    <div v-if="!myBorrowedBooks.length" class="empty-state">
      <div class="empty-icon">
        <v-icon size="48" color="primary" style="opacity:0.2">mdi-book-off-outline</v-icon>
      </div>
      <p class="empty-label">{{ t('myBooks.noLoans') }}</p>
      <v-btn variant="tonal" color="primary" rounded="lg" to="/books" size="small">
        {{ t('myBooks.goToCatalog') }}
      </v-btn>
    </div>

    <div v-else class="loans-list">
      <div
        v-for="(book, idx) in myBorrowedBooks"
        :key="book.id"
        class="loan-card"
        @click="goToBook(book.id)"
      >
        <div class="loan-idx">{{ idx + 1 }}</div>

        <div class="loan-thumb">
          <img
            v-if="coverUrl(book)"
            :src="coverUrl(book)!"
            :alt="book.title"
            class="loan-thumb__img"
          />
          <div v-else class="loan-thumb__fallback">
            <v-icon size="20" color="white" style="opacity:0.4">mdi-book-open-variant</v-icon>
          </div>
        </div>

        <div class="loan-info">
          <div class="loan-title">{{ book.title }}</div>
          <div class="loan-author">{{ book.author }}</div>
        </div>

        <div class="loan-dates">
          <div class="loan-date-item">
            <span class="loan-date-label">{{ t('table.borrowedDate') }}</span>
            <span class="loan-date-val">{{ formatDate(book.borrowed_at) }}</span>
          </div>
          <div class="loan-date-item">
            <span class="loan-date-label">{{ t('table.dueDate') }}</span>
            <span class="loan-date-val">{{ formatDate(book.due_date) }}</span>
          </div>
        </div>

        <div class="loan-due" :class="dueStatus(book).cls">
          <v-icon size="13" class="me-1">{{ dueStatus(book).icon }}</v-icon>
          {{ dueStatus(book).label }}
        </div>

        <v-btn
          v-if="canRequestReturn(book)"
          color="primary"
          variant="tonal"
          size="small"
          rounded="lg"
          class="ms-4 font-weight-bold"
          prepend-icon="mdi-keyboard-return"
          :loading="bookStore.loading"
          @click.stop="handleReturn(book)"
        >
          {{ t('myBooks.return') }}
        </v-btn>

        <v-chip
          v-else
          size="small"
          variant="tonal"
          color="amber-darken-2"
          label
          class="ms-4"
        >
          <v-icon size="14" start>mdi-clock-time-eight-outline</v-icon>
          {{ book.status === 'borrow_pending' ? t('status.borrow_pending') : t('status.return_pending') }}
        </v-chip>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-books-view { max-width: 900px; padding-bottom: 48px; }
.page-header   { margin-bottom: 28px; }
.page-title    { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em; }
.page-sub      { font-size: 0.82rem; color: rgba(var(--v-theme-on-surface), 0.42); margin-top: 4px; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 72px 24px;
  text-align: center;
}

.empty-icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-label { font-size: 0.9rem; color: rgba(var(--v-theme-on-surface), 0.45); }

.loans-list  { display: flex; flex-direction: column; gap: 10px; }

.loan-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1.5px solid rgba(var(--v-border-color), 0.09);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s;
}

.loan-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 18px rgba(0,0,0,0.07);
  border-color: rgba(var(--v-theme-primary), 0.25);
}

.loan-idx {
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.25);
  width: 20px;
  flex-shrink: 0;
  text-align: center;
}

.loan-thumb {
  width: 42px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #1a237e, #283593);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loan-thumb__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
}

.loan-thumb__fallback { display: flex; align-items: center; justify-content: center; }
.loan-info  { flex: 1; min-width: 0; }
.loan-title { font-size: 0.87rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
.loan-author{ font-size: 0.73rem; color: rgba(var(--v-theme-on-surface), 0.45); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.loan-dates { display: flex; gap: 20px; flex-shrink: 0; }
@media (max-width: 640px) { .loan-dates { display: none; } }

.loan-date-item  { display: flex; flex-direction: column; gap: 2px; }
.loan-date-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface), 0.35); }
.loan-date-val   { font-size: 0.78rem; font-weight: 600; color: rgba(var(--v-theme-on-surface), 0.75); white-space: nowrap; }

.loan-due {
  display: inline-flex;
  align-items: center;
  padding: 5px 11px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
.due--ok      { background: rgba(34,197,94,0.1);   color: #16a34a; }
.due--warning { background: rgba(245,158,11,0.12); color: #d97706; }
.due--danger  { background: rgba(239,68,68,0.1);   color: #dc2626; }
.due--pending { background: rgba(245,158,11,0.18); color: #b45309; }
</style>
