export interface AuthUser {
  id: string;
  name: string;
  phoneNo: string;
  role: "member" | "admin";
  status: "pending" | "active" | "inactive";
}

export function useAuth() {
  const user = useState<AuthUser | null>("auth-user", () => null);
  const { api } = useApi();

  function setToken(token: string | null) {
    if (import.meta.client) {
      if (token) localStorage.setItem("token", token);
      else localStorage.removeItem("token");
    }
  }

  function getToken() {
    if (import.meta.client) {
      return localStorage.getItem("token");
    }
    return null;
  }

  async function fetchUser() {
    const token = getToken();
    if (!token) {
      user.value = null;
      return null;
    }
    try {
      const res = await api<{ user: AuthUser }>("/api/auth/me", { auth: true });
      user.value = res.user;
      return res.user;
    } catch {
      setToken(null);
      user.value = null;
      return null;
    }
  }

  async function login(phoneNo: string, password: string) {
    const res = await api<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: { phoneNo, password },
      auth: false,
    });
    setToken(res.token);
    user.value = res.user;
    return res;
  }

  async function register(name: string, phoneNo: string, password: string) {
    return api("/api/auth/register", {
      method: "POST",
      body: { name, phoneNo, password },
      auth: false,
    });
  }

  function logout() {
    setToken(null);
    user.value = null;
    navigateTo("/login");
  }

  const isLoggedIn = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");
  const isActiveMember = computed(
    () =>
      user.value?.role === "member" && user.value?.status === "active"
  );

  return {
    user,
    isLoggedIn,
    isAdmin,
    isActiveMember,
    login,
    register,
    logout,
    fetchUser,
    getToken,
  };
}
