import { columnTypes } from '../config/table.config';
import { isMissingValue } from '.';

export default ({ data, formatters, types }) => {
    let domainMap = {};
    let nominalColumns = [];
    Object.entries(types).forEach(entry => {
        let [col, colType] = entry;
        // treat boolean as nominal (as they can have formatted domains)
        if ([columnTypes.Boolean, columnTypes.Nominal].includes(colType)) {
            nominalColumns.push(col);
            domainMap[col] = [];
        }
    });
    data.forEach(row => {
        nominalColumns.forEach(col => {
            let cellValue = formatters?.[col]?.(row[col]) || row[col];
            if (isMissingValue(cellValue)) {
                cellValue = null;
            }
            if (!domainMap[col].includes(cellValue)) {
                domainMap[col].push(cellValue);
            }
        });
    });
    return domainMap;
};
