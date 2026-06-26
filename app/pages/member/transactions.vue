<template>
  <div class="page-container">
    <h1 class="text-3xl font-bold mb-6">Submit Payment</h1>

    <Card class="mb-8 shadow-sm">
      <template #content>
        <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 font-medium">Name</label>
              <InputText :model-value="user?.name" class="w-full" disabled size="large" />
            </div>
            <div>
              <label class="block mb-2 font-medium">Phone</label>
              <InputText :model-value="user?.phoneNo" class="w-full" disabled size="large" />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 font-medium">Amount (Rs.)</label>
              <InputNumber v-model="amount" class="w-full" :min="1" size="large" />
            </div>
            <div>
              <label class="block mb-2 font-medium">Payment Method</label>
              <Select
                v-model="paymentMethod"
                :options="paymentMethods"
                option-label="label"
                option-value="value"
                class="w-full"
                size="large"
              />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 font-medium">Month</label>
              <Select
                v-model="month"
                :options="months"
                option-label="label"
                option-value="value"
                class="w-full"
                size="large"
              />
            </div>
            <div>
              <label class="block mb-2 font-medium">Year</label>
              <InputNumber v-model="year" class="w-full" :min="2020" :max="2100" size="large" />
            </div>
          </div>

          <div>
            <label class="block mb-2 font-medium">Payment Screenshot</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="block w-full text-base"
              @change="onFileChange"
            />
            <p class="text-sm text-gray-500 mt-1">JPG, PNG or WEBP. Max 5 MB.</p>
          </div>

          <div>
            <label class="block mb-2 font-medium">Notes (optional)</label>
            <Textarea v-model="description" class="w-full" rows="2" />
          </div>

          <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
          <Message v-if="success" severity="success" :closable="false">{{ success }}</Message>

          <Button
            type="submit"
            label="Submit Payment"
            size="large"
            :loading="submitting"
          />
        </form>
      </template>
    </Card>

    <h2 class="text-2xl font-bold mb-4">My Submissions</h2>

    <div v-if="loadingHistory" class="text-center py-8 text-gray-500">Loading...</div>

    <DataTable
      v-else
      :value="transactions"
      striped-rows
      :empty-message="'No submissions yet.'"
    >
      <Column header="Amount">
        <template #body="{ data: row }">
          Rs. {{ row.amount.toLocaleString("en-PK") }}
        </template>
      </Column>
      <Column header="Month">
        <template #body="{ data: row }">
          <span v-if="row.month">{{ row.month }}/{{ row.year }}</span>
          <span v-else>—</span>
        </template>
      </Column>
      <Column field="status" header="Status">
        <template #body="{ data: row }">
          <Tag
            :value="row.status"
            :severity="
              row.status === 'approved'
                ? 'success'
                : row.status === 'rejected'
                  ? 'danger'
                  : 'warn'
            "
          />
        </template>
      </Column>
      <Column header="Screenshot">
        <template #body="{ data: row }">
          <a
            v-if="row.screenshotUrl"
            :href="row.screenshotUrl"
            target="_blank"
            class="text-[var(--color-primary)] underline"
          >
            View
          </a>
          <span v-else>—</span>
        </template>
      </Column>
      <Column header="Date">
        <template #body="{ data: row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </Column>
      <Column header="Note">
        <template #body="{ data: row }">
          <span v-if="row.rejectionReason" class="text-red-600">
            {{ row.rejectionReason }}
          </span>
          <span v-else>—</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default", middleware: ["auth"] });

const { user, fetchUser } = useAuth();
const { api } = useApi();

const amount = ref<number | null>(null);
const paymentMethod = ref("easypaisa");
const month = ref(new Date().getMonth() + 1);
const year = ref(new Date().getFullYear());
const description = ref("");
const screenshot = ref<File | null>(null);
const error = ref("");
const success = ref("");
const submitting = ref(false);
const loadingHistory = ref(true);
const transactions = ref<Record<string, unknown>[]>([]);

const paymentMethods = [
  { label: "Easypaisa", value: "easypaisa" },
  { label: "JazzCash", value: "jazzcash" },
  { label: "Bank Transfer", value: "bank" },
  { label: "Other", value: "other" },
];

const months = Array.from({ length: 12 }, (_, i) => ({
  label: new Date(2000, i, 1).toLocaleString("en", { month: "long" }),
  value: i + 1,
}));

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  screenshot.value = input.files?.[0] || null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-PK");
}

async function loadHistory() {
  loadingHistory.value = true;
  try {
    const res = await api<{ transactions: Record<string, unknown>[] }>(
      "/api/member/transactions"
    );
    transactions.value = res.transactions;
  } catch {
    transactions.value = [];
  } finally {
    loadingHistory.value = false;
  }
}

async function handleSubmit() {
  error.value = "";
  success.value = "";

  if (!amount.value || amount.value <= 0) {
    error.value = "Please enter a valid amount.";
    return;
  }
  if (!screenshot.value) {
    error.value = "Please attach a payment screenshot.";
    return;
  }

  submitting.value = true;
  try {
    const form = new FormData();
    form.append("amount", String(amount.value));
    form.append("paymentMethod", paymentMethod.value);
    form.append("category", "monthly_fee");
    form.append("month", String(month.value));
    form.append("year", String(year.value));
    if (description.value) form.append("description", description.value);
    form.append("screenshot", screenshot.value);

    const res = await api<{ message: string }>("/api/member/transactions", {
      method: "POST",
      body: form,
    });
    success.value = res.message;
    amount.value = null;
    screenshot.value = null;
    description.value = "";
    await loadHistory();
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    error.value = err.data?.message || "Submission failed. Please try again.";
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await fetchUser();
  await loadHistory();
});
</script>
