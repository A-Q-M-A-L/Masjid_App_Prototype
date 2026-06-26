<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white border-b border-gray-200">
      <div class="page-header flex items-center justify-between">
        <NuxtLink to="/admin" class="text-xl font-bold text-[var(--color-primary)]">
          Admin Panel
        </NuxtLink>
        <nav class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="nav-link"
            :class="route.path === link.to ? 'nav-link-active' : 'nav-link-inactive'"
          >
            {{ link.label }}
          </NuxtLink>
          <NuxtLink to="/" class="nav-link nav-link-inactive">Public Site</NuxtLink>
          <button class="nav-link nav-link-inactive" @click="logout">Logout</button>
        </nav>
      </div>
    </header>
    <main class="flex-1 page-container">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { logout } = useAuth();

const links = [
  { to: "/admin", label: "Pending" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/transactions", label: "Manual Entry" },
  { to: "/admin/stones", label: "Stones" },
];
</script>
