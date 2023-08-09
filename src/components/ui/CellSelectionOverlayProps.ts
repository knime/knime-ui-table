import type { Rect } from "../composables/useCellSelection";

interface CellSelectionOverlayProps {
  rect: Rect;
  rowHeight: number;
  columnSizes: number[];
  rowResizeIndex: null | number;
  rowResizeDelta: null | number;
  tableConfig: {
    showSelection: boolean;
    showCollapser: boolean;
  };
}

export default CellSelectionOverlayProps;
