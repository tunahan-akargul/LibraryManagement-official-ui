export default {
  // Sidebar
  sidebar: {
    brand: 'KTU Library',
    subtitle: 'Management System',
    mainMenu: 'Main Menu',
    closeMenu: 'Close menu',
    userRole: 'User',
    logout: 'Log Out',
  },

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    catalog: 'Catalog',
    myBooks: 'My Books',
    adminInventory: 'Book Panel',
  },

  // Topbar
  topbar: {
    student: 'Student',
    bookDetails: 'Book Details',
    page: 'Page',
    toggleMenu: 'Toggle menu',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Library system overview',
    totalBooks: 'Total Books',
    available: 'Available',
    borrowed: 'Borrowed',
    myActiveLoans: 'My Active Loans',
    recentlyAdded: 'Recently Added Books',
    viewAll: 'View All →',
    loading: 'Loading...',
  },

  // Catalog
  catalog: {
    title: 'Catalog',
    booksInCollection: 'book in collection | books in collection',
    searchPlaceholder: 'Search by title, author, or genre...',
    results: 'result | results',
    loadingCatalog: 'Loading catalog...',
    noResults: 'No books found matching your search.',
    found: 'found',
  },

  //Filter
  filter: {
    toggle: 'Filter',
    title: 'Filters',
    reset: 'Reset',
  },

  // Book Detail
  bookDetail: {
    back: '← Back',
    loadingDetails: 'Loading book details...',
    notFound: 'Book not found.',
    returnToCatalog: 'Return to Catalog',
    bookInfo: 'Book Information',
    borrowBook: 'Borrow This Book',
    unavailable: 'Currently Unavailable',
    loanPeriod: '{days}-Day Loan Period',
    daysLeft: '{days} Days Left',
    dueToday: 'Due Today!',
    overdue: 'Overdue: {days} Days',
  },

  // Borrow Dialog
  borrowDialog: {
    title: 'Borrow This Book',
    confirmText: 'Are you sure you want to borrow this book?',
    returnHint: 'You must return it by: {date}',
    successMessage: 'Success! Book borrowed.',
    terms: 'I agree to use this book with care and return it in good condition.',
    loanDuration: 'Loan duration: {days} days',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },

  // My Books
  myBooks: {
    title: 'My Books',
    activeLoans: 'active loan | active loans',
    noLoans: 'No active loans.',
    daysLeft: 'days left',
    overdue: 'Overdue',
    returned: 'Returned',
    goToCatalog: 'Go to Catalog',
    "return": "Return Book",
  },

  // 404
  notFound: {
    title: 'Page not found.',
    returnDashboard: 'Return to Dashboard',
    hint: 'The page you are looking for may have been moved or deleted.',
  },

  // Login
  login: {
    university: 'Karadeniz Technical University',
    signIn: 'Sign In',
    email: 'Email',
    emailPlaceholder: 'example@ktu.edu.tr',
    emailRequired: 'Email is required.',
    emailInvalid: 'Please enter a valid email.',
    password: 'Password',
    passwordRequired: 'Password is required.',
    passwordMin: 'Password must be at least 6 characters.',
    demoAccounts: 'Demo Accounts',
  },

  // Table headers
  table: {
    title: 'Title',
    author: 'Author',
    genre: 'Genre',
    year: 'Year',
    isbn: 'ISBN',
    status: 'Status',
    rating: 'Rating',
    borrowedDate: 'Borrowed',
    dueDate: 'Due Date',
    publishedYear: 'Published Year',
    cover: 'Cover',
    actions: 'Actions',
    returnPeriod: 'Return Info',
  },

  // Status
  status: {
    available: 'Available',
    borrow_pending: 'Pending Approval',
    borrowed: 'Borrowed',
    return_pending: 'Return Pending',
    lost: 'Lost',
    damaged: 'Damaged',
  },

  // Language
  lang: {
    tr: 'Türkçe',
    en: 'English',
  },

  // Common actions
  common: {
    cancel: 'Cancel',
    save: 'Save',
    update: 'Update',
    delete: 'Delete',
    confirm: 'Confirm',
  },

  // Genres
  genres: {
    classic: 'Classic Fiction',
    dystopian: 'Dystopian',
    scifi: 'Science Fiction',
    fantasy: 'Fantasy',
    romance: 'Romance',
    thriller: 'Thriller',
    mystery: 'Mystery',
    nonfiction: 'Non-Fiction',
    selfhelp: 'Self-Help',
    memoir: 'Memoir',
    biography: 'Biography',
    history: 'History',
    philosophy: 'Philosophy',
    psychology: 'Psychology',
    technology: 'Technology',
    mathematics: 'Mathematics',
    art: 'Art',
    other: 'Other',
  },

  // Validation
  validation: {
    required: 'This field is required.',
    isbn: 'Please enter a valid ISBN (10–17 digits/hyphens).',
    year: 'Please enter a year between 1800 and {max}.',
    returnPeriod: 'Loan period must be between 1 and 365 days.',
  },

  // Admin — Inventory page
  admin: {
    
    inventory: {
      title: 'Book Inventory',
      subtitle: 'Manage the library collection',
      addBook: 'Add Book',
    },

    stats: {
      total: 'Total Books',
      available: 'Available',
      borrowed: 'Borrowed',
    },

    table: {
      searchPlaceholder: 'Search by title, author, or ISBN…',
      records: 'records',
      noResults: 'No books matched your search.',
      empty: 'No books in the inventory yet.',
      loanPeriod: '{days}-Day Loan Period',
      daysLeft: '{days} Days Left',
      dueToday: 'Due Today!',
      overdue: 'Overdue: {days} Days',
    },

    form: {
      addTitle: 'Add New Book',
      editTitle: 'Edit Book',
      bookTitle: 'Book Title',
      bookTitlePlaceholder: 'e.g. The Great Gatsby',
      author: 'Author',
      authorPlaceholder: 'e.g. F. Scott Fitzgerald',
      description: 'Description',
      descriptionPlaceholder: 'Brief description of the book…',
      genrePlaceholder: 'Select or type a genre',
      returnPeriod: 'Standard Loan Period',
      returnPeriodPlaceholder: 'e.g. 30',
      days: 'days',
      selectStatus: 'Select status',
    },

    delete: {
      title: 'Delete Book',
      message: 'Are you sure you want to delete "{title}"? This action cannot be undone.',
      confirm: 'Delete',
      cancel: 'Cancel',
    },
  },
}
