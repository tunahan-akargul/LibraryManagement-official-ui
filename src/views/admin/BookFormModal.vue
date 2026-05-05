<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import type { Book } from '@/types/book'
import BookFormCover  from './BookFormCover.vue'
import BookFormFields from './BookFormFields.vue'
import { useBookStore } from '@/store/books'

// ─── Vuetify Form Tipi (TypeScript "validate" Hatası Çözümü) ─────────────────
interface VForm {
  validate: () => Promise<{ valid: boolean }>
  reset: () => void
}

// ─── Props / Emits ───────────────────────────────────────────────────────────

const props = defineProps<{
  open: boolean
  book: Book | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void          // kayıt + yükleme tamamen bitince
}>()

// ─── Composables ─────────────────────────────────────────────────────────────

const { smAndDown } = useDisplay()
const { t }        = useI18n()
const bookStore    = useBookStore()

// ─── State ───────────────────────────────────────────────────────────────────

// Tip ataması yapıldı (TypeScript Hatası Çözümü)
const formRef        = ref<VForm | null>(null)
const coverFile      = ref<File | null>(null)      // seçilen ham dosya
const coverPreview   = ref<string | null>(null)    // önizleme (data URL)
const uploadLoading  = ref(false)
const uploadError    = ref<string | null>(null)

// Tüm 'undefined' değerler, Vuetify ve TypeScript ile çakışmaması için güvenli tiplere çevrildi
const defaultForm = (): Omit<Book, 'id'> => ({
  title:                '',
  author:               '',
  isbn:                 '',
  genre:                '',
  published_year:       new Date().getFullYear(),
  status:               'available',
  cover_image:          '',
  description:          '',
  rating:               0,
  standard_return_days: 15,
  borrowed_at:          '',
  due_date:             '',
})

const form = ref<Omit<Book, 'id'>>(defaultForm())

// ─── Computed ─────────────────────────────────────────────────────────────────

const isEditing  = computed(() => props.book !== null)
const modalTitle = computed(() =>
  isEditing.value ? t('admin.form.editTitle') : t('admin.form.addTitle'),
)

/** Kaydet butonunun genel yükleme durumu: store ya da upload işlemi devam ediyorsa */
const isSaving = computed(() => bookStore.loading || uploadLoading.value)

// ─── Watchers ─────────────────────────────────────────────────────────────────

watch(
  () => props.open,
  (opened) => {
    if (!opened) return

    // Her açılışta geçici dosya/önizleme/hataları sıfırla
    coverFile.value     = null
    coverPreview.value  = null
    uploadError.value   = null

    if (props.book) {
      form.value = {
        title:                props.book.title,
        author:               props.book.author,
        isbn:                 props.book.isbn ?? '',
        genre:                props.book.genre ?? '',
        published_year:       props.book.published_year,
        status:               props.book.status,
        cover_image:          props.book.cover_image ?? '',
        description:          props.book.description ?? '',
        rating:               props.book.rating ?? 0,
        standard_return_days: props.book.standard_return_days ?? 15,
        // MySQL'den gelen saat/dakika kısmını atıp sadece tarihi (ilk 10 karakteri) alıyoruz
        borrowed_at:          props.book.borrowed_at ? props.book.borrowed_at.substring(0, 10) : '',
        due_date:             props.book.due_date ? props.book.due_date.substring(0, 10) : '',
      }
      // Düzenle ekranında resmin görünmesi için sihirli CodeIgniter linkini ekliyoruz
        coverPreview.value = props.book.cover_image 
          ? 'http://localhost:8080/' + props.book.cover_image 
          : null
      } else {
        form.value = defaultForm()
      }
    },
  )

// ─── Cover handlers ───────────────────────────────────────────────────────────

/**
 * BookFormCover bileşeninden gelen önizleme güncellemesi.
 * `preview`  → base64 data URL veya null
 * `file`     → ham File nesnesi (yükleme için saklanır)
 */
function onCoverUpdate(preview: string | null, file?: File | null) {
  coverPreview.value     = preview
  coverFile.value        = file ?? null
  form.value.cover_image = preview ?? ''
  uploadError.value      = null
}

// ─── Cover upload ─────────────────────────────────────────────────────────────

/**
 * Kapak fotoğrafını FormData olarak API'ye yükler.
 * @param bookId  Yeni eklenen ya da düzenlenen kitabın ID'si
 */
async function uploadCover(bookId: number): Promise<void> {
  if (!coverFile.value) return

  uploadLoading.value = true
  uploadError.value   = null

  const fd = new FormData()
  fd.append('cover', coverFile.value)

  try {
    const response = await axios.post(`http://localhost:8080/api/books/upload-cover/${bookId}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    
    // --- EKLENEN KRİTİK KISIM ---
    // Sunucu resmi yükleyip bize yeni yolu verdiğinde bunu frontend store'a söylemeliyiz
    if (response.data && response.data.path) {
      bookStore.updateBook(bookId, { ...form.value, cover_image: response.data.path })
    }
  } catch (e) {
    uploadError.value = t('admin.form.coverUploadError', 'Kapak fotoğrafı yüklenemedi.')
    console.error('[BookFormModal] Cover upload failed:', e)
  } finally {
    uploadLoading.value = false
  }
}

// ─── Save ─────────────────────────────────────────────────────────────────────

async function handleSave(): Promise<void> {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  uploadError.value = null
  bookStore.error = null

  // --- ISBN BENZERSİZLİK ZIRHI (YENİ EKLENDİ) ---
  if (form.value.isbn) {
    // Mağazadaki kitapları kontrol et: Aynı ISBN'e sahip başka bir kitap var mı?
    // (Eğer düzenleme modundaysak, kendi ID'si hariç diğerlerine bakması gerektiğini söylüyoruz)
    const isDuplicate = bookStore.books.some(b => 
      b.isbn === form.value.isbn && 
      (!isEditing.value || b.id !== props.book?.id)
    )

    if (isDuplicate) {
      bookStore.error = 'Ulan bu ISBN numarası zaten başka bir kitaba kayıtlı amk! Farklı bir numara gir.'
      return // Hatayı ver ve kaydetmeyi iptal et
    }
  }
  // ---------------------------------------------

  // --- HAYAT KURTARAN ZIRH ---
  const dataToSave = { ...form.value }
  
  if (dataToSave.cover_image && dataToSave.cover_image.startsWith('data:image')) {
    dataToSave.cover_image = props.book ? (props.book.cover_image ?? '') : ''
  }

  if (isEditing.value && props.book !== null) {
    // ── Düzenleme ─────────────────────────────────────────
    await bookStore.updateBook(props.book.id, dataToSave)
    
    if (!bookStore.error && coverFile.value) {
      await uploadCover(props.book.id)
    }
  } else {
    // ── Yeni ekleme ────────────────────────────────────────
    dataToSave.cover_image = '' 
    await bookStore.addBook(dataToSave)

    if (!bookStore.error) {
      const newBook = bookStore.books[bookStore.books.length - 1] ?? null
      if (newBook !== null && coverFile.value) {
        await uploadCover(newBook.id)
      }
    }
  }

  // Store ya da upload'da kritik hata yoksa kapat
  if (!bookStore.error) {
    emit('saved')
  }
}
</script>

<template>
  <v-dialog
    :model-value="open"
    :max-width="smAndDown ? undefined : '660'"
    :fullscreen="smAndDown"
    persistent
    :rounded="smAndDown ? undefined : 'xl'"
    @update:model-value="!$event && emit('close')"
  >
    <v-card
      :rounded="smAndDown ? '0' : 'xl'"
      elevation="0"
      border
      :class="{ 'modal-card--fullscreen': smAndDown }"
    >

      <!-- ── Başlık ─────────────────────────────────────── -->
      <div class="modal-header">
        <div class="modal-header__left">
          <div class="modal-header__icon-wrap">
            <v-icon
              :icon="isEditing ? 'mdi-pencil-outline' : 'mdi-plus-circle-outline'"
              color="primary"
              size="18"
            />
          </div>
          <span class="modal-header__title">{{ modalTitle }}</span>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" :disabled="isSaving" @click="emit('close')" />
      </div>

      <v-divider />

      <!-- ── Form içeriği ───────────────────────────────── -->
      <v-card-text :class="smAndDown ? 'pa-4 modal-body--scroll' : 'pa-6'">

        <!-- Yükleme hatası bildirimi (kapak upload'ına özel) -->
        <v-alert
          v-if="uploadError"
          type="warning"
          variant="tonal"
          density="compact"
          closable
          class="mb-4"
          @click:close="uploadError = null"
        >
          {{ uploadError }}
        </v-alert>

        <!-- Store hatası -->
        <v-alert
          v-if="bookStore.error"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          {{ bookStore.error }}
        </v-alert>

        <v-form ref="formRef" @submit.prevent="handleSave">
          <v-row dense>

            <!-- Kapak -->
            <v-col cols="12" :sm="smAndDown ? 12 : 4">
              <BookFormCover
                :cover-preview="coverPreview"
                @update:cover-preview="(preview) => { 
                  coverPreview = preview; 
                  form.cover_image = preview ?? ''; 
                }"
                @file-change="(file) => { 
                  coverFile = file; 
                  uploadError = null; 
                }"
              />

              <!-- Yükleme overlay'i (kapak alanı içinde küçük indicator) -->
              <div v-if="uploadLoading" class="cover-upload-status mt-2">
                <v-progress-circular indeterminate size="16" width="2" color="primary" class="mr-2" />
                <span class="text-caption text-medium-emphasis">
                  {{ t('admin.form.uploadingCover', 'Kapak yükleniyor…') }}
                </span>
              </div>
            </v-col>

            <!-- Alanlar -->
            <v-col cols="12" :sm="smAndDown ? 12 : 8">
              <BookFormFields
                :form="form"
                @update:form="form = $event"
              />
            </v-col>

          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <!-- ── Butonlar ───────────────────────────────────── -->
      <v-card-actions :class="smAndDown ? 'pa-3 gap-2' : 'pa-4 gap-2'">
        <v-spacer />

        <v-btn
          variant="text"
          rounded="lg"
          :disabled="isSaving"
          @click="emit('close')"
        >
          {{ t('common.cancel') }}
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          :loading="isSaving"
          :prepend-icon="isEditing ? 'mdi-content-save-outline' : 'mdi-plus'"
          @click="handleSave"
        >
          {{ isEditing ? t('common.update') : t('common.save') }}
        </v-btn>

      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<style scoped>
.modal-card--fullscreen {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.modal-card--fullscreen .modal-body--scroll {
  flex: 1;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
}

@media (min-width: 600px) {
  .modal-header { padding: 16px 20px; }
}

.modal-header__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-header__icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-header__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.cover-upload-status {
  display: flex;
  align-items: center;
}
</style>