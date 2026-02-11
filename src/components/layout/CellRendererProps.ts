interface CellRendererProps {
  isClickable: boolean;
  isMissing: boolean;
  isSlotted: boolean;
  isSelected: boolean;
  isToBeExpanded: boolean;
  noPadding?: boolean;
  /**
   * Only to be used if no color indicator is shown in a cell
   */
  noPaddingLeft?: boolean;
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
  enableExpand?: boolean;
  isEditing?: boolean;
}

export type { CellRendererProps };
