import type PossibleValue from './PossibleValue';

interface FilterConfigBase {
    placeholder: string
}

type FilterConfigDropdownBase = FilterConfigBase & {
    possibleValues: PossibleValue[]
}

type FilterConfigDropdown = FilterConfigDropdownBase & {
    is: 'FilterDropdown'
    value: string
}

type FilterConfigMultiselect = FilterConfigDropdownBase & {
    is: 'FilterMultiselect'
    value: Array<string>
}

type FilterConfigInput = FilterConfigBase & {
    is: 'FilterInputField'
    disabled?: boolean,
    value: number | string
}

type FilterConfig = FilterConfigDropdown | FilterConfigMultiselect | FilterConfigInput;

export default FilterConfig;
