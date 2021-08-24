import { columnTypes, columnTypeEmptyFilters } from '../config/table.config';

export const getColumnDomains = (columnFilterConfig) => {
    let {
        data,
        formatters,
        types
    } = columnFilterConfig;
    let filterConfigs = {};
    let typeMap = Object.entries(types).reduce((obj, [col, type]) => {
        // treat boolean as nominal (as they can have formatted domains)
        if (type === columnTypes.Boolean) {
            type = columnTypes.Nominal;
        }
        if ([columnTypes.Nominal, columnTypes.Number].includes(type)) {
            obj[type].push(col);
            filterConfigs[col] = {
                domain: columnTypes.Number === type ? [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY] : new Set(),
                value: []
            };
        } else {
            filterConfigs[col] = { value: '' };
        }
        return obj;
    }, { [columnTypes.Nominal]: [], [columnTypes.Number]: [] });
    data.forEach(row => {
        typeMap[columnTypes.Nominal].forEach(col => {
            filterConfigs[col].domain.add(formatters[col] ? formatters[col](row[col]) : row[col]);
        });
        typeMap[columnTypes.Number].forEach(col => {
            filterConfigs[col].domain[0] = Math.min(row[col], filterConfigs[col].domain[0]);
            filterConfigs[col].domain[1] = Math.max(row[col], filterConfigs[col].domain[1]);
        });
    });
    typeMap[columnTypes.Nominal].forEach(col => {
        filterConfigs[col] = {
            domain: Array.from(filterConfigs[col].domain.values())
        };
    });
    return filterConfigs;
};

export const getEmptyFilters = (columns, types) => columns.reduce((obj, col) => {
    obj[col] = columnTypeEmptyFilters[types[col]];
    return obj;
}, {});
