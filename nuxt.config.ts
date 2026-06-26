// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from "@primeuix/themes/aura";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@primevue/nuxt-module", "@nuxtjs/tailwindcss"],
  tailwindcss: {
    cssPath: "~/assets/css/main.css",
  },
  css: ["~/assets/css/main.css", "primeicons/primeicons.css"],
  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: Aura,
        options: {
          prefix: "p",
          darkModeSelector: false,
          cssLayer: {
            name: "primevue",
            order: "tailwind-base, primevue, tailwind-utilities",
          },
        },
      },
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3001",
    },
  },
  app: {
    head: {
      title: "Masjid Finance",
      meta: [
        {
          name: "description",
          content: "Masjid finance dashboard - transparent community finances",
        },
      ],
    },
  },
});
