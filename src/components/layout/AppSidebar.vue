<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/auth'

const props = defineProps<{
  isMobile: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()

const navItems = computed(() => {
  // Herkese görünen standart liste
  const items = [
    { label: t('nav.dashboard'),      path: '/',                icon: 'mdi-view-dashboard-outline' },
    { label: t('nav.catalog'),        path: '/books',           icon: 'mdi-book-multiple-outline' },
    { label: t('nav.myBooks'),        path: '/my-books',        icon: 'mdi-bookshelf' },
  ]

  // Reaktiviteyi zorluyoruz: Eğer kullanıcı adminse, yetki geldiği an listeye ekle!
  if (auth.isAdmin) {
    items.push({ label: t('nav.adminInventory'), path: '/admin/inventory', icon: 'mdi-table-edit' })
  }

  return items
})

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const handleNavClick = () => {
  if (props.isMobile) emit('close')
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside
    class="sidebar"
    :class="{ 'sidebar--mobile': isMobile }"
    id="app-sidebar"
  >
    <div class="sidebar__brand">
      <img src="../../assets/img/ktuLogo.png" class="sidebar__logo" />
      <div class="sidebar__brand-text">
        <span class="sidebar__brand-name">{{ $t('sidebar.brand') }}</span>
        <span class="sidebar__brand-sub">{{ $t('sidebar.subtitle') }}</span>
      </div>
      <button
        v-if="isMobile"
        class="sidebar__close-btn"
        :aria-label="$t('sidebar.closeMenu')"
        @click="emit('close')"
      >
        <v-icon icon="mdi-close" size="20" />
      </button>
    </div>

    <nav class="sidebar__nav">
      <span class="sidebar__section-label">{{ $t('sidebar.mainMenu') }}</span>
      <template v-for="item in navItems" :key="item.path">
        <router-link
          :to="item.path"
          class="sidebar__link"
          :class="{ 'sidebar__link--active': isActive(item.path) }"
          @click="handleNavClick"
        >
          <v-icon :icon="item.icon" size="20" />
          <span class="sidebar__link-text">{{ item.label }}</span>
        </router-link>
      </template>
    </nav>

    <div class="sidebar__footer">
      <div class="sidebar__user" v-if="auth.currentUser">
        <div class="sidebar__user-avatar">
          <v-icon
            :icon="auth.isAdmin ? 'mdi-shield-crown-outline' : 'mdi-account-outline'"
            size="18"
          />
        </div>
        <div class="sidebar__user-info">
          <span class="sidebar__user-name">{{ auth.currentUser.name }}</span>
          <span class="sidebar__user-role">{{ auth.isAdmin ? 'Admin' : $t('sidebar.userRole') }}</span>
        </div>
      </div>

      <button class="sidebar__logout-btn" @click="handleLogout">
        <v-icon icon="mdi-logout" size="18" />
        <span>{{ $t('sidebar.logout') }}</span>
      </button>

      <div class="sidebar__version">v1.0.0</div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar__close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  color: var(--sidebar-text);
  transition: background 150ms ease, color 150ms ease;
  flex-shrink: 0;
}

.sidebar__close-btn:hover {
  background: var(--sidebar-bg-hover);
  color: var(--sidebar-text-active);
}

.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid var(--sidebar-border);
  overflow-y: auto;
}

.sidebar--mobile {
  position: fixed;
  top: 0;
  left: 0;
  height: 100dvh;
  z-index: 100;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 16px;
  border-bottom: 1px solid var(--sidebar-border);
}

.sidebar__logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
}

.sidebar__brand-text {
  display: flex;
  flex-direction: column;
}

.sidebar__brand-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--sidebar-text-active);
  line-height: 1.3;
}

.sidebar__brand-sub {
  font-size: 0.75rem;
  color: var(--sidebar-text);
  line-height: 1.3;
}

.sidebar__nav {
  flex: 1;
  padding: 12px;
}

.sidebar__section-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--sidebar-text);
  padding: 8px 12px;
  margin-bottom: 4px;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--sidebar-text);
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 150ms ease;
  margin-bottom: 2px;
  text-decoration: none;
}

.sidebar__link:hover {
  background: var(--sidebar-bg-hover);
  color: var(--sidebar-text-active);
}

.sidebar__link--active {
  background: var(--sidebar-bg-active);
  color: var(--sidebar-text-active);
}

.sidebar__link-text {
  white-space: nowrap;
}

.sidebar__footer {
  padding: 12px;
  border-top: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar__user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--sidebar-bg-hover);
  border-radius: 8px;
}

.sidebar__user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--sidebar-bg-active);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--sidebar-text-active);
}

.sidebar__user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sidebar__user-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--sidebar-text-active);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__user-role {
  font-size: 0.6875rem;
  color: var(--sidebar-text);
}

.sidebar__logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
  color: #ef4444;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: background 150ms ease;
}

.sidebar__logout-btn:hover {
  background: #fef2f2;
}

.sidebar__version {
  font-size: 0.6875rem;
  color: var(--sidebar-text);
  padding: 0 12px;
}
</style>