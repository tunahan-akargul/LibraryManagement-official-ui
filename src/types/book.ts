// ── src/types/book.ts ─────────────────────────────────────
export interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  isbn?: string;
  published_year?: number; // DB: published_year
  genre?: string;
  standard_return_days: number; // DB: standard_return_days
  status: 'available' | 'borrowed' | 'lost' | 'damaged'; // DB: status
  rating?: number | string;
  cover_image?: string; // DB: cover_image
  borrowed_at?: string; // DB: borrowed_at
  due_date?: string; // DB: due_date
  borrower_id?: number | null; // YENİ EKLEDİĞİMİZ KOLON!
  
  // Detay görünümü için isteğe bağlı
  borrower?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface BookFilters {
  genres: string[];
  yearRange: [number, number];
  availability: 'all' | 'available' | 'borrowed';
}