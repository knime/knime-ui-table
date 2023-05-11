import { columnFilterConfigs } from '../config/table.config';

export const getDefaultFilterValues = (columns, types) => columns.reduce((obj, col) => {
    obj[col] = columnFilterConfigs[types[col]].value();
    return obj;
}, {});

export const getInitialFilterValues = (columns, types, initialFilterValues) => columns.reduce((obj, col) => {
    obj[col] = initialFilterValues.hasOwnProperty(col)
        ? initialFilterValues[col]
        : columnFilterConfigs[types[col]].value();
    return obj;
}, {});

export const getFilterConfigs = ({ domains, columns, types, values }) => columns.map(col => {
    let config = {
        ...columnFilterConfigs[types[col]],
        value: values[col]
    };

    if (domains[col]) {
        config.possibleValues = domains[col].map(val => ({ id: val, text: val }));
    }
    return config;
});
