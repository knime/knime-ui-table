import { type Ref, computed, ref, watch } from "vue";
import { isEqual } from "lodash-es";

export type CellPosition = {
  x: number;
  y: number;
};

class CellRect {
  anchor: CellPosition;
  opposite: CellPosition;

  constructor(anchorPosition: CellPosition) {
    this.anchor = this.opposite = anchorPosition;
  }

  setCorner(cellPos: CellPosition) {
    if (isEqual(this.opposite, cellPos)) {
      return;
    }
    this.opposite = cellPos;
  }

  getMinMax(coord: keyof CellPosition) {
    const coords = [this.anchor[coord], this.opposite[coord]];
    return { min: Math.min(...coords), max: Math.max(...coords) };
  }
}

export type MinMax = { min: number; max: number };

export type Rect = { x: MinMax; y: MinMax };

export type RectId = number;

export const useCellSelection = (enableCellSelection: Ref<boolean>) => {
  const cellRect = ref<CellRect | null>(null);
  const currentRectId: Ref<RectId | null> = ref(null);

  const rectMinMax = computed<Rect | null>(() => {
    const rectValue = cellRect.value;
    if (rectValue === null) {
      return null;
    }
    return {
      x: rectValue.getMinMax("x"),
      y: rectValue.getMinMax("y"),
    };
  });

  const selectedCell = computed(() => cellRect.value?.opposite);

  const isSingleSelectedCell = (cellPosition: CellPosition) => {
    return (
      cellRect.value !== null &&
      isEqual(cellRect.value.anchor, cellRect.value.opposite) &&
      isEqual(cellRect.value.anchor, cellPosition)
    );
  };

  const clearCellSelection = () => {
    cellRect.value = null;
    currentRectId.value = null;
  };

  watch(
    () => enableCellSelection.value,
    (isEnabled) => {
      if (!isEnabled) {
        clearCellSelection();
      }
    },
  );

  const selectCell = (
    cellPosition: CellPosition,
    rectId: RectId,
    ignoreIfSelected: boolean = false,
  ) => {
    if (
      rectId === currentRectId.value &&
      isSingleSelectedCell(cellPosition) &&
      !ignoreIfSelected
    ) {
      clearCellSelection();
      return;
    }
    cellRect.value = new CellRect(cellPosition);
    currentRectId.value = rectId;
  };

  const expandCellSelection = (cellPosition: CellPosition, rectId: RectId) => {
    if (cellRect.value === null || currentRectId.value !== rectId) {
      selectCell(cellPosition, rectId);
      return;
    }
    cellRect.value.setCorner(cellPosition);
  };

  const applyIfEnabled = (method: (...args: any[]) => void) => {
    return (...args: any[]) => {
      if (enableCellSelection.value) {
        method(...args);
      }
    };
  };

  return {
    selectCell: applyIfEnabled(selectCell),
    expandCellSelection: applyIfEnabled(expandCellSelection),
    clearCellSelection,
    rectMinMax,
    selectedCell,
    currentRectId,
    isSingleSelectedCell,
  };
};
