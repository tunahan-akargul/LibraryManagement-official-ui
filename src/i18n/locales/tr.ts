export default {
  // Sidebar
  sidebar: {
    brand: 'KTÜ Kütüphanesi',
    subtitle: 'Yönetim Sistemi',
    mainMenu: 'Ana Menü',
    closeMenu: 'Menüyü kapat',
    userRole: 'Kullanıcı',
    logout: 'Çıkış Yap',
  },

  // Navigation
  nav: {
    dashboard: 'Ana Sayfa',
    catalog: 'Katalog',
    myBooks: 'Kitaplarım',
    adminInventory: 'Kitap Paneli',
  },

  // Topbar
  topbar: {
    student: 'Öğrenci',
    bookDetails: 'Kitap Detayı',
    page: 'Sayfa',
    toggleMenu: 'Menüyü aç/kapat',
  },

  // Dashboard
  dashboard: {
    title: 'Ana Sayfa',
    subtitle: 'Kütüphane sistem özeti',
    totalBooks: 'Toplam Kitap',
    available: 'Mevcut',
    borrowed: 'Ödünç Verilen',
    myActiveLoans: 'Aktif Ödünçlerim',
    recentlyAdded: 'Son Eklenen Kitaplar',
    viewAll: 'Tümünü Gör →',
    loading: 'Yükleniyor...',
  },

  // Catalog
  catalog: {
    title: 'Katalog',
    booksInCollection: 'kitap koleksiyonda | kitap koleksiyonda',
    searchPlaceholder: 'Başlık, yazar veya tür ile arayın...',
    results: 'sonuç | sonuç',
    loadingCatalog: 'Katalog yükleniyor...',
    noResults: 'Aramanızla eşleşen kitap bulunamadı.',
    found: 'bulundu',
  },

  //Filter
  filter: {
    toggle: 'Filtrele',
    title: 'Filtreler',
    reset: 'Sıfırla',
  },

  // Book Detail
  bookDetail: {
    back: '← Geri',
    loadingDetails: 'Kitap detayları yükleniyor...',
    notFound: 'Kitap bulunamadı.',
    returnToCatalog: 'Kataloğa Dön',
    bookInfo: 'Kitap Bilgisi',
    borrowBook: 'Bu Kitabı Ödünç Al',
    unavailable: 'Şu An Mevcut Değil',
    loanPeriod: '{days} Günlük İade Süresi',
    daysLeft: 'İadeye {days} Gün Kaldı',
    dueToday: 'Bugün Son Gün!',
    overdue: 'Gecikmiş: {days} Gün',
  },

  // Borrow Dialog
  borrowDialog: {
    title: 'Kitabı Ödünç Al',
    confirmText: 'Bu kitabı ödünç almak istediğinizden emin misiniz?',
    returnHint: 'İade etmeniz gereken tarih: {date}',
    successMessage: 'İşlem başarılı! Kitap ödünç alındı.',
    terms: 'Kitabı temiz ve özenli kullanmayı kabul ediyorum.',
    loanDuration: 'Ödünç süresi: {days} gün',
    cancel: 'İptal',
    confirm: 'Onayla',
  },

  // My Books
  myBooks: {
    title: 'Kitaplarım',
    activeLoans: 'aktif ödünç | aktif ödünç',
    noLoans: 'Aktif ödünç yok.',
    daysLeft: 'gün kaldı',
    overdue: 'Gecikmiş',
    returned: 'İade Edildi',
    goToCatalog: 'Kataloğa Git',
    "return": "İade Et",
  },

  // 404
  notFound: {
    title: 'Sayfa bulunamadı.',
    returnDashboard: 'Ana Sayfaya Dön',
    hint: 'Aradığınız sayfa taşınmış ya da silinmiş olabilir.',
  },

  // Login
  login: {
    university: 'Karadeniz Teknik Üniversitesi',
    signIn: 'Giriş Yap',
    email: 'E-posta',
    emailPlaceholder: 'ornek@ktu.edu.tr',
    emailRequired: 'E-posta zorunludur.',
    emailInvalid: 'Geçerli bir e-posta girin.',
    password: 'Şifre',
    passwordRequired: 'Şifre zorunludur.',
    passwordMin: 'Şifre en az 6 karakter olmalıdır.',
    demoAccounts: 'Demo Hesaplar',
  },

  // Table headers
  table: {
    title: 'Başlık',
    author: 'Yazar',
    genre: 'Tür',
    year: 'Yıl',
    isbn: 'ISBN',
    status: 'Durum',
    rating: 'Puan',
    borrowedDate: 'Ödünç Tarihi',
    dueDate: 'İade Tarihi',
    publishedYear: 'Yayın Yılı',
    cover: 'Kapak',
    actions: 'İşlemler',
    returnPeriod: 'İade Bilgisi',
  },

  // Status
  status: {
    available: 'Mevcut',
    borrow_pending: 'Onay Bekliyor',
    borrowed: 'Ödünç',
    return_pending: 'İade Onay Bekliyor',
    lost: 'Kayıp',
    damaged: 'Hasarlı',
  },

  // Language
  lang: {
    tr: 'Türkçe',
    en: 'English',
  },

  // Common actions
  common: {
    cancel: 'İptal',
    save: 'Kaydet',
    update: 'Güncelle',
    delete: 'Sil',
    confirm: 'Onayla',
  },

  // Türler (Genres)
  genres: {
    classic: 'Roman',
    dystopian: 'Distopya',
    scifi: 'Bilim Kurgu',
    fantasy: 'Fantastik',
    romance: 'Aşk / Romantik',
    thriller: 'Gerilim',
    mystery: 'Gizem',
    nonfiction: 'Kurgu Dışı',
    selfhelp: 'Kişisel Gelişim',
    memoir: 'Anı',
    biography: 'Biyografi',
    history: 'Tarih',
    philosophy: 'Felsefe',
    psychology: 'Psikoloji',
    technology: 'Teknik / Teknoloji',
    mathematics: 'Matematik',
    art: 'Sanat',
    other: 'Diğer',
  },

  // Validation
  validation: {
    required: 'Bu alan zorunludur.',
    isbn: 'Geçerli bir ISBN girin (10–17 rakam/tire).',
    year: '1800 ile {max} arasında bir yıl girin.',
    returnPeriod: 'İade süresi 1 ile 365 gün arasında olmalıdır.',
  },

  // Admin — Inventory page
  admin: {
    inventory: {
      title: 'Kitap Envanteri',
      subtitle: 'Kütüphane koleksiyonunu yönetin',
      addBook: 'Kitap Ekle',
    },

    stats: {
      total: 'Toplam Kitap',
      available: 'Mevcut',
      borrowed: 'Ödünç',
    },

    table: {
      searchPlaceholder: 'Başlık, yazar veya ISBN ile ara…',
      records: 'kayıt',
      noResults: 'Aramanızla eşleşen kitap bulunamadı.',
      empty: 'Envanterde henüz kitap yok.',
      loanPeriod: '{days} Günlük İade Süresi',
      daysLeft: 'İadeye {days} Gün Kaldı',
      dueToday: 'Bugün Son Gün!',
      overdue: 'Gecikmiş: {days} Gün',
    },

    form: {
      addTitle: 'Yeni Kitap Ekle',
      editTitle: 'Kitabı Düzenle',
      bookTitle: 'Kitap Adı',
      bookTitlePlaceholder: 'ör. Büyük Gatsby',
      author: 'Yazar',
      authorPlaceholder: 'ör. F. Scott Fitzgerald',
      description: 'Açıklama',
      descriptionPlaceholder: 'Kitap hakkında kısa bir açıklama…',
      genrePlaceholder: 'Tür seçin veya yazın',
      returnPeriod: 'Standart İade Süresi',
      returnPeriodPlaceholder: 'ör. 30',
      days: 'gün',
      selectStatus: 'Durum seçin',
      coverPhoto: 'Kapak Fotoğrafı',
      chooseFile: 'Dosya Seç',
      coverPreview: 'Kapak önizleme',
      dragOrSelect: 'Sürükle & Bırak veya Seç',
    },

    delete: {
      title: 'Kitabı Sil',
      message: '"{title}" kitabını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      confirm: 'Sil',
      cancel: 'İptal',
    },
  },
}