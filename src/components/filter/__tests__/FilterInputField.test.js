import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";

import FilterInputField from "../FilterInputField.vue";

describe("FilterInputField.vue", () => {
  it("renders", () => {
    const wrapper = mount(FilterInputField, {
      props: {
        modelValue: "Test value",
      },
    });
    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.isVisible()).toBeTruthy();
    expect(wrapper.element.tagName).toBe("DIV");
    let input = wrapper.find("input");
    expect(input.attributes("type")).toBe("text"); // default
    expect(input.element.value).toBe("Test value");
  });

  it("emits input events", () => {
    const wrapper = mount(FilterInputField);
    const newValue = "new value";
    let input = wrapper.find("input");
    input.setValue(newValue);
    expect(wrapper.emitted("update:modelValue")[0][0]).toEqual(newValue);
  });

  it("emits blur events", () => {
    const wrapper = mount(FilterInputField);
    wrapper.vm.focus();
    expect(wrapper.emitted("blur")).toBeFalsy();
    wrapper.find("input").trigger("keydown.esc");
    expect(wrapper.emitted("blur")).toBeTruthy();
  });

  it("focuses on focus call", () => {
    const wrapper = mount(FilterInputField, { attachTo: document.body });
    wrapper.vm.focus();
    expect(document.activeElement).toEqual(wrapper.find("input").element);
  });
});
