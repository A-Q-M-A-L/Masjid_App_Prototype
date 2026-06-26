<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Grave Stones Inventory</h1>

    <div v-if="pending" class="text-center py-12 text-gray-500">Loading...</div>

    <div v-else class="grid gap-6 lg:grid-cols-2">
      <Card class="shadow-sm">
        <template #content>
          <p class="stat-label">Currently Available</p>
          <p class="text-4xl font-bold text-[var(--color-primary)]">
            {{ stones?.currentPieces ?? 0 }} pieces
          </p>
          <div v-if="stones?.lastPurchase?.purchasedAt" class="mt-4 text-base text-gray-600">
            Last purchase: {{ stones.lastPurchase.pieces }} pieces for
            Rs. {{ stones.lastPurchase.totalCost?.toLocaleString("en-PK") }}
            on {{ formatDate(stones.lastPurchase.purchasedAt) }}
          </div>
        </template>
      </Card>

      <Card class="shadow-sm">
        <template #title>
          <h2 class="text-xl font-bold">Record Stone Purchase</h2>
        </template>
        <template #content>
          <form class="flex flex-col gap-4" @submit.prevent="recordPurchase">
            <div>
              <label class="block mb-2 font-medium">Pieces Purchased</label>
              <InputNumber v-model="purchasePieces" class="w-full" :min="1" size="large" />
            </div>
            <div>
              <label class="block mb-2 font-medium">Total Cost (Rs.)</label>
              <InputNumber v-model="purchaseCost" class="w-full" :min="1" size="large" />
            </div>
            <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
            <Message v-if="success" severity="success" :closable="false">{{ success }}</Message>
            <Button type="submit" label="Add Purchase" size="large" :loading="saving" />
          </form>
        </template>
      </Card>

      <Card class="shadow-sm">
        <template #title>
          <h2 class="text-xl font-bold">Set Current Stock</h2>
        </template>
        <template #content>
          <form class="flex flex-col gap-4" @submit.prevent="setStock">
            <div>
              <label class="block mb-2 font-medium">Current Pieces</label>
              <InputNumber v-model="currentPieces" class="w-full" :min="0" size="large" />
            </div>
            <Button type="submit" label="Update Stock" size="large" severity="secondary" :loading="saving" />
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: ["admin"] });

interface Stones {
  currentPieces: number;
  lastPurchase?: {
    pieces: number;
    totalCost: number;
    purchasedAt: string;
  };
}

const { api } = useApi();
const stones = ref<Stones | null>(null);
const pending = ref(true);
const purchasePieces = ref<number | null>(null);
const purchaseCost = ref<number | null>(null);
const currentPieces = ref<number | null>(null);
const error = ref("");
const success = ref("");
const saving = ref(false);

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-PK");
}

async function load() {
  pending.value = true;
  const res = await api<{ stones: Stones }>("/api/admin/stones");
  stones.value = res.stones;
  currentPieces.value = res.stones.currentPieces;
  pending.value = false;
}

async function recordPurchase() {
  error.value = "";
  success.value = "";
  saving.value = true;
  try {
    const res = await api<{ message: string }>("/api/admin/stones", {
      method: "PATCH",
      body: {
        purchasePieces: purchasePieces.value,
        purchaseCost: purchaseCost.value,
      },
    });
    success.value = res.message;
    purchasePieces.value = null;
    purchaseCost.value = null;
    await load();
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    error.value = err.data?.message || "Update failed.";
  } finally {
    saving.value = false;
  }
}

async function setStock() {
  error.value = "";
  success.value = "";
  saving.value = true;
  try {
    const res = await api<{ message: string }>("/api/admin/stones", {
      method: "PATCH",
      body: { currentPieces: currentPieces.value },
    });
    success.value = res.message;
    await load();
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    error.value = err.data?.message || "Update failed.";
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>
