export default defineNuxtRouteMiddleware(async () => {
  const { fetchUser, isAdmin } = useAuth();
  await fetchUser();
  if (!isAdmin.value) {
    return navigateTo("/login");
  }
});
