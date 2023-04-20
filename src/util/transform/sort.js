import { columnTypes } from '@/config/table.config';
import { isEmpty, isMissingValue } from '..';

/**
 * Utility function for sorting a data set. This functionality sorts the entire dataset, but also performs sorts within
 * the grouped data. Additionally, transformations of the row order are tracked on an index level so original row order
 * can be tracked.
 *
 * @param {*} sortConfig - the object mapping of the required fields for sorting the data.
 * @param {Array[]} sortConfig.groupedData - an array of arrays, each containing a single group of row JSON objects.
 * @param {Array[]} sortConfig.groupedIndicies - an array of arrays of numbers; the arrays representing groups
 *      and the numbers the original indicies.
 * @param {String} sortConfig.groupColumnKey - the columnKey of the column currently being used as the "group-by"
 *      column.
 * @param {String[]} sortConfig.columnKeys - the column keys for the row Objects of the currently displayed data.
 * @param {Object} sortConfig.columnTypes - a columnKey/type (@see table.config.js ) mapping for the columns in the data
 *      set. Allows data-type specific sorting.
 * @param {String} [sortConfig.sortColumn] - the optional columnKey for the column which should be used to sort the data.
 *      If none is provided, no sorting will be performed.
 * @param {String} sortConfig.sortDirection - either 1 or -1 which correspond to ascending/descending respectively.
 * @returns {Object} sortedDataConfig - contains the results of the sorting operations.
 * @returns {Array[]} sortedDataConfig.sortedData - an array of arrays of row Objects. This data set will be grouped and
 *      sorted according to the provided configuration.
 * @returns {Number[]} sortedDataConfig.sortedIndicies - an array of the original row indicies grouped and sorted according
 *      to the previous grouping and the current sorting transformations which were performed.
 */
export const sort = sortConfig => {
    let {
        groupedData,
        groupedIndicies,
        groupColumnKey,
        columnKeys,
        columnTypes: currentColumnTypes,
        sortColumn,
        sortDirection
    } = sortConfig;

    return groupedData
        .map(({ data, groupInd }) => data
            .map((row, rowInd) => ({
                row,
                rowInd: groupedIndicies[groupInd][rowInd]
            }))
            .sort(({ row: row1 }, { row: row2 }) => {
                // only sort within groups
                if (sortColumn === null || (groupColumnKey && row1[groupColumnKey] !== row2[groupColumnKey])) {
                    return 0;
                }
                let columnKey = columnKeys[sortColumn];
                let columnType = currentColumnTypes[sortColumn];
                let rawVal1 = row1[columnKey];
                let rawVal2 = row2[columnKey];
                const val1EmptyOrMissing = isEmpty(rawVal1) || isMissingValue(rawVal1);
                const val2EmptyOrMissing = isEmpty(rawVal2) || isMissingValue(rawVal2);

                if (val1EmptyOrMissing && val2EmptyOrMissing) {
                    return 0;
                } else if (val1EmptyOrMissing) {
                    return 1;
                } else if (val2EmptyOrMissing) {
                    return -1;
                } else {
                    let order = 0;
                    if (columnType === columnTypes.Array && rawVal1.length !== rawVal2.length) {
                        order = rawVal1.length > rawVal2.length ? 1 : -1;
                    } else {
                        let val1comparison = JSON.stringify(row1[columnKey]);
                        let val2comparison = JSON.stringify(row2[columnKey]);
                        if (val1comparison !== val2comparison) {
                            order = val1comparison > val2comparison ? 1 : -1;
                        }
                    }
                    return order * sortDirection;
                }
            })
            .reduce((acc, mapItem) => {
                acc.data.push(mapItem.row);
                acc.indicies.push(mapItem.rowInd);
                return acc;
            }, { data: [], indicies: [] }))
        .reduce((acc, { data, indicies }) => {
            acc.sortedData.push(data);
            acc.sortedIndicies.push(indicies);
            return acc;
        }, { sortedData: [], sortedIndicies: [] });
};
