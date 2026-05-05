<script setup lang="ts">
// ── src/components/books/BookSearch.vue ───────────────────
// Bu bileşen yalnızca arama string'ini emit eder.
// Gerçek filtreleme üst bileşende (katalog sayfası) yapılır;
// filtreleme mantığı artık title, author, genre, isbn gibi
// snake_case alanlar üzerinden çalışmalıdır.
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue: string
  resultCount?: number
  showResultCount?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isFocused = ref(false)
</script>

<template>
  <div class="search-wrapper" :class="{ 'search-wrapper--focused': isFocused }">
    <div class="search-inner">
      <!-- Icon -->
      <div class="search-icon">
        <v-icon size="18" color="primary">mdi-magnify</v-icon>
      </div>

      <!-- Input -->
      <input
        class="search-input"
        :value="modelValue"
        :placeholder="t('catalog.searchPlaceholder')"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- Clear -->
      <Transition name="fade-scale">
        <button
          v-if="modelValue"
          class="search-clear"
          @click="emit('update:modelValue', '')"
          tabindex="-1"
        >
          <v-icon size="16">mdi-close</v-icon>
        </button>
      </Transition>
    </div>

    <!-- Result Count Bar -->
    <Transition name="slide-down">
      <div v-if="showResultCount && modelValue" class="result-bar">
        <span class="result-bar__icon">
          <v-icon size="11">mdi-book-multiple-outline</v-icon>
        </span>
        <span class="result-bar__text">
          {{ resultCount }} {{ t('catalog.results', resultCount ?? 0) }} {{ t('catalog.found') }}
        </span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.search-wrapper {
  width: 100%;
  max-width: 520px;
}

.search-inner {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-surface), 1);
  border: 1.5px solid rgba(var(--v-border-color), 0.14);
  border-radius: 14px;
  padding: 0 14px;
  height: 48px;
  gap: 10px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.25s ease,
    background 0.2s ease;
}

.search-wrapper--focused .search-inner {
  border-color: rgba(var(--v-theme-primary), 0.7);
  box-shadow:
    0 0 0 3px rgba(var(--v-theme-primary), 0.1),
    0 4px 20px rgba(0, 0, 0, 0.08);
  background: rgba(var(--v-theme-surface), 1);
}

.search-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.search-wrapper--focused .search-icon {
  opacity: 1;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  color: rgb(var(--v-theme-on-surface));
  font-family: 'Crimson Pro', 'Georgia', serif;
  letter-spacing: 0.01em;
}

.search-input::placeholder {
  color: rgba(var(--v-theme-on-surface), 0.38);
  font-style: italic;
}

.search-clear {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: rgba(var(--v-theme-on-surface), 0.6);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.search-clear:hover {
  background: rgba(var(--v-theme-error), 0.12);
  color: rgb(var(--v-theme-error));
}

.result-bar {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  padding: 0 4px;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.result-bar__icon {
  display: flex;
  align-items: center;
  opacity: 0.6;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>