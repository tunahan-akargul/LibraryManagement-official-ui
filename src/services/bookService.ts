import type { Book } from '@/types/book'
import { mockBooks } from '@/utils/mockData'
// import api from './api'

/**
 * Book service — currently returns mock data.
 * Replace mock implementations with real API calls when the backend is ready.
 */
export const bookService = {
  async getAll(): Promise<Book[]> {
    // return (await api.get<Book[]>('/books')).data
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockBooks]), 600)
    })
  },

  async getById(id: number): Promise<Book | undefined> {
    // return (await api.get<Book>(`/books/${id}`)).data
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockBooks.find((b) => b.id === id)), 400)
    })
  },

  async search(query: string): Promise<Book[]> {
    // return (await api.get<Book[]>('/books/search', { params: { q: query } })).data
    const q = query.toLowerCase()
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve(
            mockBooks.filter(
              (b) =>
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q) ||
                b.genre.toLowerCase().includes(q)
            )
          ),
        400
      )
    })
  },

  async getFeatured(): Promise<Book[]> {
    // return (await api.get<Book[]>('/books/featured')).data
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockBooks.filter((b) => b.rating >= 4.5)), 500)
    })
  },
}
