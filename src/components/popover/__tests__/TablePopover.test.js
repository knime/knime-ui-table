import { beforeEach, describe, expect, it, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";

import { FunctionButton, useClickOutside } from "@knime/components";

import { columnTypes } from "@/config/table.config";
import ArrayRenderer from "../ArrayRenderer.vue";
import MessageRenderer from "../MessageRenderer.vue";
import ObjectRenderer from "../ObjectRenderer.vue";
import StringRenderer from "../StringRenderer.vue";
import TablePopover from "../TablePopover.vue";

vi.mock("@knime/components", () => ({
  useClickOutside: vi.fn(),
  FunctionButton: {
    template: "<slot/>",
  },
}));

describe("TablePopover.vue", () => {
  let props;

  beforeEach(() => {
    props = {
      data: [],
      target: document.body,
    };
  });

  it("closes the dialog on click outside", () => {
    shallowMount(TablePopover, { props });
    expect(useClickOutside).toHaveBeenCalled();
  });

  it("renders the default state", () => {
    const wrapper = shallowMount(TablePopover, {
      slots: {
        content: "contentText",
      },
      props,
    });
    expect(wrapper.find(".content").isVisible()).toBeTruthy();
    expect(wrapper.find(".content .closer").exists()).toBeTruthy();
    expect(wrapper.find(".content").text()).toContain("contentText");
  });

  it("renders the different data renders based on type", async () => {
    const wrapper = shallowMount(TablePopover, {
      props,
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
        target: document.body,
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

  it("emits close events when the close button is clicked", async () => {
    const wrapper = shallowMount(TablePopover, {
      props: {
        target: document.body,
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
        target: document.body,
        data: null,
      },
    });
    expect(wrapper.vm.show).toBe(false);
    expect(wrapper.find(".content").isVisible()).toBeFalsy();
  });
});
