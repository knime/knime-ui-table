interface CellProps {
  cellData: any;
  selectOnMove: boolean;
  isSlotted: boolean;
  size: number;
  classGenerators?: (
    | ((val: string | undefined) => string)
    | Record<string, string>
    | string
  )[];
  isClickableByConfig: boolean;
  formatter: any;
  defaultTopBottomPadding: number;
}

export type { CellProps };
