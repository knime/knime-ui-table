import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
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
            '@': fileURLToPath(new URL('src/.', import.meta.url))
        },
        dedupe: [
            'vue' // see https://github.com/vuejs/core/issues/4344#issuecomment-899064501
        ]
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
    },
    test: {
        include: ['src/**/__tests__/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        environment: 'jsdom',
        reporters: ['default', 'junit'],
        deps: { inline: ['consola'] },
        setupFiles: [
            fileURLToPath(new URL('test-setup/vitest.setup.js', import.meta.url))
        ],
        coverage: {
            all: true,
            exclude: [
                'buildtools/', 'coverage/**', 'dist/**', 'webapps-common/**', 'vue-virtual-scroller/**', 'demo/**',
                'lib/**', '**/*.d.ts', '**/__tests__/**', 'test-setup/**',
                '**/{vite,vitest,postcss}.config.{js,cjs,mjs,ts}', '**/.{eslint,prettier,stylelint}rc.{js,cjs,yml}'
            ]
        },
        outputFile: {
            junit: 'test-results/junit.xml' // needed for Bitbucket Pipeline, see https://support.atlassian.com/bitbucket-cloud/docs/test-reporting-in-pipelines/
        }
    }
});
