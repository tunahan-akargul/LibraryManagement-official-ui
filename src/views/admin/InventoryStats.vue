<script setup lang="ts">
// ── src/views/admin/InventoryStats.vue ────────────────────

defineProps<{
  total: number
  available: number // status === 'available'
  borrowed: number  // status === 'borrowed'
}>()
</script>

<template>
  <v-row class="mb-4" dense>

    <!-- Toplam -->
    <v-col cols="12" sm="4">
      <div class="stat-card">
        <div class="stat-card__icon-wrap stat-card__icon-wrap--primary">
          <v-icon icon="mdi-book-multiple" color="primary" size="20" />
        </div>
        <div>
          <p class="stat-card__value">{{ total }}</p>
          <p class="stat-card__label">Toplam Kitap</p>
        </div>
      </div>
    </v-col>

    <!-- Mevcut -->
    <v-col cols="6" sm="4">
      <div class="stat-card">
        <div class="stat-card__icon-wrap stat-card__icon-wrap--success">
          <v-icon icon="mdi-check-circle-outline" color="success" size="20" />
        </div>
        <div>
          <p class="stat-card__value">{{ available }}</p>
          <p class="stat-card__label">Mevcut</p>
        </div>
      </div>
    </v-col>

    <!-- Ödünçte -->
    <v-col cols="6" sm="4">
      <div class="stat-card">
        <div class="stat-card__icon-wrap stat-card__icon-wrap--warning">
          <v-icon icon="mdi-clock-outline" color="warning" size="20" />
        </div>
        <div>
          <p class="stat-card__value">{{ borrowed }}</p>
          <p class="stat-card__label">Ödünçte</p>
        </div>
      </div>
    </v-col>

  </v-row>
</template>

<style scoped>
/* aynı kaldı */
.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.18);
  border-radius: 12px;
  padding: 14px 18px;
}
.stat-card__icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-card__icon-wrap--primary { background: rgba(var(--v-theme-primary), 0.1); }
.stat-card__icon-wrap--success { background: rgba(var(--v-theme-success), 0.1); }
.stat-card__icon-wrap--warning { background: rgba(var(--v-theme-warning), 0.12); }

.stat-card__value {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}
.stat-card__label {
  font-size: 0.75rem;
  opacity: 0.6;
  margin: 0;
}
</style>