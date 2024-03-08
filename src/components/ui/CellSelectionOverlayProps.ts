import type TableConfig from "../../types/TableConfig";
import type { Rect } from "../composables/useCellSelection";

interface CellSelectionOverlayProps {
  rect: Rect;
  rowHeight: number;
  columnSizes: number[];
  rowResizeIndex: null | number;
  rowResizeDelta: null | number;
  tableConfig: TableConfig;
}

export default CellSelectionOverlayProps;
