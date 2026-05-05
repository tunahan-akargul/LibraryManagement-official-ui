// ── src/store/books.ts ────────────────────────────────────

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type { Book } from '@/types/book'

/** Varsayılan ödünç alma süresi (gün) — kitapta standard_return_days yoksa kullanılır */
const DEFAULT_LOAN_DAYS = 15

const api = axios.create({ baseURL: 'http://localhost:8080/api' })

export const useBookStore = defineStore('books', () => {
  const books         = ref<Book[]>([])
  const featuredBooks = ref<Book[]>([])
  const currentBook   = ref<Book | null>(null)
  const loading       = ref(false)
  const error         = ref<string | null>(null)
  const searchQuery   = ref('')

  // ── Computed ──────────────────────────────────────────────

  const filteredBooks = computed(() => {
    if (!searchQuery.value) return books.value
    const q = searchQuery.value.toLowerCase()
    return books.value.filter(
      (b) =>
        b.title.toLowerCase().includes(q)            ||
        b.author.toLowerCase().includes(q)           ||
        (b.genre?.toLowerCase().includes(q) ?? false),
    )
  })

  const availableCount = computed(() => books.value.filter((b) => b.status === 'available').length)
  const borrowedCount  = computed(() => books.value.filter((b) => b.status === 'borrowed').length)
  const totalCount     = computed(() => books.value.length)

  // ── Fetch işlemleri ───────────────────────────────────────

  async function fetchBooks(): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get<Book[]>('/books')
      books.value = data
    } catch (e) {
      error.value = 'Kitaplar yüklenemedi. Lütfen tekrar deneyin.'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchFeaturedBooks(): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get<Book[]>('/books/featured')
      featuredBooks.value = data
    } catch (e) {
      error.value = 'Öne çıkan kitaplar yüklenemedi.'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchBookById(id: number): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get<Book>(`/books/${id}`)
      currentBook.value = data ?? null
    } catch (e) {
      error.value = 'Kitap detayları yüklenemedi.'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  // ── CRUD ─────────────────────────────────────────────────

  async function addBook(bookData: Omit<Book, 'id'>): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.post<Book>('/books', bookData)
      books.value.push(data)
    } catch (e) {
      error.value = 'Kitap eklenemedi. Lütfen tekrar deneyin.'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function updateBook(id: number, bookData: Omit<Book, 'id'>): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      // api.put geriye { message: string, book: Book } dönebilir veya direkt Book dönebilir.
      const response = await api.put(`/books/${id}`, bookData)
      
      // Backend'den dönen gerçek kitap objesini güvenli bir şekilde alıyoruz
      const updatedData = response.data.book ? response.data.book : response.data

      const idx = books.value.findIndex((b) => b.id === id)
      if (idx !== -1) {
        books.value[idx] = updatedData // Artık veriler silinmeyecek!
      }
      if (currentBook.value !== null && currentBook.value.id === id) {
        currentBook.value = updatedData
      }
    } catch (e) {
      error.value = 'Kitap güncellenemedi. Lütfen tekrar deneyin.'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function deleteBook(id: number): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      await api.delete(`/books/${id}`)
      books.value = books.value.filter((b) => b.id !== id)
      if (currentBook.value !== null && currentBook.value.id === id) {
        currentBook.value = null
      }
    } catch (e) {
      error.value = 'Kitap silinemedi. Lütfen tekrar deneyin.'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  // ── Ödünç alma / İade ─────────────────────────────────────

  /**
   * Bir kitabı ödünç al.
   * POST /api/books/borrow/:id
   * Sunucudan dönen güncel kitap verisiyle store senkronize edilir.
   */
 async function borrowBook(id: number, borrowedAt: string, dueDate: string, borrowerId: number): Promise<void> {
  loading.value = true
  error.value   = null
  try {
    const payload = {
      status:      'borrowed' as const,
      borrowed_at: borrowedAt,
      due_date:    dueDate,
      borrower_id: borrowerId // Kullanıcı ID'sini de pakete ekledik!
    }
    const response = await api.put(`/books/${id}/borrow`, payload)

    // Backend { book: Book } veya direkt Book dönebilir — her ikisini de karşıla
    const updated: Book = response.data.book ?? response.data

    const idx = books.value.findIndex((b) => b.id === id)
    if (idx !== -1) books.value[idx] = updated
    if (currentBook.value?.id === id) currentBook.value = updated
  } catch (e) {
    error.value = 'Kitap ödünç alınamadı. Lütfen tekrar deneyin.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

  /**
   * Ödünç alınan kitabı iade et.
   * POST /api/books/return/:id
   * Sunucudan dönen güncel kitap verisiyle store senkronize edilir.
   */
  async function returnBook(id: number): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.post<Book>(`/books/return/${id}`)
      const idx = books.value.findIndex((b) => b.id === id)
      if (idx !== -1) {
        books.value[idx] = data
      }
      if (currentBook.value !== null && currentBook.value.id === id) {
        currentBook.value = data
      }
    } catch (e) {
      error.value = 'Kitap iade edilemedi. Lütfen tekrar deneyin.'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  // ── Kalan gün hesabı ──────────────────────────────────────

  /**
   * İade tarihine kaç gün kaldığını döndürür.
   *
   * @param due_date  ISO "YYYY-MM-DD" string'i (Book.due_date)
   * @returns  Pozitif → kaç gün kaldı | 0 → bugün son gün | Negatif → gecikme
   */
  function getRemainingDays(due_date: string | undefined | null): number {
    if (!due_date) return 0
    const due   = new Date(due_date)
    const today = new Date()
    due.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    const diffMs = due.getTime() - today.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }

  /**
   * Kalan güne göre Vuetify renk adı döndürür.
   * Gecikmiş → 'error' | Kritik (≤3) → 'deep-orange' | Uyarı (≤7) → 'warning' | Normal → 'success'
   */
  function getReturnDayColor(due_date: string | undefined | null): string {
    const days = getRemainingDays(due_date)
    if (days < 0)  return 'error'
    if (days <= 3) return 'deep-orange'
    if (days <= 7) return 'warning'
    return 'success'
  }

  // ── Diğer ─────────────────────────────────────────────────

  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  return {
    // state
    books,
    featuredBooks,
    currentBook,
    loading,
    error,
    searchQuery,
    // computed
    filteredBooks,
    availableCount,
    borrowedCount,
    totalCount,
    // actions
    fetchBooks,
    fetchFeaturedBooks,
    fetchBookById,
    addBook,
    updateBook,
    deleteBook,
    borrowBook,
    returnBook,
    getRemainingDays,
    getReturnDayColor,
    setSearchQuery,
  }
})