import type { MenuItem } from "@knime/components";

export interface PageConfig {
  currentSize: number;
  tableSize?: number;
  pageSize: number;
  currentPage: number;
  columnCount: number;
  possiblePageSizes?: number[];
  showTableSize?: boolean;
  showPageControls?: boolean;
  showOnlyRowCount?: boolean;
}

export interface SortConfig {
  sortColumn?: number;
  sortDirection?: number;
}

export interface SearchConfig {
  searchQuery: string;
}

export interface TimeFilterConfig {
  currentTimeFilter: string;
}

export interface ColumnSelectionConfig {
  possibleColumns: string[];
}

export interface GroupByConfig {
  currentGroup: string;
  possibleGroups: string[];
  currentGroupValues?: string[];
}

export interface ActionButtonConfig {
  callback: () => void;
  text: string;
}

interface TableConfig {
  searchConfig?: SearchConfig;
  timeFilterConfig?: TimeFilterConfig;
  columnSelectionConfig?: ColumnSelectionConfig;
  groupByConfig?: GroupByConfig;
  pageConfig?: PageConfig;
  actionButtonConfig?: ActionButtonConfig;
  settingsItems?: MenuItem[];
  sortConfig?: SortConfig;
  enableColumnResizing?: boolean;
  showCollapser?: boolean;
  showSelection?: boolean;
  disableSelection?: boolean;
  showColumnFilters?: boolean;
  subMenuItems?: MenuItem[];
  groupSubMenuItems?: MenuItem[];
  reserveSpaceForSubMenu?: "always" | "auto";
  showPopovers?: boolean;
  enableCellSelection?: boolean;
  enableDataValueViews?: boolean;
  dataValueViewIsShown?: boolean;
  columnFilterInitiallyActive?: boolean;
  enableVirtualScrolling?: boolean;
  showBottomControls?: boolean;
}

export default TableConfig;
