import { URL, fileURLToPath } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import svgLoader from "vite-svg-loader";

// @ts-ignore
import { svgoConfig } from "@knime/styles/config/svgo.config";

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
      tsconfigPath: "tsconfig.app.json",
    }),
    svgLoader({ svgoConfig }),
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
    exclude: ["**/node_modules/**", "**/dist/**"],
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
