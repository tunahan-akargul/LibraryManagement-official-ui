// ── src/utils/mockData.ts ─────────────────────────────────

import type { Book, BorrowedBook } from '@/types/book'

const daysFromNow = (offsetDays: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

export const mockBooks: Book[] = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description:
      'A novel set in the Roaring Twenties that explores themes of wealth, class, love, and the American Dream through the mysterious Jay Gatsby and his obsession with the beautiful Daisy Buchanan.',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    isbn: '978-0-7432-7356-5',
    genre: 'Classic Fiction',
    publishedYear: 1925,
    available: false,
    rating: 4.5,
    standardReturnPeriod: 15,
    // 35 gün önce alındı → 5 gün gecikmiş (GECİKMİŞ)
    borrowedDate: daysFromNow(-35),
    returnDate:   daysFromNow(-5),
  },
  {
    id: 2,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description:
      'A gripping, heart-wrenching tale of racial injustice in the Deep South, seen through the eyes of young Scout Finch as her father defends a Black man falsely accused of a crime.',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    isbn: '978-0-06-112008-4',
    genre: 'Classic Fiction',
    publishedYear: 1960,
    available: true,
    rating: 4.8,
    standardReturnPeriod: 15,
  },
  {
    id: 3,
    title: '1984',
    author: 'George Orwell',
    description:
      'A dystopian masterpiece that paints a terrifying picture of a totalitarian future where individuality is crushed and truth is manipulated by an omnipresent government.',
    coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop',
    isbn: '978-0-451-52493-5',
    genre: 'Dystopian Fiction',
    publishedYear: 1949,
    available: false,
    rating: 4.7,
    standardReturnPeriod: 15,
    // 26 gün önce alındı → 4 gün kaldı (UYARI)
    borrowedDate: daysFromNow(-26),
    returnDate:   daysFromNow(4),
  },
  {
    id: 4,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description:
      'A witty and romantic novel following Elizabeth Bennet as she navigates issues of manners, upbringing, morality, and marriage in the landed gentry of early 19th-century England.',
    coverUrl: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=600&fit=crop',
    isbn: '978-0-14-143951-8',
    genre: 'Romance',
    publishedYear: 1813,
    available: true,
    rating: 4.6,
    standardReturnPeriod: 15,
  },
  {
    id: 5,
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description:
      'A timeless adventure of Bilbo Baggins, a reluctant hobbit who embarks on an epic quest with a group of dwarves to reclaim their homeland from the fearsome dragon Smaug.',
    coverUrl: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=600&fit=crop',
    isbn: '978-0-618-00221-3',
    genre: 'Fantasy',
    publishedYear: 1937,
    available: false,
    rating: 4.7,
    standardReturnPeriod: 15,
    // 19 gün önce alındı → 11 gün kaldı (NORMAL)
    borrowedDate: daysFromNow(-19),
    returnDate:   daysFromNow(11),
  },
  {
    id: 6,
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    description:
      "A groundbreaking narrative of humanity's creation and evolution that explores how biology and history have defined us and enhanced our understanding of what it means to be human.",
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop',
    isbn: '978-0-06-231609-7',
    genre: 'Non-Fiction',
    publishedYear: 2011,
    available: true,
    rating: 4.4,
    standardReturnPeriod: 15,
  },
  {
    id: 7,
    title: 'Dune',
    author: 'Frank Herbert',
    description:
      'An epic science fiction saga set on the desert planet Arrakis, exploring themes of politics, religion, ecology, and human potential in a richly imagined future universe.',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop',
    isbn: '978-0-441-17271-9',
    genre: 'Science Fiction',
    publishedYear: 1965,
    available: false,
    rating: 4.6,
    standardReturnPeriod: 15,
    // 28 gün önce alındı → 2 gün kaldı (KRİTİK)
    borrowedDate: daysFromNow(-28),
    returnDate:   daysFromNow(2),
  },
  {
    id: 8,
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    description:
      'A magical fable about Santiago, an Andalusian shepherd boy who journeys to the Egyptian pyramids in search of a treasure, only to discover that the true treasure lies within.',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    isbn: '978-0-06-112241-5',
    genre: 'Fiction',
    publishedYear: 1988,
    available: true,
    rating: 4.3,
    standardReturnPeriod: 15,
  },
  {
    id: 9,
    title: 'Atomic Habits',
    author: 'James Clear',
    description:
      'A revolutionary guide to building good habits and breaking bad ones, offering a proven framework for improving every day through small, incremental changes.',
    coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop',
    isbn: '978-0-7352-1129-2',
    genre: 'Self-Help',
    publishedYear: 2018,
    available: true,
    rating: 4.8,
    standardReturnPeriod: 15,
  },
  {
    id: 10,
    title: 'The Midnight Library',
    author: 'Matt Haig',
    description:
      'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
    coverUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=600&fit=crop',
    isbn: '978-0-525-55947-4',
    genre: 'Fiction',
    publishedYear: 2020,
    available: true,
    rating: 4.2,
    standardReturnPeriod: 15,
  },
  {
    id: 11,
    title: 'Educated',
    author: 'Tara Westover',
    description:
      'A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.',
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
    isbn: '978-0-399-59050-4',
    genre: 'Memoir',
    publishedYear: 2018,
    available: true,
    rating: 4.7,
    standardReturnPeriod: 15,
  },
  {
    id: 12,
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    description:
      "A classic coming-of-age novel following Holden Caulfield's experiences in New York City after being expelled from prep school, exploring themes of alienation and innocence.",
    coverUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
    isbn: '978-0-316-76948-0',
    genre: 'Classic Fiction',
    publishedYear: 1951,
    available: false,
    rating: 4.0,
    standardReturnPeriod: 15,
    // 30 gün önce alındı → bugün son gün (0 gün — UYARI)
    borrowedDate: daysFromNow(-30),
    returnDate:   daysFromNow(0),
  },
]

export const mockBorrowedBooks: BorrowedBook[] = mockBooks
  .filter((b) => !b.available && b.borrowedDate && b.returnDate)
  .map((b) => ({
    ...b,
    borrowedDate: b.borrowedDate as string,
    dueDate:      b.returnDate  as string,
  }))