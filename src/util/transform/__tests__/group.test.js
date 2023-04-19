import { describe, it, expect } from 'vitest';
import { group } from '../group';

describe('group', () => {
    let dataMock = [
        { col1: 1, col2: 2, col3: 'A' },
        { col1: 1, col2: 2, col3: 'B' },
        { col1: 1, col2: 2, col3: 'A' },
        { col1: 1, col2: 2, col3: 'B' },
        { col1: 1, col2: 2, col3: 'C' }
    ];

    let indiciesMock = [0, 1, 2, 3, 4];

    let expectedOutput = {
        groupedData: [
            {
                data: [
                    { col1: 1, col2: 2, col3: 'A' },
                    { col1: 1, col2: 2, col3: 'A' }
                ],
                groupInd: 0
            },
            {
                data: [
                    { col1: 1, col2: 2, col3: 'B' },
                    { col1: 1, col2: 2, col3: 'B' }
                ],
                groupInd: 1
            },
            {
                data: [
                    { col1: 1, col2: 2, col3: 'C' }
                ],
                groupInd: 2
            }
        ],
        groupedIndicies: [[0, 2], [1, 3], [4]],
        groupTitles: ['A', 'B', 'C']
    };

    it('returns a single group if group column is missing', () => {
        let groupConfig = {
            filteredData: dataMock,
            filteredIndicies: indiciesMock
        };
        expect(group(groupConfig)).toStrictEqual({
            groupedData: [{
                data: dataMock,
                groupInd: 0
            }],
            groupedIndicies: [indiciesMock],
            groupTitles: ['None']
        });
    });

    it('returns a single group if group column is \'None\'', () => {
        let groupConfig = {
            filteredData: dataMock,
            groupColumn: 'None',
            filteredIndicies: indiciesMock
        };
        expect(group(groupConfig)).toStrictEqual({
            groupedData: [{
                data: dataMock,
                groupInd: 0
            }],
            groupedIndicies: [indiciesMock],
            groupTitles: ['None']
        });
    });

    it('groups columns when provided a valid group name and key', () => {
        let groupConfig = {
            filteredData: dataMock,
            groupColumnKey: 'col3',
            groupColumn: 'Column 3',
            filteredIndicies: indiciesMock
        };
        expect(group(groupConfig)).toStrictEqual(expectedOutput);
    });

    it('sorts when they occur in an unordered state', () => {
        let groupConfig = {
            filteredData: [
                { col1: 1, col2: 2, col3: 'C' },
                { col1: 1, col2: 2, col3: 'A' },
                { col1: 1, col2: 2, col3: 'B' },
                { col1: 1, col2: 2, col3: 'B' },
                { col1: 1, col2: 2, col3: 'A' }
            ],
            groupColumnKey: 'col3',
            groupColumn: 'Column 3',
            filteredIndicies: indiciesMock
        };
        expect(group(groupConfig)).toStrictEqual({
            groupedData: [
                {
                    data: [
                        { col1: 1, col2: 2, col3: 'A' },
                        { col1: 1, col2: 2, col3: 'A' }
                    ],
                    groupInd: 1
                },
                {
                    data: [
                        { col1: 1, col2: 2, col3: 'B' },
                        { col1: 1, col2: 2, col3: 'B' }
                    ],
                    groupInd: 2
                },
                {
                    data: [
                        { col1: 1, col2: 2, col3: 'C' }
                    ],
                    groupInd: 0
                }
            ],
            groupedIndicies: [[0], [1, 4], [2, 3]],
            groupTitles: ['A', 'B', 'C']
        });
    });

    it('groups data missing group column values and sorts the missing group last', () => {
        let groupConfig = {
            filteredData: [
                { col1: 8, col2: 9 },
                { col1: 1, col2: 2, col3: 'C' },
                { col1: 1, col2: 2, col3: 'A' },
                { col1: 8, col2: 9, col3: null },
                { col1: 1, col2: 2, col3: 'B' },
                { col1: 1, col2: 2, col3: 'B' },
                { col1: 8, col2: 9, col3: { metadata: 'Dummy message' } },
                { col1: 1, col2: 2, col3: 'A' },
                { col1: 8, col2: 9, col3: { metadata: 'Another message' } }
            ],
            groupColumnKey: 'col3',
            groupColumn: 'Column 3',
            filteredIndicies: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        };
        expect(group(groupConfig)).toStrictEqual({
            groupedData: [
                {
                    data: [
                        { col1: 1, col2: 2, col3: 'A' },
                        { col1: 1, col2: 2, col3: 'A' }
                    ],
                    groupInd: 2
                },
                {
                    data: [
                        { col1: 1, col2: 2, col3: 'B' },
                        { col1: 1, col2: 2, col3: 'B' }
                    ],
                    groupInd: 3
                },
                {
                    data: [
                        { col1: 1, col2: 2, col3: 'C' }
                    ],
                    groupInd: 1
                },
                {
                    data: [
                        { col1: 8, col2: 9 },
                        { col1: 8, col2: 9, col3: null },
                        { col1: 8, col2: 9, col3: { metadata: 'Dummy message' } },
                        { col1: 8, col2: 9, col3: { metadata: 'Another message' } }
                    ],
                    groupInd: 0
                }
            ],
            groupedIndicies: [[0, 3, 6, 8], [1], [2, 7], [4, 5]],
            groupTitles: ['A', 'B', 'C', 'Missing']
        });
    });

    it('uses fallback group if group column domain contains the value \'Missing\'', () => {
        let groupConfig = {
            filteredData: [
                { col1: 8, col2: 9 },
                { col1: 1, col2: 2, col3: 'C' },
                { col1: 1, col2: 2, col3: 'B' },
                { col1: 1, col2: 2, col3: 'A' },
                { col1: 1, col2: 2, col3: 'Missing' }
            ],
            groupColumnKey: 'col3',
            groupColumn: 'Column 3',
            filteredIndicies: indiciesMock
        };
        expect(group(groupConfig)).toStrictEqual({
            groupedData: [
                
                {
                    data: [{ col1: 1, col2: 2, col3: 'A' }],
                    groupInd: 3
                },
                {
                    data: [{ col1: 1, col2: 2, col3: 'B' }],
                    groupInd: 2
                },
                {
                    data: [{ col1: 1, col2: 2, col3: 'C' }],
                    groupInd: 1
                },
                {
                    data: [{ col1: 1, col2: 2, col3: 'Missing' }],
                    groupInd: 4
                },
                {
                    data: [{ col1: 8, col2: 9 }],
                    groupInd: 0
                }
            ],
            groupedIndicies: [[0], [1], [2], [3], [4]],
            groupTitles: ['A', 'B', 'C', 'Missing', 'No group']
        });
    });
});
