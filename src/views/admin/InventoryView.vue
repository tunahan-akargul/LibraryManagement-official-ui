<script setup lang="ts">
// ── src/views/admin/InventoryView.vue ─────────────────────
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBookStore } from '@/store/books'
import type { Book } from '@/types/book'
import InventoryHeader from './InventoryHeader.vue'
import InventoryStats from './InventoryStats.vue'
import InventoryTable from './InventoryTable.vue'
import InventoryDeleteDialog from './InventoryDeleteDialog.vue'
import BookFormModal from './BookFormModal.vue'

const bookStore = useBookStore()
const { t } = useI18n()

// ── Stats (DOĞRU: status bazlı hesaplama) ─────────────────
const totalCount = computed(() => bookStore.books.length)

const availableCount = computed(() =>
  bookStore.books.filter(b => b.status === 'available').length
)

const borrowedCount = computed(() =>
  bookStore.books.filter(b => b.status === 'borrowed').length
)

// ── Modal ─────────────────────────────────────────────────
const modalOpen = ref(false)
const editingBook = ref<Book | null>(null)

function openCreate() {
  editingBook.value = null
  modalOpen.value = true
}

function openEdit(book: Book) {
  // shallow copy OK (primitive fields)
  editingBook.value = { ...book }
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

// ── Bildirim (Snackbar) State ─────────────────────────────
const snackbar = ref(false)
const snackbarText = ref('')

function onBookSaved() {
  // Bildirim metnini duruma göre ayarla
  snackbarText.value = editingBook.value 
    ? 'Kitap başarıyla güncellendi reis, eline sağlık!' 
    : 'Yeni kitap fişek gibi eklendi amk!'
  
  snackbar.value = true // Bildirimi ekranda fırlat
  closeModal()          // Modalı kapat
}

// ── Silme ─────────────────────────────────────────────────
const deleteDialog = ref(false)
const bookToDelete = ref<Book | null>(null)

function askDelete(book: Book) {
  bookToDelete.value = book
  deleteDialog.value = true
}

function confirmDelete() {
  if (!bookToDelete.value) return
  bookStore.deleteBook(bookToDelete.value.id)
  deleteDialog.value = false
  bookToDelete.value = null
}

function cancelDelete() {
  deleteDialog.value = false
  bookToDelete.value = null
}
</script>

<template>
  <div class="inventory-page">

    <InventoryHeader @add="openCreate" />

    <InventoryStats
      :total="totalCount"
      :available="availableCount"
      :borrowed="borrowedCount"
    />

    <InventoryTable
      :books="bookStore.books"
      :total-count="totalCount"
      @edit="openEdit"
      @delete="askDelete"
    />

    <BookFormModal
      :open="modalOpen"
      :book="editingBook"
      @close="closeModal"
      @saved="onBookSaved"
    />

    <InventoryDeleteDialog
      :open="deleteDialog"
      :book="bookToDelete"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

  <!-- Başarı Bildirimi (Snackbar) -->
    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      location="bottom right"
      rounded="xl"
      color="success"
      variant="flat"
    >
      <div style="display:flex; align-items:center; font-size:0.9rem; font-weight:600;">
        <v-icon size="20" class="me-2">mdi-check-circle-outline</v-icon>
        {{ snackbarText }}
      </div>
    </v-snackbar>
  </div>
</template>

<style scoped>
.inventory-page {
  padding: 24px;
  max-width: 1200px;
}

@media (max-width: 599px) {
  .inventory-page {
    padding: 16px;
  }
}
</style>