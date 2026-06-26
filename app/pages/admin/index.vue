<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Pending Approvals</h1>

    <div v-if="pending" class="text-center py-12 text-gray-500">Loading...</div>
    <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>
    <Message v-else-if="!transactions.length" severity="info" :closable="false">
      No pending transactions.
    </Message>

    <div v-else class="flex flex-col gap-4">
      <Card v-for="tx in transactions" :key="tx._id" class="shadow-sm">
        <template #content>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {{ tx.displayName }}</p>
              <p><strong>Phone:</strong> {{ tx.displayPhone }}</p>
              <p><strong>Amount:</strong> Rs. {{ tx.amount?.toLocaleString("en-PK") }}</p>
              <p><strong>Method:</strong> {{ tx.paymentMethod }}</p>
              <p v-if="tx.month"><strong>Month:</strong> {{ tx.month }}/{{ tx.year }}</p>
            </div>
            <div v-if="tx.screenshotUrl">
              <p class="font-medium mb-2">Screenshot</p>
              <img
                :src="tx.screenshotUrl"
                alt="Payment screenshot"
                class="max-h-48 rounded border"
              />
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <Button label="Approve" @click="approve(tx._id)" />
            <Button
              label="Reject"
              severity="danger"
              outlined
              @click="openReject(tx._id)"
            />
          </div>
        </template>
      </Card>
    </div>

    <Dialog v-model:visible="rejectDialog" header="Reject Payment" modal class="max-w-md">
      <Textarea v-model="rejectReason" class="w-full" rows="3" placeholder="Reason for rejection" />
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="rejectDialog = false" />
        <Button label="Reject" severity="danger" :loading="rejecting" @click="confirmReject" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: ["admin"] });

interface PendingTx {
  _id: string;
  displayName: string;
  displayPhone: string;
  amount: number;
  paymentMethod: string;
  month?: number;
  year?: number;
  screenshotUrl?: string;
}

const { api } = useApi();
const transactions = ref<PendingTx[]>([]);
const pending = ref(true);
const error = ref("");
const rejectDialog = ref(false);
const rejectId = ref("");
const rejectReason = ref("");
const rejecting = ref(false);

async function load() {
  pending.value = true;
  error.value = "";
  try {
    const res = await api<{ transactions: PendingTx[] }>(
      "/api/admin/transactions/pending"
    );
    transactions.value = res.transactions;
  } catch {
    error.value = "Could not load pending transactions.";
  } finally {
    pending.value = false;
  }
}

async function approve(id: string) {
  try {
    await api(`/api/admin/transactions/${id}/approve`, {
      method: "PATCH",
      body: {},
    });
    await load();
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    error.value = err.data?.message || "Approval failed.";
  }
}

function openReject(id: string) {
  rejectId.value = id;
  rejectReason.value = "";
  rejectDialog.value = true;
}

async function confirmReject() {
  if (!rejectReason.value.trim()) return;
  rejecting.value = true;
  try {
    await api(`/api/admin/transactions/${rejectId.value}/reject`, {
      method: "PATCH",
      body: { reason: rejectReason.value },
    });
    rejectDialog.value = false;
    await load();
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    error.value = err.data?.message || "Rejection failed.";
  } finally {
    rejecting.value = false;
  }
}

onMounted(load);
</script>
