<template>
  <div class="page-container">
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

    <div v-if="pending" class="text-center py-12 text-gray-500">
      Loading dashboard...
    </div>

    <Message v-else-if="error" severity="error" :closable="false">
      {{ error }}
    </Message>

    <div v-else-if="data" class="grid gap-4 sm:grid-cols-2">
      <div class="stat-card sm:col-span-2">
        <p class="stat-label">Available Balance</p>
        <p class="text-4xl font-bold text-[var(--color-primary)]">
          Rs. {{ formatAmount(data.balance.amount) }}
        </p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Spent This Month</p>
        <p class="stat-value">Rs. {{ formatAmount(data.monthlySpend) }}</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Grave Stones Available</p>
        <p class="stat-value">{{ data.stones.currentPieces }} pieces</p>
      </div>

      <div v-if="data.stones.lastPurchase" class="stat-card sm:col-span-2">
        <p class="stat-label">Last Stone Purchase</p>
        <p class="stat-value">
          {{ data.stones.lastPurchase.pieces }} pieces —
          Rs. {{ formatAmount(data.stones.lastPurchase.totalCost) }}
        </p>
        <p class="text-base text-gray-500 mt-1">
          {{ formatDate(data.stones.lastPurchase.purchasedAt) }}
        </p>
      </div>

      <div v-else class="stat-card sm:col-span-2">
        <p class="stat-label">Last Stone Purchase</p>
        <p class="text-base text-gray-500">No purchase recorded yet</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

interface DashboardData {
  balance: { amount: number; updatedAt: string };
  monthlySpend: number;
  stones: {
    currentPieces: number;
    lastPurchase: {
      pieces: number;
      totalCost: number;
      purchasedAt: string;
    } | null;
  };
}

const { api } = useApi();
const data = ref<DashboardData | null>(null);
const pending = ref(true);
const error = ref("");

function formatAmount(n: number) {
  return n.toLocaleString("en-PK");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

onMounted(async () => {
  try {
    data.value = await api<DashboardData>("/api/public/dashboard", { auth: false });
  } catch {
    error.value = "Could not load dashboard. Please try again later.";
  } finally {
    pending.value = false;
  }
});
</script>
