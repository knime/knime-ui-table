import { columnTypes } from '@/config/table.config';

/**
 * Utility function to search a single cell. Formatters are required for the following table data types:
 * Number, String, Nominal, DateTime, Boolean. Errors thrown during search will assume no match was found
 * and return false. Additionally, if no type is supplied, `toString` will be called on the item. Objects
 * and Arrays are stringified to perform a 'deep search'.
 *
 * ** All searches are case insensitive **
 *
 * @param {*} field - the item to search.
 * @param {String} type - the table data type for the search item.
 * @param {Function} formatter - the formatting function to apply to the item before searching.
 * @param {String} query - the search term to locate in the item.
 * @returns {Boolean} - if a match was found.
 */
export const searchCell = (field, type, formatter, query) => {
    if (typeof field === 'undefined') {
        return false;
    }
    try {
        let formattedData;
        switch (type) {
            case columnTypes.Number:
            case columnTypes.String:
            case columnTypes.Nominal:
            case columnTypes.DateTime:
            case columnTypes.Boolean:
                formattedData = formatter(field);
                break;
            case columnTypes.Array:
            case columnTypes.Object:
                formattedData = JSON.stringify(field);
                // search both JSON data and displayed value if custom formatter provided
                if (formatter?.name && !columnTypes[formatter.name]) {
                    formattedData += formatter(field);
                }
                break;
            default:
                formattedData = field.toString();
        }
        return formattedData.search(new RegExp(query.trim(), 'i')) > -1;
    } catch (err) {
        return false;
    }
};

/**
 * Utility for searching an entire row of values. For specifics of the search dynamics, please @see searchCell.
 *
 * @param {*[]} row - an array of values to search.
 * @param {String[]} types - an array of types for the values in the row.
 * @param {Function[]} formatters - an array of formatting functions for values.
 * @param {String} query - the search query to locate in the provided row.
 * @returns {Boolean} - if the query has been matched with an item in the row.
 */
export const searchRow = (row, types, formatters, query) => row
    .some((data, colInd) => searchCell(data, types[colInd], formatters[colInd], query));
