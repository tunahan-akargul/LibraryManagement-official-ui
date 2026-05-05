import { createRouter, createWebHistory } from 'vue-router'
import i18n from '@/i18n'
import { useAuthStore } from '@/store/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { hideLayout: true, guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { hideLayout: true, guestOnly: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { titleKey: 'nav.dashboard', requiresAuth: true },
    },
    {
      path: '/books',
      name: 'books',
      component: () => import('@/views/BooksView.vue'),
      meta: { titleKey: 'nav.catalog', requiresAuth: true },
    },
    {
      path: '/books/:id',
      name: 'book-detail',
      component: () => import('@/views/BookDetailView.vue'),
      meta: { titleKey: 'topbar.bookDetails', requiresAuth: true },
    },
    {
      path: '/admin/inventory',
      name: 'inventory',
      component: () => import('@/views/admin/InventoryView.vue'),
      meta: { titleKey: 'nav.inventory', requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/my-books',
      name: 'my-books',
      component: () => import('@/views/MyBooksView.vue'),
      meta: { titleKey: 'nav.myBooks', requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { titleKey: 'notFound.title' },
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const t = i18n.global.t

  // Sayfa başlığı
  const base = 'KTÜ Kütüphanesi'
  const titleKey = to.meta.titleKey as string | undefined
  document.title = titleKey ? `${t(titleKey)} — ${base}` : base

  // Giriş gerektiren sayfa → giriş yapılmamışsa /login'e yönlendir
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Sadece misafir sayfası (login) → zaten giriş yapılmışsa ana sayfaya yönlendir
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'home' }
  }

  // Admin koruması → admin değilse ana sayfaya yönlendir
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'home' }
  }
})

export default router