interface CellRendererProps {
  isClickable: boolean;
  isMissing: boolean;
  isSlotted: boolean;
  text: string | undefined;
  title: string | null;
  color: string | null;
  paddingLeft: number;
  classes: (string | null)[];
  selectOnMove: boolean;
  size: number;
}

export type { CellRendererProps };
