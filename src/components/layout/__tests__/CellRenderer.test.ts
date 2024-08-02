import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";

import CircleHelpIcon from "@knime/styles/img/icons/circle-help.svg";
import CellRenderer from "../CellRenderer.vue";
import type { CellRendererProps } from "../CellRendererProps";

describe("Cell.vue", () => {
  let props: CellRendererProps;

  beforeEach(() => {
    props = {
      isClickable: false,
      isMissing: false,
      isSlotted: false,
      text: "Text",
      title: "Title",
      color: "#abcdef",
      paddingLeft: 10,
      classes: [],
      selectOnMove: false,
      size: 300,
      defaultTopBottomPadding: 12,
    };
  });

  it("renders with the given styles", () => {
    const wrapper = mount(CellRenderer, { props });
    expect(wrapper.attributes("title")).toBe("Title");
    expect(wrapper.text()).toBe("Text");
    expect(wrapper.attributes("style")).toContain("width: calc(300px);");
    expect(wrapper.attributes("style")).toContain("padding-left: 10px;");
    expect(wrapper.attributes("style")).toContain(
      "--data-cell-color: #abcdef;",
    );
  });

  it("renders with the given styles without color", () => {
    props.color = null;
    const wrapper = mount(CellRenderer, { props });
    expect(wrapper.attributes("style")).not.toContain(
      "--data-cell-color: #abcdef;",
    );
  });

  it("renders slot if isSlotted is true", () => {
    const slots = { default: "<h3>This is a Slot!</h3>" };
    const wrapper = mount(CellRenderer, { props, slots });
    expect(wrapper.text()).toBe("Text");
    props.isSlotted = true;
    const slottedWrapper = mount(CellRenderer, { props, slots });
    expect(slottedWrapper.text()).toBe("This is a Slot!");
  });

  it("renders CircleHelpIcon if missing", () => {
    props.isMissing = true;
    const wrapper = mount(CellRenderer, { props });
    expect(wrapper.findComponent(CircleHelpIcon).exists()).toBeTruthy();
    expect(wrapper.text()).toBe("");
  });

  it("emits event on input", () => {
    const wrapper = mount(CellRenderer, { props });

    wrapper.find("td").trigger("input");
    // @ts-ignore
    expect(wrapper.emitted().input[0][0]).toStrictEqual({
      cell: wrapper.element,
      value: expect.anything(),
    });
  });

  describe("onClick", () => {
    it("does not emit click event if not clickable", () => {
      props.isClickable = false;
      const wrapper = mount(CellRenderer, { props });
      wrapper.find("td").trigger("click");
      expect(wrapper.emitted().click).toBeUndefined();
    });

    it("emits click event if clickable", () => {
      props.isClickable = true;
      const wrapper = mount(CellRenderer, { props });
      expect(wrapper.classes()).toContain("clickable");

      wrapper.find("td").trigger("click");
      // @ts-ignore
      expect(wrapper.emitted().click[0][0]).toStrictEqual({
        cell: wrapper.element,
        event: expect.anything(),
      });
    });
  });

  describe("width computation", () => {
    it("sets the correct width", () => {
      const wrapper = mount(CellRenderer, { props });
      expect(wrapper.attributes("style")).toContain(
        `width: calc(${props.size}px)`,
      );
    });

    it("sets width property for slot", () => {
      props.isSlotted = true;
      props.size = 300;
      const wrapper = mount(CellRenderer, {
        props,
        slots: { default: (props) => `${JSON.stringify(props)}` },
      });
      expect(wrapper.text()).toContain('"width":290');
    });
  });

  it("applies the given classes to the data", () => {
    props.classes = ["width-3"];
    const wrapper = shallowMount(CellRenderer, { props });
    expect(wrapper.element.classList.contains("width-1")).toBeFalsy();
    expect(wrapper.element.classList.contains("width-3")).toBeTruthy();
  });

  it("expands selection if selectOnMove is true and the pointer is moved over the cell", async () => {
    props.selectOnMove = true;
    const wrapper = shallowMount(CellRenderer, { props });
    wrapper.find("td").trigger("pointerover");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().select).toStrictEqual([
      [{ expandSelection: true }],
    ]);
  });

  describe("cell content dimensions", () => {
    it("returns the size of the padding as cell dimensions when the dimensions cannot be calculated", () => {
      const wrapper = shallowMount(CellRenderer, { props });
      expect(wrapper.vm.getCellContentDimensions()).toStrictEqual({
        height: 24,
        width: 10,
      });
    });

    it("sums up paddings and dimensions when the dimensions can be calculated", () => {
      Element.prototype.getBoundingClientRect = vi
        .fn()
        .mockReturnValueOnce({ width: 22.2, height: 33.3 });
      const wrapper = shallowMount(CellRenderer, { props });
      expect(wrapper.vm.getCellContentDimensions()).toStrictEqual({
        width: 33,
        height: 58,
      });
    });
  });
});
