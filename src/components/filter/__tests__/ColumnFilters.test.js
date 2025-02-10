import { describe, expect, it } from "vitest";
import { shallowMount } from "@vue/test-utils";

import { FunctionButton } from "@knime/components";
import TrashIcon from "@knime/styles/img/icons/trash.svg";

import ControlDropdown from "../../control/ControlDropdown.vue";
import ControlMultiselect from "../../control/ControlMultiselect.vue";
import ColumnFilters from "../ColumnFilters.vue";
import FilterInputField from "../FilterInputField.vue";

describe("ColumnFilters.vue", () => {
  let props = {
    columnHeaders: ["User", "Count", "Enabled"],
    columnSizes: [33, 33, 33],
    filterConfigs: [
      {
        is: "ControlMultiselect",
        modelValue: [],
        possibleValues: [
          { id: "Root", text: "Root" },
          { id: "Alice", text: "Alice" },
          { id: "Bob", text: "Bob" },
        ],
        placeholder: "Column1",
      },
      { is: "FilterInputField", modelValue: "", placeholder: "Column2" },
      {
        is: "ControlDropdown",
        modelValue: "",
        possibleValues: [
          { id: "Yes", text: "Yes" },
          { id: "No", text: "No" },
          { id: "-", text: "-" },
        ],
        placeholder: "Column3",
      },
    ],
  };

  it("renders column filters controls", () => {
    let wrapper = shallowMount(ColumnFilters, { props });

    expect(wrapper.findComponent(ColumnFilters).exists()).toBe(true);
    expect(wrapper.findComponent(ControlMultiselect).exists()).toBe(true);
    expect(wrapper.findComponent(ControlDropdown).exists()).toBe(true);
    expect(wrapper.findComponent(FilterInputField).exists()).toBe(true);
    expect(wrapper.findComponent(FunctionButton).exists()).toBe(true);
    expect(wrapper.findComponent(TrashIcon).exists()).toBe(true);
  });

  it("emits columnFilter events", () => {
    let wrapper = shallowMount(ColumnFilters, { props });
    expect(wrapper.emitted().columnFilter).toBeFalsy();
    wrapper
      .findComponent(FilterInputField)
      .vm.$emit("update:modelValue", "New Value");
    expect(wrapper.emitted().columnFilter).toBeTruthy();
    expect(wrapper.emitted().columnFilter[0]).toStrictEqual([1, "New Value"]);
  });

  it("emits clearFilter events", () => {
    let wrapper = shallowMount(ColumnFilters, { props });
    expect(wrapper.emitted().clearFilter).toBeFalsy();
    wrapper.findComponent(FunctionButton).vm.$emit("click");
    expect(wrapper.emitted().clearFilter).toBeTruthy();
  });
});
