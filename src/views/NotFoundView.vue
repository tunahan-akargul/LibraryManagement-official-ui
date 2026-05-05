<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <div class="not-found-view">
    <div class="nf-content">
      <div class="nf-bg-text">404</div>

      <div class="nf-icon">
        <v-icon size="52" color="primary" style="opacity:0.6">mdi-book-off-outline</v-icon>
      </div>

      <h1 class="nf-code">404</h1>
      <p class="nf-message">{{ t('notFound.title') }}</p>
      <p class="nf-hint">{{ t('notFound.hint') }}</p>

      <v-btn
        color="primary"
        variant="tonal"
        rounded="lg"
        size="large"
        to="/"
        class="nf-btn"
      >
        <v-icon start>mdi-home-outline</v-icon>
        {{ t('notFound.returnDashboard') }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.not-found-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.nf-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  position: relative;
}

.nf-bg-text {
  position: absolute;
  font-size: clamp(120px, 20vw, 220px);
  font-weight: 900;
  color: rgba(var(--v-theme-primary), 0.04);
  letter-spacing: -0.05em;
  line-height: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
}

.nf-icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 1.5px solid rgba(var(--v-theme-primary), 0.12);
  background: rgba(var(--v-theme-primary), 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.nf-code {
  font-size: 2.4rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: rgb(var(--v-theme-primary));
  line-height: 1;
  margin: 0;
}

.nf-message {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.nf-hint {
  font-size: 0.82rem;
  color: rgba(var(--v-theme-on-surface), 0.42);
  margin: 0;
  margin-bottom: 8px;
}

.nf-btn {
  margin-top: 8px;
}
</style>