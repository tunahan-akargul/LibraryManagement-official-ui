<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import type { Book } from '@/types/book'

const props = defineProps<{
  form: Omit<Book, 'id'>
}>()

const emit = defineEmits<{
  (e: 'update:form', value: Omit<Book, 'id'>): void
}>()

const { t } = useI18n()

const genres = computed(() => [
  t('genres.classic'), t('genres.dystopian'), t('genres.scifi'), t('genres.fantasy'),
  t('genres.romance'), t('genres.thriller'), t('genres.mystery'), t('genres.nonfiction'),
  t('genres.selfhelp'), t('genres.memoir'), t('genres.biography'), t('genres.history'),
  t('genres.philosophy'), t('genres.psychology'), t('genres.technology'), t('genres.mathematics'),
  t('genres.art'), t('genres.other')
])

const currentYear = new Date().getFullYear()

const required        = (v: string | number | null | undefined) => !!v || t('validation.required')
const isbnRule        = (v: string) => /^[\d\-]{10,17}$/.test(v) || t('validation.isbn')
const yearRule        = (v: number) => (v >= 1800 && v <= currentYear) || t('validation.year', { max: currentYear })
const returnDaysRule  = (v: number) => (v >= 1 && v <= 365) || t('validation.returnPeriod')

const statusItems = computed(() => [
  { title: t('status.available'), value: 'available' },
  { title: t('status.borrowed'),  value: 'borrowed'  },
])

/**
 * Durum değiştiğinde:
 * - Yeni status'u güncelle.
 * - Eğer 'borrowed' dışında bir değer seçildiyse due_date'i temizle,
 *   böylece veritabanında gereksiz/tutarsız veri kalmaz.
 */
function onStatusChange(newStatus: Book['status']) {
  // Bugünün tarihini YYYY-MM-DD formatında alıyoruz (Saat dilimi zımbırtılarına takılmadan)
  const today = new Date().toISOString().split('T')[0];

  emit('update:form', {
    ...props.form,
    status: newStatus,
    
    // Durum ödünçteyse iade tarihini koru, değilse sil
    due_date: newStatus === 'borrowed' ? props.form.due_date : '',
    
    // Durum ödünçteyse ve önceden alınma tarihi yoksa BUGÜNÜ ÇAK, değilse temizle gitsin amk!
    borrowed_at: newStatus === 'borrowed' ? (props.form.borrowed_at || today) : ''
  })
}
</script>

<template>
  <v-row dense>

    <!-- Kitap Adı -->
    <v-col cols="12">
      <p class="field-label">{{ t('admin.form.bookTitle') }} <span class="required">*</span></p>
      <v-text-field
        :model-value="form.title"
        :placeholder="t('admin.form.bookTitlePlaceholder')"
        variant="outlined"
        density="compact"
        rounded="lg"
        :rules="[required]"
        hide-details="auto"
        @update:model-value="$emit('update:form', { ...form, title: $event })"
      />
    </v-col>

    <!-- Yazar -->
    <v-col cols="12">
      <p class="field-label">{{ t('admin.form.author') }} <span class="required">*</span></p>
      <v-text-field
        :model-value="form.author"
        :placeholder="t('admin.form.authorPlaceholder')"
        variant="outlined"
        density="compact"
        rounded="lg"
        :rules="[required]"
        hide-details="auto"
        @update:model-value="$emit('update:form', { ...form, author: $event })"
      />
    </v-col>

    <!-- Açıklama -->
    <v-col cols="12">
      <p class="field-label">{{ t('admin.form.description') }}</p>
      <v-textarea
        :model-value="form.description"
        :placeholder="t('admin.form.descriptionPlaceholder')"
        variant="outlined"
        density="compact"
        rounded="lg"
        rows="2"
        auto-grow
        hide-details="auto"
        @update:model-value="$emit('update:form', { ...form, description: $event })"
      />
    </v-col>

    <!-- ISBN -->
    <v-col cols="12" sm="6">
      <p class="field-label">ISBN <span class="required">*</span></p>
      <v-text-field
        :model-value="form.isbn"
        placeholder="978-0-000-00000-0"
        variant="outlined"
        density="compact"
        rounded="lg"
        :rules="[required, isbnRule]"
        hide-details="auto"
        @update:model-value="$emit('update:form', { ...form, isbn: $event })"
      />
    </v-col>

    <!-- Yayın Yılı -->
    <v-col cols="12" sm="6">
      <p class="field-label">{{ t('table.publishedYear') }} <span class="required">*</span></p>
      <v-text-field
        :model-value="form.published_year"
        type="number"
        :placeholder="`${t('admin.form.returnPeriodPlaceholder')} ${currentYear}`"
        variant="outlined"
        density="compact"
        rounded="lg"
        :rules="[required, yearRule]"
        hide-details="auto"
        @update:model-value="$emit('update:form', { ...form, published_year: Number($event) })"
      />
    </v-col>

    <!-- Tür -->
    <v-col cols="12" sm="6">
      <p class="field-label">{{ t('table.genre') }} <span class="required">*</span></p>
      <v-combobox
        :model-value="form.genre"
        :items="genres"
        :placeholder="t('admin.form.genrePlaceholder')"
        variant="outlined"
        density="compact"
        rounded="lg"
        :rules="[required]"
        hide-details="auto"
        @update:model-value="$emit('update:form', { ...form, genre: $event })"
      />
    </v-col>

    <!-- Standart İade Süresi -->
    <v-col cols="12" sm="6">
      <p class="field-label">{{ t('admin.form.returnPeriod') }} <span class="required">*</span></p>
      <v-text-field
        :model-value="form.standard_return_days ?? 30"
        type="number"
        :placeholder="t('admin.form.returnPeriodPlaceholder')"
        variant="outlined"
        density="compact"
        rounded="lg"
        :rules="[required, returnDaysRule]"
        hide-details="auto"
        :suffix="t('admin.form.days')"
        @update:model-value="$emit('update:form', { ...form, standard_return_days: Number($event) })"
      />
    </v-col>

    <!-- Durum -->
    <v-col cols="12" sm="6">
      <p class="field-label">{{ t('table.status') }} <span class="required">*</span></p>
      <v-select
        :model-value="form.status"
        :items="statusItems"
        item-title="title"
        item-value="value"
        :placeholder="t('admin.form.selectStatus')"
        variant="outlined"
        density="compact"
        rounded="lg"
        :rules="[required]"
        hide-details="auto"
        @update:model-value="onStatusChange($event)"
      />
    </v-col>

    <!-- İade Tarihi — yalnızca durum 'borrowed' (Ödünçte) olduğunda gösterilir -->
    <v-col v-if="form.status === 'borrowed'" cols="12" sm="6">
      <p class="field-label">{{ t('admin.form.dueDate') }} <span class="required">*</span></p>
      <v-text-field
        :model-value="form.due_date"
        type="date"
        variant="outlined"
        density="compact"
        rounded="lg"
        :rules="[required]"
        hide-details="auto"
        @update:model-value="$emit('update:form', { ...form, due_date: $event })"
      />
    </v-col>

    <!-- Puan -->
    <v-col cols="12" sm="6">
      <p class="field-label">{{ t('table.rating') }}</p>
      <v-text-field
        :model-value="form.rating"
        type="number"
        placeholder="0.0 – 5.0"
        variant="outlined"
        density="compact"
        rounded="lg"
        hide-details="auto"
        @update:model-value="
          $emit('update:form', {
            ...form,
            rating: $event ? Math.min(5, Math.max(0, Number($event))) : undefined,
          })
        "
      />
    </v-col>

  </v-row>
</template>

<style scoped>
.field-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.75);
  margin: 0 0 4px;
}

.required {
  color: rgb(var(--v-theme-error));
}
</style>