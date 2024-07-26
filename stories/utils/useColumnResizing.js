import { ref, computed } from "vue";
import { MIN_COLUMN_SIZE } from "@/util/constants";

export default ({ currentColumnIndices, currentColumnKeys }) => {
  const currentAvailableWidth = ref(0);
  const currentAllColumnSizes = ref({});
  const currentSetDefaultSize = ref(null);

  const updateAvailableWidth = (newAvailableWidth) => {
    if (currentAvailableWidth.value) {
      // update all non-default column widths according to the relative change in client width
      const ratio = newAvailableWidth / currentAvailableWidth.value;
      Object.keys(currentAllColumnSizes).forEach((key) => {
        currentAllColumnSizes.value[key] *= ratio;
      });
      if (currentSetDefaultSize.value !== null) {
        currentSetDefaultSize.value *= ratio;
      }
      currentAvailableWidth.value = newAvailableWidth;
    }
    currentAvailableWidth.value = newAvailableWidth;
  };

  const onAutoSizesUpdate = (newAutoColumnSizesByKey) => {
    currentAllColumnSizes.value = {};
    currentSetDefaultSize.value = null;
    currentColumnIndices.value.forEach(
      (columnIndex, indexInDisplayedColumns) => {
        currentAllColumnSizes.value[columnIndex] =
          newAutoColumnSizesByKey[
            currentColumnKeys.value[indexInDisplayedColumns]
          ];
      },
    );
  };

  const currentColumnSizes = computed(() => {
    const n = currentColumnIndices.value.length;
    if (n < 1) {
      return [];
    }
    const currentDefaultColumnSize =
      currentSetDefaultSize.value || currentAvailableWidth.value / n;
    const defaultColumnSize = Math.max(
      MIN_COLUMN_SIZE,
      currentDefaultColumnSize,
    );

    const currentColumnSizes = currentColumnIndices.value.map(
      (column) => currentAllColumnSizes.value[column] || defaultColumnSize,
    );
    const lastColumnMinSize =
      currentAvailableWidth.value -
      currentColumnSizes
        .slice(0, n - 1)
        .reduce((partialSum, size) => partialSum + size, 0);
    currentColumnSizes[n - 1] = Math.max(
      lastColumnMinSize,
      currentColumnSizes[n - 1],
    );
    return currentColumnSizes;
  });

  const onColumnResize = (columnIndex, newColumnSize) => {
    consola.debug(
      `Table received: columnResize ${columnIndex} ${newColumnSize}`,
    );
    const resizedColumnIndex = currentColumnIndices.value[columnIndex];
    currentAllColumnSizes.value[resizedColumnIndex] = newColumnSize;
  };

  const onAllColumnsResize = (newColumnSize) => {
    consola.debug(`Table received: allColumnsResize ${newColumnSize}`);
    currentSetDefaultSize.value = newColumnSize;
    currentAllColumnSizes.value = {};
  };

  return {
    currentColumnSizes,
    onColumnResize,
    onAllColumnsResize,
    updateAvailableWidth,
    onAutoSizesUpdate,
  };
};
