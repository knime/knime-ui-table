import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import PageControls from "../PageControls.vue";
import FunctionButton from "webapps-common/ui/components/FunctionButton.vue";
import ArrowNextIcon from "webapps-common/ui/assets/img/icons/arrow-next.svg";
import ArrowPrevIcon from "webapps-common/ui/assets/img/icons/arrow-prev.svg";
import TextDimensionAndRange from "../TextDimensionAndRange.vue";

describe("PageControls.vue", () => {
  let wrapper;

  it("renders page controls", () => {
    wrapper = shallowMount(PageControls);

    expect(wrapper.findComponent(PageControls).exists()).toBe(true);
    expect(wrapper.findComponent(TextDimensionAndRange).exists()).toBe(true);
    expect(wrapper.findComponent(FunctionButton).exists()).toBe(false);
    expect(wrapper.findComponent(ArrowNextIcon).exists()).toBe(false);
    expect(wrapper.findComponent(ArrowPrevIcon).exists()).toBe(false);
  });

  it("disables next page button if no next page", () => {
    wrapper = shallowMount(PageControls, {
      props: {
        totalItems: 12,
        pageSize: 5,
        currentPage: 3,
      },
    });
    expect(
      wrapper.findAllComponents(FunctionButton).at(0).vm.$props.disabled,
    ).toBeFalsy();
    expect(
      wrapper.findAllComponents(FunctionButton).at(1).vm.$props.disabled,
    ).toBe(true);
  });

  it("disables prev page button if no prev page", () => {
    wrapper = shallowMount(PageControls, {
      props: {
        totalItems: 12,
        currentItems: 10,
        pageSize: 5,
        currentPage: 1,
      },
    });
    expect(
      wrapper.findAllComponents(FunctionButton).at(0).vm.$props.disabled,
    ).toBe(true);
    expect(
      wrapper.findAllComponents(FunctionButton).at(1).vm.$props.disabled,
    ).toBeFalsy();
  });

  it("emits next and previous page events", () => {
    wrapper = shallowMount(PageControls, {
      props: {
        totalItems: 100,
        currentItems: 100,
        pageSize: 25,
        currentPage: 2,
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

  it("does not render page controls if disabled", () => {
    wrapper = shallowMount(PageControls, {
      props: {
        totalItems: 12,
        currentItems: 12,
        pageSize: 5,
        currentPage: 3,
        showPageControls: false,
      },
    });
    expect(wrapper.findComponent(FunctionButton).exists()).toBe(false);
    expect(wrapper.findComponent(ArrowNextIcon).exists()).toBe(false);
    expect(wrapper.findComponent(ArrowPrevIcon).exists()).toBe(false);
  });
});
