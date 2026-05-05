<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ name: '', email: '', password: '', confirmPassword: '' })
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const nameRules = [
  (v: string) => !!v || 'Ad Soyad zorunludur.',
  (v: string) => v.length >= 2 || 'Ad Soyad en az 2 karakter olmalıdır.',
]
const emailRules = [
  (v: string) => !!v || 'E-posta zorunludur.',
  (v: string) => /.+@.+\..+/.test(v) || 'Geçerli bir e-posta girin.',
]
const passwordRules = [
  (v: string) => !!v || 'Şifre zorunludur.',
  (v: string) => v.length >= 6 || 'Şifre en az 6 karakter olmalıdır.',
]
const confirmPasswordRules = [
  (v: string) => !!v || 'Şifre tekrarı zorunludur.',
  (v: string) => v === form.password || 'Şifreler eşleşmiyor.',
]

const formRef = ref()

async function handleRegister() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  errorMessage.value = ''

  const result = await auth.register(form.name, form.email, form.password)
  loading.value = false

  if (result.success) {
    router.push('/')
  } else {
    errorMessage.value = result.message
  }
}
</script>

<template>
  <v-app>
    <div class="auth-page">
      <!-- Sol: Marka paneli -->
      <aside class="auth-brand" aria-hidden="true">
        <div class="auth-brand__inner">
          <div class="auth-brand__logo">
            <v-icon icon="mdi-book-open-page-variant" size="40" color="white" />
          </div>
          <h1 class="auth-brand__title">KTÜ Kütüphanesi</h1>
          <p class="auth-brand__sub">Karadeniz Teknik Üniversitesi</p>

          <ul class="auth-brand__features">
            <li>
              <v-icon icon="mdi-account-plus-outline" size="18" color="white" />
              <span>Birkaç saniyede hesap oluşturun</span>
            </li>
            <li>
              <v-icon icon="mdi-bookmark-multiple-outline" size="18" color="white" />
              <span>Favori kitaplarınızı kaydedin</span>
            </li>
            <li>
              <v-icon icon="mdi-history" size="18" color="white" />
              <span>Ödünç geçmişinizi takip edin</span>
            </li>
          </ul>
        </div>
        <p class="auth-brand__footer">© KTÜ Kütüphane Sistemi</p>
      </aside>

      <!-- Sağ: Form -->
      <main class="auth-form-wrap">
        <div class="auth-card">
          <div class="auth-card__header">
            <p class="auth-card__welcome">Yeni hesap</p>
            <p class="auth-card__title">Hesap oluşturun</p>
          </div>

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

          <v-form ref="formRef" @submit.prevent="handleRegister">
            <v-text-field
              v-model="form.name"
              label="Ad Soyad"
              placeholder="Adınız Soyadınız"
              type="text"
              autocomplete="name"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="nameRules"
              class="mb-3"
            />

            <v-text-field
              v-model="form.email"
              label="E-posta"
              placeholder="ornek@ktu.edu.tr"
              type="email"
              autocomplete="email"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="emailRules"
              class="mb-3"
            />

            <v-text-field
              v-model="form.password"
              label="Şifre"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append-inner="showPassword = !showPassword"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="passwordRules"
              class="mb-3"
            />

            <v-text-field
              v-model="form.confirmPassword"
              label="Şifre Tekrarı"
              :type="showConfirmPassword ? 'text' : 'password'"
              autocomplete="new-password"
              prepend-inner-icon="mdi-lock-check-outline"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="confirmPasswordRules"
              class="mb-5"
            />

            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              rounded="lg"
              :loading="loading"
              class="auth-submit mb-4"
            >
              Kayıt Ol
            </v-btn>
          </v-form>

          <div class="auth-card__foot">
            Zaten hesabınız var mı?
            <router-link to="/login" class="text-primary font-weight-medium text-decoration-none">
              Giriş Yap
            </router-link>
          </div>
        </div>
      </main>
    </div>
  </v-app>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f1f5f9;
}

/* ---- Brand panel ---- */
.auth-brand {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 56px 48px;
  color: #ffffff;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.12), transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08), transparent 50%),
    linear-gradient(135deg, #1e3a8a 0%, #3b82f6 60%, #06b6d4 100%);
  overflow: hidden;
}

.auth-brand::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.04) 0 2px, transparent 2px 14px);
  pointer-events: none;
}

.auth-brand__inner {
  position: relative;
  max-width: 420px;
}

.auth-brand__logo {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  backdrop-filter: blur(8px);
}

.auth-brand__title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.01em;
}

.auth-brand__sub {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.78);
  margin: 0 0 40px 0;
}

.auth-brand__features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.auth-brand__features li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.92);
}

.auth-brand__footer {
  position: relative;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* ---- Form panel ---- */
.auth-form-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 40px 36px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 32px -8px rgba(15, 23, 42, 0.08);
}

.auth-card__header {
  margin-bottom: 28px;
}

.auth-card__welcome {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #3b82f6;
  margin: 0 0 6px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.auth-card__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.auth-submit {
  text-transform: none !important;
  letter-spacing: 0 !important;
  font-weight: 600 !important;
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.auth-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px -6px rgba(59, 130, 246, 0.5);
}

.auth-card__foot {
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}

/* ---- Responsive ---- */
@media (max-width: 960px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-brand {
    display: none;
  }

  .auth-form-wrap {
    min-height: 100vh;
    background:
      radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.08), transparent 60%),
      #f1f5f9;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 28px 22px;
    border-radius: 16px;
  }
}
</style>
