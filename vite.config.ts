import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        svgLoader(),
        cssInjectedByJsPlugin() // not supported natively in Vite yet, see https://github.com/vitejs/vite/issues/1579]
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@@': fileURLToPath(new URL('.', import.meta.url))
        }
    },
    envPrefix: 'KNIME_',
    build: {
        lib: {
            entry: fileURLToPath(new URL('lib/main.js', import.meta.url)),
            fileName: 'knime-ui-table',
            formats: ['es']
        },
        rollupOptions: {
            external: ['vue']
        }
    }
});
