import type { ColumnConfig } from "@/types/DataConfig";

const isNonEmptyObject = (val: any) =>
  val !== null &&
  typeof val === "object" &&
  Object.getOwnPropertyNames(val).length > 0;

const isObjectRepresentation = (
  val: any,
): val is { value?: any; color?: string; metadata?: string } => {
  const possibleKeys = ["value", "metadata", "color"];
  return (
    isNonEmptyObject(val) &&
    Object.getOwnPropertyNames(val).every((key) => possibleKeys.includes(key))
  );
};

export const unpackObjectRepresentation = (val: any) => {
  if (isObjectRepresentation(val)) {
    if (val.hasOwnProperty("metadata") && !val.hasOwnProperty("value")) {
      return null;
    }
    return val.value;
  }
  return val;
};

export const getColor = (val: any) => {
  if (isObjectRepresentation(val) && val.hasOwnProperty("color")) {
    const color = val.color;
    return typeof color === "undefined" ? null : color;
  }
  return null;
};

export const isMissingValue = (val: any): val is { metadata: string } | null =>
  val === null ||
  (isObjectRepresentation(val) && val?.hasOwnProperty("metadata"));

export const isEmpty = (val: any): val is { value: undefined } | undefined =>
  typeof unpackObjectRepresentation(val) === "undefined";

export const getPropertiesFromColumns = <T extends keyof ColumnConfig>(
  columnConfigs: ColumnConfig[],
  key: T,
): Array<ColumnConfig[T]> => columnConfigs.map((colConfig) => colConfig[key]);

const PADDING_LEFT_DEFAULT_CELL = 10;
const PADDING_LEFT_COLORED_CELL = 20;

const getPaddingLeft = (color: string | null) =>
  color === null ? PADDING_LEFT_DEFAULT_CELL : PADDING_LEFT_COLORED_CELL;

export const getCellPaddingLeft = (cellData: any) =>
  getPaddingLeft(getColor(cellData));

export const getHeaderPaddingLeft = (headerColor: string | null) =>
  getPaddingLeft(headerColor);
