<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/auth'

const props = defineProps<{
  showHamburger: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-drawer'): void
}>()

const route = useRoute()
const { t, locale } = useI18n()
const auth = useAuthStore()

// Admin paneline (admin-ui) yönlendirme — sadece role === 'admin' iken gösterilir.
// Doğrudan /login sayfasına gönderiyoruz; yetkili tekrar giriş yapmak zorunda
// (JWT origin başına saklandığı için admin-ui'da ayrı oturum gerekir).
const ADMIN_UI_URL = import.meta.env.VITE_ADMIN_UI_URL || 'http://localhost:5173'
const ADMIN_LOGIN_URL = `${ADMIN_UI_URL.replace(/\/$/, '')}/login`
function openAdminPanel() {
  window.open(ADMIN_LOGIN_URL, '_blank', 'noopener')
}

const breadcrumb = () => {
  const map: Record<string, string> = {
    '/': t('nav.dashboard'),
    '/books': t('nav.catalog'),
    '/my-books': t('nav.myBooks'),
    '/admin/inventory': t('nav.adminInventory'),
  }
  if (route.path.startsWith('/books/')) return t('topbar.bookDetails')
  return map[route.path] || t('topbar.page')
}

const toggleLocale = () => {
  const newLocale = locale.value === 'tr' ? 'en' : 'tr'
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
}
</script>

<template>
  <header class="topbar" id="app-topbar">
    <div class="topbar__left">
      <button
        v-if="props.showHamburger"
        class="topbar__hamburger"
        :aria-label="$t('topbar.toggleMenu')"
        @click="emit('toggle-drawer')"
      >
        <v-icon icon="mdi-menu" size="22" />
      </button>
      <span class="topbar__breadcrumb">{{ breadcrumb() }}</span>
    </div>

    <div class="topbar__right">
      <v-btn
        v-if="auth.isAdmin"
        variant="flat"
        color="primary"
        size="small"
        density="comfortable"
        prepend-icon="mdi-shield-account-outline"
        class="admin-btn"
        @click="openAdminPanel"
      >
        Admin Paneli
      </v-btn>

      <v-btn
        variant="outlined"
        size="small"
        density="compact"
        @click="toggleLocale"
        id="lang-toggle"
        class="lang-btn"
      >
        <span class="lang-active">{{ locale === 'tr' ? 'TR' : 'EN' }}</span>
        <span class="lang-sep">|</span>
        <span class="lang-alt">{{ locale === 'tr' ? 'EN' : 'TR' }}</span>
      </v-btn>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: var(--navbar-height);
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

@media (max-width: 599px) {
  .topbar {
    padding: 0 12px;
  }
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar__hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  color: #0f172a;
  transition: background 150ms ease;
  flex-shrink: 0;
}

.topbar__hamburger:hover {
  background: #f1f5f9;
}

.topbar__breadcrumb {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #0f172a;
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-btn {
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  text-transform: none;
  letter-spacing: 0;
}

.lang-btn {
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  letter-spacing: 0;
  text-transform: none;
  min-width: auto;
  padding: 0 10px !important;
}

.lang-active {
  color: #3b82f6;
}

.lang-sep {
  color: #e2e8f0;
  margin: 0 4px;
}

.lang-alt {
  color: #94a3b8;
}
</style>