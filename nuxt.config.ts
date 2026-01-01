// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@nuxt/icon'],

  devServer:{
    port: 3001,
    // 代理
   
  },
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  // 修改启动的端口号
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
  vite: {
    plugins: [
            tailwindcss(),
        ],
      // 代理
      server: {
        proxy: {
          '/message': {
            target: 'http://localhost:3000',
            changeOrigin: true,     
            rewrite: (path) => path.replace(/^\/message/, ''),
          },
        },
      },
  },
})