/**
 * Utility for checking the current pagination state and providing the correct page
 * number if the current state is invalid. Invalid page states include a current page
 * number which is outside of the range of the filtered data, a page size which is
 * larger than the total number of rows in the data or a paginated data set size of 0.
 *
 * @param {Number} pageSize - the current page size (in number of rows per page).
 * @param {Number} currentPage - the current page number to check.
 * @param {Number} availableRows - the number of rows in the filtered data set.
 * @param {Number} pageRows - the number of rows in the current paginated data set.
 * @returns {Number|null} new page number or null of no update is needed.
 */
export const getNextPage = (pageSize, currentPage, availableRows, pageRows) => {
    if (pageSize > availableRows) {
        return 1;
    } else if (pageSize * currentPage > availableRows || pageRows < 1) {
        let newPageNumber = currentPage;
        while (newPageNumber >= 1) {
            if (pageSize * newPageNumber > availableRows) {
                newPageNumber -= 1;
            } else {
                break;
            }
        }
        return newPageNumber;
    }
    return null;
};
