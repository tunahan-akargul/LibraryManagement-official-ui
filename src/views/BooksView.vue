<script setup lang="ts">
// ── src/views/BooksView.vue ───────────────────────────────
import { onMounted, computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBookStore } from '@/store/books'
import BookSearch from '@/components/books/BookSearch.vue'
import BookFilter from '@/components/books/BookFilter.vue'
import BookList   from '@/components/books/BookList.vue'
import type { BookFilters } from '@/types/book'

const bookStore = useBookStore()
const { t }     = useI18n()

const searchQuery = ref(bookStore.searchQuery ?? '')
const filterOpen  = ref(false)

const filters = ref<BookFilters>({
  genres:       [],
  yearRange:    [1900, new Date().getFullYear()],
  availability: 'all',
})

onMounted(() => {
  if (!bookStore.books.length) bookStore.fetchBooks()
})

// ── Tüm türleri genre alanından topla ─────────────────────
const allGenres = computed(() =>
  [...new Set(bookStore.books.map((b) => b.genre).filter(Boolean))] as string[]
)

// ── Yıl sınırlarını published_year alanından hesapla ──────
const yearBounds = computed(() => {
  const years = bookStore.books
    .map((b) => b.published_year)
    .filter((y): y is number => typeof y === 'number' && !isNaN(y))

  return {
    min: years.length ? Math.min(...years) : 1900,
    max: years.length ? Math.max(...years) : new Date().getFullYear(),
  }
})

// ── Filtrelenmiş kitap listesi ────────────────────────────
const filteredBooks = computed(() => {
  let r = bookStore.books

  // Metin arama: title, author, genre
  const q = searchQuery.value.trim().toLowerCase()
  if (q)
    r = r.filter(
      (b) =>
        b.title?.toLowerCase().includes(q)  ||
        b.author?.toLowerCase().includes(q) ||
        b.genre?.toLowerCase().includes(q)
    )

  // Müsaitlik filtresi — status alanına göre
  if (filters.value.availability === 'available')
    r = r.filter((b) => b.status === 'available')
  if (filters.value.availability === 'borrowed')
    r = r.filter((b) => b.status === 'borrowed')

  // Tür filtresi — genre alanına göre
  if (filters.value.genres.length)
    r = r.filter((b) => b.genre && filters.value.genres.includes(b.genre))

  // Yıl aralığı filtresi — published_year alanına göre
  r = r.filter(
    (b) =>
      !b.published_year ||
      (b.published_year >= filters.value.yearRange[0] &&
       b.published_year <= filters.value.yearRange[1])
  )

  return r
})

// ── Aktif filtre sayacı (rozet için) ──────────────────────
const activeFilterCount = computed(
  () =>
    filters.value.genres.length +
    (filters.value.availability !== 'all' ? 1 : 0) +
    (filters.value.yearRange[0] !== yearBounds.value.min ||
     filters.value.yearRange[1] !== yearBounds.value.max
      ? 1
      : 0)
)

watch(searchQuery, (val) => bookStore.setSearchQuery(val))
</script>

<template>
  <div class="books-view">
    <!-- ── Page Header ── -->
    <div class="books-header">
      <div>
        <h1 class="books-header__title">{{ t('catalog.title') }}</h1>
        <p class="books-header__sub">
          {{ bookStore.books.length }}
          {{ t('catalog.booksInCollection', bookStore.books.length) }}
        </p>
      </div>
    </div>

    <!-- ── Toolbar ── -->
    <div class="toolbar">
      <BookSearch
        v-model="searchQuery"
        :result-count="filteredBooks.length"
        :show-result-count="true"
        class="toolbar__search"
      />

      <button
        class="filter-toggle"
        :class="{ 'filter-toggle--active': filterOpen }"
        @click="filterOpen = !filterOpen"
      >
        <v-icon size="16">mdi-tune-variant</v-icon>
        <span>{{ t('filter.toggle') }}</span>
        <Transition name="badge-pop">
          <div v-if="activeFilterCount > 0" class="filter-toggle__badge">
            {{ activeFilterCount }}
          </div>
        </Transition>
        <v-icon size="14" :class="filterOpen ? 'rotate-icon' : ''">mdi-chevron-down</v-icon>
      </button>
    </div>

    <!-- ── Layout ── -->
    <div class="content-layout">
      <!-- Filter Sidebar -->
      <Transition name="slide-filter">
        <div v-if="filterOpen" class="filter-sidebar">
          <BookFilter
            v-model="filters"
            :genres="allGenres"
            :min-year="yearBounds.min"
            :max-year="yearBounds.max"
          />
        </div>
      </Transition>

      <!-- Book List -->
      <div class="book-list-area">
        <BookList
          :books="filteredBooks"
          :loading="bookStore.loading"
          :error="bookStore.error"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.books-view {
  max-width: 1440px;
  padding-bottom: 40px;
}

.books-header {
  margin-bottom: 28px;
}

.books-header__title {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.books-header__sub {
  font-size: 0.82rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin-top: 4px;
}

.toolbar {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.toolbar__search {
  flex: 1;
  min-width: 240px;
}

.filter-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 48px;
  padding: 0 18px;
  border-radius: 14px;
  border: 1.5px solid rgba(var(--v-border-color), 0.14);
  background: rgba(var(--v-theme-surface), 1);
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.75);
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
  flex-shrink: 0;
  position: relative;
}

.filter-toggle:hover {
  border-color: rgba(var(--v-theme-primary), 0.4);
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}

.filter-toggle--active {
  border-color: rgb(var(--v-theme-primary)) !important;
  background: rgba(var(--v-theme-primary), 0.08) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.filter-toggle__badge {
  min-width: 17px;
  height: 17px;
  border-radius: 9px;
  background: rgb(var(--v-theme-primary));
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.rotate-icon {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

.content-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.filter-sidebar {
  width: 240px;
  flex-shrink: 0;
}

.book-list-area {
  flex: 1;
  min-width: 0;
}

.slide-filter-enter-active,
.slide-filter-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.slide-filter-enter-from,
.slide-filter-leave-to {
  opacity: 0;
  width: 0 !important;
  transform: translateX(-16px);
}

.badge-pop-enter-active {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s;
}
.badge-pop-leave-active {
  transition: transform 0.15s, opacity 0.15s;
}
.badge-pop-enter-from,
.badge-pop-leave-to {
  transform: scale(0);
  opacity: 0;
}

@media (max-width: 768px) {
  .filter-sidebar {
    width: 100%;
  }

  .content-layout {
    flex-direction: column;
  }
}
</style>