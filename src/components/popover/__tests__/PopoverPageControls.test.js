import { describe, expect, it } from "vitest";
import { shallowMount } from "@vue/test-utils";

import { FunctionButton } from "@knime/components";
import ArrowNextIcon from "@knime/styles/img/icons/arrow-next.svg";
import ArrowPrevIcon from "@knime/styles/img/icons/arrow-prev.svg";

import PopoverPageControls from "../PopoverPageControls.vue";

describe("PopoverPageControls.vue", () => {
  let wrapper;

  it("renders page controls", () => {
    wrapper = shallowMount(PopoverPageControls, {
      props: {
        totalPages: 5,
        currentPage: 0,
      },
    });

    expect(wrapper.findComponent(PopoverPageControls).exists()).toBe(true);
    expect(wrapper.findComponent(FunctionButton).exists()).toBe(true);
    expect(wrapper.findComponent(ArrowNextIcon).exists()).toBe(true);
    expect(wrapper.findComponent(ArrowPrevIcon).exists()).toBe(true);
    expect(wrapper.find(".controls").text()).toContain("1 of 5");
  });

  it("emits next and previous page events", () => {
    wrapper = shallowMount(PopoverPageControls, {
      props: {
        totalPages: 5,
        currentPage: 0,
      },
    });
    let buttons = wrapper.findAllComponents(FunctionButton);
    expect(wrapper.emitted().nextPage).toBeFalsy();
    expect(wrapper.emitted().prevPage).toBeFalsy();
    buttons.at(1).vm.$emit("click");
    expect(wrapper.emitted().nextPage).toBeTruthy();
    expect(wrapper.emitted().prevPage).toBeFalsy();
    buttons.at(0).vm.$emit("click");
    expect(wrapper.emitted().prevPage).toBeTruthy();
  });
});
