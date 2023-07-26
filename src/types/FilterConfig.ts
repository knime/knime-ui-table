import type PossibleValue from "./PossibleValue";

export enum FilterComponent {
  ControlDropdown,
  ControlMultiselect,
  FilterInputField,
}

interface FilterConfigBase {
  placeholder?: string;
}

type FilterConfigDropdownBase = FilterConfigBase & {
  possibleValues: PossibleValue[];
};

type FilterConfigDropdown = FilterConfigDropdownBase & {
  is: "ControlDropdown";
  modelValue?: string;
};

type FilterConfigMultiselect = FilterConfigDropdownBase & {
  is: "ControlMultiselect";
  modelValue?: Array<string>;
};

type FilterConfigInput = FilterConfigBase & {
  is: "FilterInputField";
  disabled?: boolean;
  modelValue?: number | string;
};

type FilterConfig = (
  | FilterConfigDropdown
  | FilterConfigMultiselect
  | FilterConfigInput
) & {
  is: keyof typeof FilterComponent;
};

export default FilterConfig;
