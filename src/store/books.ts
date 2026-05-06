import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { Book } from '@/types/book'

export const useBookStore = defineStore('books', () => {
  const books         = ref<Book[]>([])
  const featuredBooks = ref<Book[]>([])
  const currentBook   = ref<Book | null>(null)
  const loading       = ref(false)
  const error         = ref<string | null>(null)
  const searchQuery   = ref('')

  const filteredBooks = computed(() => {
    if (!searchQuery.value) return books.value
    const q = searchQuery.value.toLowerCase()
    return books.value.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.genre?.toLowerCase().includes(q) ?? false),
    )
  })

  const availableCount = computed(() => books.value.filter((b) => b.status === 'available').length)
  const borrowedCount  = computed(() => books.value.filter((b) => b.status === 'borrowed').length)
  const totalCount     = computed(() => books.value.length)

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

  /**
   * The backend now derives borrower_id from the JWT — the client only sends dates.
   */
  async function borrowBook(id: number, borrowedAt: string, dueDate: string): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.put(`/books/${id}/borrow`, {
        borrowed_at: borrowedAt,
        due_date:    dueDate,
      })
      const updated: Book = data.book ?? data
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

  async function returnBook(id: number): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.post(`/books/return/${id}`)
      const updated: Book = data.book ?? data
      const idx = books.value.findIndex((b) => b.id === id)
      if (idx !== -1) books.value[idx] = updated
      if (currentBook.value?.id === id) currentBook.value = updated
    } catch (e) {
      error.value = 'Kitap iade edilemedi. Lütfen tekrar deneyin.'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  function getRemainingDays(due_date: string | undefined | null): number {
    if (!due_date) return 0
    const due   = new Date(due_date)
    const today = new Date()
    due.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  function getReturnDayColor(due_date: string | undefined | null): string {
    const days = getRemainingDays(due_date)
    if (days < 0)  return 'error'
    if (days <= 3) return 'deep-orange'
    if (days <= 7) return 'warning'
    return 'success'
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  return {
    books,
    featuredBooks,
    currentBook,
    loading,
    error,
    searchQuery,
    filteredBooks,
    availableCount,
    borrowedCount,
    totalCount,
    fetchBooks,
    fetchFeaturedBooks,
    fetchBookById,
    borrowBook,
    returnBook,
    getRemainingDays,
    getReturnDayColor,
    setSearchQuery,
  }
})
