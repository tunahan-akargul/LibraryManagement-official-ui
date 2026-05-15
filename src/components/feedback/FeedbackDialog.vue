<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import type { Book } from '@/types/book'

const props = defineProps<{
  modelValue: boolean
  /** Optional book context: when provided, the feedback is scoped to this book. */
  book?: Book | null
  /** Optional preset type — defaults to 'complaint' when a book is provided. */
  defaultType?: 'request' | 'complaint'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const { t } = useI18n()

const form = reactive({
  type: 'request' as 'request' | 'complaint',
  subject: '',
  message: '',
})

const loading = ref(false)
const errorMessage = ref('')
const successOpen = ref(false)

const formRef = ref()

const subjectRules = [
  (v: string) => !!v || 'Konu zorunludur.',
  (v: string) => v.length >= 3 || 'Konu en az 3 karakter olmalıdır.',
  (v: string) => v.length <= 200 || 'Konu en fazla 200 karakter olabilir.',
]

const messageRules = [
  (v: string) => !!v || 'Mesaj zorunludur.',
  (v: string) => v.length >= 5 || 'Mesaj en az 5 karakter olmalıdır.',
  (v: string) => v.length <= 5000 || 'Mesaj en fazla 5000 karakter olabilir.',
]

function close() {
  emit('update:modelValue', false)
}

function resetForm() {
  form.type = props.defaultType ?? (props.book ? 'complaint' : 'request')
  form.subject = ''
  form.message = ''
  errorMessage.value = ''
  successOpen.value = false
  formRef.value?.resetValidation?.()
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) resetForm()
  },
)

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  errorMessage.value = ''

  try {
    await api.post('/feedback', {
      type: form.type,
      subject: form.subject.trim(),
      message: form.message.trim(),
      book_id: props.book?.id ?? null,
    })
    successOpen.value = true
    setTimeout(() => close(), 1400)
  } catch (err: any) {
    const errors = err.response?.data?.errors
    const errorList = errors ? Object.values(errors).join(' ') : ''
    errorMessage.value =
      err.response?.data?.message || errorList || 'Mesaj gönderilirken bir hata oluştu.'
  } finally {
    loading.value = false
  }
}

const typeOptions = [
  { value: 'request',   title: 'Talep',   icon: 'mdi-message-text-outline',    color: '#3b82f6' },
  { value: 'complaint', title: 'Şikayet', icon: 'mdi-alert-octagon-outline',   color: '#ef4444' },
]
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="540"
    :persistent="loading"
    @update:model-value="(v) => !v && !loading && close()"
  >
    <v-card rounded="xl" elevation="0" border>

      <!-- Header -->
      <div class="fb-header">
        <div class="fb-header__icon">
          <v-icon icon="mdi-message-draw" size="22" color="primary" />
        </div>
        <div class="fb-header__text">
          <p class="fb-header__title">{{ book ? 'Kitap Hakkında Bildirim' : 'Talep / Şikayet' }}</p>
          <p class="fb-header__sub">
            {{ book
              ? 'Bu kitapla ilgili talep ya da şikayetinizi yetkili ekibe iletin.'
              : 'Görüş, talep veya şikayetinizi yetkili ekibe iletin.' }}
          </p>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          :disabled="loading"
          aria-label="Kapat"
          @click="close"
        />
      </div>

      <!-- Book context -->
      <div v-if="book" class="fb-book">
        <div class="fb-book__cover">
          <img
            v-if="book.cover_image"
            :src="'http://localhost:8080/' + book.cover_image"
            :alt="book.title"
            class="fb-book__cover-img"
          />
          <div v-else class="fb-book__cover-placeholder">
            <v-icon icon="mdi-book-open-variant" size="18" color="grey-lighten-1" />
          </div>
        </div>
        <div class="fb-book__info">
          <p class="fb-book__label">Konu Kitap</p>
          <p class="fb-book__title">{{ book.title }}</p>
          <p class="fb-book__author">{{ book.author }}</p>
        </div>
      </div>

      <v-divider />

      <v-card-text class="pa-5">

        <!-- Success state -->
        <v-alert
          v-if="successOpen"
          type="success"
          variant="tonal"
          density="compact"
          rounded="lg"
          class="mb-2"
        >
          Mesajınız iletildi. Teşekkürler!
        </v-alert>

        <template v-else>
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-4"
          >
            {{ errorMessage }}
          </v-alert>

          <v-form ref="formRef" @submit.prevent="handleSubmit">
            <!-- Type selector -->
            <p class="field-label">Tür</p>
            <div class="type-row">
              <button
                v-for="opt in typeOptions"
                :key="opt.value"
                type="button"
                class="type-card"
                :class="{ 'type-card--active': form.type === opt.value }"
                :style="form.type === opt.value ? `--type-color: ${opt.color}` : ''"
                @click="form.type = opt.value as 'request' | 'complaint'"
              >
                <v-icon :icon="opt.icon" size="22" />
                <span>{{ opt.title }}</span>
              </button>
            </div>

            <!-- Subject -->
            <p class="field-label mt-4">Konu</p>
            <v-text-field
              v-model="form.subject"
              placeholder="Kısaca konuyu özetleyin"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="subjectRules"
              hide-details="auto"
              :counter="200"
              :disabled="loading"
            />

            <!-- Message -->
            <p class="field-label mt-4">Mesaj</p>
            <v-textarea
              v-model="form.message"
              placeholder="Detayları buraya yazın…"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              rows="5"
              auto-grow
              :rules="messageRules"
              hide-details="auto"
              :counter="5000"
              :disabled="loading"
            />
          </v-form>
        </template>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          rounded="lg"
          :disabled="loading"
          @click="close"
        >
          {{ successOpen ? 'Kapat' : 'İptal' }}
        </v-btn>
        <v-btn
          v-if="!successOpen"
          color="primary"
          variant="flat"
          rounded="lg"
          prepend-icon="mdi-send-outline"
          :loading="loading"
          @click="handleSubmit"
        >
          Gönder
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<style scoped>
.fb-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
}

.fb-header__icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fb-header__text {
  flex: 1;
  min-width: 0;
}

.fb-header__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.fb-header__sub {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin: 2px 0 0 0;
}

.field-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.75);
  margin: 0 0 6px;
}

.type-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.type-card {
  --type-color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid rgba(var(--v-border-color), 0.18);
  background: rgb(var(--v-theme-surface));
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  cursor: pointer;
  transition: all 0.15s ease;
}

.type-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.4);
  color: rgb(var(--v-theme-primary));
}

.type-card--active {
  border-color: var(--type-color) !important;
  color: var(--type-color) !important;
  background: color-mix(in srgb, var(--type-color) 8%, transparent) !important;
}

.fb-book {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: rgba(var(--v-theme-primary), 0.04);
}

.fb-book__cover {
  width: 38px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(var(--v-theme-on-surface), 0.05);
  border: 1px solid rgba(var(--v-border-color), 0.15);
}

.fb-book__cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.fb-book__cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fb-book__info {
  flex: 1;
  min-width: 0;
}

.fb-book__label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  margin: 0 0 2px 0;
}

.fb-book__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fb-book__author {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
