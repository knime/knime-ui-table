export interface VirtualElementAnchor {
  x: number;
  y: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

export interface DataValueViewConfig {
  rowIndex: number;
  colIndex: number;
  anchor: VirtualElementAnchor;
}
