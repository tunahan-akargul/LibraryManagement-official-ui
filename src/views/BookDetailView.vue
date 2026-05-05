<script setup lang="ts">
// ── src/views/BookDetailView.vue ──────────────────────────
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBookStore } from '@/store/books'
import BorrowDialog    from '@/components/books/BorrowDialog.vue'
import BookDetailInfo    from '@/views/details/BookDetailInfo.vue'
import BookDetailStatus  from '@/views/details/BookDetailStatus.vue'
import BookDetailActions from '@/views/details/BookDetailActions.vue'

const route     = useRoute()
const router    = useRouter()
const bookStore = useBookStore()
const { t }     = useI18n()

// ── Kapak ─────────────────────────────────────────────────
const coverLoaded = ref(false)
const coverError  = ref(false)

// ── Dialog & Snackbar ─────────────────────────────────────
const dialogOpen   = ref(false)
const snackbar     = ref(false)
const snackbarText = ref('')

const bookId = computed(() => Number(route.params.id))

onMounted(() => {
  bookStore.fetchBookById(bookId.value)
  coverLoaded.value = false
  coverError.value  = false
})

const goBack = () => router.back()

// ── Kapak URL'si: önce cover_image, yoksa isbn ile OpenLibrary ────────────
const coverUrl = computed(() => {
  const book = bookStore.currentBook
  if (!book) return null
  if (book.cover_image) return 'http://localhost:8080/' + book.cover_image
  if (book.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`
  return null
})

// ── Türe göre arka plan gradyanı (genre alanı) ───────────
const genreGradient = computed(() => {
  const g = bookStore.currentBook?.genre?.toLowerCase().slice(0, 5) ?? ''
  const map: Record<string, string> = {
    roman:  '160deg, #0f1b4d 0%, #1e3a8a 60%, #2563eb 100%',
    bilim:  '160deg, #052e16 0%, #065f46 60%, #059669 100%',
    tarih:  '160deg, #2d0a4e 0%, #6b21a8 60%, #9333ea 100%',
    felsef: '160deg, #450a0a 0%, #991b1b 60%, #dc2626 100%',
    teknik: '160deg, #431407 0%, #9a3412 60%, #ea580c 100%',
    sanat:  '160deg, #500724 0%, #9f1239 60%, #e11d48 100%',
    psikol: '160deg, #042f2e 0%, #115e59 60%, #0d9488 100%',
    ekonom: '160deg, #14532d 0%, #166534 60%, #16a34a 100%',
  }
  return `linear-gradient(${map[g] ?? '160deg, #0f1b4d 0%, #1a237e 60%, #283593 100%'})`
})

// ── Yıldız puanı (rating alanı — number | string desteği) ─
const ratingStars = computed(() => {
  const raw = bookStore.currentBook?.rating ?? 0
  const r   = typeof raw === 'string' ? parseFloat(raw) : raw
  return Array.from({ length: 5 }, (_, i) => ({
    icon:
      i < Math.floor(r)
        ? 'mdi-star'
        : i === Math.floor(r) && r % 1 >= 0.5
        ? 'mdi-star-half-full'
        : 'mdi-star-outline',
    filled: i < r,
  }))
})

// ── Rating görüntüleme yardımcısı ─────────────────────────
const ratingDisplay = computed(() => {
  const raw = bookStore.currentBook?.rating
  if (raw == null) return null
  const n = typeof raw === 'string' ? parseFloat(raw) : raw
  return isNaN(n) ? null : n.toFixed(1)
})

// ── status yardımcı computed'ları ─────────────────────────
const isAvailable = computed(() =>
  bookStore.currentBook?.status === 'available'
)

// ── Dialog aksiyonları ────────────────────────────────────
function onBorrowSuccess() {
  dialogOpen.value   = false
  snackbarText.value = t('borrowDialog.successMessage')
  snackbar.value     = true
}

function onBorrowCancel() {
  dialogOpen.value = false
}
</script>

<template>
  <div class="detail-view-root">
    <div class="detail-view">

      <!-- Geri Butonu -->
      <button class="back-btn" @click="goBack">
        <v-icon size="16">mdi-arrow-left</v-icon>
        {{ t('bookDetail.back') }}
      </button>

      <!-- Yükleniyor -->
      <div v-if="bookStore.loading" class="detail-grid">
        <div class="detail-cover-col">
          <v-skeleton-loader type="image" height="420" rounded="xl" />
        </div>
        <div class="detail-info-col">
          <v-skeleton-loader type="heading" class="mb-4" />
          <v-skeleton-loader type="paragraph" />
          <v-skeleton-loader type="paragraph" />
        </div>
      </div>

      <!-- Bulunamadı -->
      <div v-else-if="!bookStore.currentBook" class="not-found-card">
        <v-icon size="64" color="primary" style="opacity:0.15">mdi-book-off-outline</v-icon>
        <p class="not-found-text">{{ t('bookDetail.notFound') }}</p>
        <v-btn variant="tonal" color="primary" rounded="lg" to="/books">
          {{ t('bookDetail.returnToCatalog') }}
        </v-btn>
      </div>

      <!-- Ana İçerik -->
      <div v-else class="detail-grid">

        <!-- SOL: Kapak Paneli -->
        <div class="detail-cover-col">
          <div class="cover-panel" :style="`background: ${genreGradient}`">

            <Transition name="cover-reveal">
              <img
                v-if="coverUrl && !coverError"
                :src="coverUrl"
                :alt="bookStore.currentBook.title"
                class="cover-real"
                @load="coverLoaded = true"
                @error="coverError = true"
              />
            </Transition>

            <div v-if="coverError || !coverUrl" class="cover-art">
              <div class="cover-art__lines">
                <div
                  v-for="n in 6"
                  :key="n"
                  class="cover-art__line"
                  :style="`opacity: ${0.06 + n * 0.04}`"
                />
              </div>
              <v-icon size="64" color="white" style="opacity:0.2">
                mdi-book-open-page-variant
              </v-icon>
            </div>

            <div class="cover-fade" />

            <div class="cover-bottom">
              <!-- Yıldız Puanı -->
              <div class="star-row">
                <v-icon
                  v-for="(s, i) in ratingStars"
                  :key="i"
                  size="16"
                  :color="s.filled ? '#FFB300' : 'rgba(255,255,255,0.25)'"
                >
                  {{ s.icon }}
                </v-icon>
                <span v-if="ratingDisplay" class="star-value">{{ ratingDisplay }}</span>
              </div>

              <!-- Durum Rozeti: status alanından türetilir -->
              <div
                class="cover-status"
                :class="isAvailable ? 'cover-status--ok' : 'cover-status--no'"
              >
                <span class="cover-status__dot" />
                {{ isAvailable ? t('status.available') : t('status.borrowed') }}
              </div>
            </div>
          </div>
        </div>

        <!-- SAĞ: Bilgi Paneli -->
        <div class="detail-info-col">

          <!-- Temel Bilgiler -->
          <BookDetailInfo :book="bookStore.currentBook" />

          <div class="info-divider" />

          <!-- Durum & İade Bilgisi -->
          <BookDetailStatus :book="bookStore.currentBook" />

          <div class="info-divider" />

          <!-- Aksiyon Butonu -->
          <BookDetailActions
            :book="bookStore.currentBook"
            @borrow="dialogOpen = true"
          />
        </div>
      </div>
    </div>

    <!-- BorrowDialog -->
    <v-dialog
      v-model="dialogOpen"
      :max-width="480"
      rounded="xl"
      persistent
    >
      <BorrowDialog
        v-if="bookStore.currentBook && dialogOpen"
        :book="bookStore.currentBook"
        @success="onBorrowSuccess"
        @cancel="onBorrowCancel"
      />
    </v-dialog>

    <!-- Başarı Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      location="bottom center"
      rounded="xl"
      color="success"
      variant="flat"
    >
      <div style="display:flex; align-items:center; font-size:0.85rem; font-weight:600;">
        <v-icon size="18" class="me-2">mdi-check-circle-outline</v-icon>
        {{ snackbarText }}
      </div>
    </v-snackbar>
  </div>
</template>

<style scoped>
.detail-view-root {
  display: contents;
}

.detail-view {
  max-width: 1100px;
  padding-bottom: 48px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.55);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px 0;
  margin-bottom: 28px;
  transition: color 0.15s;
  letter-spacing: 0.02em;
}

.back-btn:hover {
  color: rgb(var(--v-theme-primary));
}

.detail-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 36px;
  align-items: start;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

/* ── Kapak Paneli ── */
.cover-panel {
  border-radius: 22px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 2/3;
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.22),
    0 8px 24px rgba(0, 0, 0, 0.12);
}

.cover-real {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.cover-art {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
}

.cover-art__lines {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 20px;
  gap: 10px;
}

.cover-art__line {
  height: 1px;
  background: white;
  border-radius: 1px;
}

.cover-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 55%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, transparent 100%);
  z-index: 2;
}

.cover-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.star-row {
  display: flex;
  align-items: center;
  gap: 3px;
}

.star-value {
  font-size: 0.82rem;
  font-weight: 700;
  color: #FFB300;
  margin-left: 6px;
}

.cover-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  width: fit-content;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cover-status--ok {
  background: rgba(56, 161, 105, 0.8);
  color: #fff;
}

.cover-status--no {
  background: rgba(229, 62, 62, 0.78);
  color: #fff;
}

.cover-status__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* ── Sağ Kolon ── */
.detail-info-col {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-divider {
  height: 1px;
  background: rgba(var(--v-border-color), 0.09);
  margin: 20px 0;
}

/* ── Geçiş Animasyonu ── */
.cover-reveal-enter-active {
  transition: opacity 0.4s ease;
}

.cover-reveal-enter-from {
  opacity: 0;
}

/* ── Bulunamadı ── */
.not-found-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 24px;
  text-align: center;
}

.not-found-text {
  font-size: 1rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
}
</style>