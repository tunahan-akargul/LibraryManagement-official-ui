<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'

/**
 * Bu bileşen yalnızca dosya seçimi ve önizleme yönetiminden sorumludur.
 * Üst bileşen (BookFormModal) `onCoverUpdate` ile hem `coverPreview` hem de
 * `form.cover_image` alanını (base64 data URL veya null) günceller.
 */
const props = defineProps<{
  coverPreview: string | null
}>()

const emit = defineEmits<{
  (e: 'update:coverPreview', value: string | null): void
  (e: 'fileChange', file: File | null): void
}>()

const { smAndDown } = useDisplay()
const { t } = useI18n()

function onFileChange(files: File | File[] | null) {
  const file = Array.isArray(files) ? files[0] : files
  if (!file) {
    emit('update:coverPreview', null)
    emit('fileChange', null)
    return
  }
  const reader  = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    emit('update:coverPreview', result)
    emit('fileChange', file)
  }
  reader.readAsDataURL(file)
}

function removeCover() {
  emit('update:coverPreview', null)
  emit('fileChange', null)
}
</script>

<template>
  <div>
    <p class="field-label">{{ t('admin.form.coverPhoto') }}</p>

    <!-- MOBİL: yatay kompakt düzen -->
    <template v-if="smAndDown">
      <div class="cover-mobile">
        <div class="cover-mobile__thumb">
          <img
            v-if="coverPreview"
            :src="coverPreview"
            class="cover-mobile__img"
            :alt="t('admin.form.coverPhoto')"
          />
          <div v-else class="cover-mobile__placeholder">
            <v-icon icon="mdi-image-plus-outline" size="22" color="grey-lighten-1" />
          </div>
          <v-btn
            v-if="coverPreview"
            icon="mdi-close"
            size="x-small"
            color="error"
            class="cover-mobile__remove"
            @click="removeCover"
          />
        </div>
        <v-file-input
          :label="t('admin.form.chooseFile')"
          accept="image/png, image/jpeg, image/webp"
          variant="outlined"
          density="compact"
          rounded="lg"
          prepend-icon=""
          prepend-inner-icon="mdi-upload-outline"
          hide-details
          class="cover-mobile__input"
          @update:model-value="onFileChange"
        />
      </div>
    </template>

    <!-- MASAÜSTÜ: dikey tam kolon düzeni -->
    <template v-else>
      <div v-if="coverPreview" class="cover-preview">
        <img :src="coverPreview" class="cover-preview__img" :alt="t('admin.form.coverPreview')" />
        <v-btn
          icon="mdi-close"
          size="x-small"
          color="error"
          class="cover-preview__remove"
          @click="removeCover"
        />
      </div>

      <div v-else class="cover-upload-zone">
        <v-icon icon="mdi-image-plus-outline" size="28" color="grey-lighten-1" />
        <p class="cover-upload-zone__hint">{{ t('admin.form.dragOrSelect') }}</p>
      </div>

      <v-file-input
        :label="t('admin.form.chooseFile')"
        accept="image/png, image/jpeg, image/webp"
        variant="outlined"
        density="compact"
        rounded="lg"
        prepend-icon=""
        prepend-inner-icon="mdi-upload-outline"
        hide-details
        class="mt-2"
        @update:model-value="onFileChange"
      />
    </template>
  </div>
</template>

<style scoped>
.field-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.75);
  margin: 0 0 6px;
}

.cover-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0.15);
}

.cover-preview__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-preview__remove {
  position: absolute;
  top: 6px;
  right: 6px;
}

.cover-upload-zone {
  width: 100%;
  aspect-ratio: 2 / 3;
  border: 2px dashed rgba(var(--v-border-color), 0.25);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.cover-upload-zone:hover {
  border-color: rgba(var(--v-theme-primary), 0.4);
  background: rgba(var(--v-theme-primary), 0.03);
}

.cover-upload-zone__hint {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin: 0;
  text-align: center;
}

.cover-mobile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.cover-mobile__thumb {
  position: relative;
  flex-shrink: 0;
  width: 56px;
  height: 76px;
}

.cover-mobile__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid rgba(var(--v-border-color), 0.15);
  display: block;
}

.cover-mobile__placeholder {
  width: 100%;
  height: 100%;
  border: 2px dashed rgba(var(--v-border-color), 0.2);
  border-radius: 6px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-mobile__remove {
  position: absolute;
  top: -6px;
  right: -6px;
}

.cover-mobile__input {
  flex: 1;
  min-width: 0;
}
</style>
