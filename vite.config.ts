import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), svgLoader()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@@': fileURLToPath(new URL('.', import.meta.url)), // I believe this is 'more standard' than to define individual imports for submodules
            '~': fileURLToPath(new URL('.', import.meta.url)) // only needed for import statements in webapps-common
        }
    },
    envPrefix: 'KNIME_',
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: fileURLToPath(new URL('lib/main.js', import.meta.url)),
            name: 'KNIME-Table',
            fileName: 'KNIME-Table'
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: 'Vue'
                }
            }
        }
    }
});
