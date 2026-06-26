<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="page-header">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <NuxtLink to="/" class="text-xl font-bold text-[var(--color-primary)]">
            Masjid Finance
          </NuxtLink>
          <nav class="flex flex-wrap gap-2">
            <NuxtLink
              to="/"
              class="nav-link"
              :class="route.path === '/' ? 'nav-link-active' : 'nav-link-inactive'"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/fees"
              class="nav-link"
              :class="route.path === '/fees' ? 'nav-link-active' : 'nav-link-inactive'"
            >
              Monthly Fees
            </NuxtLink>
            <NuxtLink
              v-if="isActiveMember || isAdmin"
              to="/member/transactions"
              class="nav-link"
              :class="
                route.path.startsWith('/member')
                  ? 'nav-link-active'
                  : 'nav-link-inactive'
              "
            >
              Transactions
            </NuxtLink>
            <NuxtLink
              v-if="isAdmin"
              to="/admin"
              class="nav-link"
              :class="
                route.path.startsWith('/admin')
                  ? 'nav-link-active'
                  : 'nav-link-inactive'
              "
            >
              Admin
            </NuxtLink>
            <NuxtLink
              v-if="!isLoggedIn"
              to="/login"
              class="nav-link nav-link-inactive"
            >
              Login
            </NuxtLink>
            <button
              v-else
              class="nav-link nav-link-inactive"
              @click="logout"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
    <main class="flex-1">
      <slot />
    </main>
    <footer class="text-center text-sm text-gray-500 py-6">
      Masjid Finance — Transparent community finances
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { isLoggedIn, isAdmin, isActiveMember, logout, fetchUser } = useAuth();

onMounted(() => {
  fetchUser();
});
</script>
