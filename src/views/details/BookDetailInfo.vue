<script setup lang="ts">
// ── src/views/details/BookDetailInfo.vue ──────────────────
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Book } from '@/types/book'

const props = defineProps<{
  book: Book
}>()

const { t } = useI18n()

const formattedRating = (rating?: number | string) => {
  if (rating === undefined || rating === null) return '-'
  if (typeof rating === 'number') return `${rating.toFixed(2)} / 5.00`
  return `${rating} / 5.00`
}

const infoFields = computed(() => [
  { label: t('table.author'), value: props.book.author, icon: 'mdi-account-edit-outline' },
  { label: t('table.genre'), value: props.book.genre, icon: 'mdi-tag-outline' },
  { label: t('table.publishedYear'), value: props.book.published_year, icon: 'mdi-calendar-outline' },
  { label: t('table.isbn'), value: props.book.isbn, icon: 'mdi-barcode-scan', mono: true },
  { label: t('table.rating'), value: formattedRating(props.book.rating), icon: 'mdi-star-circle-outline' },
])
</script>

<template>
  <div class="book-detail-info">
    <div class="title-block">
      <div class="genre-tag">{{ book.genre }}</div>
      <h1 class="book-main-title">{{ book.title }}</h1>
      <div class="book-main-author">
        <v-icon size="14" style="opacity:0.5; margin-right:4px">mdi-account-outline</v-icon>
        {{ book.author }}
      </div>
    </div>

    <div class="info-divider" />

    <div class="info-fields">
      <div
        v-for="field in infoFields"
        :key="field.label"
        class="info-field"
      >
        <div class="info-field__label">
          <v-icon size="13" color="primary" class="me-1">{{ field.icon }}</v-icon>
          {{ field.label }}
        </div>
        <div
          class="info-field__value"
          :class="{ 'info-field__value--mono': field.mono }"
        >
          {{ field.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-detail-info {
  display: flex;
  flex-direction: column;
}

.title-block {
  margin-bottom: 24px;
}

.genre-tag {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
  padding: 4px 10px;
  border-radius: 5px;
  margin-bottom: 12px;
}

.book-main-title {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -0.02em;
  margin-bottom: 10px;
  color: rgb(var(--v-theme-on-surface));
}

.book-main-author {
  font-size: 0.88rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  display: flex;
  align-items: center;
}

.info-divider {
  height: 1px;
  background: rgba(var(--v-border-color), 0.09);
  margin: 20px 0;
}

.info-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-bottom: 4px;
}

@media (max-width: 560px) {
  .info-fields {
    grid-template-columns: 1fr;
  }
}

.info-field {
  padding: 12px 16px;
  border-radius: 12px;
  transition: background 0.15s;
}

.info-field:hover {
  background: rgba(var(--v-theme-primary), 0.05);
}

.info-field__label {
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.38);
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.info-field__value {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
}

.info-field__value--mono {
  font-family: 'Courier New', monospace;
  font-size: 0.82rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>