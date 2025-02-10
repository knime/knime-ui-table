import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

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

    await new Promise((r) => setTimeout(r, 0));

    wrapper.vm.referenceElement.getBoundingClientRect = () => ({
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    });

    expect(wrapper.vm.floatingElement.style.minWidth).toBe("0px");

    wrapper.vm.update();
    await new Promise((r) => setTimeout(r, 0));

    expect(wrapper.vm.floatingElement.style.minWidth).toBe("10px");
  });
});
