<template>
  <div class="page-container">
    <div class="max-w-md mx-auto">
    <Card class="shadow-sm">
      <template #title>
        <h1 class="text-2xl font-bold">Register</h1>
      </template>
      <template #content>
        <form class="flex flex-col gap-4" @submit.prevent="handleRegister">
          <div>
            <label class="block mb-2 font-medium">Full Name</label>
            <InputText v-model="name" class="w-full" size="large" />
          </div>
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
          <Message v-if="success" severity="success" :closable="false">
            {{ success }}
          </Message>
          <Button
            type="submit"
            label="Register"
            class="w-full"
            size="large"
            :loading="loading"
          />
          <p class="text-center text-base">
            Already registered?
            <NuxtLink to="/login" class="text-[var(--color-primary)] font-medium">
              Login
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

const name = ref("");
const phoneNo = ref("");
const password = ref("");
const error = ref("");
const success = ref("");
const loading = ref(false);
const { register } = useAuth();

async function handleRegister() {
  error.value = "";
  success.value = "";
  loading.value = true;
  try {
    const res = await register(name.value, phoneNo.value, password.value) as { message: string };
    success.value = res.message;
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    error.value = err.data?.message || "Registration failed. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>
