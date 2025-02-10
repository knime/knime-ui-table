import consola from "consola";

import DemoRow from "./DemoRow.vue";

// More on default export: https://storybook.js.org/docs/vue/writing-stories/introduction#default-export
export default {
  title: "Row",
  component: DemoRow,
  parameters: {
    layout: "fullscreen",
  },
};

// More on component templates: https://storybook.js.org/docs/vue/writing-stories/introduction#using-args
const Template = (args) => {
  window.global.consola = consola;
  return {
    components: { DemoRow },
    setup() {
      return { args };
    },
    template: '<DemoRow v-bind="args" />',
  };
};

const formatter = (content) => content;

const defaultArgs = {
  columnConfigs: [
    {
      key: "first",
      size: 100,
      formatter,
    },
    {
      key: "second",
      size: 100,
      formatter,
    },
    {
      key: "third",
      size: 100,
      formatter,
    },
  ],
  row: ["first cell", "second cell", "third cell"],
  tableConfig: {
    showCollapser: false,
    showSelection: true,
    showPopovers: true,
  },
};

export const RowWithoutSubMenu = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
RowWithoutSubMenu.args = defaultArgs;

export const RowWithSpecificSubMenu = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
RowWithSpecificSubMenu.args = {
  ...defaultArgs,
  rowData: {
    subMenuItemsForRow: [
      {
        id: "myId",
        text: "Specific Row SubMenu item",
      },
    ],
  },
  tableConfig: {
    ...defaultArgs.tableConfig,
    reserveSpaceForSubMenu: "always", // needed to make sure RowWithSpecificSubMenu works
    subMenuItems: [
      {
        id: "foo",
        text: "Global Row SubMenu item",
      },
    ],
  },
};

export const RowWithGlobalSubMenu = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
RowWithGlobalSubMenu.args = {
  ...defaultArgs,
  tableConfig: {
    ...defaultArgs.tableConfig,
    subMenuItems: [
      {
        id: "foo",
        text: "Global Row SubMenu item",
      },
    ],
  },
};
