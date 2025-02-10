import { describe, expect, it } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";

import DropdownIcon from "@knime/styles/img/icons/arrow-next.svg";

import CollapserToggle from "../CollapserToggle.vue";

describe("CollapserToggle.vue", () => {
  let wrapper;

  it("renders default", () => {
    wrapper = shallowMount(CollapserToggle);
    expect(wrapper.findComponent(CollapserToggle).exists()).toBe(true);
    expect(wrapper.findComponent(DropdownIcon).exists()).toBe(true);
  });

  it("emit a collapserExpand event when clicked", () => {
    wrapper = mount(CollapserToggle);
    wrapper.find("button").trigger("click");
    expect(wrapper.emitted().collapserExpand).toBeTruthy();
  });

  it("changes icon classes when expanded", async () => {
    wrapper = shallowMount(CollapserToggle);
    expect(wrapper.findComponent(DropdownIcon).classes()).not.toContain("flip");
    await wrapper.setProps({ expanded: true });
    expect(wrapper.findComponent(DropdownIcon).classes()).toContain("flip");
  });
});
