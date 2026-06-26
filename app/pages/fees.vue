<template>
  <div class="page-container">
    <h1 class="text-3xl font-bold mb-6">Monthly Fees</h1>

    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <label class="block mb-2 font-medium">Search by name or phone</label>
        <InputText
          v-model="search"
          class="w-full"
          placeholder="Type a name or phone..."
          size="large"
          @keyup.enter="loadFees"
        />
      </div>
      <div>
        <label class="block mb-2 font-medium">From</label>
        <DatePicker v-model="fromDate" date-format="yy-mm-dd" class="w-full" />
      </div>
      <div>
        <label class="block mb-2 font-medium">To</label>
        <DatePicker v-model="toDate" date-format="yy-mm-dd" class="w-full" />
      </div>
      <div class="flex items-end">
        <Button label="Search" size="large" @click="loadFees" />
      </div>
    </div>

    <div v-if="pending" class="text-center py-12 text-gray-500">Loading...</div>
    <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>

    <DataTable
      v-else
      :value="fees"
      striped-rows
      class="text-base"
      :empty-message="'No fee records found.'"
    >
      <Column field="name" header="Name" />
      <Column field="phone" header="Phone" />
      <Column header="Month">
        <template #body="{ data: row }">
          {{ monthName(row.month) }} {{ row.year }}
        </template>
      </Column>
      <Column header="Amount">
        <template #body="{ data: row }">
          Rs. {{ row.amount.toLocaleString("en-PK") }}
        </template>
      </Column>
      <Column header="Paid On">
        <template #body="{ data: row }">
          {{ formatDate(row.paidOn) }}
        </template>
      </Column>
      <Column field="status" header="Status">
        <template #body="{ data: row }">
          <Tag
            :value="row.status"
            :severity="row.status === 'approved' ? 'success' : 'warn'"
          />
        </template>
      </Column>
    </DataTable>

    <div v-if="pagination && pagination.pages > 1" class="flex justify-center gap-2 mt-6">
      <Button
        label="Previous"
        severity="secondary"
        :disabled="pagination.page <= 1"
        @click="goPage(pagination.page - 1)"
      />
      <span class="flex items-center px-4">
        Page {{ pagination.page }} of {{ pagination.pages }}
      </span>
      <Button
        label="Next"
        severity="secondary"
        :disabled="pagination.page >= pagination.pages"
        @click="goPage(pagination.page + 1)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

interface FeeRow {
  id: string;
  name: string;
  phone: string;
  month: number;
  year: number;
  amount: number;
  paidOn: string;
  status: string;
}

const { api } = useApi();
const search = ref("");
const fromDate = ref<Date | null>(null);
const toDate = ref<Date | null>(null);
const fees = ref<FeeRow[]>([]);
const pending = ref(true);
const error = ref("");
const page = ref(1);
const pagination = ref<{ page: number; pages: number } | null>(null);

function monthName(m: number) {
  return new Date(2000, m - 1, 1).toLocaleString("en", { month: "long" });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-PK");
}

function toIsoDate(d: Date | null) {
  if (!d) return undefined;
  return d.toISOString().split("T")[0];
}

async function loadFees() {
  pending.value = true;
  error.value = "";
  try {
    const res = await api<{
      fees: FeeRow[];
      pagination: { page: number; pages: number };
    }>("/api/public/fees", {
      auth: false,
      query: {
        search: search.value || undefined,
        from: toIsoDate(fromDate.value),
        to: toIsoDate(toDate.value),
        page: page.value,
        limit: 20,
      },
    });
    fees.value = res.fees;
    pagination.value = res.pagination;
  } catch {
    error.value = "Could not load fee records.";
  } finally {
    pending.value = false;
  }
}

function goPage(p: number) {
  page.value = p;
  loadFees();
}

onMounted(loadFees);
</script>
