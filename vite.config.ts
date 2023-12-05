import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import svgLoader from "vite-svg-loader";
import { libInjectCss } from "vite-plugin-lib-inject-css";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      rollupTypes: true,
      copyDtsFiles: true,
      staticImport: true,
      pathsToAliases: true,
      outDir: ["dist"],
      compilerOptions: {
        declarationMap: true,
      },
    }),
    svgLoader(),
    libInjectCss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src/.", import.meta.url)),
    },
    dedupe: [
      "vue", // see https://github.com/vuejs/core/issues/4344#issuecomment-899064501
    ],
  },
  envPrefix: "KNIME_",
  build: {
    lib: {
      entry: fileURLToPath(new URL("lib/main.ts", import.meta.url)),
      fileName: "knime-ui-table",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        assetFileNames: "knime-ui-table[extname]",
      },
    },
  },
  test: {
    include: ["src/**/__tests__/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "webapps-common/**"],
    environment: "jsdom",
    reporters: ["default", "junit"],
    deps: { inline: ["consola"] }, // needed? already defined in vitest.setup.js
    setupFiles: [
      fileURLToPath(new URL("test-setup/vitest.setup.js", import.meta.url)),
    ],
    coverage: {
      all: true,
      exclude: [
        "buildtools/",
        "coverage/**",
        "dist/**",
        "webapps-common/**",
        "vue-virtual-scroller/**",
        "demo/**",
        "stories/**",
        "lib/**",
        "**/*.d.ts",
        "**/__tests__/**",
        "test-setup/**",
        "types/**",
        "src/types/**",
        "**/{vite,vitest,postcss}.config.{js,cjs,mjs,ts}",
        "**/.{eslint,prettier,stylelint}rc.{js,cjs,yml}",
      ],
      reporter: ["html", "text", "lcov"],
    },
    outputFile: {
      junit: "test-results/junit.xml", // needed for Bitbucket Pipeline, see https://support.atlassian.com/bitbucket-cloud/docs/test-reporting-in-pipelines/
    },
  },
});
