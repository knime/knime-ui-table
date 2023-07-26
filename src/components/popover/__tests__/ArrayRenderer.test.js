import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import ArrayRenderer from "../ArrayRenderer.vue";
import PopoverPageControls from "../PopoverPageControls.vue";

describe("ArrayRenderer.vue", () => {
  let wrapper;

  it("renders array data", () => {
    wrapper = shallowMount(ArrayRenderer, {
      props: {
        data: ["test"],
      },
    });

    expect(wrapper.findComponent(ArrayRenderer).exists()).toBe(true);
    expect(wrapper.find("div").text()).toBe("test");
    expect(wrapper.findComponent(PopoverPageControls).exists()).toBe(false);
  });

  it("renders page controls for multi-item arrays", () => {
    wrapper = shallowMount(ArrayRenderer, {
      props: {
        data: ["test", "data"],
      },
    });

    expect(wrapper.findComponent(ArrayRenderer).exists()).toBe(true);
    expect(wrapper.find("div").text()).toBe("test");
    expect(wrapper.findComponent(PopoverPageControls).exists()).toBe(true);
  });

  it("reacts to page events by updating the content of the page", async () => {
    wrapper = shallowMount(ArrayRenderer, {
      props: {
        data: ["test", "data"],
      },
    });

    expect(wrapper.findComponent(ArrayRenderer).exists()).toBe(true);
    expect(wrapper.findComponent(PopoverPageControls).exists()).toBe(true);
    expect(wrapper.find("div").text()).toBe("test");
    await wrapper.findComponent(PopoverPageControls).vm.$emit("nextPage");
    expect(wrapper.find("div").text()).toBe("data");
    await wrapper.findComponent(PopoverPageControls).vm.$emit("prevPage");
    expect(wrapper.find("div").text()).toBe("test");
  });

  it("parses and formats valid object within arrays", () => {
    wrapper = shallowMount(ArrayRenderer, {
      props: {
        data: [
          {
            important: "property",
          },
        ],
      },
    });

    expect(wrapper.findComponent(ArrayRenderer).exists()).toBe(true);
    expect(wrapper.find("div").text()).toBe('{\n  "important": "property"\n}');
  });

  it("does not render for empty arrays", () => {
    wrapper = shallowMount(ArrayRenderer, {
      props: {
        data: [],
      },
    });

    expect(wrapper.findComponent(ArrayRenderer).exists()).toBe(true);
    expect(wrapper.find("div").exists()).toBe(false);
  });

  it("does not render if data is missing", () => {
    wrapper = shallowMount(ArrayRenderer);

    expect(wrapper.findComponent(ArrayRenderer).exists()).toBe(true);
    expect(wrapper.find("div").exists()).toBe(false);
  });
});
