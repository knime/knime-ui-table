import demoProps from '../props.json';

const allData = demoProps.allData;

const generateCopyOfAllData = (counter) => allData.map((data) => ({ ...data, id: data.id + counter }));

export default (desiredLength) => {
    const dataLength = allData.length;
    let generatedAllData = [];
    let numRows = 0;
    let counter = 0;
    while (numRows < desiredLength) {
        const nextNumRows = Math.min(desiredLength - numRows, dataLength);
        generatedAllData = generatedAllData.concat(
            generateCopyOfAllData(counter).slice(0, nextNumRows)
        );
        numRows += nextNumRows;
        counter += 1;
    }
    return generatedAllData;
};
       
