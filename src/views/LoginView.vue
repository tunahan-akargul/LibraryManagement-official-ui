<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

const form = reactive({ email: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const emailRules = [
  (v: string) => !!v || t('login.emailRequired'),
  (v: string) => /.+@.+\..+/.test(v) || t('login.emailInvalid'),
]
const passwordRules = [
  (v: string) => !!v || t('login.passwordRequired'),
  (v: string) => v.length >= 6 || t('login.passwordMin'),
]

const formRef = ref()

async function handleLogin() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  errorMessage.value = ''

  const result = await auth.login(form.email, form.password)
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
      <!-- Sol: Marka paneli (admin teması) -->
      <aside class="auth-brand" aria-hidden="true">
        <div class="auth-brand__inner">
          <div class="auth-brand__logo">
            <v-icon icon="mdi-shield-account-outline" size="40" color="white" />
          </div>
          <p class="auth-brand__eyebrow">Yönetim Paneli</p>
          <h1 class="auth-brand__title">KTÜ Kütüphane</h1>
          <p class="auth-brand__sub">Yetkili personel girişi</p>

          <ul class="auth-brand__features">
            <li>
              <v-icon icon="mdi-package-variant-closed" size="18" color="white" />
              <span>Envanter ve katalog yönetimi</span>
            </li>
            <li>
              <v-icon icon="mdi-account-multiple-outline" size="18" color="white" />
              <span>Üye ve ödünç işlemleri</span>
            </li>
            <li>
              <v-icon icon="mdi-chart-line" size="18" color="white" />
              <span>İstatistik ve raporlar</span>
            </li>
          </ul>
        </div>
        <p class="auth-brand__footer">© KTÜ Kütüphane Sistemi · Yönetim</p>
      </aside>

      <!-- Sağ: Form -->
      <main class="auth-form-wrap">
        <div class="auth-card">
          <div class="auth-card__header">
            <p class="auth-card__welcome">Yetkili Girişi</p>
            <p class="auth-card__title">Yönetim paneline giriş</p>
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

          <v-form ref="formRef" @submit.prevent="handleLogin">
            <v-text-field
              v-model="form.email"
              label="E-posta"
              placeholder="admin@ktu.edu.tr"
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
              :label="t('login.password')"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append-inner="showPassword = !showPassword"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="passwordRules"
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
              {{ t('login.signIn') }}
            </v-btn>
          </v-form>

          <p class="auth-card__notice">
            <v-icon icon="mdi-information-outline" size="14" />
            Yetkili hesaplar yalnızca sistem yöneticisi tarafından oluşturulur.
          </p>
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
  background: #0f172a;
}

/* ---- Brand panel (dark admin theme) ---- */
.auth-brand {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 56px 48px;
  color: #ffffff;
  background:
    radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.25), transparent 50%),
    radial-gradient(circle at 85% 80%, rgba(56, 189, 248, 0.18), transparent 50%),
    linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #312e81 100%);
  overflow: hidden;
}

.auth-brand::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0 2px, transparent 2px 14px);
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
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  backdrop-filter: blur(8px);
}

.auth-brand__eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  color: #a78bfa;
  margin: 0 0 6px 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.auth-brand__title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.01em;
}

.auth-brand__sub {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.7);
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
  color: rgba(255, 255, 255, 0.88);
}

.auth-brand__footer {
  position: relative;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* ---- Form panel ---- */
.auth-form-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: #f8fafc;
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
    0 12px 32px -8px rgba(15, 23, 42, 0.10);
}

.auth-card__header {
  margin-bottom: 28px;
}

.auth-card__welcome {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #8b5cf6;
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
  box-shadow: 0 8px 20px -6px rgba(139, 92, 246, 0.5);
}

.auth-card__notice {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  text-align: left;
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  padding: 10px 12px;
  background: #f1f5f9;
  border-radius: 8px;
}

/* ---- Responsive ---- */
@media (max-width: 960px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-brand {
    display: none;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 28px 22px;
    border-radius: 16px;
  }
}
</style>
