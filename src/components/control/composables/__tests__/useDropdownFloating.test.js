import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import DropdownFloatingTestComponent from "./DropdownFloatingTestComponent.vue";

describe("useDropdownFloating", () => {
  it("places floating element at the bottom", () => {
    const wrapper = mount(DropdownFloatingTestComponent);

    expect(wrapper.vm.placement).toBe("bottom-start");
  });

  it("places floating element at the top if desired", () => {
    const wrapper = mount(DropdownFloatingTestComponent, {
      props: { openUp: true },
    });

    expect(wrapper.vm.placement).toBe("top-end");
  });

  it("sets minWidth on update", async () => {
    const wrapper = mount(DropdownFloatingTestComponent, {
      props: { openUp: true },
    });

    expect(wrapper.vm.floatingElement.style).toBeFalsy();
    wrapper.vm.update();
    await new Promise((r) => setTimeout(r, 0));

    expect(wrapper.vm.floatingElement.style).toBe("0px");
  });
});
