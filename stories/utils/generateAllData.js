import demoProps from "../props.json";

const allData = demoProps.allData;

const generateColumns = (numCols) =>
  Array.from({ length: numCols }).map((_, i) => `dummyColumn${i}`);

const generateCopyOfAllData = (counter, additionalColumns) =>
  allData.map((data, rowIndex) =>
    additionalColumns.reduce(
      (newRowData, column) => ({
        ...newRowData,
        [column]: `${column}_chunk${counter}_row${rowIndex}`,
      }),
      { ...data, id: data.id + counter },
    ),
  );

export default (desiredNumRows, desiredNumCols) => {
  const dataLength = allData.length;
  let allDataGenerated = [];
  let numRows = 0;
  let counter = 0;
  const additionalColumns = generateColumns(
    Math.max(desiredNumCols - demoProps.allColumnKeys.length, 0),
  );
  while (numRows < desiredNumRows) {
    const nextNumRows = Math.min(desiredNumRows - numRows, dataLength);
    allDataGenerated = allDataGenerated.concat(
      generateCopyOfAllData(counter, additionalColumns).slice(0, nextNumRows),
    );
    numRows += nextNumRows;
    counter += 1;
  }

  return {
    allDataGenerated,
    allColumnKeysGenerated: [...demoProps.allColumnKeys, ...additionalColumns],
    allColumnHeadersGenerated: [
      ...demoProps.allColumnHeaders,
      ...additionalColumns,
    ],
    allColumnTypesGenerated: {
      ...demoProps.allColumnTypes,
      ...additionalColumns.reduce(
        (allColumnTypes, column) => ({ ...allColumnTypes, [column]: "String" }),
        {},
      ),
    },
  };
};
