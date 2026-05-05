<script setup lang="ts">
// ── src/views/admin/components/InventoryBorrowerDetail.vue ─
import { computed } from 'vue'
import { useBookStore } from '@/store/books'
import type { Book } from '@/types/book'

const props = defineProps<{
  book: Book | null
  modelValue: boolean        // v-model — dialog açık/kapalı
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const bookStore = useBookStore()

const close = () => emit('update:modelValue', false)

// ── Kalan gün hesabı & renk ───────────────────────────────
const remaining = computed(() =>
  props.book ? bookStore.getRemainingDays(props.book.due_date) : 0,
)

const returnColor = computed(() => {
  if (!props.book) return 'success'
  return bookStore.getReturnDayColor(props.book.due_date)
})

const returnIcon = computed(() => {
  const r = remaining.value
  if (r < 0)   return 'mdi-alert-circle-outline'
  if (r === 0) return 'mdi-clock-alert-outline'
  return 'mdi-calendar-clock-outline'
})

const returnLabel = computed(() => {
  const r = remaining.value
  if (r < 0)   return `${Math.abs(r)} gün gecikmiş`
  if (r === 0) return 'Bugün son gün'
  return `${r} gün kaldı`
})

// ── Tarih formatlayıcı (YYYY-MM-DD → DD.MM.YYYY) ─────────
function formatDate(iso?: string): string {
  if (!iso || iso.startsWith('0000')) return '—' // Eski bozuk tarihler için zırh
  const datePart = iso.substring(0, 10) // Saati dakikayı çöpe at, sadece ilk 10'u (YYYY-MM-DD) al amk!
  const [y, m, d] = datePart.split('-')
  return `${d}.${m}.${y}`
}

// ── İlerleme çubuğu: geçen süre yüzdesi ──────────────────
const progressPercent = computed(() => {
  if (!props.book?.borrowed_at || !props.book?.due_date) return 0

  const start = new Date(props.book.borrowed_at)
  const end   = new Date(props.book.due_date)
  const today = new Date()

  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const total   = Math.ceil((end.getTime()   - start.getTime()) / 86_400_000)
  const elapsed = Math.ceil((today.getTime() - start.getTime()) / 86_400_000)

  if (total <= 0) return 100
  return Math.min(100, Math.round((elapsed / total) * 100))
})

const progressColor = computed(() => {
  const p = progressPercent.value
  if (p >= 100) return 'error'
  if (p >= 80)  return 'warning'
  return 'primary'
})
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="480"
    rounded="xl"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card v-if="book" rounded="xl" elevation="0" border>

      <!-- ── Başlık ── -->
      <div class="detail-header">
        <!-- Kapak küçük resim -->
        <div class="detail-header__cover">
          <img
            v-if="book.cover_image"
            :src="'http://localhost:8080/' + book.cover_image"
            class="detail-header__cover-img"
            alt="Kapak"
          />
          <div v-else class="detail-header__cover-placeholder">
            <v-icon icon="mdi-book-open-variant" size="22" color="grey-lighten-1" />
          </div>
        </div>

        <!-- Kitap adı + yazar -->
        <div class="detail-header__meta">
          <p class="detail-header__title">{{ book.title }}</p>
          <p class="detail-header__author">{{ book.author }}</p>
          <v-chip size="x-small" variant="tonal" color="primary" label>
            {{ book.genre }}
          </v-chip>
        </div>

        <!-- Kapat butonu -->
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          :aria-label="'Kapat'"
          class="detail-header__close"
          @click="close"
        />
      </div>

      <v-divider />

      <v-card-text class="pa-5">

        <!-- ── Ödünç Alan Kişi ── -->
        <p class="section-label">
          <v-icon size="13" color="primary" class="me-1">mdi-account-circle-outline</v-icon>
          Ödünç Alan
        </p>

        <!-- Ödünç Alan Kişi Bölümü -->
        <div v-if="book.borrower && book.borrower.name" class="borrower-card">
          <v-avatar size="44" color="primary" variant="tonal" class="borrower-card__avatar">
            <span class="borrower-card__initials">
              {{ book.borrower.name.charAt(0).toUpperCase() }}
            </span>
          </v-avatar>

          <div class="borrower-card__info">
            <p class="borrower-card__name">{{ book.borrower.name }}</p>
            <p class="borrower-card__email">{{ book.borrower.email }}</p>
            <p class="borrower-card__id">#{{ book.borrower.id }}</p>
          </div>
        </div>

        <!-- Veri gelmediyse veya ID var ama isim yoksa burası çalışır -->
        <div v-else class="borrower-card bg-grey-lighten-4 py-3 px-4 rounded-xl border-dashed">
          <v-icon size="20" color="orange" class="me-2">mdi-account-search-outline</v-icon>
          <div class="d-flex flex-column">
            <span class="text-caption font-weight-bold text-orange-darken-2">Kullanıcı Bilgisi Eksik</span>
            <span class="text-caption text-grey">Sistemde ID: {{ book.borrower_id || 'Belirsiz' }} kayıtlı.</span>
          </div>
        </div>

        <div class="section-divider" />

        <!-- ── Ödünç Tarihleri ── -->
        <p class="section-label">
          <v-icon size="13" color="primary" class="me-1">mdi-calendar-range-outline</v-icon>
          Ödünç Tarihleri
        </p>

        <div class="date-row">
          <!-- Alınış tarihi -->
          <div class="date-cell">
            <p class="date-cell__label">Alınış Tarihi</p>
            <p class="date-cell__value">{{ formatDate(book.borrowed_at) }}</p>
          </div>

          <!-- Ok -->
          <v-icon size="18" color="grey-lighten-1" class="date-arrow">
            mdi-arrow-right
          </v-icon>

          <!-- İade tarihi -->
          <div class="date-cell date-cell--right">
            <p class="date-cell__label">İade Tarihi</p>
            <p class="date-cell__value">{{ formatDate(book.due_date) }}</p>
          </div>
        </div>

        <!-- ── Süre İlerleme Çubuğu ── -->
        <div class="progress-block">
          <div class="progress-block__labels">
            <span class="progress-block__elapsed">
              %{{ progressPercent }} tamamlandı
            </span>
            <!-- Durum chip'i -->
            <v-chip
              :color="returnColor"
              size="x-small"
              variant="tonal"
              label
              :prepend-icon="returnIcon"
            >
              {{ returnLabel }}
            </v-chip>
          </div>

          <v-progress-linear
            :model-value="progressPercent"
            :color="progressColor"
            bg-color="rgba(var(--v-border-color), 0.12)"
            rounded="pill"
            height="7"
            class="mt-2"
          />
        </div>

        <div class="section-divider" />

        <!-- ── İade Süresi Bilgisi ── -->
        <p class="section-label">
          <v-icon size="13" color="primary" class="me-1">mdi-clock-outline</v-icon>
          Standart İade Süresi
        </p>

        <div class="loan-period-row">
          <v-chip color="primary" variant="tonal" label prepend-icon="mdi-calendar-check-outline">
            {{ book.standard_return_days ?? 15 }} gün
          </v-chip>
        </div>

      </v-card-text>

      <!-- ── Footer ── -->
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="tonal"
          rounded="lg"
          color="primary"
          @click="close"
        >
          Kapat
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<style scoped>
/* ── Başlık ── */
.detail-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px 16px 16px;
}

.detail-header__cover-img {
  width: 48px;
  height: 64px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid rgba(var(--v-border-color), 0.15);
  display: block;
  flex-shrink: 0;
}

.detail-header__cover-placeholder {
  width: 48px;
  height: 64px;
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 6px;
  border: 1px solid rgba(var(--v-border-color), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-header__meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 2px;
}

.detail-header__title {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.3;
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
}

.detail-header__author {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 0;
}

.detail-header__close {
  flex-shrink: 0;
  margin-top: -4px;
}

/* ── Section label ── */
.section-label {
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.4);
  display: flex;
  align-items: center;
  margin: 0 0 10px 0;
}

.section-divider {
  height: 1px;
  background: rgba(var(--v-border-color), 0.09);
  margin: 18px 0;
}

/* ── Ödünç alan kişi kartı ── */
.borrower-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.04);
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
}

.borrower-card__avatar {
  flex-shrink: 0;
}

.borrower-card__initials {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.borrower-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.borrower-card__name {
  font-size: 0.92rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.borrower-card__email {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.borrower-card__id {
  font-size: 0.72rem;
  font-family: monospace;
  color: rgba(var(--v-theme-on-surface), 0.35);
  margin: 0;
}

/* ── Veri yok metni ── */
.no-data-text {
  font-size: 0.84rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
  display: flex;
  align-items: center;
  margin: 0;
}

/* ── Tarih satırı ── */
.date-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.date-cell {
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid rgba(var(--v-border-color), 0.1);
}

.date-cell--right {
  text-align: right;
}

.date-cell__label {
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.38);
  margin: 0 0 4px 0;
}

.date-cell__value {
  font-size: 0.92rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  font-family: 'Courier New', monospace;
  margin: 0;
}

.date-arrow {
  flex-shrink: 0;
}

/* ── İlerleme bloğu ── */
.progress-block__labels {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.progress-block__elapsed {
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
}

/* ── İade süresi satırı ── */
.loan-period-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>