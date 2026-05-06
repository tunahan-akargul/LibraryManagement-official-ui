<script setup lang="ts">
// ── src/views/HomeView.vue ────────────────────────────────
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '@/store/books'
import { useAuthStore } from '@/store/auth'

const bookStore = useBookStore()
const auth      = useAuthStore()
const router    = useRouter()

onMounted(() => {
  if (!bookStore.books.length) bookStore.fetchBooks()
})

const goToBook = (id: number) => router.push(`/books/${id}`)

// ── İstatistik hesaplamaları: status alanına göre ─────────
const availableCount = computed(
  () => bookStore.books.filter((b) => b.status === 'available').length
)

const borrowedCount = computed(
  () => bookStore.books.filter((b) => b.status === 'borrowed').length
)

const myActiveLoans = computed(
  () =>
    auth.currentUser
      ? bookStore.books.filter(
          (b) => b.status === 'borrowed' && b.borrower_id === auth.currentUser!.id,
        ).length
      : 0,
)

// ── Kapak URL'si: önce cover_image, yoksa isbn ile OpenLibrary ────
const coverUrl = (isbn?: string, cover_image?: string): string | null => {
  // Eğer veritabanında kapak resmi varsa ve link değilse (lokal sunucu yoluysa) başına localhost ekle amk!
  if (cover_image) {
    return cover_image.startsWith('http') ? cover_image : `http://localhost:8080/${cover_image}`
  }
  // Kapak yoksa ISBN ile OpenLibrary'den çek (S yerine M koydum daha net çıksın diye)
  if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
  return null
}

// ── Türe göre arka plan gradyanı (genre alanı) ───────────
const genreGradient = (genre?: string): string => {
  const g = genre?.toLowerCase().slice(0, 5) ?? ''
  const map: Record<string, string> = {
    roman:  '135deg, #1a237e, #3949ab',
    bilim:  '135deg, #004d40, #00796b',
    tarih:  '135deg, #4a148c, #7b1fa2',
    felsef: '135deg, #b71c1c, #e53935',
    teknik: '135deg, #bf360c, #e64a19',
    sanat:  '135deg, #880e4f, #c2185b',
  }
  return `linear-gradient(${map[g] ?? '135deg, #1a237e, #283593'})`
}

// ── 2. Hafta Görevi: Slayt (Carousel) Verileri ───────────
const featuredBooks = [
  {
    title: 'Nutuk',
    author: 'Mustafa Kemal Atatürk',
    color: '#1a237e',
    image: 'https://covers.openlibrary.org/b/isbn/9789751601728-M.jpg'
  },
  {
    title: 'Sefiller',
    author: 'Victor Hugo',
    color: '#1b5e20',
    image: 'https://covers.openlibrary.org/b/isbn/9789750719165-M.jpg'
  },
  {
    title: '1984',
    author: 'George Orwell',
    color: '#b71c1c',
    image: 'https://covers.openlibrary.org/b/isbn/9789750718533-M.jpg'
  }
]
</script>

<template>
  <div class="home-view">
    <!-- ── Header ── -->
    <div class="home-header">
      <div>
        <h1 class="home-title">{{ $t('dashboard.title') }}</h1>
        <p class="home-sub">{{ $t('dashboard.subtitle') }}</p>
      </div>
    </div>

    <!-- ── 2. Hafta Görevi: Premium UX Slayt (Carousel) ── -->
    <v-carousel
      cycle
      height="320"
      hide-delimiter-background
      show-arrows="hover"
      class="rounded-xl mb-8 elevation-4"
      style="border: 1px solid rgba(var(--v-border-color), 0.1); overflow: hidden;"
    >
      <v-carousel-item
        v-for="(book, i) in featuredBooks"
        :key="i"
      >
        <!-- Arka Plan Gradyanı ve İçerik -->
        <div
          class="d-flex align-center h-100 px-6 px-md-16 w-100"
          :style="`background: linear-gradient(135deg, ${book.color}ee, ${book.color}); position: relative; overflow: hidden;`"
        >
          <!-- Arka Planda Saydam Dekoratif İkon -->
          <v-icon 
            size="250" 
            color="white" 
            style="position: absolute; right: -30px; bottom: -40px; opacity: 0.05; transform: rotate(-15deg); pointer-events: none;"
          >
            mdi-book-open-page-variant
          </v-icon>

          <div class="d-flex align-center gap-8 w-100" style="z-index: 2;">
            <!-- Büyütülmüş Kitap Kapağı -->
            <v-img
              :src="book.image"
              width="150"
              max-width="150"
              class="rounded-lg elevation-12"
              style="border: 2px solid rgba(255,255,255,0.2);"
            />
            
            <!-- Kitap Detayları ve Aksiyon Butonu -->
            <div class="text-white flex-grow-1">
              <v-chip size="small" color="white" variant="outlined" class="mb-3 font-weight-bold">
                <v-icon start size="14">mdi-star-shooting</v-icon>
                Haftanın Önerisi
              </v-chip>
              
              <h2 class="text-h3 font-weight-black mb-1" style="letter-spacing: -0.03em;">{{ book.title }}</h2>
              
              <div class="text-h6 font-weight-regular mb-4" style="opacity: 0.85;">
                <v-icon size="18" class="me-2">mdi-fountain-pen-tip</v-icon>{{ book.author }}
              </div>
              
              <!-- Sadece geniş ekranlarda görünen kısa açıklama -->
              <p class="text-body-2 mb-6 d-none d-sm-block" style="opacity: 0.75; max-width: 450px; line-height: 1.6;">
                Kütüphanemizin en çok okunan eserlerinden biri. Hemen detaylarına göz at, stokta varsa anında ödünç al!
              </p>

              <v-btn
                color="white"
                variant="elevated"
                rounded="pill"
                size="large"
                class="font-weight-bold"
                :style="`color: ${book.color} !important;`"
                prepend-icon="mdi-book-open-blank-variant"
                elevation="8"
              >
                Kitabı İncele
              </v-btn>
            </div>
          </div>
        </div>
      </v-carousel-item>
    </v-carousel>

    <!-- ── Stat Cards ── -->
    <div class="stat-row">
      <!-- Toplam Kitap -->
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--blue">
          <v-icon size="22" color="white">mdi-bookshelf</v-icon>
        </div>
        <div>
          <div class="stat-card__label">{{ $t('dashboard.totalBooks') }}</div>
          <div class="stat-card__value">
            <span v-if="bookStore.loading" class="stat-skeleton" />
            <span v-else>{{ bookStore.books.length }}</span>
          </div>
        </div>
      </div>

      <!-- Mevcut Kitaplar: status === 'available' -->
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--green">
          <v-icon size="22" color="white">mdi-check-circle-outline</v-icon>
        </div>
        <div>
          <div class="stat-card__label">{{ $t('dashboard.available') }}</div>
          <div class="stat-card__value stat-card__value--green">
            <span v-if="bookStore.loading" class="stat-skeleton" />
            <span v-else>{{ availableCount }}</span>
          </div>
        </div>
      </div>

      <!-- Ödünç Verilenler: status === 'borrowed' -->
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--amber">
          <v-icon size="22" color="white">mdi-clock-outline</v-icon>
        </div>
        <div>
          <div class="stat-card__label">{{ $t('dashboard.borrowed') }}</div>
          <div class="stat-card__value stat-card__value--amber">
            <span v-if="bookStore.loading" class="stat-skeleton" />
            <span v-else>{{ borrowedCount }}</span>
          </div>
        </div>
      </div>

      <!-- Aktif Ödünçlerim -->
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--purple">
          <v-icon size="22" color="white">mdi-account-clock-outline</v-icon>
        </div>
        <div>
          <div class="stat-card__label">{{ $t('dashboard.myActiveLoans') }}</div>
          <div class="stat-card__value stat-card__value--purple">
            <span v-if="bookStore.loading" class="stat-skeleton" />
            <span v-else>{{ myActiveLoans }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Recently Added ── -->
    <div class="section-header">
      <h2 class="section-title">{{ $t('dashboard.recentlyAdded') }}</h2>
      <router-link to="/books" class="view-all-link">
        {{ $t('dashboard.viewAll') }}
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="bookStore.loading" class="recent-grid">
      <div v-for="n in 6" :key="n" class="recent-skeleton">
        <v-skeleton-loader type="image" height="100" />
        <div class="pa-3">
          <v-skeleton-loader type="text" />
          <v-skeleton-loader type="text" width="60%" />
        </div>
      </div>
    </div>

    <!-- Book mini-cards -->
    <div v-else class="recent-grid">
      <div
        v-for="book in bookStore.books.slice(0, 6)"
        :key="book.id"
        class="recent-card"
        @click="goToBook(book.id)"
      >
        <!-- Kapak: cover_image öncelikli, fallback OpenLibrary (isbn) -->
        <div
          class="recent-card__cover d-flex align-center justify-center"
          :style="`background: ${genreGradient(book.genre)}`"
        >
          <!-- Resim varsa göster -->
          <img
            v-if="coverUrl(book.isbn, book.cover_image)"
            :src="coverUrl(book.isbn, book.cover_image)!"
            :alt="book.title"
            class="recent-cover-img"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
            loading="lazy"
          />
          <!-- Resim veya ISBN yoksa jilet gibi duracak yedek ikon -->
          <v-icon
            v-else
            size="36"
            color="white"
            style="opacity: 0.3; position: absolute;"
          >
            mdi-book-open-blank-variant
          </v-icon>
        </div>

        <div class="recent-card__body">
          <div class="recent-card__title">{{ book.title }}</div>
          <div class="recent-card__author">{{ book.author }}</div>
          <div class="recent-card__foot">
            <!-- Tür etiketi -->
            <span v-if="book.genre" class="recent-chip">{{ book.genre }}</span>

            <!-- Yıl etiketi — published_year alanı -->
            <span v-if="book.published_year" class="recent-year">
              {{ book.published_year }}
            </span>

            <!-- Durum rozeti — status alanı -->
            <span
              class="recent-status"
              :class="book.status === 'available' ? 'recent-status--ok' : 'recent-status--no'"
            >
              {{ book.status === 'available' ? $t('status.available') : $t('status.borrowed') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1280px;
  padding-bottom: 48px;
}

.home-header { margin-bottom: 28px; }

.home-title {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.home-sub {
  font-size: 0.82rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin-top: 4px;
}

/* ── Stats ── */
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 40px;
}

@media (max-width: 900px) { .stat-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .stat-row { grid-template-columns: 1fr; } }

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1.5px solid rgba(var(--v-border-color), 0.09);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.07);
}

.stat-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card__icon--blue   { background: linear-gradient(135deg, #1a237e, #3949ab); }
.stat-card__icon--green  { background: linear-gradient(135deg, #1b5e20, #2e7d32); }
.stat-card__icon--amber  { background: linear-gradient(135deg, #e65100, #f57c00); }
.stat-card__icon--purple { background: linear-gradient(135deg, #4a148c, #6a1b9a); }

.stat-card__label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.42);
  margin-bottom: 4px;
}

.stat-card__value {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
}

.stat-card__value--green  { color: #22c55e; }
.stat-card__value--amber  { color: #f59e0b; }
.stat-card__value--purple { color: #a855f7; }

.stat-skeleton {
  display: inline-block;
  width: 48px;
  height: 28px;
  border-radius: 6px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* ── Section Header ── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.view-all-link {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  transition: opacity 0.15s;
}

.view-all-link:hover { opacity: 0.7; }

/* ── Recent Grid ── */
.recent-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}

@media (max-width: 1100px) { .recent-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 640px)  { .recent-grid { grid-template-columns: repeat(2, 1fr); } }

.recent-card {
  border-radius: 14px;
  overflow: hidden;
  border: 1.5px solid rgba(var(--v-border-color), 0.09);
  background: rgb(var(--v-theme-surface));
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recent-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.recent-card__cover {
  height: 110px;
  position: relative;
  overflow: hidden;
}

.recent-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.recent-card__body {
  padding: 10px 12px 12px;
}

.recent-card__title {
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 3px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.recent-card__author {
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  flex-wrap: wrap;
}

.recent-chip {
  font-size: 0.62rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(var(--v-theme-primary), 0.09);
  color: rgba(var(--v-theme-primary), 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70px;
}

.recent-year {
  font-size: 0.6rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.4);
  white-space: nowrap;
}

.recent-status {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.recent-status--ok  { background: rgba(34,197,94,0.12);  color: #16a34a; }
.recent-status--no  { background: rgba(239,68,68,0.10);  color: #dc2626; }

.recent-skeleton {
  border-radius: 14px;
  overflow: hidden;
  border: 1.5px solid rgba(var(--v-border-color), 0.08);
}
</style>