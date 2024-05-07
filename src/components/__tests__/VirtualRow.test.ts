import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import VirtualRow from "../VirtualRow.vue";
import PlaceholderRow from "../ui/PlaceholderRow.vue";

describe("VirtualRow.vue", () => {
  it("renders slot when given data", () => {
    const wrapper = mount(VirtualRow, {
      props: {
        dataItem: { data: "myData" },
        rowHeight: 10,
        bodyWidth: 20,
      },
      slots: {
        default: '<div id="myId"> {{params.row}}</div>',
      },
    });
    expect(wrapper.html()).toBe('<div id="myId">myData</div>');
  });

  it("renders placeholder row when given dots", () => {
    const wrapper = mount(VirtualRow, {
      props: {
        dataItem: { dots: true },
        rowHeight: 10,
        bodyWidth: 20,
      },
    });
    expect(wrapper.findComponent(PlaceholderRow)).toBeTruthy();
  });

  it("renders empty row when given no data", () => {
    const wrapper = mount(VirtualRow, {
      props: {
        rowHeight: 10,
        bodyWidth: 20,
      },
    });
    expect(wrapper.text()).toContain("Loading row");
  });
});
