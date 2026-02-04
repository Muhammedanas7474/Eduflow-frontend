import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        proxy: {
            // Proxy API requests to Nginx (which routes to backend)
            '/api': {
                target: 'http://localhost:80',
                changeOrigin: true,
            },
            // Proxy WebSocket requests to Nginx (which routes to backend)
            '/ws': {
                target: 'http://127.0.0.1:80',
                ws: true,
                changeOrigin: true,
            },
        },
    },
})

