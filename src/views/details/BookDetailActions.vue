<script setup lang="ts">
// ── src/views/details/BookDetailActions.vue ───────────────
import { useI18n } from 'vue-i18n'
import type { Book } from '@/types/book'

const props = defineProps<{
  book: Book
}>()

const emit = defineEmits<{
  (e: 'borrow'): void
  (e: 'return'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="action-row">
    <!-- Kitap sadece available ise ödünç alınabilir -->
    <button
      v-if="book.status === 'available'"
      class="borrow-btn"
      @click="emit('borrow')"
    >
      <v-icon size="18" class="me-2">mdi-hand-extended-outline</v-icon>
      {{ t('bookDetail.borrowBook') }}
    </button>

    <!-- Diğer tüm durumlar -->
    <div v-else class="unavailable-badge">
      <v-icon size="16" class="me-2">mdi-clock-outline</v-icon>
      {{ t('bookDetail.unavailable') }}
    </div>
  </div>
</template>

<style scoped>
.action-row {
  margin-top: 4px;
}

.borrow-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 36px;
  border-radius: 14px;
  border: none;
  background: rgb(var(--v-theme-primary));
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.35);
}

.borrow-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.4);
}

.borrow-btn:active {
  transform: translateY(0);
}

.unavailable-badge {
  display: inline-flex;
  align-items: center;
  padding: 13px 28px;
  border-radius: 14px;
  border: 1.5px solid rgba(var(--v-border-color), 0.15);
  font-size: 0.87rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.4);
}
</style>