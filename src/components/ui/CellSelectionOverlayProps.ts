import type TableConfig from "../../types/TableConfig";
import type { CellPosition, Rect } from "../composables/useCellSelection";

interface CellSelectionOverlayProps {
  rect: Rect;
  rowHeight: number;
  columnSizes: number[];
  rowResizeIndex: null | number;
  rowResizeDelta: null | number;
  tableConfig: TableConfig;
  cellSelectionRectFocusCorner?: CellPosition;
}

export default CellSelectionOverlayProps;
