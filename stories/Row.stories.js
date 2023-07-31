import RowComp from "../src/components/layout/Row.vue";
import consola from "consola";

// More on default export: https://storybook.js.org/docs/vue/writing-stories/introduction#default-export
export default {
  title: "Row",
  component: RowComp,
  parameters: {
    layout: "fullscreen",
  },
};

// More on component templates: https://storybook.js.org/docs/vue/writing-stories/introduction#using-args
const Template = (args) => {
  window.global.consola = consola;
  return {
    components: { RowComp },
    setup() {
      return { args };
    },
    template: '<RowComp v-bind="args" />',
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
    data: {
      subMenuItemsForRow: [
        {
          id: "myId",
          text: "Specific Row SubMenu item",
        },
      ],
    },
  },
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
