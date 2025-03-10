import { describe, expect, it, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";

import { Button } from "@knime/components";

import ActionButton from "../ActionButton.vue";

describe("ActionButton.vue", () => {
  let wrapper;

  it("renders default", () => {
    wrapper = shallowMount(ActionButton, {
      props: {
        config: {
          text: "test",
          callback: vi.fn(),
        },
      },
    });
    expect(wrapper.findComponent(ActionButton).exists()).toBe(true);
    expect(wrapper.findComponent(Button).text()).toBe("test");
  });

  it("invokes a callback function on click", () => {
    let actionCallbackMock = vi.fn();
    wrapper = shallowMount(ActionButton, {
      props: {
        config: {
          text: "test",
          callback: actionCallbackMock,
        },
      },
    });
    expect(actionCallbackMock).not.toHaveBeenCalled();
    wrapper.findComponent(Button).vm.$emit("click");
    expect(actionCallbackMock).toHaveBeenCalled();
  });
});
