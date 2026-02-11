import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { flushPromises, mount, shallowMount } from "@vue/test-utils";

import CircleHelpIcon from "@knime/styles/img/icons/circle-help.svg";

import {
  injectionKey as injectionKeyDataValueViews,
  useDataValueViews,
} from "@/components/composables/useDataValueViews";
import CellRenderer from "../CellRenderer.vue";
import type { CellRendererProps } from "../CellRendererProps";
import ExpandIcon from "../expand.svg";

describe("CellRenderer.vue", () => {
  let props: CellRendererProps,
    providedDataValueViewData: ReturnType<typeof useDataValueViews>;

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
      isSelected: false,
      isToBeExpanded: false,
    };

    providedDataValueViewData = {
      isShown: ref(false),
      close: vi.fn(),
    };
  });

  const mountCellRenderer = (
    params: Partial<Parameters<typeof mount>[1]> = {},
  ) =>
    mount(CellRenderer, {
      // @ts-ignore
      props,
      global: {
        provide: {
          [injectionKeyDataValueViews as symbol]: providedDataValueViewData,
        },
      },
      ...params,
    });

  const shallowMountCellRenderer = () =>
    shallowMount(CellRenderer, {
      props,
      global: {
        provide: {
          [injectionKeyDataValueViews as symbol]: providedDataValueViewData,
        },
      },
    });

  it("renders with the given styles", () => {
    const wrapper = mountCellRenderer();
    expect(wrapper.attributes("title")).toBe("Title");
    expect(wrapper.text()).toBe("Text");
    expect(wrapper.attributes("style")).toContain("width: calc(300px);");
    expect(wrapper.attributes("style")).toContain("padding-left: 10px;");
    expect(wrapper.attributes("style")).toContain("padding-top: 12px;");
    expect(wrapper.attributes("style")).toContain("padding-bottom: 12px;");
    expect(wrapper.attributes("style")).toContain(
      "--data-cell-color: #abcdef;",
    );
  });

  it("renders with the given styles without color", () => {
    props.color = null;
    const wrapper = mountCellRenderer();
    expect(wrapper.attributes("style")).not.toContain(
      "--data-cell-color: #abcdef;",
    );
  });

  it("renders slot if isSlotted is true", () => {
    const slots = { default: "<h3>This is a Slot!</h3>" };
    const wrapper = mountCellRenderer({ props, slots });
    expect(wrapper.text()).toBe("Text");
    props.isSlotted = true;
    const slottedWrapper = mountCellRenderer({ props, slots });
    expect(slottedWrapper.text()).toBe("This is a Slot!");
  });

  it("does not set a top or bottom padding on slots", () => {
    const slots = { default: "<h3>This is a Slot!</h3>" };
    props.isSlotted = true;
    props.noPadding = true;
    const slottedWrapper = mountCellRenderer({ slots });
    expect(slottedWrapper.attributes("style")).not.toContain("padding-top");
    expect(slottedWrapper.attributes("style")).not.toContain("padding-bottom");
  });

  it("renders CircleHelpIcon if missing", () => {
    props.isMissing = true;
    const wrapper = mountCellRenderer();
    expect(wrapper.findComponent(CircleHelpIcon).exists()).toBeTruthy();
    expect(wrapper.text()).toBe("");
    expect(wrapper.attributes("style")).toContain("padding-top: 13px;");
    expect(wrapper.attributes("style")).toContain("padding-bottom: 13px;");
  });

  it("emits event on input", () => {
    const wrapper = mountCellRenderer();

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
      const wrapper = mountCellRenderer();
      wrapper.find("td").trigger("click");
      expect(wrapper.emitted().click).toBeUndefined();
    });

    it("emits click event if clickable", () => {
      props.isClickable = true;
      const wrapper = mountCellRenderer();
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
      const wrapper = mountCellRenderer();
      expect(wrapper.attributes("style")).toContain(
        `width: calc(${props.size}px)`,
      );
    });

    it("sets width property for slot", () => {
      props.isSlotted = true;
      props.size = 300;
      const wrapper = mountCellRenderer({
        slots: { default: (props: unknown) => `${JSON.stringify(props)}` },
      });
      expect(wrapper.text()).toContain('"width":290');
    });
  });

  it("applies the given classes to the data", () => {
    props.classes = ["width-3"];
    const wrapper = shallowMountCellRenderer();
    expect(wrapper.element.classList.contains("width-1")).toBeFalsy();
    expect(wrapper.element.classList.contains("width-3")).toBeTruthy();
  });

  it("expands selection if selectOnMove is true and the pointer is moved over the cell", async () => {
    props.selectOnMove = true;
    const wrapper = shallowMountCellRenderer();
    wrapper.find("td").trigger("pointermove");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().select).toStrictEqual([
      [{ expandSelection: true }],
    ]);
  });

  describe("cell content dimensions", () => {
    it("returns the size of the padding as cell dimensions when the dimensions cannot be calculated", () => {
      const wrapper = shallowMountCellRenderer();
      expect(wrapper.vm.getCellContentDimensions()).toStrictEqual({
        height: 24,
        width: 10,
      });
    });

    it("sums up paddings and dimensions when the dimensions can be calculated", () => {
      Element.prototype.getBoundingClientRect = vi
        .fn()
        .mockReturnValueOnce({ width: 22.2, height: 33.3 });
      const wrapper = shallowMountCellRenderer();
      expect(wrapper.vm.getCellContentDimensions()).toStrictEqual({
        width: 33,
        height: 58,
      });
    });
  });

  describe("expand event", () => {
    describe("in case the cell is to be expanded", () => {
      it("closes an existing expanded view on mounted if not expandable", async () => {
        props.isToBeExpanded = true;
        props.enableExpand = false;
        mountCellRenderer();
        await flushPromises();
        expect(providedDataValueViewData.close).toHaveBeenCalled();
      });

      it("shows this cell's expanded view on mounted if expandable", async () => {
        props.isToBeExpanded = true;
        props.enableExpand = true;
        const wrapper = mountCellRenderer();
        await flushPromises();
        expect(wrapper.emitted("expand")).toBeDefined();
      });

      it("closes the existing expanded view on prop change if not expandable", async () => {
        props.isToBeExpanded = false;
        props.enableExpand = false;
        const wrapper = mountCellRenderer();
        await wrapper.setProps({ isToBeExpanded: true });
        expect(providedDataValueViewData.close).toHaveBeenCalled();
      });

      it("shows this cell's expanded view on prop change if expandable", async () => {
        props.isToBeExpanded = false;
        props.enableExpand = true;
        const wrapper = mountCellRenderer();
        await wrapper.setProps({ isToBeExpanded: true });
        expect(wrapper.emitted("expand")).toBeDefined();
      });
    });

    describe("on double click", () => {
      it("emits expand event if expand is enabled", async () => {
        props.enableExpand = true;
        const wrapper = mountCellRenderer();
        await wrapper.find("td").trigger("dblclick");
        expect(wrapper.emitted("expand")).toBeTruthy();
      });

      it("does not emit expand if expand is not enabled", async () => {
        const wrapper = mountCellRenderer();
        await wrapper.find("td").trigger("dblclick");
        expect(wrapper.emitted("expand")).toBeFalsy();
      });
    });

    describe("per expand icon", () => {
      it("shows expand icon if expand is enabled", async () => {
        props.enableExpand = true;
        const wrapper = mountCellRenderer();
        const expandIcon = wrapper.findComponent(ExpandIcon);
        expect(expandIcon.exists()).toBeTruthy();
        await expandIcon.trigger("click");
        expect(wrapper.emitted("expand")).toBeTruthy();
      });

      it("does not show expand icon if expand is not enabled", () => {
        const wrapper = mountCellRenderer();
        const expandIcon = wrapper.findComponent(ExpandIcon);
        expect(expandIcon.exists()).toBeFalsy();
      });
    });
  });
});
