import { computed, ref, type Ref } from "vue";
import { isEqual } from "lodash";

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

export default () => {
  const cellRect = ref<CellRect | null>(null);
  const currentRectId: Ref<number | boolean | null> = ref(null);

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

  const isSingleSelectedCell = (cellPosition: CellPosition) => {
    return (
      cellRect.value !== null &&
      isEqual(cellRect.value.anchor, cellRect.value.opposite) &&
      isEqual(cellRect.value.anchor, cellPosition)
    );
  };

  const selectCell = (cellPosition: CellPosition, rectId: number | boolean) => {
    if (rectId === currentRectId.value && isSingleSelectedCell(cellPosition)) {
      cellRect.value = null;
      currentRectId.value = null;
      return;
    }
    cellRect.value = new CellRect(cellPosition);
    currentRectId.value = rectId;
  };

  const expandCellSelection = (cellPosition: CellPosition, rectId: number) => {
    if (cellRect.value === null || currentRectId.value !== rectId) {
      selectCell(cellPosition, rectId);
      return;
    }
    cellRect.value.setCorner(cellPosition);
  };

  return { selectCell, expandCellSelection, rectMinMax, currentRectId };
};
