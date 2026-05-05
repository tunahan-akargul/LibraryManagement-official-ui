<script setup lang="ts">
// ── src/views/details/BookDetailStatus.vue ────────────────
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBookStore } from '@/store/books'
import type { Book } from '@/types/book'

const props = defineProps<{
  book: Book
}>()

const { t } = useI18n()
const bookStore = useBookStore()

const returnChip = computed(() => {
  if (props.book.status === 'available') {
    const days = props.book.standard_return_days ?? 15
    return {
      label: t('bookDetail.loanPeriod', { days }),
      color: 'primary',
      icon: 'mdi-calendar-check-outline',
    }
  }

  const remaining = bookStore.getRemainingDays(props.book.due_date)

  if (remaining < 0) {
    return {
      label: t('bookDetail.overdue', { days: Math.abs(remaining) }),
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  }

  if (remaining === 0) {
    return {
      label: t('bookDetail.dueToday'),
      color: 'warning',
      icon: 'mdi-clock-alert-outline',
    }
  }

  return {
    label: t('bookDetail.daysLeft', { days: remaining }),
    color: remaining <= 7 ? 'warning' : 'success',
    icon: 'mdi-calendar-clock-outline',
  }
})

const loanPeriodChip = computed(() => {
  if (props.book.status === 'available') return null

  const days = props.book.standard_return_days ?? 15
  return {
    label: t('bookDetail.loanPeriod', { days }),
    color: 'primary',
    icon: 'mdi-calendar-check-outline',
  }
})
</script>

<template>
  <div v-if="returnChip" class="return-chip-row">
    <v-chip
      :color="returnChip.color"
      variant="tonal"
      label
      :prepend-icon="returnChip.icon"
      class="return-chip"
    >
      {{ returnChip.label }}
    </v-chip>

    <v-chip
      v-if="loanPeriodChip"
      :color="loanPeriodChip.color"
      variant="outlined"
      label
      :prepend-icon="loanPeriodChip.icon"
      class="return-chip"
    >
      {{ loanPeriodChip.label }}
    </v-chip>
  </div>
</template>

<style scoped>
.return-chip-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.return-chip {
  font-size: 0.8rem !important;
  font-weight: 600 !important;
}
</style>