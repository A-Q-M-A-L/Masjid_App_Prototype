<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">User Management</h1>

    <div class="flex gap-2 mb-6">
      <Button
        v-for="s in statuses"
        :key="s.value"
        :label="s.label"
        :severity="filter === s.value ? 'primary' : 'secondary'"
        @click="filter = s.value; load()"
      />
    </div>

    <div v-if="pending" class="text-center py-12 text-gray-500">Loading...</div>

    <DataTable v-else :value="users" striped-rows :empty-message="'No users found.'">
      <Column field="name" header="Name" />
      <Column field="phoneNo" header="Phone" />
      <Column field="status" header="Status">
        <template #body="{ data: row }">
          <Tag :value="row.status" :severity="statusSeverity(row.status)" />
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data: row }">
          <div class="flex gap-2">
            <Button
              v-if="row.status !== 'active'"
              label="Approve"
              size="small"
              @click="updateStatus(row._id, 'active')"
            />
            <Button
              v-if="row.status === 'active'"
              label="Deactivate"
              size="small"
              severity="danger"
              outlined
              @click="updateStatus(row._id, 'inactive')"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: ["admin"] });

interface UserRow {
  _id: string;
  name: string;
  phoneNo: string;
  status: string;
}

const { api } = useApi();
const users = ref<UserRow[]>([]);
const pending = ref(true);
const filter = ref("pending");

const statuses = [
  { label: "Pending", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

function statusSeverity(s: string) {
  if (s === "active") return "success";
  if (s === "pending") return "warn";
  return "danger";
}

async function load() {
  pending.value = true;
  try {
    const res = await api<{ users: UserRow[] }>("/api/admin/users", {
      query: { status: filter.value },
    });
    users.value = res.users;
  } finally {
    pending.value = false;
  }
}

async function updateStatus(id: string, status: string) {
  await api(`/api/admin/users/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
  await load();
}

onMounted(load);
</script>
