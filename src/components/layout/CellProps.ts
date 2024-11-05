export type ClassGenerator =
  | ((val: string | undefined) => string)
  | Record<string, string>
  | string;

interface CellProps {
  cellData: any;
  selectOnMove: boolean;
  isSlotted: boolean;
  isSelected: boolean;
  size: number;
  classGenerators?: ClassGenerator[];
  isClickableByConfig: boolean;
  formatter: (value: any) => string;
  defaultTopBottomPadding: number;
  hasDataValueView?: boolean;
}

export type { CellProps };
