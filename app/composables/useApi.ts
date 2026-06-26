export function useApi() {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase as string;

  function getToken() {
    if (import.meta.client) {
      return localStorage.getItem("token");
    }
    return null;
  }

  async function api<T>(
    path: string,
    options: {
      method?: string;
      body?: unknown;
      query?: Record<string, string | number | undefined>;
      auth?: boolean;
    } = {}
  ): Promise<T> {
    const headers: Record<string, string> = {};
    const token = getToken();
    if (options.auth !== false && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const isFormData = options.body instanceof FormData;
    if (!isFormData && options.body) {
      headers["Content-Type"] = "application/json";
    }

    return $fetch<T>(path, {
      baseURL,
      method: (options.method || "GET") as "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
      headers,
      body: options.body as BodyInit,
      query: options.query,
    });
  }

  return { api, baseURL };
}
