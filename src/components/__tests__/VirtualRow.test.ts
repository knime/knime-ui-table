import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import VirtualRow from "../VirtualRow.vue";
import PlaceholderRow from "../ui/PlaceholderRow.vue";

describe("VirtualRow.vue", () => {
  const defaultProps = {
    bodyWidth: 20,
    rowHeight: 10,
    compact: false,
    columnSizes: [100],
    specialColumnSizes: {
      collapserSize: 1,
      selectionSize: 10,
      rightSideSize: 100,
      deletionSize: 1000,
    },
    tableConfig: {
      showSelection: false,
    },
  };

  it("renders slot when given data", () => {
    const wrapper = mount(VirtualRow, {
      props: { ...defaultProps, dataItem: { data: "myData" } },
      slots: {
        default: '<div id="myId"> {{params.row}} </div>',
      },
    });
    expect(wrapper.html()).toBe('<div id="myId">myData</div>');
  });

  it("renders placeholder row when given dots", () => {
    const wrapper = mount(VirtualRow, {
      props: { ...defaultProps, dataItem: { dots: true } },
    });
    expect(wrapper.findComponent(PlaceholderRow)).toBeTruthy();
  });

  it("renders empty row when given no data", () => {
    const wrapper = mount(VirtualRow, {
      props: { ...defaultProps },
    });
    expect(wrapper.find("td .skeleton").exists()).toBe(true);
    expect(wrapper.find("td.select-cell").exists()).toBe(false);
  });

  it("renders empty row when given no data with selection enabled", () => {
    const wrapper = mount(VirtualRow, {
      props: { ...defaultProps, tableConfig: { showSelection: true } },
    });
    expect(wrapper.find("td .skeleton").exists()).toBe(true);
    expect(wrapper.find("td.select-cell").exists()).toBe(true);
  });
});
