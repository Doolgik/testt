import { defineConfig } from 'vite';

// base = имя репозитория для GitHub Pages (https://<user>.github.io/testt/)
export default defineConfig({
  base: '/testt/',
  server: { host: true, port: 5173 },
});
