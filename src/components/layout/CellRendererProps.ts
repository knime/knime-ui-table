interface CellRendererProps {
  isClickable: boolean;
  isMissing: boolean;
  isSlotted: boolean;
  text: string | undefined;
  title: string | null;
  color: string | null;
  classes: (string | null)[];
  selectOnMove: boolean;
  size: number;
  paddingLeft: number;
  /**
   * padding top/bottom applied to cells, will not affect slotted columns
   */
  defaultTopBottomPadding: number;
}

export type { CellRendererProps };
