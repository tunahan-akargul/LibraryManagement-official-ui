<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BookFilters } from '@/types/book'

const { t } = useI18n()

const props = defineProps<{
  genres: string[]
  minYear: number
  maxYear: number
  modelValue: BookFilters
}>()

const emit = defineEmits<{
  'update:modelValue': [filters: BookFilters]
}>()

const local = ref<BookFilters>(JSON.parse(JSON.stringify(props.modelValue)))

watch(local, (val) => emit('update:modelValue', JSON.parse(JSON.stringify(val))), { deep: true })

const hasActive = computed(() =>
  local.value.genres.length > 0 ||
  local.value.availability !== 'all' ||
  local.value.yearRange[0] !== props.minYear ||
  local.value.yearRange[1] !== props.maxYear
)

const reset = () => {
  local.value = {
    genres: [],
    yearRange: [props.minYear, props.maxYear],
    availability: 'all',
  }
}

const toggleGenre = (g: string) => {
  const idx = local.value.genres.indexOf(g)
  idx === -1 ? local.value.genres.push(g) : local.value.genres.splice(idx, 1)
}

/**
 * availability filtresi artık Book['status'] değerleriyle ('available' | 'borrowed')
 * çalışır. 'all' seçiliyken tekrar tıklanırsa 'all'a döner.
 */
const setAvailability = (val: BookFilters['availability']) => {
  local.value.availability = local.value.availability === val ? 'all' : val
}

const activeCount = computed(
  () =>
    local.value.genres.length +
    (local.value.availability !== 'all' ? 1 : 0) +
    (local.value.yearRange[0] !== props.minYear || local.value.yearRange[1] !== props.maxYear ? 1 : 0)
)
</script>

<template>
  <div class="filter-panel">
    <!-- Header -->
    <div class="filter-header">
      <div class="filter-header__left">
        <div class="filter-icon">
          <v-icon size="16" color="primary">mdi-tune-variant</v-icon>
        </div>
        <span class="filter-title">{{ t('filter.title') }}</span>
        <Transition name="badge-pop">
          <div v-if="activeCount > 0" class="filter-badge">{{ activeCount }}</div>
        </Transition>
      </div>
      <Transition name="fade">
        <button v-if="hasActive" class="reset-btn" @click="reset">
          <v-icon size="13">mdi-refresh</v-icon>
          {{ t('filter.reset') }}
        </button>
      </Transition>
    </div>

    <div class="filter-divider" />

    <!-- Section: Status -->
    <div class="filter-section">
      <div class="section-label">{{ t('table.status') }}</div>
      <div class="status-grid">
        <!-- Müsait filtresi: status === 'available' -->
        <button
          class="status-btn"
          :class="{ 'status-btn--active status-btn--success': local.availability === 'available' }"
          @click="setAvailability('available')"
        >
          <span class="status-dot status-dot--success" />
          {{ t('status.available') }}
        </button>

        <!-- Ödünç verilmiş filtresi: status === 'borrowed' -->
        <button
          class="status-btn"
          :class="{ 'status-btn--active status-btn--error': local.availability === 'borrowed' }"
          @click="setAvailability('borrowed')"
        >
          <span class="status-dot status-dot--error" />
          {{ t('status.borrowed') }}
        </button>
      </div>
    </div>

    <div class="filter-divider" />

    <!-- Section: Genre -->
    <div class="filter-section">
      <div class="section-label">{{ t('table.genre') }}</div>
      <div class="genre-grid">
        <button
          v-for="g in genres"
          :key="g"
          class="genre-btn"
          :class="{ 'genre-btn--active': local.genres.includes(g) }"
          @click="toggleGenre(g)"
        >
          <v-icon v-if="local.genres.includes(g)" size="11" class="me-1">mdi-check</v-icon>
          {{ g }}
        </button>
      </div>
    </div>

    <div class="filter-divider" />

    <!-- Section: Year -->
    <div class="filter-section">
      <div class="section-label-row">
        <span class="section-label">{{ t('table.publishedYear') }}</span>
        <span class="year-range-display">
          {{ local.yearRange[0] }} — {{ local.yearRange[1] }}
        </span>
      </div>
      <div class="slider-wrap">
        <v-range-slider
          v-model="local.yearRange"
          :min="minYear"
          :max="maxYear"
          :step="1"
          color="primary"
          track-color="rgba(var(--v-theme-on-surface), 0.1)"
          thumb-size="16"
          hide-details
          density="compact"
        />
      </div>
      <div class="year-labels">
        <span>{{ minYear }}</span>
        <span>{{ maxYear }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  background: rgba(var(--v-theme-surface), 1);
  border: 1.5px solid rgba(var(--v-border-color), 0.1);
  border-radius: 18px;
  overflow: hidden;
  position: sticky;
  top: 24px;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 14px;
}

.filter-header__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-title {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.filter-badge {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}

.reset-btn:hover {
  background: rgba(var(--v-theme-primary), 0.08);
}

.filter-divider {
  height: 1px;
  background: rgba(var(--v-border-color), 0.08);
  margin: 0;
}

.filter-section {
  padding: 14px 18px;
}

.section-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-bottom: 10px;
  display: block;
}

.section-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.year-range-display {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  font-variant-numeric: tabular-nums;
}

.status-grid {
  display: flex;
  gap: 8px;
}

.status-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1.5px solid rgba(var(--v-border-color), 0.12);
  background: transparent;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.7);
  transition: all 0.18s ease;
}

.status-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.status-btn--success {
  border-color: rgba(var(--v-theme-success), 0.5) !important;
  background: rgba(var(--v-theme-success), 0.08) !important;
  color: rgb(var(--v-theme-success)) !important;
}

.status-btn--error {
  border-color: rgba(var(--v-theme-error), 0.5) !important;
  background: rgba(var(--v-theme-error), 0.08) !important;
  color: rgb(var(--v-theme-error)) !important;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot--success {
  background: rgb(var(--v-theme-success));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-success), 0.25);
}

.status-dot--error {
  background: rgb(var(--v-theme-error));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-error), 0.25);
}

.genre-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.genre-btn {
  display: inline-flex;
  align-items: center;
  padding: 5px 11px;
  border-radius: 20px;
  border: 1.5px solid rgba(var(--v-border-color), 0.14);
  background: transparent;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.65);
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}

.genre-btn:hover {
  border-color: rgba(var(--v-theme-primary), 0.4);
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
  transform: translateY(-1px);
}

.genre-btn--active {
  border-color: rgb(var(--v-theme-primary)) !important;
  background: rgba(var(--v-theme-primary), 0.12) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 700;
}

.slider-wrap {
  padding: 0 4px;
  margin-bottom: 2px;
}

.year-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.35);
  padding: 0 4px;
  margin-top: 2px;
}

.badge-pop-enter-active {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s;
}
.badge-pop-leave-active {
  transition: transform 0.15s, opacity 0.15s;
}
.badge-pop-enter-from,
.badge-pop-leave-to {
  transform: scale(0);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>