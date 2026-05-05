<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/store/auth'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { mobile } = useDisplay()

const hideLayout = computed(() => !!route.meta.hideLayout)

const drawerOpen = ref(!mobile.value)

watch(mobile, (isMobile) => {
  drawerOpen.value = !isMobile
})

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value
}

const closeDrawer = () => {
  if (mobile.value) drawerOpen.value = false
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <!-- Login sayfasında sadece router-view göster, layout gizle -->
  <template v-if="hideLayout">
    <router-view />
  </template>

  <!-- Normal layout -->
  <div v-else class="app-layout">
    <transition name="overlay-fade">
      <div
        v-if="mobile && drawerOpen"
        class="app-layout__overlay"
        @click="closeDrawer"
      />
    </transition>

    <transition name="sidebar-slide">
      <AppSidebar
        v-show="drawerOpen"
        :is-mobile="mobile"
        @close="closeDrawer"
      />
    </transition>

    <div
      class="app-layout__main"
      :class="{ 'app-layout__main--expanded': mobile || !drawerOpen }"
    >
      <AppNavbar
        :show-hamburger="mobile"
        @toggle-drawer="toggleDrawer"
        @logout="handleLogout"
      />
      <div class="app-layout__content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>