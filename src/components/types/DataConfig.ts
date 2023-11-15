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

export type ColumnConfig = any;

interface DataConfig {
  columnConfigs: ColumnConfig[];
  rowConfig: RowConfig;
}

export default DataConfig;
