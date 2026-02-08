import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                // Manual chunks to split large vendor libraries
                manualChunks: {
                    // Supabase - only needed after auth
                    'vendor-supabase': ['@supabase/supabase-js'],
                    // Highcharts - only needed for portfolio/dashboard
                    'vendor-charts': ['highcharts', 'highcharts-react-official'],
                    // Framer Motion - used for animations
                    'vendor-motion': ['framer-motion'],
                    // React Router - core navigatio
                    'vendor-router': ['react-router-dom'],
                },
            },
        },
        // Increase chunk size warning limit slightly
        chunkSizeWarningLimit: 600,
    },
})
