export type ClassGenerator =
  | ((val: string | undefined) => string)
  | Record<string, string>
  | string;

interface CellProps {
  cellData: any;
  selectOnMove: boolean;
  isSlotted: boolean;
  isSelected: boolean;
  isToBeExpanded: boolean;
  size: number;
  classGenerators?: ClassGenerator[];
  isClickableByConfig: boolean;
  formatter: (value: any) => string;
  defaultTopBottomPadding: number;
  hasDataValueView?: boolean;
  isEditing?: boolean;
}

export type { CellProps };
