import type PossibleValue from "./PossibleValue";

export enum FilterComponent {
  ControlDropdown,
  ControlMultiselect,
  FilterInputField,
}

export interface FilterConfigBase {
  placeholder?: string;
}

export type FilterConfigDropdownBase = FilterConfigBase & {
  possibleValues: PossibleValue[];
};

export type FilterConfigDropdown = FilterConfigDropdownBase & {
  is: "ControlDropdown";
  modelValue?: string;
};

export type FilterConfigMultiselect = FilterConfigDropdownBase & {
  is: "ControlMultiselect";
  modelValue?: Array<string>;
};

export type FilterConfigInput = FilterConfigBase & {
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
