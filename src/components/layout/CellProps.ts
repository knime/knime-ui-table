interface CellProps {
  text: string | undefined;
  title: string | null;
  isMissing: boolean;
  isSelected: boolean;
  selectOnMove: boolean;
  clickable: boolean;
  isSlotted: boolean;
  size?: number;
  classGenerators?: (
    | ((val: string | undefined) => string)
    | Record<string, string>
    | string
  )[];
  backgroundColor: string | null;
}

export type { CellProps };
