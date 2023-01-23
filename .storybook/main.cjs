const { mergeConfig } = require("vite");
const path = require("node:path");
const { fileURLToPath, URL } = require("node:url");
const svgLoader = require("vite-svg-loader");
module.exports = {
  stories: ["**/*.stories.mdx", "../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      plugins: [svgLoader()],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "../src"),
          "webapps-common": path.resolve(__dirname, "../webapps-common"),
        },
      },
    });
  },
  features: {
    storyStoreV7: true,
  },
  docs: {
    autodocs: true,
  },
};
