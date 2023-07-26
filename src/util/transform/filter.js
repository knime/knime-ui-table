import { columnTypes } from "@/config/table.config";
import { tableTimeFilters, checkTimeFilter } from "@/config/time.config";
import { searchRow, searchCell } from "./search";
import { isEmpty, unpackObjectRepresentation } from "..";

/**
 * Utility function designed to consume an entire data set and output only the rows which match the provided
 * filter state. This filtering happens on three levels:
 *
 *      1.) Time filtering- if a time filter is provided with a DateTime column, any data outside of this range
 *          will be excluded from the returned data subset. If either parameter is omitted, then no filtering on
 *          DateTime will be performed.
 *      2.) Search filtering- if a search query is provided, the data set will be checked for matching rows on a
 *          global level- meaning any match in any column will satisfy this condition and move on for further
 *          filtering. If this search query is omitted, all data which passed the time filter (if provided), will
 *          continue on to column filtering.
 *      3.) Column filtering- if there are active column filters for the data set, each row will be checked on a
 *          columnar basis for values matching the filter configuration for that column. This filtering is type
 *          sensitive (defined in @see table.config.js ).
 *
 * @param {Object} filterConfig - the object mapping of the required fields for filtering the data.
 * @param {Object[]} filterConfig.data - the data set to process.
 * @param {String[]} filterConfig.columnKeys - the column keys for the row Objects of the currently displayed data.
 *      Should only be the currently displayed columns, because users only want to filter based on the information
 *      currently displayed.
 * @param {Object} filterConfig.formatters - a columnKey/function mapping for the formatting functions of the column
 *      data. Enables filtering on the data the user is viewing, as opposed to the raw data values which may have
 *      undergone some point-wise transformations depending on the table configuration.
 * @param {Object} filterConfig.types - a columnKey/type (@see table.config.js ) mapping for the columns in the data
 *      set. Allows data-type specific filtering.
 * @param {String} [filterConfig.timeFilter] - the optional active time filter value. Possible values are the keys
 *      found in @see time.config.js . If none is provided, no time filtering will be performed.
 * @param {String} [filterConfig.timeFilterKey] - the optional columnKey of the DateTime column which should be used
 *      for time filtering. Require IFF a timeFilter has been provided.
 * @param {String} [filterConfig.searchQuery] - the optional global search query active for the dataset. If none is
 *      provided, no global search or filtering will be performed.
 * @param {Object} [filterConfig.showFilter] - if column filters should be applied to the data. Provided explicitly
 *      for performance reason so potentially expensive column filtering can be avoided if inactive.
 * @param {Object} [filterConfig.filterValues] - the columnKey/value mapping for any currently active column-specific
 *      filters. If no filters are active and showFilter is true, an empty Object should be provided.
 * @returns {Object} filteredDataConfig - contains the results of the filtering operations.
 * @returns {Object[]} filteredDataConfig.filteredData - the rows which passed all provided filtering operations.
 * @returns {Number[]} filteredDataConfig.filteredIndicies - an array of the original row indicies for the filtered
 *      data subset. Can be used for tracking transformations of the data.
 */
export const filter = (filterConfig) => {
  let {
    data,
    columnKeys,
    formatters,
    types,
    timeFilter,
    timeFilterKey,
    searchQuery,
    showFilter,
    filterValues,
  } = filterConfig;
  let localColumnTypes = columnKeys.map((colKey) => types[colKey]);
  let filters = Object.entries(filterValues);
  let columnFormatters = Object.values(formatters);
  let filteredIndicies = [];
  let filteredData = data.filter((row, rowInd) => {
    if (timeFilter) {
      let inTimeFilter = checkTimeFilter(
        row[timeFilterKey],
        tableTimeFilters[timeFilter],
      );
      if (!inTimeFilter) {
        return false;
      }
    }
    let rowValues = columnKeys.map((colKey) => row[colKey]);
    let shouldSearch = searchQuery && searchQuery.length;
    if (
      shouldSearch &&
      !searchRow(rowValues, localColumnTypes, columnFormatters, searchQuery)
    ) {
      return false;
    }
    if (!showFilter || filters.length === 0) {
      filteredIndicies.push(rowInd);
      return true;
    }
    let inFilter = filters.every((entry) => {
      let colKey = entry[0];
      let filterVal = entry[1];
      let colInd = columnKeys.indexOf(colKey);
      let columnType = localColumnTypes[colInd];
      let colFormatter = columnFormatters[colInd];
      let rowValue = unpackObjectRepresentation(row[colKey]);
      const formattedRowValue = colFormatter
        ? colFormatter(rowValue)
        : rowValue;
      if (filterVal === null) {
        return rowValue === null;
      }
      if (
        typeof filterVal === "undefined" ||
        filterVal === "" ||
        (Array.isArray(filterVal) && filterVal.length === 0)
      ) {
        return true;
      }
      if (isEmpty(rowValue)) {
        return false;
      }
      switch (columnType) {
        case columnTypes.Nominal: {
          return filterVal.includes(formattedRowValue);
        }
        case columnTypes.Number:
        case columnTypes.String:
        case columnTypes.DateTime:
        case columnTypes.Object:
        case columnTypes.Array:
          return searchCell(rowValue, columnType, colFormatter, filterVal);
        case columnTypes.Boolean:
          return filterVal.includes(
            colFormatter ? colFormatter(rowValue) : rowValue.toString(),
          );
        // return filterVal.includes(rowValue.toString());
        default:
          return true;
      }
    });
    if (inFilter) {
      filteredIndicies.push(rowInd);
    }
    return inFilter;
  });
  return { filteredData, filteredIndicies };
};
