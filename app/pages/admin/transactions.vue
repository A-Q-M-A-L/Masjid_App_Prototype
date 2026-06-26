<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Manual Entry</h1>

    <Card class="mb-8 shadow-sm">
      <template #content>
        <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
          <div>
            <label class="block mb-2 font-medium">Type</label>
            <Select
              v-model="type"
              :options="types"
              option-label="label"
              option-value="value"
              class="w-full"
              size="large"
            />
          </div>

          <div>
            <label class="block mb-2 font-medium">Amount (Rs.)</label>
            <InputNumber v-model="amount" class="w-full" :min="1" size="large" />
          </div>

          <div>
            <label class="block mb-2 font-medium">Category</label>
            <Select
              v-model="category"
              :options="categories"
              option-label="label"
              option-value="value"
              class="w-full"
              size="large"
            />
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 font-medium">Name</label>
              <InputText v-model="displayName" class="w-full" size="large" />
            </div>
            <div>
              <label class="block mb-2 font-medium">Phone</label>
              <InputText v-model="displayPhone" class="w-full" size="large" />
            </div>
          </div>

          <div v-if="category === 'monthly_fee'" class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 font-medium">Month</label>
              <InputNumber v-model="month" class="w-full" :min="1" :max="12" size="large" />
            </div>
            <div>
              <label class="block mb-2 font-medium">Year</label>
              <InputNumber v-model="year" class="w-full" :min="2020" size="large" />
            </div>
          </div>

          <div>
            <label class="block mb-2 font-medium">
              Description
              <span v-if="type === 'adjustment'" class="text-red-600">(required for adjustments)</span>
            </label>
            <Textarea v-model="description" class="w-full" rows="2" />
          </div>

          <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
          <Message v-if="success" severity="success" :closable="false">{{ success }}</Message>

          <Button type="submit" label="Save Transaction" size="large" :loading="submitting" />
        </form>
      </template>
    </Card>

    <h2 class="text-2xl font-bold mb-4">Recent Records</h2>
    <DataTable :value="recent" striped-rows :empty-message="'No records yet.'">
      <Column field="type" header="Type" />
      <Column field="displayName" header="Name" />
      <Column header="Amount">
        <template #body="{ data: row }">
          Rs. {{ row.amount?.toLocaleString("en-PK") }}
        </template>
      </Column>
      <Column field="category" header="Category" />
      <Column field="status" header="Status" />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: ["admin"] });

const { api } = useApi();

const type = ref("income");
const amount = ref<number | null>(null);
const category = ref("monthly_fee");
const displayName = ref("");
const displayPhone = ref("");
const month = ref(new Date().getMonth() + 1);
const year = ref(new Date().getFullYear());
const description = ref("");
const error = ref("");
const success = ref("");
const submitting = ref(false);
const recent = ref<Record<string, unknown>[]>([]);

const types = [
  { label: "Income", value: "income" },
  { label: "Expense", value: "expense" },
  { label: "Balance Adjustment", value: "adjustment" },
];

const categories = [
  { label: "Monthly Fee", value: "monthly_fee" },
  { label: "Donation", value: "donation" },
  { label: "Utilities", value: "utilities" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Stones", value: "stones" },
  { label: "Other", value: "other" },
];

async function loadRecent() {
  const res = await api<{ transactions: Record<string, unknown>[] }>(
    "/api/admin/transactions"
  );
  recent.value = res.transactions.slice(0, 20);
}

async function handleSubmit() {
  error.value = "";
  success.value = "";
  submitting.value = true;
  try {
    const res = await api<{ message: string }>("/api/admin/transactions", {
      method: "POST",
      body: {
        type: type.value,
        amount: amount.value,
        category: category.value,
        displayName: displayName.value || "Admin Entry",
        displayPhone: displayPhone.value || "-",
        month: category.value === "monthly_fee" ? month.value : undefined,
        year: category.value === "monthly_fee" ? year.value : undefined,
        description: description.value,
      },
    });
    success.value = res.message;
    amount.value = null;
    description.value = "";
    await loadRecent();
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    error.value = err.data?.message || "Failed to save.";
  } finally {
    submitting.value = false;
  }
}

onMounted(loadRecent);
</script>
