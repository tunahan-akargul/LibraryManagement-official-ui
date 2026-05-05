<script setup lang="ts">
// ── src/components/books/BorrowDialog.vue ─────────────────
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBookStore } from '@/store/books'
import { useAuthStore } from '@/store/auth' // Giriş yapan kullanıcıyı bilmemiz lazım![cite: 12]
import type { Book } from '@/types/book'

// ── Props & Emits ──────────────────────────────────────────
const props = defineProps<{
  book: Book
}>()

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'cancel'): void
}>()

// ── Composables ────────────────────────────────────────────
const { t, locale } = useI18n()
const bookStore = useBookStore()
const authStore = useAuthStore() //[cite: 12]

// ── State ──────────────────────────────────────────────────
const loading = ref(false)
const termsAccepted = ref(false)

// ── Computed ───────────────────────────────────────────────
const DEFAULT_LOAN_DAYS = 15

/** Ödünç alma süresi: DB'den gelen standard_return_days kullanılır */
const loanDays = computed(() => props.book.standard_return_days ?? DEFAULT_LOAN_DAYS)

/** Bugüne loanDays eklenerek hesaplanan iade tarihi */
const returnDate = computed(() => {
  const d = new Date()
  // JS'nin string birleştirme mallığını engellemek için Number() basıyoruz amk!
  d.setDate(d.getDate() + Number(loanDays.value)) 
  return d
})

/** Locale'e göre formatlanmış iade tarihi */
const formattedReturnDate = computed(() =>
  returnDate.value.toLocaleDateString(locale.value === 'tr' ? 'tr-TR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
)

// ── Actions ────────────────────────────────────────────────
/** "YYYY-MM-DD" formatında tarih string'i üretir */
function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

async function handleConfirm() {
  if (!termsAccepted.value) return

  loading.value = true
  try {
    const borrowedAt = toDateString(new Date())
    const dueDate    = toDateString(returnDate.value)

    // Store'daki doğru ismi kullanıyoruz: currentUser
    if (!authStore.currentUser?.id) {
      alert('Hacı giriş yapmadan nasıl kitap alıyon? Önce bi login ol lan!');
      return;
    }
    
    await bookStore.borrowBook(props.book.id, borrowedAt, dueDate, authStore.currentUser.id);
    emit('success')
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <v-card rounded="xl" flat class="borrow-dialog-card" :elevation="0">
    <!-- ── Header ── -->
    <div class="dialog-header">
      <div class="dialog-header__icon-wrap">
        <v-icon size="24" color="primary">mdi-hand-extended-outline</v-icon>
      </div>
      <div class="dialog-header__text">
        <h2 class="dialog-title">{{ t('borrowDialog.title') }}</h2>
      </div>
    </div>

    <v-card-text class="dialog-body">
      <!-- Kitap özet kartı -->
      <div class="book-summary">
        <!-- Kapak thumbnail — cover_image (snake_case) kullanılır -->
        <div class="book-summary__cover">
          <img
            v-if="book.cover_image"
            :src="'http://localhost:8080/' + book.cover_image"
            :alt="book.title"
            class="book-summary__cover-img"
          />
          <div v-else class="book-summary__cover-fallback">
            <v-icon size="20" color="grey-lighten-2">mdi-book-open-page-variant</v-icon>
          </div>
        </div>

        <!-- Kitap bilgileri -->
        <div class="book-summary__info">
          <div class="book-summary__genre">{{ book.genre }}</div>
          <div class="book-summary__title">{{ book.title }}</div>
          <div class="book-summary__author">{{ book.author }}</div>
        </div>
      </div>

      <!-- Onay metni -->
      <p class="confirm-text">{{ t('borrowDialog.confirmText') }}</p>

      <!-- İade tarihi bilgi kartı -->
      <div class="return-info-card">
        <!-- Süre bilgisi: standard_return_days'ten hesaplanan loanDays -->
        <div class="return-info-card__row">
          <v-icon size="16" color="primary" class="me-2">mdi-calendar-check-outline</v-icon>
          <span class="return-info-card__label">
            {{ t('borrowDialog.loanDuration', { days: loanDays }) }}
          </span>
        </div>
        <!-- İade tarihi: bugün + loanDays -->
        <div class="return-info-card__row return-info-card__row--highlight">
          <v-icon size="16" color="success" class="me-2">mdi-calendar-arrow-right</v-icon>
          <span class="return-info-card__hint">
            {{ t('borrowDialog.returnHint', { date: formattedReturnDate }) }}
          </span>
        </div>
      </div>

      <!-- Koşulları kabul checkbox -->
      <v-checkbox
        v-model="termsAccepted"
        color="primary"
        density="compact"
        hide-details
        class="terms-checkbox"
      >
        <template #label>
          <span class="terms-label">{{ t('borrowDialog.terms') }}</span>
        </template>
      </v-checkbox>
    </v-card-text>

    <!-- ── Actions ── -->
    <v-card-actions class="dialog-actions">
      <v-btn
        variant="text"
        rounded="lg"
        class="cancel-btn"
        :disabled="loading"
        @click="handleCancel"
      >
        {{ t('borrowDialog.cancel') }}
      </v-btn>

      <v-btn
        color="primary"
        variant="flat"
        rounded="lg"
        class="confirm-btn"
        :loading="loading"
        :disabled="!termsAccepted || loading"
        @click="handleConfirm"
      >
        <v-icon v-if="!loading" size="16" class="me-1">mdi-check-circle-outline</v-icon>
        {{ t('borrowDialog.confirm') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
/* ── Kart ── */
.borrow-dialog-card {
  background: rgb(var(--v-theme-surface));
  overflow: hidden;
}

/* ── Header ── */
.dialog-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px 24px 0;
}

.dialog-header__icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-title {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

/* ── Body ── */
.dialog-body {
  padding: 20px 24px 8px !important;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Kitap özet */
.book-summary {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-border-color), 0.1);
}

.book-summary__cover {
  width: 52px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(var(--v-theme-on-surface), 0.07);
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-summary__cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-summary__cover-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.book-summary__info {
  flex: 1;
  min-width: 0;
}

.book-summary__genre {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 4px;
}

.book-summary__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-summary__author {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Onay metni */
.confirm-text {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.6;
  margin: 0;
}

/* İade tarihi bilgi kartı */
.return-info-card {
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
  background: rgba(var(--v-theme-primary), 0.05);
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.return-info-card__row {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.return-info-card__row--highlight {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
  font-size: 0.82rem;
}

.return-info-card__hint {
  line-height: 1.4;
}

/* Checkbox */
.terms-checkbox {
  margin-top: -4px;
}

.terms-label {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.5;
}

/* ── Actions ── */
.dialog-actions {
  padding: 12px 24px 24px !important;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-btn {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.55);
  letter-spacing: 0.01em;
}

.confirm-btn {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  padding: 0 20px;
  height: 40px;
}
</style>