import { computed, ref } from "vue";
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

  const selectCell = (cellPosition: CellPosition) => {
    if (isSingleSelectedCell(cellPosition)) {
      cellRect.value = null;
      return;
    }
    cellRect.value = new CellRect(cellPosition);
  };

  const expandCellSelection = (cellPosition: CellPosition) => {
    if (cellRect.value === null) {
      selectCell(cellPosition);
      return;
    }
    cellRect.value.setCorner(cellPosition);
  };

  const getSelectedIndicesForRow = computed(() => {
    const rect = rectMinMax.value;
    if (rect === null) {
      return () => null;
    }
    return (rowInd: number): MinMax | null => {
      const { x, y } = rect;
      if (y.min <= rowInd && y.max >= rowInd) {
        return x;
      }
      return null;
    };
  });

  return { selectCell, expandCellSelection, getSelectedIndicesForRow };
};
