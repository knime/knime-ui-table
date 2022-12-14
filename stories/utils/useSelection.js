import { computed, ref, unref, watch } from 'vue';

export default ({
    totalTableSize,
    processedIndicies,
    paginatedIndicies
}) => {
    const initMasterSelected = () => Array(unref(totalTableSize)).fill(0);

    const masterSelected = ref(initMasterSelected());

    watch(() => totalTableSize.value, () => {
        masterSelected.value = initMasterSelected();
    });
   
    const paginatedSelection = computed(() => paginatedIndicies.value?.map(
        group => group.map(rowInd => Boolean(masterSelected.value[rowInd]))
    ));
        
    const totalSelected = computed(() => masterSelected.value?.reduce((count, isSelected) => count + isSelected, 0));
  
    const onSelectAll = (selected) => {
        consola.debug(`Table received: selectAll ${selected}`);
        const newSelection = masterSelected.value.map(
            (_, i) => selected && processedIndicies.value.some(group => group.includes(i)) ? 1 : 0
        );
        masterSelected.value = newSelection;
    };
        
    const onRowSelect = (selected, rowInd, groupInd) => {
        consola.debug(
            `Table received: rowSelect ${selected} ${rowInd} ${groupInd} ${paginatedIndicies.value}`
        );
        const masterSelectedIndex = paginatedIndicies.value[groupInd][rowInd];
        masterSelected.value[masterSelectedIndex] = selected ? 1 : 0;
    };
        
    return { totalSelected, onSelectAll, onRowSelect, paginatedSelection };
};
