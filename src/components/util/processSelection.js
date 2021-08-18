/**
 * Take a relative row id from a selection event and return the processed index.
 *
 * @param {*} param
 * @param {Number} param.relativeInd - row index provided by event.
 * @param {Number} param.groupInd - row group index provided by event.
 * @param {Number} param.currentPage - the current page number from the table.
 * @param {Number} param.currentPageSize - the current page size from the table.
 * @param {Number} [param.currentGroup] - the current group-by group (if present).
 * @param {Array<Array<Number>>} param.processedIndicies - the grouped and sorted index mapping.
 * @returns {int} index from processed mapping
 */
export const getProcessedRowInd = ({
    relativeInd,
    groupInd,
    currentPage,
    currentPageSize,
    currentGroup,
    processedIndicies
}) => {
    let pageStart = currentPageSize * (currentPage - 1);
    if (pageStart === 0) {
        return relativeInd;
    }
    if (currentGroup) {
        let indCount = 0;
        processedIndicies.forEach((group, gInd) => {
            if (gInd < groupInd) {
                indCount += group.length;
            }
        });
        if (indCount <= pageStart) {
            return pageStart - indCount + relativeInd;
        }
        return relativeInd;
    }
    return relativeInd + pageStart;
};
