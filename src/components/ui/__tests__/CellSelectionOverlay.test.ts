import { VueWrapper, shallowMount } from "@vue/test-utils";
import CellSelectionOverlay from "../CellSelectionOverlay.vue";
import { Mock, beforeEach, describe, expect, it, vi } from "vitest";
import type CellSelectionOverlayProps from "../CellSelectionOverlayProps";
import { nextTick } from "vue";

describe("CellSelectionOverlay.vue", () => {
  let props: CellSelectionOverlayProps,
    wrapper: VueWrapper<InstanceType<typeof CellSelectionOverlay>>;

  beforeEach(() => {
    props = {
      rect: { x: { min: 1, max: 3 }, y: { min: 1, max: 2 } },
      rowHeight: 20,
      rowResizeIndex: null,
      rowResizeDelta: null,
      tableConfig: { showSelection: false, showCollapser: false },
      columnSizes: [10, 20, 30, 40, 50],
      cellSelectionRectFocusCorner: { x: 1, y: 2 },
    };

    wrapper = shallowMount(CellSelectionOverlay, {
      props,
    });
  });

  describe("totalSelectionOverlay", () => {
    const getTotalSelectionOverlay = (wrapper: VueWrapper) =>
      wrapper.findAll(".overlay").at(0)?.element as HTMLElement;

    describe("vertical properties", () => {
      it("calculates top correctly", async () => {
        expect(getTotalSelectionOverlay(wrapper).style.transform).toContain(
          "translateY(20px)",
        );

        await wrapper.setProps({
          rowHeight: 100,
        });

        expect(getTotalSelectionOverlay(wrapper).style.transform).toContain(
          "translateY(100px)",
        );

        await wrapper.setProps({
          rect: { x: props.rect.x, y: { min: 5, max: 10 } },
        });

        expect(getTotalSelectionOverlay(wrapper).style.transform).toContain(
          "translateY(500px)",
        );
      });

      it("calculates height correctly", async () => {
        expect(getTotalSelectionOverlay(wrapper).style.height).toBe("40px");

        await wrapper.setProps({
          rowHeight: 100,
        });

        expect(getTotalSelectionOverlay(wrapper).style.height).toBe("200px");

        await wrapper.setProps({
          rect: { x: props.rect.x, y: { min: 2, max: 4 } },
        });

        expect(getTotalSelectionOverlay(wrapper).style.height).toBe("300px");
      });

      it("takes resized row into account", async () => {
        expect(getTotalSelectionOverlay(wrapper).style.transform).toContain(
          "translateY(20px)",
        );
        expect(getTotalSelectionOverlay(wrapper).style.height).toBe("40px");

        await wrapper.setProps({
          rowResizeIndex: 0,
          rowResizeDelta: 100,
        });

        expect(getTotalSelectionOverlay(wrapper).style.transform).toContain(
          "translateY(120px)",
        );
        expect(getTotalSelectionOverlay(wrapper).style.height).toBe("40px");

        await wrapper.setProps({
          rowResizeIndex: 1,
          rowResizeDelta: 100,
        });
        expect(getTotalSelectionOverlay(wrapper).style.transform).toContain(
          "translateY(20px)",
        );
        expect(getTotalSelectionOverlay(wrapper).style.height).toBe("140px");

        await wrapper.setProps({
          rowResizeIndex: 2,
          rowResizeDelta: 100,
        });

        expect(getTotalSelectionOverlay(wrapper).style.transform).toContain(
          "translateY(20px)",
        );
        expect(getTotalSelectionOverlay(wrapper).style.height).toBe("140px");

        await wrapper.setProps({
          rowResizeIndex: 3,
          rowResizeDelta: 100,
        });

        expect(getTotalSelectionOverlay(wrapper).style.transform).toContain(
          "translateY(20px)",
        );
        expect(getTotalSelectionOverlay(wrapper).style.height).toBe("40px");
      });
    });

    describe("horizontal properties", () => {
      it("calculates left correctly", async () => {
        expect(getTotalSelectionOverlay(wrapper).style.transform).toContain(
          "translateX(10px)",
        );

        await wrapper.setProps({
          rect: { x: { min: 3, max: 3 }, y: props.rect.y },
        });

        expect(getTotalSelectionOverlay(wrapper).style.transform).toContain(
          "translateX(60px)",
        );

        await wrapper.setProps({
          columnSizes: [10, 10, 10, 10, 10],
        });

        expect(getTotalSelectionOverlay(wrapper).style.transform).toContain(
          "translateX(30px)",
        );

        await wrapper.setProps({
          tableConfig: { showSelection: true, showCollapser: false },
        });

        expect(getTotalSelectionOverlay(wrapper).style.transform).toContain(
          "translateX(60px)",
        );

        await wrapper.setProps({
          tableConfig: { showSelection: true, showCollapser: true },
        });

        expect(getTotalSelectionOverlay(wrapper).style.transform).toContain(
          "translateX(90px)",
        );
      });

      it("calculates width correctly", async () => {
        expect(getTotalSelectionOverlay(wrapper).style.width).toBe("90px");
        await wrapper.setProps({
          rect: { x: { min: 3, max: 3 }, y: props.rect.y },
        });
        expect(getTotalSelectionOverlay(wrapper).style.width).toBe("40px");

        await wrapper.setProps({
          columnSizes: [10, 10, 10, 10, 10],
        });

        expect(getTotalSelectionOverlay(wrapper).style.width).toBe("10px");
      });
    });
  });

  describe("virtual focus overlay", () => {
    const getVirtualSelectionOverlay = (wrapper: VueWrapper) =>
      wrapper.findAll(".overlay").at(1)?.element as HTMLElement;

    it("does not render the overlay when the focus corner is not defined", async () => {
      await wrapper.setProps({
        cellSelectionRectFocusCorner: undefined,
      });

      expect(wrapper.findAll(".overlay")).toHaveLength(1);
      expect(wrapper.find(".overlay").classes()).not.toContain("virtual-focus");
    });

    describe("vertical properties", () => {
      it("calculates top correctly", async () => {
        expect(getVirtualSelectionOverlay(wrapper).style.transform).toContain(
          "translateY(43px)",
        );

        await wrapper.setProps({
          rowHeight: 100,
        });

        expect(getVirtualSelectionOverlay(wrapper).style.transform).toContain(
          "translateY(203px)",
        );
      });

      it("calculates height correctly", async () => {
        expect(getVirtualSelectionOverlay(wrapper).style.height).toBe("14px");

        await wrapper.setProps({
          rowHeight: 100,
        });

        expect(getVirtualSelectionOverlay(wrapper).style.height).toBe("94px");
      });

      it("takes resized row into account", async () => {
        expect(getVirtualSelectionOverlay(wrapper).style.transform).toContain(
          "translateY(43px)",
        );
        expect(getVirtualSelectionOverlay(wrapper).style.height).toBe("14px");

        await wrapper.setProps({
          rowResizeIndex: 0,
          rowResizeDelta: 100,
        });

        expect(getVirtualSelectionOverlay(wrapper).style.transform).toContain(
          "translateY(143px)",
        );
        expect(getVirtualSelectionOverlay(wrapper).style.height).toBe("14px");
      });
    });

    describe("horizontal properties", () => {
      it("calculates left correctly", async () => {
        expect(getVirtualSelectionOverlay(wrapper).style.transform).toContain(
          "translateX(13px)",
        );

        await wrapper.setProps({
          tableConfig: { showSelection: true, showCollapser: false },
        });

        expect(getVirtualSelectionOverlay(wrapper).style.transform).toContain(
          "translateX(43px)",
        );

        await wrapper.setProps({
          tableConfig: { showSelection: true, showCollapser: true },
        });

        expect(getVirtualSelectionOverlay(wrapper).style.transform).toContain(
          "translateX(73px)",
        );
      });

      it("calculates width correctly", async () => {
        expect(getVirtualSelectionOverlay(wrapper).style.width).toBe("14px");

        await wrapper.setProps({
          columnSizes: [10, 10, 10, 10, 10],
        });

        expect(getVirtualSelectionOverlay(wrapper).style.width).toBe("4px");
      });
    });

    describe("scroll into view for groups", () => {
      it("scroll the element to the center of the viewport", async () => {
        const scrollIntoViewMock = vi.fn();
        Element.prototype.scrollIntoView = scrollIntoViewMock;
        wrapper = shallowMount(CellSelectionOverlay, { props });
        wrapper.vm.scrollFocusOverlayIntoView(null);

        await nextTick();
        expect(scrollIntoViewMock).toHaveBeenCalledWith({
          block: "center",
          inline: "center",
        });
      });
    });

    describe("scroll into view for virtual scrolling", () => {
      let scrollToMock: Mock;
      const containerBCR = new DOMRect(0, 0, 40, 80);
      const headerHeight = 0;

      beforeEach(() => {
        scrollToMock = vi.fn();
        wrapper = shallowMount(CellSelectionOverlay, { props });
      });

      it("does not scroll if the focus cell is inside the viewport of the body", async () => {
        Element.prototype.getBoundingClientRect = vi
          .fn()
          .mockReturnValue({ width: 24, height: 14, top: 20, left: 0 });

        wrapper.vm.scrollFocusOverlayIntoView({
          containerBCR,
          headerHeight,
          scrollTo: scrollToMock,
        });

        await nextTick();
        expect(scrollToMock).not.toHaveBeenCalled();
      });

      it("does not scroll the overlay when the focus corner is not defined", async () => {
        await wrapper.setProps({
          cellSelectionRectFocusCorner: undefined,
        });

        Element.prototype.getBoundingClientRect = vi
          .fn()
          .mockReturnValue({ width: 24, height: 14, top: -100, left: 0 });

        wrapper.vm.scrollFocusOverlayIntoView({
          containerBCR,
          headerHeight,
          scrollTo: scrollToMock,
        });

        await nextTick();
        expect(scrollToMock).not.toHaveBeenCalled();
      });

      it.each([
        ["vertically upwards", { top: -15 }, { top: 17 }],
        ["vertically downwards", { top: 145 }, { top: 17 }],
        ["horizontally upwards", { left: -32 }, { left: 0 }],
        ["horizontally downwards", { left: 170 }, { left: 0 }],
      ])(
        "does scroll %s if the focus cell is outside the viewport of the body",
        async (_, focusOverlayBCR, result) => {
          Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
            width: 24,
            height: 14,
            top: 0,
            left: 0,
            ...focusOverlayBCR,
          });

          wrapper.vm.scrollFocusOverlayIntoView({
            containerBCR,
            headerHeight,
            scrollTo: scrollToMock,
          });

          await nextTick();
          expect(scrollToMock).toHaveBeenCalledWith(result);
        },
      );
    });
  });

  describe("copy event", () => {
    it("sets the correct class to trigger the copy animation and removes it after the animation", async () => {
      (wrapper.vm as InstanceType<typeof CellSelectionOverlay>).triggerCopied();
      await wrapper.vm.$nextTick();
      expect(wrapper.findAll(".overlay").at(0)?.classes()).toContain("copied");

      wrapper.findAll(".overlay").at(0)?.trigger("animationend");
      await wrapper.vm.$nextTick();
      expect(wrapper.findAll(".overlay").at(0)?.classes()).not.toContain(
        "copied",
      );
    });
  });
});
