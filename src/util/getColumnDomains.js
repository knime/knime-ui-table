import { columnTypes } from "../config/table.config";
import { unpackObjectRepresentation } from ".";

export default ({ data, formatters, types }) => {
  let domainMap = {};
  let nominalColumns = [];
  Object.entries(types).forEach((entry) => {
    let [col, colType] = entry;
    // treat boolean as nominal (as they can have formatted domains)
    if ([columnTypes.Boolean, columnTypes.Nominal].includes(colType)) {
      nominalColumns.push(col);
      domainMap[col] = [];
    }
  });
  data.forEach((row) => {
    nominalColumns.forEach((col) => {
      const cellValue = unpackObjectRepresentation(row[col]);
      const formattedCellValue = formatters?.[col]?.(cellValue) || cellValue;
      if (!domainMap[col].includes(formattedCellValue)) {
        domainMap[col].push(formattedCellValue);
      }
    });
  });
  return domainMap;
};
