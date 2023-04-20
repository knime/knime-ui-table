import { isMissingValue, isEmpty } from '..';

const missingValueSymbol = Symbol('Missing');

/**
 * Utility function for grouping rows in the provided data based on nominal group membership. This group membership
 * is determined by the provided column name and key. If there is no group currently, the function will return a
 * formatted object mapping for the placeholder group 'None' which can then be ignored, but processed in the same
 * way as grouped data. For rows with a missing nominal column value, they will be mapped to the group 'Missing'
 * unless there is already a nominal group mapped to missing (as is sometimes the case with pre-processed data).
 * In this case, a fallback group will be created for 'No group'.
 *
 * This method also expects to receive an array of indicies corresponding to the rows in the master dataset. This
 * allows for transformation tracking during grouping to enable selection or other row-specific actions and events
 * on the returned grouped data.
 *
 * @param {Object} groupConfig - the configuration options to use during grouping.
 * @param {Object[]} groupConfig.sortedData - an array of row data as individual JSON objects in the array.
 * @param {String} groupConfig.groupColumn - the group-by column name (as displayed in the header).
 * @param {String} groupConfig.groupColumnKey - the key representation of the group-by column as found in the row
 *      JSON objects of the sortedData.
 * @param {Number[]} groupConfig.filteredIndicies - the original row indicies of the data filtered/sorted/mutated in
 *      in the same transformation as the sortedData. Used to track method transformations.
 * @returns {Object} groupedDataConfig - a map of group transformation information.
 * @returns {Object} groupedDataConfig.groupedData - an object mapping of group data and the index of the group name in
 *      the groupTitles list.
 * @returns {Array[]} groupedDataConfig.groupedData.data - an array of arrays, each containing a single group of row
 *      JSON objects.
 * @returns {Number} groupedDataConfig.groupedData.groupInd - the index of the group in the groupTitles list.
 * @returns {Array[]} groupedDataConfig.groupedIndicies - an array of arrays of numbers; the arrays representing groups
 *      and the numbers the original indicies.
 * @returns {Array} groupedDataConfig.groupTitles - a list of Group names
 */
export const group = groupConfig => {
    let {
        filteredData,
        groupColumn,
        groupColumnKey,
        filteredIndicies
    } = groupConfig;
    let returnValue = {
        groupedData: {},
        groupedIndicies: [],
        groupTitles: []
    };
    if (!groupColumn || groupColumn === 'None') {
        returnValue.groupedIndicies.push(filteredIndicies);
        returnValue.groupTitles.push('None');
        returnValue.groupedData = [
            {
                data: filteredData,
                groupInd: 0
            }
        ];
        return returnValue;
    }
    let containsMissingGroupFromString = false;
    returnValue.groupedData = filteredData
        .reduce((map, row, rowInd) => {
            let rowGroup = row[groupColumnKey];
            if (isEmpty(rowGroup) || isMissingValue(rowGroup)) {
                rowGroup = missingValueSymbol;
            } else if (rowGroup === missingValueSymbol.description) {
                containsMissingGroupFromString = true;
            }
            if (typeof map[rowGroup] === 'undefined') {
                returnValue.groupTitles.push(rowGroup);
                let indexTracker = returnValue.groupedIndicies.push([]);
                map[rowGroup] = {
                    data: [],
                    groupInd: indexTracker - 1
                };
            }
            returnValue.groupedIndicies[map[rowGroup].groupInd].push(filteredIndicies[rowInd]);
            map[rowGroup].data.push(row);
            return map;
        }, {});
    let orderedGroups = [];
    returnValue.groupTitles = returnValue.groupTitles.sort((group1, group2) => {
        if (group1 === missingValueSymbol) {
            return 1;
        } else if (group2 === missingValueSymbol) {
            return -1;
        }
        return group1.toLowerCase() > group2.toLowerCase() ? 1 : -1;
    }).map(group => {
        orderedGroups.push(returnValue.groupedData[group]);
        if (group === missingValueSymbol) {
            return containsMissingGroupFromString ? 'No group' : missingValueSymbol.description;
        }
        return group;
    });
    returnValue.groupedData = orderedGroups;

    return returnValue;
};
