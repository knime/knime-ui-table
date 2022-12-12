/* eslint-disable no-magic-numbers */
import { columnTypes } from '@/config/table.config';

export const orderedData = [
    { col1: [1], col2: 4, col3: 'A', col4: { item: 4 }, col5: '2020-10-29T19:23:11.277Z', col6: 'Drinks' },
    { col1: [1, 2], col2: 3, col3: 'A', col4: { item: 3 }, col5: '2020-10-29T18:23:11.277Z', col6: 'Cold' },
    { col1: [1, 2, 3], col2: 2, col3: 'A', col4: { item: 2 }, col5: '2020-10-29T17:23:11.277Z', col6: 'Bring' },
    { col1: [1, 2, 3, 4], col2: 1, col3: 'A', col4: { item: 1 }, col5: '2020-10-29T16:23:11.277Z', col6: 'Always' }
];

export const reversedData = [
    { col1: [1, 2, 3, 4], col2: 1, col3: 'B', col4: { item: 1 }, col5: '2020-10-29T16:23:11.277Z', col6: 'Always' },
    { col1: [1, 2, 3], col2: 2, col3: 'B', col4: { item: 2 }, col5: '2020-10-29T17:23:11.277Z', col6: 'Bring' },
    { col1: [1, 2], col2: 3, col3: 'B', col4: { item: 3 }, col5: '2020-10-29T18:23:11.277Z', col6: 'Cold' },
    { col1: [1], col2: 4, col3: 'B', col4: { item: 4 }, col5: '2020-10-29T19:23:11.277Z', col6: 'Drinks' }
];

export const unorderedData = [
    { col1: [1, 2, 3], col2: 2, col3: 'C', col4: { item: 2 }, col5: '2020-10-29T17:23:11.277Z', col6: 'Bring' },
    { col1: [1], col2: 4, col3: 'C', col4: { item: 4 }, col5: '2020-10-29T19:23:11.277Z', col6: 'Drinks' },
    { col1: [1, 2], col2: 3, col3: 'C', col4: { item: 3 }, col5: '2020-10-29T18:23:11.277Z', col6: 'Cold' },
    { col1: [1, 2, 3, 4], col2: 1, col3: 'C', col4: { item: 1 }, col5: '2020-10-29T16:23:11.277Z', col6: 'Always' }
];

export const groupedData = [
    {
        data: orderedData,
        groupInd: 0
    },
    {
        data: reversedData,
        groupInd: 1
    },
    {
        data: unorderedData,
        groupInd: 2
    }
];

export const missingGroupedData = [
    {
        data: [
            orderedData[0],
            { col3: 'A' },
            orderedData[1],
            { col3: 'A' },
            orderedData[2],
            { col3: 'A' },
            orderedData[3]
        ],
        groupInd: 0
    },
    {
        data: [
            reversedData[0],
            { col3: 'B' },
            reversedData[1],
            { col3: 'B' },
            reversedData[2],
            { col3: 'B' },
            reversedData[3]
        ],
        groupInd: 1
    },
    {
        data: [
            unorderedData[0],
            { col3: 'C' },
            unorderedData[1],
            { col3: 'C' },
            unorderedData[2],
            { col3: 'C' },
            unorderedData[3]
        ],
        groupInd: 2
    }
];

export const groupedIndicies = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]];

export const columnKeys = ['col1', 'col2', 'col3', 'col4', 'col5', 'col6'];

export const currentColumnTypes = {
    col1: columnTypes.Array,
    col2: columnTypes.Number,
    col3: columnTypes.Nominal,
    col4: columnTypes.Object,
    // col5: columnTypes.Boolean,
    col6: columnTypes.DateTime,
    col7: columnTypes.String
};
