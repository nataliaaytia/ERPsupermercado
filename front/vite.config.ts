import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** Reenvía /srv/<servicio>/... al microservicio local (igual que nginx en Docker). */
const proxy = (puerto: number, prefijo: string) => ({
  target: `http://localhost:${puerto}`,
  changeOrigin: true,
  rewrite: (ruta: string) => ruta.replace(new RegExp(`^/srv/${prefijo}`), ''),
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/srv/proveedores': proxy(8080, 'proveedores'),
      '/srv/cotizaciones': proxy(8082, 'cotizaciones'),
      '/srv/ordenes': proxy(8083, 'ordenes'),
      '/srv/recepcion': proxy(8084, 'recepcion'),
    },
  },
})
