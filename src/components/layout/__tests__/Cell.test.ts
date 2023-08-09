import { beforeEach, describe, expect, it } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";

import CircleHelpIcon from "webapps-common/ui/assets/img/icons/circle-help.svg";
import Cell from "../Cell.vue";
import type { CellProps } from "../CellProps";

describe("Cell.vue", () => {
  let props: CellProps;

  beforeEach(() => {
    props = {
      text: "Text",
      title: "Title",
      isMissing: false,
      clickable: false,
      isSlotted: false,
      selectOnMove: false,
      isSelected: false,
      leftIsSelected: false,
      rightIsSelected: false,
      aboveIsSelected: false,
      belowIsSelected: false,
      size: 300,
      backgroundColor: null,
    };
  });

  it("renders", () => {
    const wrapper = mount(Cell, { props });
    expect(wrapper.attributes("title")).toBe("Title");
    expect(wrapper.text()).toBe("Text");
    expect(wrapper.attributes("style")).toContain("width: calc(300px);");
  });

  it("renders slot if isSlotted is true", () => {
    const slots = { default: "<h3>This is a Slot!</h3>" };
    const wrapper = mount(Cell, { props, slots });
    expect(wrapper.text()).toBe("Text");
    props.isSlotted = true;
    const slottedWrapper = mount(Cell, { props, slots });
    expect(slottedWrapper.text()).toBe("This is a Slot!");
  });

  it("renders CircleHelpIcon if missing", () => {
    props.isMissing = true;
    const wrapper = mount(Cell, { props });
    expect(wrapper.findComponent(CircleHelpIcon).exists()).toBeTruthy();
    expect(wrapper.text()).toBe("");
  });

  it("emits event on input", () => {
    const wrapper = mount(Cell, { props });

    wrapper.find("td").trigger("input");
    // @ts-ignore
    expect(wrapper.emitted().input[0][0]).toStrictEqual({
      cell: wrapper.element,
      value: expect.anything(),
    });
  });

  describe("onClick", () => {
    it("does not emit click event if not clickable", () => {
      props.clickable = false;
      const wrapper = mount(Cell, { props });
      wrapper.find("td").trigger("click");
      expect(wrapper.emitted().click).toBeUndefined();
    });

    it("emits click event if clickable", () => {
      props.clickable = true;
      const wrapper = mount(Cell, { props });
      expect(wrapper.classes()).toContain("clickable");

      wrapper.find("td").trigger("click");
      // @ts-ignore
      expect(wrapper.emitted().click[0][0]).toStrictEqual({
        cell: wrapper.element,
        event: expect.anything(),
      });
    });
  });

  describe("coloring", () => {
    it("does not set any additional color styles if no background color is given", () => {
      props.backgroundColor = null;
      const wrapper = mount(Cell, { props });
      expect(wrapper.classes()).not.toContain("colored-cell");
      expect(wrapper.attributes("style")).not.toContain(
        "--cell-background-color",
      );
      expect(wrapper.attributes("style")).toContain("padding-left: 10px");
    });

    it("sets background color and check for additional padding", () => {
      props.backgroundColor = "#abcdef";
      const wrapper = mount(Cell, { props });
      expect(wrapper.classes()).toContain("colored-cell");
      expect(wrapper.attributes("style")).toContain(
        "--cell-background-color: #abcdef",
      );
      expect(wrapper.attributes("style")).toContain("padding-left: 20px");
    });
  });

  describe("width computation", () => {
    it("sets the correct width", () => {
      const wrapper = mount(Cell, { props });
      expect(wrapper.attributes("style")).toContain(
        `width: calc(${props.size}px)`,
      );
    });

    it("sets width property for slot", () => {
      props.isSlotted = true;
      props.size = 300;
      const wrapper = mount(Cell, {
        props,
        slots: { default: (props) => `${JSON.stringify(props)}` },
      });
      expect(wrapper.text()).toContain('"width":290');
    });

    it("sets width property for slot with color", () => {
      props.isSlotted = true;
      props.backgroundColor = "#abcdef";
      props.size = 300;
      const wrapper = mount(Cell, {
        props,
        slots: { default: (props) => `${JSON.stringify(props)}` },
      });
      expect(wrapper.text()).toContain('"width":280');
    });
  });

  describe("classes and styles", () => {
    it("applies object map class generators to the data", () => {
      const classMap = {
        data1: "width-1",
        data2: "width-2",
        data3: "width-3",
        data4: "width-4",
        data5: "width-5",
      };
      props.text = "data3";
      props.classGenerators = [classMap];
      const wrapper = shallowMount(Cell, { props });
      expect(wrapper.element.classList.contains("width-1")).toBeFalsy();
      expect(wrapper.element.classList.contains("width-3")).toBeTruthy();
    });

    it("applies function class generators to the data", () => {
      const classFunction = (data: string | undefined) =>
        `width-${data?.slice(-1)}`;
      props.text = "data3";
      props.classGenerators = [classFunction];
      const wrapper = shallowMount(Cell, { props });
      expect(wrapper.element.classList.contains("width-1")).toBeFalsy();
      expect(wrapper.element.classList.contains("width-3")).toBeTruthy();
    });

    it("uses custom classes", () => {
      props.classGenerators = ["width-3"];
      const wrapper = shallowMount(Cell, { props });
      expect(wrapper.element.classList.contains("width-3")).toBeTruthy();
    });
  });

  it("expands selection if selectOnMove is true and the pointer is moved over the cell", async () => {
    props.selectOnMove = true;
    const wrapper = shallowMount(Cell, { props });
    wrapper.find("td").trigger("pointerover");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().select).toStrictEqual([
      [{ expandSelection: true }],
    ]);
  });
});
