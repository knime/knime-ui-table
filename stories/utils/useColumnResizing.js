import { ref, computed } from 'vue';

import throttle from 'raf-throttle';
import { MIN_COLUMN_SIZE } from '@/util/constants';

export default ({
    currentColumnIndices,
    spacerSettings: { showCollapser, withSelection, withColumnFilters }
}) => {
    const currentAvailableWidth = ref(0);
    const currentAllColumnSizes = ref({});
    const currentSetDefaultSize = ref(null);

    const updateAvailableWidth = (newAvaliableWidth) => {
        console.log(newAvaliableWidth);
        if (currentAvailableWidth.value) {
            // update all non-default column widths according to the relative change in client width
            const ratio = newAvaliableWidth / currentAvailableWidth.value;
            Object.keys(currentAllColumnSizes).forEach(key => {
                currentAllColumnSizes.value[key] *= ratio;
            });
            if (currentSetDefaultSize.value !== null) {
                currentSetDefaultSize.value *= ratio;
            }
            currentAvailableWidth.value = newAvaliableWidth;
        }
        currentAvailableWidth.value = newAvaliableWidth;
    };

    const currentColumnSizes = computed(() => {
        const n = currentColumnIndices.value.length;
        if (n < 1) {
            return [];
        }
        const currentDefaultColumnSize = currentSetDefaultSize.value || currentAvailableWidth.value / n;
        const defaultColumnSize = Math.max(MIN_COLUMN_SIZE, currentDefaultColumnSize);
            
        const currentColumnSizes = currentColumnIndices.value.map(
            column => currentAllColumnSizes.value[column] || defaultColumnSize
        );
        const lastColumnMinSize = currentAvailableWidth.value -
            currentColumnSizes.slice(0, n - 1).reduce((partialSum, size) => partialSum + size, 0);
        currentColumnSizes[n - 1] = Math.max(lastColumnMinSize, currentColumnSizes[n - 1]);
        console.log('Sum of current column sizes:', currentColumnSizes.reduce((partialSum, size) => partialSum + size, 0));
        console.log(currentColumnSizes);
        return currentColumnSizes;
    });
        
    const onColumnResize = (columnIndex, newColumnSize) => {
        consola.debug(`Table received: columnResize ${columnIndex} ${newColumnSize}`);
        const resizedColumnIndex = currentColumnIndices.value[columnIndex];
        currentAllColumnSizes.value[resizedColumnIndex] = newColumnSize;
    };
        
    const onAllColumnsResize = (newColumnSize) => {
        consola.debug(`Table received: allColumnsResize ${newColumnSize}`);
        currentSetDefaultSize.value = newColumnSize;
        currentAllColumnSizes.value = {};
    };

    return { currentColumnSizes, onColumnResize, onAllColumnsResize, updateAvailableWidth };
};
