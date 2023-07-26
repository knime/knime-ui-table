import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import DropdownPopperTestComponent from "./DropdownPopperTestComponent.vue";

describe("usePopperDropdown", () => {
  it("places popper at the bottom", () => {
    const wrapper = mount(DropdownPopperTestComponent);
    const instance = wrapper.vm.popperInstance;
    expect(instance.state.options).toMatchObject({
      placement: "bottom-start",
    });
  });

  it("places popper at the top if desired", () => {
    const wrapper = mount(DropdownPopperTestComponent, {
      props: { openUp: true },
    });
    const instance = wrapper.vm.popperInstance;
    expect(instance.state.options).toMatchObject({
      placement: "top-end",
    });
  });

  it("sets minWidth on update", async () => {
    const wrapper = mount(DropdownPopperTestComponent, {
      props: { openUp: true },
    });
    expect(wrapper.vm.popperInstance.state.elements.popper.style.minWidth).toBe(
      "",
    );
    wrapper.vm.updatePopper();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.popperInstance.state.elements.popper.style.minWidth).toBe(
      "0px",
    );
  });
});
