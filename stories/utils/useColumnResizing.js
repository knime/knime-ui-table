import { ref, unref, computed, onMounted } from 'vue';

import throttle from 'raf-throttle';
import { MIN_COLUMN_SIZE, SPECIAL_COLUMNS_SIZE } from '@/util/constants';

export default ({
    currentColumnIndices,
    spacerSettings: { showCollapser, withSelection, withColumnFilters }
}) => {
    const clientWidth = ref(0);
    const currentAllColumnSizes = ref({});
    const currentSetDefaultSize = ref(null);
    const boundingBoxElement = ref(null);

    let onResize;

    const observeTableIntersection = () => {
        if (boundingBoxElement.value) {
            new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.target === boundingBoxElement.value && entry.boundingClientRect.width) {
                        clientWidth.value = entry.boundingClientRect.width;
                        // observer is either removed here or on garbage collection
                        observer.unobserve(entry.target);
                        window.addEventListener('resize', onResize);
                    }
                });
            }).observe(boundingBoxElement.value);
        }
    };

    onResize = throttle(() => {
        const updatedClientWidth = boundingBoxElement.value?.getBoundingClientRect().width;
        if (updatedClientWidth) {
            // update all non-default column widths according to the relative change in client width
            const ratio = updatedClientWidth / clientWidth.value;
            Object.keys(currentAllColumnSizes).forEach(key => {
                currentAllColumnSizes.value[key] *= ratio;
            });
            if (currentSetDefaultSize.value !== null) {
                currentSetDefaultSize.value *= ratio;
            }
            clientWidth.value = updatedClientWidth;
        } else {
            observeTableIntersection();
            window.removeEventListener('resize', onResize);
        }
    });

    onMounted(() => {
        const initialClientWidth = boundingBoxElement.value?.getBoundingClientRect().width;
        // clientWidth can be 0, e.g., if table is not visible (yet)
        if (initialClientWidth) {
            clientWidth.value = initialClientWidth;
            window.addEventListener('resize', onResize);
        } else {
            observeTableIntersection();
        }
    });

    const currentColumnSizes = computed(() => {
        const n = currentColumnIndices.value.length;
        if (n < 1) {
            return [];
        }
            
        const specialColumnsSizeTotal = (unref(withColumnFilters) ? SPECIAL_COLUMNS_SIZE : 0) +
            (unref(withSelection) ? SPECIAL_COLUMNS_SIZE : 0) +
            (unref(showCollapser) ? SPECIAL_COLUMNS_SIZE : 0);
        const dataColumnsSizeTotal = clientWidth.value - specialColumnsSizeTotal;
        const currentDefaultColumnSize = currentSetDefaultSize.value || dataColumnsSizeTotal / n;
        const defaultColumnSize = Math.max(MIN_COLUMN_SIZE, currentDefaultColumnSize);
            
        const currentColumnSizes = currentColumnIndices.value.map(
            column => currentAllColumnSizes.value[column] || defaultColumnSize
        );
        const lastColumnMinSize = dataColumnsSizeTotal -
            currentColumnSizes.slice(0, n - 1).reduce((partialSum, size) => partialSum + size, 0);
        currentColumnSizes[n - 1] = Math.max(lastColumnMinSize, currentColumnSizes[n - 1]);
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

    return { currentColumnSizes, onColumnResize, onAllColumnsResize, boundingBoxElement };
};
