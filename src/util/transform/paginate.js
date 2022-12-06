/**
 * Utility function to process grouped data into a single page of grouped data based on the current page size
 * and the start and end row indicies. Also creates an updated array for both paginated selection and indicies.
 *
 * @param {Object} paginationConfig - the configuration options to use during pagination.
 * @param {Array[]} paginationConfig.sortedData - a double-nested array containing the full set of filtered,
 *      grouped and sorted data.
 *      @example: [
 *          [row1, row2,...],   // group1
 *          ...,
 *          [rowN, rowN+1, ...], // group2
 *      ]
 * @param {Array[]} paginationConfig.processedIndicies - a double-nested array containing the full set of filtered,
 *      grouped,and sorted indicies which map to the indicies of the previously filtered, grouped and sorted row in
 *      the original data.
 * @param {Array[]} paginationConfig.processedSelection - a double-nested array containing the full set of filtered,
 *      grouped and sorted selection state.
 * @param {Number} paginationConfig.pageSize - the current number of items which should be shown per page.
 * @param {Number} paginationConfig.pageStart - the starting row index to include (zero indexed; inclusive).
 * @param {Number} paginationConfig.pageEnd - the row index of the first row to *exclude* from the page.
 * @returns {Object} paginatedResults - the results of the pagination. All values are double-nested arrays and excluded
 *      groups will be returned as empty arrays and empty data or empty pages will be represented as empty arrays as well.
 * @returns {Array[]} paginatedResults.paginatedData - the paginated data to display on the page.
 * @returns {Array[]} paginatedResults.paginatedSelection - the paginated selection to pass to the TableUI.vue component.
 * @returns {Array[]} paginatedResults.paginatedIndicies - the paginated indicies to map TableUI selection events to their
 *      original indicies.
 */
export const paginate = paginationConfig => {
    let {
        sortedData,
        processedIndicies,
        processedSelection = [],
        pageSize,
        pageStart,
        pageEnd
    } = paginationConfig;
    let includedRows = 0;
    let totalRows = 0;
    let paginatedSelection = [];
    let paginatedIndicies = [];
    let paginatedData = sortedData.map((dataGroup, groupInd) => {
        let groupCount = dataGroup.length;
        let groupStart = totalRows;
        let groupEnd = groupStart + groupCount;
        let remainingRows = pageSize - includedRows;
        let returnValue = [];
        let skipGroup = remainingRows <= 0 || groupEnd < pageStart || groupStart > pageEnd;
        let includeEntireGroup = remainingRows >= groupCount && groupStart >= pageStart && groupEnd <= pageEnd;
        if (skipGroup) {
            returnValue = [];
            paginatedSelection.push([]);
            paginatedIndicies.push([]);
        } else if (includeEntireGroup) {
            returnValue = dataGroup;
            paginatedSelection.push(processedSelection[groupInd]);
            paginatedIndicies.push(processedIndicies[groupInd]);
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
            paginatedSelection.push(processedSelection[groupInd]?.slice(groupSliceStart, groupSliceEnd));
            paginatedIndicies.push(processedIndicies[groupInd].slice(groupSliceStart, groupSliceEnd));
        }
        includedRows += returnValue.length;
        totalRows += groupCount;
        return returnValue;
    });
    return { paginatedData, paginatedSelection, paginatedIndicies };
};
