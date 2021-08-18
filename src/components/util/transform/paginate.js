/**
 * Utility function to process grouped data into a single page of grouped data based on the current page size
 * and the start and end row indicies.
 *
 * @param {Object} paginationConfig - the configuration options to use during pagination.
 * @param {Array[]} paginationConfig.sortedData - a double-nested array of grouped, sorted data.
 *      @example: [
 *          [row1, row2,...],   // group1
 *          ...,
 *          [rowN, rowN+1, ...], // group2
 *      ]
 * @param {Number} paginationConfig.pageSize - the current number of items which should be shown per page.
 * @param {Number} paginationConfig.pageStart - the starting row index to include (zero indexed; inclusive).
 * @param {Number} paginationConfig.pageEnd - the row index of the first row to *exclude* from the page.
 * @returns {Array[]} paginatedData - the grouped data to display on the page. Excluded groups will be returned as
 *      empty arrays and empty data or empty pages will be represented as empty arrays as well.
 */
export const paginate = paginationConfig => {
    let {
        sortedData,
        pageSize,
        pageStart,
        pageEnd
    } = paginationConfig;
    let includedRows = 0;
    let totalRows = 0;
    return sortedData.map(dataGroup => {
        let groupCount = dataGroup.length;
        let groupStart = totalRows;
        let groupEnd = groupStart + groupCount;
        let remainingRows = pageSize - includedRows;
        let returnValue = [];
        let skipGroup = remainingRows <= 0 || groupEnd < pageStart || groupStart > pageEnd;
        let includeEntireGroup = remainingRows >= groupCount && groupStart >= pageStart && groupEnd <= pageEnd;
        if (skipGroup) {
            returnValue = [];
        } else if (includeEntireGroup) {
            returnValue = dataGroup;
        } else {
            let groupSliceStart = 0;
            let groupSliceEnd = groupCount;
            if (groupStart < pageStart) {
                groupSliceStart = pageStart - groupStart;
                if (groupCount - groupSliceStart > remainingRows) {
                    groupSliceEnd = groupSliceStart + remainingRows;
                }
            } else if (groupSliceStart + remainingRows < groupCount) {
                groupSliceEnd = groupSliceStart + remainingRows;
            }
            returnValue = dataGroup.slice(groupSliceStart, groupSliceEnd);
        }
        includedRows += returnValue.length;
        totalRows += groupCount;
        return returnValue;
    });
};
