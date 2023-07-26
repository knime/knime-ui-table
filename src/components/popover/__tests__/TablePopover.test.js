import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";

import { columnTypes } from "@/config/table.config";
import TablePopover from "../TablePopover.vue";
import StringRenderer from "../StringRenderer.vue";
import ObjectRenderer from "../ObjectRenderer.vue";
import ArrayRenderer from "../ArrayRenderer.vue";
import MessageRenderer from "../MessageRenderer.vue";
import FunctionButton from "webapps-common/ui/components/FunctionButton.vue";

vi.mock(
  "vue-clickaway2",
  () => ({
    mixin: {},
  }),
  { virtual: true },
);

describe("TablePopover.vue", () => {
  const target = {
    clientHeight: 10,
    offsetTop: 10,
    offsetLeft: 10,
    offsetHeight: 10,
    offsetWidth: 10,
    offsetParent: {
      clientHeight: 10,
    },
  };

  it("renders the default state", () => {
    const wrapper = shallowMount(TablePopover, {
      slots: {
        content: "contentText",
      },
      props: { target, data: [] },
    });
    expect(wrapper.find(".content").isVisible()).toBeFalsy();
    expect(wrapper.find(".content .closer").exists()).toBeTruthy();
    expect(wrapper.find(".content").text()).toContain("contentText");
  });

  it("renders the different data renders based on type", async () => {
    const wrapper = shallowMount(TablePopover, {
      props: { target, data: [] },
    });
    expect(wrapper.findComponent(ObjectRenderer).exists()).toBeTruthy();
    await wrapper.setProps({ renderer: columnTypes.Nominal, data: "" });
    expect(wrapper.findComponent(StringRenderer).exists()).toBeTruthy();
    await wrapper.setProps({ renderer: columnTypes.String });
    expect(wrapper.findComponent(StringRenderer).exists()).toBeTruthy();
    await wrapper.setProps({ renderer: columnTypes.DateTime });
    expect(wrapper.findComponent(ObjectRenderer).exists()).toBeTruthy();
    await wrapper.setProps({ renderer: columnTypes.Number });
    expect(wrapper.findComponent(ObjectRenderer).exists()).toBeTruthy();
    await wrapper.setProps({ renderer: columnTypes.Boolean });
    expect(wrapper.findComponent(ObjectRenderer).exists()).toBeTruthy();
    await wrapper.setProps({ renderer: columnTypes.Object });
    expect(wrapper.findComponent(ObjectRenderer).exists()).toBeTruthy();
    await wrapper.setProps({
      renderer: columnTypes.Array,
      data: ["1", "2", "3"],
    });
    expect(wrapper.findComponent(ArrayRenderer).exists()).toBeTruthy();
  });

  it("renders dynamic components with data processing functions", () => {
    const wrapper = shallowMount(TablePopover, {
      props: {
        target,
        data: [1, 2, 3],
        renderer: {
          type: "MessageRenderer",
          process: (data) => data.map((item) => item + 1),
        },
      },
    });
    expect(wrapper.findComponent(MessageRenderer).exists()).toBeTruthy();
    expect(wrapper.vm.processedData).toStrictEqual([2, 3, 4]);
  });

  it("computes the vertical direction to render based on the client height", () => {
    let wrapper = shallowMount(TablePopover, {
      props: {
        target,
        data: 1,
      },
    });
    expect(wrapper.vm.displayTop).toBe(true);
    wrapper = shallowMount(TablePopover, {
      props: {
        target: {
          ...target,
          offsetTop: 1,
          offsetParent: {
            clientHeight: 10,
          },
        },
        data: 1,
      },
    });
    expect(wrapper.vm.displayTop).toBe(false);
  });

  it("computes display coordinates based on the provided event target", () => {
    let wrapper = shallowMount(TablePopover, {
      props: {
        target: {
          clientHeight: 4,
          offsetTop: 1,
          offsetLeft: 1,
          offsetHeight: 8,
          offsetWidth: 8,
          offsetParent: {
            clientHeight: 10,
            offsetTop: 10,
            offsetLeft: 10,
          },
        },
        data: 1,
        rowHeight: 4,
      },
    });
    expect(wrapper.vm.displayTop).toBe(false);
    expect(wrapper.vm.top).toBe(15);
    expect(wrapper.vm.left).toBe(15);
    expect(wrapper.vm.maxHeight).toBe(300);
    expect(wrapper.vm.style).toStrictEqual({
      top: "15px",
      left: "15px",
    });
    expect(wrapper.vm.contentStyle).toStrictEqual({
      top: "4px",
      "max-height": "300px",
    });
    expect(wrapper.vm.childMaxHeight).toStrictEqual({
      "max-height": "296px",
    });

    wrapper = shallowMount(TablePopover, {
      props: {
        target: {
          clientHeight: 8,
          offsetTop: 6,
          offsetLeft: 6,
          offsetHeight: 8,
          offsetWidth: 8,
          offsetParent: {
            clientHeight: 10,
            offsetTop: 10,
            offsetLeft: 10,
          },
        },
        data: 1,
        rowHeight: 4,
      },
    });
    expect(wrapper.vm.displayTop).toBe(true);
    expect(wrapper.vm.top).toBe(20);
    expect(wrapper.vm.left).toBe(20);
    expect(wrapper.vm.maxHeight).toBe(300);
    expect(wrapper.vm.style).toStrictEqual({
      top: "20px",
      left: "20px",
    });
    expect(wrapper.vm.contentStyle).toStrictEqual({
      bottom: "8px",
      "max-height": "300px",
    });
    expect(wrapper.vm.childMaxHeight).toStrictEqual({
      "max-height": "296px",
    });
  });

  it("emits close events when the close button is clicked", async () => {
    const wrapper = shallowMount(TablePopover, {
      props: {
        target,
        data: [1, 2, 3],
        renderer: {
          type: "MessageRenderer",
          process: (data) => data.map((item) => item + 1),
        },
      },
    });
    expect(wrapper.emitted().close).toBeFalsy();
    const closerFunctionButton = wrapper.findComponent(FunctionButton);
    expect(closerFunctionButton.exists()).toBeTruthy();
    closerFunctionButton.vm.$emit("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().close).toBeTruthy();
  });

  it("does not open if there is no data to display", () => {
    const wrapper = shallowMount(TablePopover, {
      props: {
        target,
        data: null,
      },
    });
    expect(wrapper.vm.show).toBe(false);
    expect(wrapper.find(".content").isVisible()).toBeFalsy();
  });
});
