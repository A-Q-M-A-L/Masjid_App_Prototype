<template>
  <div class="page-container">
    <div class="max-w-md mx-auto">
    <Card class="shadow-sm">
      <template #title>
        <h1 class="text-2xl font-bold">Login</h1>
      </template>
      <template #content>
        <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
          <div>
            <label class="block mb-2 font-medium">Phone Number</label>
            <InputText
              v-model="phoneNo"
              class="w-full"
              placeholder="03xx-xxxxxxx"
              size="large"
            />
          </div>
          <div>
            <label class="block mb-2 font-medium">Password</label>
            <Password
              v-model="password"
              class="w-full"
              input-class="w-full"
              :feedback="false"
              toggle-mask
              size="large"
            />
          </div>
          <Message v-if="error" severity="error" :closable="false">
            {{ error }}
          </Message>
          <Button
            type="submit"
            label="Login"
            class="w-full"
            size="large"
            :loading="loading"
          />
          <p class="text-center text-base">
            New here?
            <NuxtLink to="/register" class="text-[var(--color-primary)] font-medium">
              Register
            </NuxtLink>
          </p>
        </form>
      </template>
    </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

const phoneNo = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const { login } = useAuth();

async function handleLogin() {
  error.value = "";
  loading.value = true;
  try {
    const res = await login(phoneNo.value, password.value);
    if (res.user.role === "admin") {
      await navigateTo("/admin");
    } else {
      await navigateTo("/member/transactions");
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    error.value = err.data?.message || "Login failed. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>
