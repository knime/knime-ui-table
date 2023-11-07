interface RowConfigBase {
  rowHeight?: number;
  compactMode?: boolean;
  enableResizing?: boolean;
}
export type RowConfig =
  | RowConfigBase
  | {
      rowHeight: "dynamic";
      enableResizing?: false;
      compactMode?: false;
    };

export type ColumnConfig = any;

interface DataConfig {
  columnConfigs: ColumnConfig[];
  rowConfig: RowConfig;
}

export default DataConfig;
