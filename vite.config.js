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
                target: 'ws://localhost:80',
                ws: true,
                changeOrigin: true,
            },
        },
    },
})

