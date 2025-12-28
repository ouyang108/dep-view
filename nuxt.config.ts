// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  
  devtools: { enabled: true },
  
  nitro: {
    preset: 'static',
    output: {
      dir: './dist',
    },
  },
  //   app: {
  //   baseURL: './',
  //   head: {
  //     viewport: 'width=device-width,initial-scale=1',
  //     // link: [
  //     //   { rel: 'icon', type: 'image/svg+xml', href: `/favicon.svg` },
  //     // ],
  //     // title: 'ESLint Config Inspector',
  //   },
  // },
  // vite: {
  //   base: './',
  // },
})
