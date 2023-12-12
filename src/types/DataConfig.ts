import type { ClassGenerator } from "@/components/layout/CellProps";
import type { PopoverRenderer } from "@/components/popover/TablePopover.vue";
import type FilterConfig from "./FilterConfig";
import type { MenuItem } from "webapps-common/ui/components/MenuItems.vue";
import type { ColumnType } from "@/config/table.config";

interface RowConfigBase {
  rowHeight?: number;
  compactMode?: boolean;
  enableResizing?: boolean;
}
export type RowConfig =
  | RowConfigBase
  | {
      rowHeight: "dynamic";
      enableResizing?: boolean;
      compactMode?: boolean;
    };

export interface ColumnConfig {
  header: string;
  subHeader?: string;
  headerSubMenuItems?: MenuItem[];
  filterConfig?: FilterConfig;
  size: number;
  type?: ColumnType;
  key: string | number | symbol;
  id: string | symbol;
  hasSlotContent?: boolean;
  isSortable?: boolean;
  popoverRenderer?: PopoverRenderer | boolean;
  formatter: (value: any) => string;
  classGenerator?: ClassGenerator[];
  headerColor?: string;
  noPadding?: boolean;
}

interface DataConfig {
  columnConfigs: ColumnConfig[];
  rowConfig: RowConfig;
}

export default DataConfig;
