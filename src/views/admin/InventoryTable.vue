<script setup lang="ts">
// ── src/views/admin/InventoryTable.vue ────────────────────
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import InventoryTableDesktop from './components/InventoryTableDesktop.vue'
import InventoryTableMobile from './components/InventoryTableMobile.vue'
import InventoryBorrowerDetail from './components/InventoryBorrowerDetail.vue'
import type { Book } from '@/types/book'

const props = defineProps<{
  books: Book[]
  totalCount: number
}>()

const emit = defineEmits<{
  (e: 'edit', book: Book): void
  (e: 'delete', book: Book): void
  (e: 'return', book: Book): void
}>()

const { smAndDown } = useDisplay()
const { t } = useI18n()

// ── Arama ─────────────────────────────────────────────────
const search = ref('')

// ── Detay dialogu ─────────────────────────────────────────
const detailOpen = ref(false)
const detailBook = ref<Book | null>(null)

function openDetail(book: Book) {
  detailBook.value = book
  detailOpen.value = true
}

// ── Masaüstü tablo başlıkları ─────────────────────────────
const headers = computed(() => [
  { title: t('table.cover'), key: 'cover', sortable: false, width: '70px' },
  { title: t('table.title'), key: 'title', sortable: true },
  { title: t('table.author'), key: 'author', sortable: true },
  { title: t('table.genre'), key: 'genre', sortable: true },
  { title: t('table.isbn'), key: 'isbn', sortable: false },
  { title: t('table.publishedYear'), key: 'published_year', sortable: true, width: '90px' },
  { title: t('table.returnPeriod'), key: 'standard_return_days', sortable: true, width: '120px' },
  { title: t('table.status'), key: 'status', sortable: true, width: '130px' },
  {
    title: t('table.actions'),
    key: 'actions',
    sortable: false,
    width: '130px',
    align: 'center' as const,
  },
])

// ── Mobil arama filtresi (snake_case uyumlu + null safe) ──
const filteredMobile = computed(() => {
  if (!search.value) return props.books

  const q = search.value.toLowerCase()

  return props.books.filter((b) =>
    b.title?.toLowerCase().includes(q) ||
    b.author?.toLowerCase().includes(q) ||
    b.genre?.toLowerCase().includes(q) ||
    b.isbn?.toLowerCase().includes(q)
  )
})
</script>

<template>
  <v-card elevation="0" border rounded="xl">

    <div class="table-toolbar">
      <v-text-field
        v-model="search"
        :placeholder="t('admin.table.searchPlaceholder')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        rounded="lg"
        hide-details
        clearable
        style="max-width: 320px"
      />
      <span class="table-toolbar__count">
        {{ totalCount }} {{ t('admin.table.records') }}
      </span>
    </div>

    <v-divider />

    <!-- Mobil -->
    <InventoryTableMobile
      v-if="smAndDown"
      :books="filteredMobile"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
      @return="emit('return', $event)"
      @detail="openDetail"
    />

    <!-- Desktop -->
    <InventoryTableDesktop
      v-else
      :books="books"
      :search="search"
      :headers="headers"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
      @return="emit('return', $event)"
      @detail="openDetail"
    />

  </v-card>

  <!-- Borrower Detail -->
  <InventoryBorrowerDetail
    v-model="detailOpen"
    :book="detailBook"
  />
</template>

<style scoped>
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  flex-wrap: wrap;
  gap: 10px;
}
.table-toolbar__count {
  font-size: 0.8125rem;
  opacity: 0.6;
}
</style>