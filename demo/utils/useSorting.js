import { ref, computed } from 'vue';
import { sort } from '@/util/transform/sort';

export default ({
    initialParameters: { initialSortColumn, initialSortDirection },
    currentColumns: { types: currentColumnTypes, keys: currentColumnKeys },
    groupColumnKey
}) => {
    const columnSort = ref(initialSortColumn);
    const columnSortDirection = ref(initialSortDirection);
    const sortData = ({ groupedData, groupedIndicies }) => {
        consola.trace('Sorting data.');
        // declare locally to avoid asynchronous behavior
        return sort({
            groupedData,
            groupedIndicies,
            groupColumnKey: groupColumnKey.value,
            columnKeys: currentColumnKeys.value,
            columnTypes: currentColumnTypes.value,
            sortColumn: columnSort.value,
            sortDirection: columnSortDirection.value
        });
    };
    const sortHash = computed(() => ({
        columnSort: columnSort.value,
        columnSortDirection: columnSortDirection.value
    }));
    
    const onColumnSort = (colInd) => {
        consola.debug(`Table received: columnSort ${colInd}`);
        let isNewColumn = columnSort.value !== colInd;
        if (isNewColumn) {
            columnSort.value = colInd;
            columnSortDirection.value = -1;
        } else {
            let ascendingSort = columnSortDirection.value === null || columnSortDirection.value < 0;
            columnSortDirection.value = ascendingSort ? 1 : -1;
        }
    };
    return { sortData, onColumnSort, sortHash, columnSort, columnSortDirection };
};
