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

type ColumnConfig = {
  header: any;
  subHeader: any;
  headerSubMenuItems: any;
  filterConfig: any;
  size: any;
  type: any;
  key: any;
  id: any;
  hasSlotContent: any;
  popoverRenderer: any;
  formatter: any;
  classGenerator: any;
};

export const getPropertiesFromColumns = (
  columnConfigs: ColumnConfig[],
  key: keyof ColumnConfig,
) => columnConfigs.map((colConfig) => colConfig[key]);

const PADDING_LEFT_DEFAULT_CELL = 10;
const PADDING_LEFT_COLORED_CELL = 20;
export const getCellPaddingLeft = (cellData: any) =>
  getColor(cellData) === null
    ? PADDING_LEFT_DEFAULT_CELL
    : PADDING_LEFT_COLORED_CELL;
