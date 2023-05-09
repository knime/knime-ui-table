import { columnFilterConfigs } from '../config/table.config';

export const getDefaultFilterValues = (
    columns: string[],
    types: Record<string, keyof typeof columnFilterConfigs>
) => columns.reduce((obj: Record<string, any>, col) => {
    obj[col] = columnFilterConfigs[types[col]].getInitialValue();
    return obj;
}, {});

export const getInitialFilterValues = (
    columns: string[],
    types: Record<string, keyof typeof columnFilterConfigs>,
    initialFilterValues: Record<string, any>
) => columns.reduce((obj: Record<string, any>, col) => {
    obj[col] = initialFilterValues.hasOwnProperty(col)
        ? initialFilterValues[col]
        : columnFilterConfigs[types[col]].getInitialValue();
    return obj;
}, {});

export const getFilterConfigs = (
    { domains, columns, types, values }:
    {
        domains: Record<string, string[]>,
        columns: string[],
        types: Record<string, keyof typeof columnFilterConfigs>,
        values: Record<string, any>
    }
) => columns.map((col: string) => ({
    is: columnFilterConfigs[types[col]].is,
    modelValue: values[col],
    ...domains[col] ? { possibleValues: domains[col].map(val => ({ id: val, text: val })) } : {}
}));
