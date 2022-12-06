import { ref, computed } from 'vue';

export default ({ allColumnsData: { allColumnHeaders, allColumnKeys, allColumnTypes }, initialColumns }) => {
    const currentAllColumnOrder = ref(allColumnKeys.map((item, colInd) => colInd));
    const allHeadersOrdered = computed(
        () => currentAllColumnOrder.value.map(colInd => allColumnHeaders[colInd])
    );
    const currentIndices = ref(
        initialColumns.map(col => allColumnKeys.indexOf(col)).filter(ind => ind > -1).sort((a, b) => a > b)
    );
        
    const onColumnUpdate = (newColumnList) => {
        consola.debug(`Table received: columnUpdate ${newColumnList}`);
        let x = newColumnList.map(col => allHeadersOrdered.value.indexOf(col)).sort((a, b) => a - b);
        currentIndices.value = x.map(colInd => currentAllColumnOrder.value[colInd]);
    };


    const onColumnReorder = (colInd, newColInd) => {
        consola.debug(`Table received: columnReorder ${colInd} ${newColInd}`);
        let trueColumnInd = currentAllColumnOrder.value[colInd];
        let newAllColumns = currentAllColumnOrder.value.filter(col => col !== trueColumnInd);
        newAllColumns.splice(newColInd, 0, trueColumnInd);
        currentAllColumnOrder.value = newAllColumns;
        if (currentIndices.value.includes(trueColumnInd)) {
            let tempCurrentColumns = currentAllColumnOrder.value
                .filter(orderedColInd => currentIndices.value.includes(orderedColInd));
            currentIndices.value = tempCurrentColumns;
        }
    };

    const filterByColumn = (localData) => localData?.length
        ? currentIndices.value.map(colInd => localData[colInd])
        : [];

    const currentKeys = computed(() => filterByColumn(allColumnKeys));

    const currentHeaders = computed(() => filterByColumn(allColumnHeaders));

    const currentTypes = computed(() => filterByColumn(Object.values(allColumnTypes)));

    return {
        onColumnUpdate,
        onColumnReorder,
        filterByColumn,
        allHeadersOrdered,
        currentColumns: {
            indices: currentIndices,
            keys: currentKeys,
            headers: currentHeaders,
            subHeaders: currentTypes,
            types: currentTypes
        }
    };
};
