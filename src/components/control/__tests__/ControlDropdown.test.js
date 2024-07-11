import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";
import { ref, unref } from "vue";

import ControlDropdown from "../ControlDropdown.vue";
import CircleHelpIcon from "@knime/styles/img/icons/circle-help.svg";

const dropdownNavigation = {
  currentIndex: ref(1),
  resetNavigation: vi.fn(),
  onKeydown: vi.fn(),
};
vi.mock("@knime/components", () => ({
  useDropdownNavigation: vi.fn(() => dropdownNavigation),
  useClickOutside: vi.fn(),
}));

const dropdownFloating = {
  update: vi.fn(),
};
vi.mock("../composables/useDropdownFloating", () => ({
  default: vi.fn(() => dropdownFloating),
}));
const scrollToElement = { scrollTo: vi.fn() };
vi.mock("../composables/useScrollToElement", () => ({
  default: vi.fn(() => scrollToElement),
}));

import useDropdownFloating from "../composables/useDropdownFloating";
import useScrollToElement from "../composables/useScrollToElement";
import { useClickOutside, useDropdownNavigation } from "@knime/components";

describe("ControlDropdown.vue", () => {
  let props;

  beforeEach(() => {
    props = {
      possibleValues: [
        {
          id: "test1",
          text: "Text 1",
        },
        {
          id: "test2",
          text: "Text 2",
        },
        {
          id: "test3",
          text: "Text 3",
        },
        {
          id: "test4",
          text: "Text 4",
        },
        {
          id: "test5",
          text: "Text 5",
        },
      ],
      ariaLabel: "Test Label",
    };
  });

  it("renders", () => {
    const wrapper = mount(ControlDropdown, {
      props,
    });
    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.isVisible()).toBeTruthy();
    expect(wrapper.find({ ref: "ul" }).findAll("[role=option]").length).toBe(
      props.possibleValues.length,
    );
  });

  it("includes placeholder value in options if enabled", () => {
    let placeholder = "Groups";
    let itemCount = props.possibleValues.length;
    const wrapper = mount(ControlDropdown, {
      props: {
        ...props,
        placeholder,
        includePlaceholder: true,
      },
    });
    expect(wrapper.find({ ref: "ul" }).findAll("[role=option]").length).toBe(
      itemCount + 1,
    );
    expect(
      wrapper.vm.localValues.some((item) => item.text === placeholder),
    ).toBe(true);
  });

  it("sets the correct aria-* attributes", () => {
    const wrapper = mount(ControlDropdown, {
      props,
    });

    let button = wrapper.find("[role=button]");
    expect(button.attributes("aria-label")).toBe(props.ariaLabel);
  });

  it("renders modelValue text or placeholder if no or empty modelValue set", async () => {
    let placeholder = "my-placeholder";
    const wrapper = mount(ControlDropdown, {
      props: {
        ...props,
        placeholder,
        modelValue: "test3",
      },
    });

    let button = wrapper.find("[role=button]");
    expect(button.text()).toBe("Text 3");

    await wrapper.setProps({ modelValue: undefined });
    expect(button.text()).toBe(placeholder);
    await wrapper.setProps({ modelValue: "" });
    expect(button.text()).toBe(placeholder);
  });

  it("renders a missing value icon if missing value set", async () => {
    const wrapper = mount(ControlDropdown, {
      props: {
        ...props,
        possibleValues: [...props.possibleValues, { id: null, text: null }],
        modelValue: "test3",
      },
    });

    const button = wrapper.find("[role=button]");
    expect(button.text()).toBe("Text 3");
    expect(button.findComponent(CircleHelpIcon).exists()).toBeFalsy();

    await wrapper.setProps({ modelValue: null });
    expect(button.findComponent(CircleHelpIcon).exists()).toBeTruthy();
  });

  it("renders value text using a formatter function if provided", async () => {
    let placeholder = "my-placeholder";
    const wrapper = mount(ControlDropdown, {
      props: {
        ...props,
        placeholder,
        formatter: (group) => `Grouped by '${group}'`,
        modelValue: "test1",
      },
    });

    let button = wrapper.find("[role=button]");
    expect(button.text()).toBe("Grouped by 'Text 1'");
    await wrapper.setProps({ modelValue: "test3" });
    expect(button.text()).toBe("Grouped by 'Text 3'");
  });

  it("emits an empty value input event if placeholder included and selected", () => {
    let placeholder = "Groups";
    const wrapper = mount(ControlDropdown, {
      props: {
        ...props,
        placeholder,
        includePlaceholder: true,
      },
    });
    let placeholderItemIndex = wrapper.vm.localValues.findIndex(
      (item) => item.text === placeholder,
    );
    let input = wrapper
      .find({ ref: "ul" })
      .findAll("li[role=option]")
      .at(placeholderItemIndex);
    input.trigger("click");
    expect(wrapper.emitted()["update:modelValue"][0][0]).toBe("");
  });

  it("opens the listbox on click of button and emits event for clicked value", async () => {
    const wrapper = mount(ControlDropdown, {
      props,
    });
    const newValueIndex = 1;
    const listbox = wrapper.find({ ref: "ul" });

    // open list
    wrapper.find("[role=button]").trigger("click");
    await wrapper.vm.$nextTick();
    expect(listbox.isVisible()).toBe(true);

    const input = listbox.findAll("li[role=option]").at(newValueIndex);
    input.trigger("click");

    expect(wrapper.emitted()["update:modelValue"][0][0]).toEqual(
      props.possibleValues[newValueIndex].id,
    );

    // listbox closed
    await wrapper.vm.$nextTick();
    expect(listbox.isVisible()).toBe(false);
  });

  it("renders a missing value icon when item.id is null, else it renders the item.text within the options", () => {
    const wrapper = mount(ControlDropdown, {
      props: {
        ...props,
        possibleValues: [...props.possibleValues, { id: null, text: null }],
        value: "test3",
      },
    });
    const listbox = wrapper.find({ ref: "ul" });
    const options = listbox.findAll("[role=option]");
    expect(options[0].find("span").text()).toBe("Text 1");
    expect(options[0].findComponent(CircleHelpIcon).exists()).toBeFalsy();
    expect(options[4].find("span").text()).toBe("Text 5");
    expect(options[4].findComponent(CircleHelpIcon).exists()).toBeFalsy();
    expect(options[5].find("span").exists()).toBeFalsy();
    expect(options[5].findComponent(CircleHelpIcon).exists()).toBeTruthy();
  });

  it("excludes possible values with undefined id", () => {
    const wrapper = mount(ControlDropdown, {
      props: {
        ...props,
        possibleValues: [
          ...props.possibleValues,
          { id: undefined, text: undefined },
        ],
        value: "test3",
      },
    });
    const listbox = wrapper.find({ ref: "ul" });
    const options = listbox.findAll("[role=option]");
    expect(wrapper.vm.possibleValues).toHaveLength(6);
    expect(options).toHaveLength(5);
  });

  describe("dropdown navigation", () => {
    let props;

    beforeEach(() => {
      props = {
        possibleValues: [
          {
            id: "test1",
            text: "test1",
          },
          {
            id: "test2",
            text: "test2",
          },
          {
            id: "test3",
            text: "test3",
          },
        ],
        ariaLabel: "foo",
      };
    });

    it("does not call keydown callback when not expanded", () => {
      const wrapper = mount(ControlDropdown, { props });

      wrapper.find('[role="button"]').trigger("keydown");

      expect(dropdownNavigation.onKeydown).toHaveBeenCalledTimes(0);
    });

    it("calls keydown callback when expanded", () => {
      const wrapper = mount(ControlDropdown, { props });

      wrapper.find('[role="button"]').trigger("keydown.space");
      wrapper.find('[role="button"]').trigger("keydown");

      expect(dropdownNavigation.onKeydown).toHaveBeenCalled();
    });

    it("marks active element", () => {
      const wrapper = mount(ControlDropdown, { props });
      wrapper.find('[role="button"]').trigger("click");
      const currentfocusedIndex = dropdownNavigation.currentIndex.value;
      const popover = wrapper.find({ ref: "ul" });
      const options = popover.findAll(".focused");
      expect(options.length).toBe(1);
      expect(options[0].html()).toContain(
        props.possibleValues[currentfocusedIndex].text,
      );
    });

    /**
     * TODO: Use shallow mount in this test again once this does not throw an error anymore due to https://github.com/vuejs/core/issues/10214
     */
    it("uses close function which emits @close", () => {
      useDropdownNavigation.mockClear();
      const wrapper = mount(ControlDropdown, { props });
      const { close } = useDropdownNavigation.mock.calls[0][0];
      wrapper.find('[role="button"]').trigger("click");

      expect(wrapper.vm.isExpanded).toBe(true);
      close();
      expect(wrapper.vm.isExpanded).toBe(false);
    });

    describe("getNextElement", () => {
      let elementClickSpy, getNextElement, getElement;

      beforeEach(() => {
        useDropdownNavigation.mockClear();
        const wrapper = mount(ControlDropdown, {
          props,
          attachTo: document.body,
        });
        wrapper.find('[role="button"]').trigger("click");
        getNextElement = useDropdownNavigation.mock.calls[0][0].getNextElement;
        getElement = (i) => {
          const popover = wrapper.find({ ref: "ul" });
          return popover.findAll("li")[i].element;
        };
        elementClickSpy = (i) => {
          const element = getElement(i);
          return vi.spyOn(element, "click");
        };
      });

      const expectNextElement = ({ index, onClick }, expectedIndex) => {
        expect(index).toBe(expectedIndex);
        const clickSpy = elementClickSpy(index);
        clickSpy.mockClear();
        onClick();
        expect(clickSpy).toHaveBeenCalled();
      };

      it("yields the first element on downward navigation if there is no previous selection", () => {
        expectNextElement(getNextElement(-1, 1), 0);
      });

      it("yields next element on downwards navigation and wraps around", () => {
        expectNextElement(getNextElement(0, 1), 1);
        expectNextElement(getNextElement(1, 1), 2);
        expectNextElement(getNextElement(2, 1), 0);
      });

      it("yields the last element on upwards navigation if there is no previous selection", () => {
        expectNextElement(getNextElement(null, -1), 2);
      });

      it("yields next element on upwards navigation and wraps around", () => {
        expectNextElement(getNextElement(2, -1), 1);
        expectNextElement(getNextElement(1, -1), 0);
        expectNextElement(getNextElement(0, -1), 2);
      });

      it("yields first element", () => {
        const getFirstElement =
          useDropdownNavigation.mock.calls[0][0].getFirstElement;
        expectNextElement(getFirstElement(), 0);
      });

      it("yields last element", () => {
        const getLastElement =
          useDropdownNavigation.mock.calls[0][0].getLastElement;
        expectNextElement(getLastElement(), 2);
      });

      it("scrolls to next element", () => {
        getNextElement(-1, 1);
        expect(scrollToElement.scrollTo).toHaveBeenCalledWith(getElement(0));
      });
    });

    it("sets aria-owns and aria-activedescendant label", () => {
      const wrapper = shallowMount(ControlDropdown, { props });
      const button = wrapper.find('[role="button"]');
      const selectedElementId = wrapper.find({ ref: "ul" }).find(".focused")
        .element.id;
      expect(button.attributes("aria-owns")).toBe(selectedElementId);
      expect(button.attributes("aria-activedescendant")).toBe(
        selectedElementId,
      );
    });

    /**
     * TODO: Use shallow mount in this test again once this does not throw an error anymore due to https://github.com/vuejs/core/issues/10214
     */
    it("resets navigation on toggle", () => {
      const wrapper = mount(ControlDropdown, { props });
      const button = wrapper.find('[role="button"]');
      button.trigger("click");
      expect(dropdownNavigation.resetNavigation).toHaveBeenCalled();
    });
  });

  it("uses scroll to element composable", () => {
    useScrollToElement.mockClear();
    const wrapper = mount(ControlDropdown, { props });
    const [{ toggleButton }] = useScrollToElement.mock.calls[0];
    expect(toggleButton.value).toStrictEqual(
      wrapper.find('[role="button"]').element,
    );
  });

  describe("dropdown popover", () => {
    it("uses dropdown floating ui", () => {
      useDropdownFloating.mockClear();
      const wrapper = shallowMount(ControlDropdown, {
        props: {
          possibleValues: [
            {
              id: "test1",
              text: "test1",
            },
            {
              id: "test2",
              text: "test2",
            },
            {
              id: "test3",
              text: "test3",
            },
          ],
          ariaLabel: "foo",
        },
      });
      const [referenceEl, floatingElement, openUp] =
        useDropdownFloating.mock.calls[0];

      expect(unref(referenceEl)).toStrictEqual(
        wrapper.find('[role="button"]').element,
      );
      expect(unref(floatingElement)).toStrictEqual(
        wrapper.find({ ref: "ul" }).element,
      );
      expect(openUp).toBe(false);
    });

    it("reverses direction on openUp", () => {
      useDropdownFloating.mockClear();
      shallowMount(ControlDropdown, {
        props: {
          possibleValues: [
            {
              id: "test1",
              text: "test1",
            },
            {
              id: "test2",
              text: "test2",
            },
            {
              id: "test3",
              text: "test3",
            },
          ],
          ariaLabel: "foo",
          openUp: true,
        },
      });
      const openUp = useDropdownFloating.mock.calls[0][2];
      expect(openUp).toBe(true);
    });
  });

  it("uses click outside", () => {
    useClickOutside.mockClear();
    const wrapper = mount(ControlDropdown, {
      props: {
        possibleValues: [
          {
            id: "test1",
            text: "test1",
          },
          {
            id: "test2",
            text: "test2",
          },
          {
            id: "test3",
            text: "test3",
          },
        ],
        ariaLabel: "foo",
      },
    });
    const [{ targets, callback }, active] = useClickOutside.mock.calls[0];

    expect(targets.length).toBe(2);
    expect(targets[0].value).toStrictEqual(
      wrapper.find('[role="button"]').element,
    );
    expect(targets[1].value).toStrictEqual(wrapper.find({ ref: "ul" }).element);
    expect(active.value).toBe(wrapper.vm.isExpanded);

    wrapper.find('[role="button"]').trigger("click");
    expect(wrapper.vm.isExpanded).toBe(true);
    callback();
    expect(wrapper.vm.isExpanded).toBe(false);
  });
});
