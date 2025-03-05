import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        md5Modifier: 'md5-modifier.html',
        baijaxingCipher: 'baijaxing-cipher.html',
      },
    },
  },
})