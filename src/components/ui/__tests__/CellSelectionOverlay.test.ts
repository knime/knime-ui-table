import { shallowMount } from "@vue/test-utils";
import CellSelectionOverlay from "../CellSelectionOverlay.vue";
import { beforeEach, describe, expect, it } from "vitest";
import type CellSelectionOverlayProps from "../CellSelectionOverlayProps";

describe("MyComponent", () => {
  let props: CellSelectionOverlayProps, wrapper: any;

  beforeEach(() => {
    props = {
      rect: { x: { min: 1, max: 3 }, y: { min: 1, max: 2 } },
      rowHeight: 20,
      rowResizeIndex: null,
      rowResizeDelta: null,
      tableConfig: { showSelection: false, showCollapser: false },
      columnSizes: [10, 20, 30, 40, 50],
    };

    wrapper = shallowMount(CellSelectionOverlay, {
      props,
    });
  });

  describe("vertical properties", () => {
    it("calculates top correctly", async () => {
      expect(wrapper.element.style.transform).toContain("translateY(20px)");

      await wrapper.setProps({
        rowHeight: 100,
      });

      expect(wrapper.element.style.transform).toContain("translateY(100px)");

      await wrapper.setProps({
        rect: { x: props.rect.x, y: { min: 5, max: 10 } },
      });

      expect(wrapper.element.style.transform).toContain("translateY(500px)");
    });

    it("calculates height correctly", async () => {
      expect(wrapper.element.style.height).toBe("40px");

      await wrapper.setProps({
        rowHeight: 100,
      });

      expect(wrapper.element.style.height).toBe("200px");

      await wrapper.setProps({
        rect: { x: props.rect.x, y: { min: 2, max: 4 } },
      });

      expect(wrapper.element.style.height).toBe("300px");
    });

    it("takes resized row into account", async () => {
      expect(wrapper.element.style.transform).toContain("translateY(20px)");
      expect(wrapper.element.style.height).toBe("40px");

      await wrapper.setProps({
        rowResizeIndex: 0,
        rowResizeDelta: 100,
      });

      expect(wrapper.element.style.transform).toContain("translateY(120px)");
      expect(wrapper.element.style.height).toBe("40px");

      await wrapper.setProps({
        rowResizeIndex: 1,
        rowResizeDelta: 100,
      });
      expect(wrapper.element.style.transform).toContain("translateY(20px)");
      expect(wrapper.element.style.height).toBe("140px");

      await wrapper.setProps({
        rowResizeIndex: 2,
        rowResizeDelta: 100,
      });

      expect(wrapper.element.style.transform).toContain("translateY(20px)");
      expect(wrapper.element.style.height).toBe("140px");

      await wrapper.setProps({
        rowResizeIndex: 3,
        rowResizeDelta: 100,
      });

      expect(wrapper.element.style.transform).toContain("translateY(20px)");
      expect(wrapper.element.style.height).toBe("40px");
    });
  });

  describe("horizontal properties", () => {
    it("calculates left correctly", async () => {
      expect(wrapper.element.style.transform).toContain("translateX(10px)");

      await wrapper.setProps({
        rect: { x: { min: 3, max: 3 }, y: props.rect.y },
      });

      expect(wrapper.element.style.transform).toContain("translateX(60px)");

      await wrapper.setProps({
        columnSizes: [10, 10, 10, 10, 10],
      });

      expect(wrapper.element.style.transform).toContain("translateX(30px)");

      await wrapper.setProps({
        tableConfig: { showSelection: true, showCollapser: false },
      });

      expect(wrapper.element.style.transform).toContain("translateX(60px)");

      await wrapper.setProps({
        tableConfig: { showSelection: true, showCollapser: true },
      });

      expect(wrapper.element.style.transform).toContain("translateX(90px)");
    });

    it("calculates width correctly", async () => {
      expect(wrapper.element.style.width).toBe("90px");
      await wrapper.setProps({
        rect: { x: { min: 3, max: 3 }, y: props.rect.y },
      });
      expect(wrapper.element.style.width).toBe("40px");

      await wrapper.setProps({
        columnSizes: [10, 10, 10, 10, 10],
      });

      expect(wrapper.element.style.width).toBe("10px");
    });
  });
});
