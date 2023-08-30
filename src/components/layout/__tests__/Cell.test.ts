import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";

import Cell from "../Cell.vue";
import type { CellProps } from "../CellProps";
import CellRenderer from "../CellRenderer.vue";

describe("Cell.vue", () => {
  let props: CellProps;

  beforeEach(() => {
    props = {
      cellData: "cellValue",
      selectOnMove: false,
      isSlotted: false,
      size: 300,
      classGenerators: [],
      isClickableByConfig: false,
      formatter: (value: string) => value,
    };
  });

  it("renders", () => {
    const wrapper = mount(Cell, { props });
    expect(wrapper.findComponent(CellRenderer).exists()).toBeTruthy();
    expect(wrapper.findComponent(CellRenderer).props()).toStrictEqual({
      color: null,
      classes: [],
      isClickable: false,
      isMissing: false,
      isSlotted: false,
      paddingLeft: 10,
      selectOnMove: false,
      size: 300,
      text: "cellValue",
      title: "cellValue",
    });
  });

  it.each([
    ["input", { event: {}, cell: {} }],
    ["click", { event: {}, cell: {} }],
    ["select", { expandSelection: {} }],
  ])("emits %s to the parent component", (emitMethod, emitValue) => {
    const wrapper = mount(Cell, { props });
    // @ts-ignore
    wrapper.findComponent(CellRenderer).vm.$emit(emitMethod, emitValue);
    // @ts-ignore
    expect(wrapper.emitted()[emitMethod][0][0]).toStrictEqual(emitValue);
  });

  describe("title", () => {
    it("creates the correct title for missing values without metadata", () => {
      props.cellData = null;
      const wrapper = shallowMount(Cell, { props });
      expect(wrapper.findComponent(CellRenderer).props().title).toBe(
        "Missing Value",
      );
    });

    it("creates the correct title for missing values with metadata", () => {
      props.cellData = { metadata: "Missing Value Message" };
      const wrapper = shallowMount(Cell, { props });
      expect(wrapper.findComponent(CellRenderer).props().title).toBe(
        "Missing Value (Missing Value Message)",
      );
    });

    it("creates the correct title for clickable cells", () => {
      props.isClickableByConfig = true;
      const wrapper = shallowMount(Cell, { props });
      expect(wrapper.findComponent(CellRenderer).props().title).toBeNull();
    });

    it("creates the correct title for undefined cellData", () => {
      props.cellData = undefined;
      const wrapper = shallowMount(Cell, { props });
      expect(wrapper.findComponent(CellRenderer).props().title).toBeNull();
    });
  });

  describe("coloring", () => {
    it("does not pass a color, but the correct padding to the CellRenderer", () => {
      props.cellData = { value: "value", color: null };
      const wrapper = mount(Cell, { props });
      expect(wrapper.classes()).not.toContain("colored-cell");
      expect(wrapper.attributes("style")).not.toContain("--data-cell-color");
      expect(wrapper.attributes("style")).toContain("padding-left: 10px");
    });

    it("passes the background color and the correct padding to the CellRenderer", () => {
      props.cellData = { value: "value", color: "#abcdef" };
      const wrapper = mount(Cell, { props });
      expect(wrapper.classes()).toContain("colored-cell");
      expect(wrapper.attributes("style")).toContain(
        "--data-cell-color: #abcdef",
      );
      expect(wrapper.attributes("style")).toContain("padding-left: 20px");
    });
  });

  describe("classes and styles", () => {
    it("passes the correct classes based on object map class generators to the CellRenderer", () => {
      const classMap = {
        data1: "width-1",
        data2: "width-2",
        data3: "width-3",
        data4: "width-4",
        data5: "width-5",
      };
      props.cellData = "data3";
      props.classGenerators = [classMap];
      const wrapper = shallowMount(Cell, { props });
      expect(wrapper.findComponent(CellRenderer).props().classes).toStrictEqual(
        ["width-3"],
      );
    });

    it("applies function class generators to the data", () => {
      const classFunction = (data: string | undefined) =>
        `width-${data?.slice(-1)}`;
      props.cellData = "data3";
      props.classGenerators = [classFunction];
      const wrapper = shallowMount(Cell, { props });
      expect(wrapper.findComponent(CellRenderer).props().classes).toStrictEqual(
        ["width-3"],
      );
    });

    it("uses custom classes", () => {
      props.classGenerators = ["width-3"];
      const wrapper = shallowMount(Cell, { props });
      expect(wrapper.findComponent(CellRenderer).props().classes).toStrictEqual(
        ["width-3"],
      );
    });

    it("does not use classes when class generators are undefined", () => {
      props.classGenerators = undefined;
      const wrapper = shallowMount(Cell, { props });
      expect(wrapper.findComponent(CellRenderer).props().classes).toStrictEqual(
        [],
      );
    });

    it("does not use the class function when the cell data is undefined", () => {
      const classFunction = (data: string | undefined) =>
        `width-${data?.slice(-1)}`;
      props.cellData = undefined;
      props.classGenerators = [classFunction];
      const wrapper = shallowMount(Cell, { props });
      expect(wrapper.findComponent(CellRenderer).props().classes).toStrictEqual(
        [],
      );
    });
  });

  it("calls getCellContentWidth in the CellRenderer", () => {
    const wrapper = mount(Cell, { props });
    const spy = vi.spyOn(
      wrapper.findComponent(CellRenderer).vm,
      "getCellContentWidth",
    );
    wrapper.findComponent(CellRenderer).vm.getCellContentWidth();
    expect(spy).toHaveBeenCalled();
  });
});
