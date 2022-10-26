import { sort } from '@/util/transform/sort';
import { orderedData, reversedData, unorderedData, groupedData, missingGroupedData,
    groupedIndicies, columnKeys, currentColumnTypes } from './mockData';

describe('sort', () => {
    describe('single group sorting', () => {
        describe('ascending order sorting', () => {
            it('leaves pre-sorted, single group data in the same order', () => {
                let sortConfig = {
                    groupedData: [{
                        data: orderedData,
                        groupInd: 0
                    }],
                    groupedIndicies,
                    groupColumnKey: null,
                    columnKeys,
                    columnTypes: currentColumnTypes,
                    sortColumn: 0,
                    sortDirection: -1
                };
                expect(sort(sortConfig)).toStrictEqual({
                    sortedData: [orderedData],
                    sortedIndicies: [[0, 1, 2, 3]]
                });
            });

            it('sorts reverse-sorted, single group data', () => {
                let sortConfig = {
                    groupedData: [{
                        data: reversedData,
                        groupInd: 0
                    }],
                    groupedIndicies,
                    groupColumnKey: null,
                    columnKeys,
                    columnTypes: currentColumnTypes,
                    sortColumn: 0,
                    sortDirection: -1
                };
                expect(sort(sortConfig)).toStrictEqual({
                    sortedData: [[reversedData[3], reversedData[2], reversedData[1], reversedData[0]]],
                    sortedIndicies: [[3, 2, 1, 0]]
                });
            });

            it('sorts un-sorted, single group data', () => {
                let sortConfig = {
                    groupedData: [{
                        data: unorderedData,
                        groupInd: 0
                    }],
                    groupedIndicies,
                    groupColumnKey: null,
                    columnKeys,
                    columnTypes: currentColumnTypes,
                    sortColumn: 0,
                    sortDirection: -1
                };
                expect(sort(sortConfig)).toStrictEqual({
                    sortedData: [[unorderedData[1], unorderedData[2], unorderedData[0], unorderedData[3]]],
                    sortedIndicies: [[1, 2, 0, 3]]
                });
            });

            it('sorts missing values last for single group data', () => {
                let sortConfig = {
                    groupedData: [{
                        data: [
                            unorderedData[0],
                            {},
                            unorderedData[1],
                            {},
                            unorderedData[2],
                            {},
                            unorderedData[3]
                        ],
                        groupInd: 0
                    }],
                    groupedIndicies: [[0, 1, 2, 3, 4, 5, 6]],
                    groupColumnKey: null,
                    columnKeys,
                    columnTypes: currentColumnTypes,
                    sortColumn: 0,
                    sortDirection: -1
                };
                expect(sort(sortConfig)).toStrictEqual({
                    sortedData: [[unorderedData[1], unorderedData[2], unorderedData[0], unorderedData[3], {}, {}, {}]],
                    sortedIndicies: [[2, 4, 0, 6, 1, 3, 5]]
                });
            });
        });

        describe('descending order sorting', () => {
            it('sorts pre-sorted, single group data in the same order', () => {
                let sortConfig = {
                    groupedData: [{
                        data: orderedData,
                        groupInd: 0
                    }],
                    groupedIndicies,
                    groupColumnKey: null,
                    columnKeys,
                    columnTypes: currentColumnTypes,
                    sortColumn: 0,
                    sortDirection: 1
                };
                expect(sort(sortConfig)).toStrictEqual({
                    sortedData: [[orderedData[3], orderedData[2], orderedData[1], orderedData[0]]],
                    sortedIndicies: [[3, 2, 1, 0]]

                });
            });

            it('leaves reverse-sorted, single group data', () => {
                let sortConfig = {
                    groupedData: [{
                        data: reversedData,
                        groupInd: 0
                    }],
                    groupedIndicies,
                    groupColumnKey: null,
                    columnKeys,
                    columnTypes: currentColumnTypes,
                    sortColumn: 0,
                    sortDirection: 1
                };
                expect(sort(sortConfig)).toStrictEqual({
                    sortedData: [reversedData],
                    sortedIndicies: [[0, 1, 2, 3]]
                });
            });

            it('sorts un-sorted, single group data', () => {
                let sortConfig = {
                    groupedData: [{
                        data: unorderedData,
                        groupInd: 0
                    }],
                    groupedIndicies,
                    groupColumnKey: null,
                    columnKeys,
                    columnTypes: currentColumnTypes,
                    sortColumn: 0,
                    sortDirection: 1
                };
                expect(sort(sortConfig)).toStrictEqual({
                    sortedData: [[unorderedData[3], unorderedData[0], unorderedData[2], unorderedData[1]]],
                    sortedIndicies: [[3, 0, 2, 1]]
                });
            });

            it('sorts missing values last for single group data', () => {
                let sortConfig = {
                    groupedData: [{
                        data: [
                            unorderedData[0],
                            {},
                            unorderedData[1],
                            {},
                            unorderedData[2],
                            {},
                            unorderedData[3]
                        ],
                        groupInd: 0
                    }],
                    groupedIndicies: [[0, 1, 2, 3, 4, 5, 6]],
                    groupColumnKey: null,
                    columnKeys,
                    columnTypes: currentColumnTypes,
                    sortColumn: 0,
                    sortDirection: 1
                };
                expect(sort(sortConfig)).toStrictEqual({
                    sortedData: [[unorderedData[3], unorderedData[0], unorderedData[2], unorderedData[1], {}, {}, {}]],
                    sortedIndicies: [[6, 0, 4, 2, 1, 3, 5]]
                });
            });
        });
    });

    describe('multi group sorting', () => {
        describe('ascending order sorting', () => {
            it('sorts groups', () => {
                let sortConfig = {
                    groupedData,
                    groupedIndicies,
                    groupColumnKey: 'col3',
                    columnKeys,
                    columnTypes: currentColumnTypes,
                    sortColumn: 0,
                    sortDirection: -1
                };
                expect(sort(sortConfig)).toStrictEqual({
                    sortedData: [
                        orderedData,
                        [reversedData[3], reversedData[2], reversedData[1], reversedData[0]],
                        [unorderedData[1], unorderedData[2], unorderedData[0], unorderedData[3]]
                    ],
                    sortedIndicies: [[0, 1, 2, 3], [7, 6, 5, 4], [9, 10, 8, 11]]
                });
            });

            it('sorts groups', () => {
                let sortConfig = {
                    groupedData: missingGroupedData,
                    groupedIndicies: [
                        [0, 1, 2, 3, 4, 5, 6],
                        [0, 1, 2, 3, 4, 5, 6],
                        [0, 1, 2, 3, 4, 5, 6]
                    ],
                    groupColumnKey: 'col3',
                    columnKeys,
                    columnTypes: currentColumnTypes,
                    sortColumn: 0,
                    sortDirection: -1
                };
                expect(sort(sortConfig)).toStrictEqual({
                    sortedData: [
                        [...orderedData, { col3: 'A' }, { col3: 'A' }, { col3: 'A' }],
                        [reversedData[3], reversedData[2], reversedData[1], reversedData[0],
                            { col3: 'B' }, { col3: 'B' }, { col3: 'B' }],
                        [unorderedData[1], unorderedData[2], unorderedData[0], unorderedData[3],
                            { col3: 'C' }, { col3: 'C' }, { col3: 'C' }]
                    ],
                    sortedIndicies: [
                        [0, 2, 4, 6, 1, 3, 5],
                        [6, 4, 2, 0, 1, 3, 5],
                        [2, 4, 0, 6, 1, 3, 5]
                    ]
                });
            });

            it('leaves groups unchanged if group column mismatched', () => {
                let localGroupInds = [[0, 1, 2], [0, 1, 2], [0, 1, 2]];
                let localGroupData = [
                    {
                        data: [orderedData[0], reversedData[0], unorderedData[0]],
                        groupInd: 0
                    },
                    {
                        data: [orderedData[1], reversedData[1], unorderedData[1]],
                        groupInd: 1
                    },
                    {
                        data: [orderedData[2], reversedData[2], unorderedData[2]],
                        groupInd: 2
                    }
                ];
                let sortConfig = {
                    groupedData: localGroupData,
                    groupedIndicies: localGroupInds,
                    groupColumnKey: 'col3',
                    columnKeys,
                    columnTypes: currentColumnTypes,
                    sortColumn: 0,
                    sortDirection: -1
                };
                expect(sort(sortConfig)).toStrictEqual({
                    sortedData: [localGroupData[0].data, localGroupData[1].data, localGroupData[2].data],
                    sortedIndicies: localGroupInds
                });
            });
        });

        describe('descending order sorting', () => {
            it('sorts groups', () => {
                let sortConfig = {
                    groupedData,
                    groupedIndicies,
                    groupColumnKey: 'col3',
                    columnKeys,
                    columnTypes: currentColumnTypes,
                    sortColumn: 0,
                    sortDirection: 1
                };
                expect(sort(sortConfig)).toStrictEqual({
                    sortedData: [
                        [orderedData[3], orderedData[2], orderedData[1], orderedData[0]],
                        reversedData,
                        [unorderedData[3], unorderedData[0], unorderedData[2], unorderedData[1]]
                    ],
                    sortedIndicies: [[3, 2, 1, 0], [4, 5, 6, 7], [11, 8, 10, 9]]
                });
            });

            it('sorts groups with missing at the end', () => {
                let sortConfig = {
                    groupedData: missingGroupedData,
                    groupedIndicies: [
                        [0, 1, 2, 3, 4, 5, 6],
                        [0, 1, 2, 3, 4, 5, 6],
                        [0, 1, 2, 3, 4, 5, 6]
                    ],
                    groupColumnKey: 'col3',
                    columnKeys,
                    columnTypes: currentColumnTypes,
                    sortColumn: 0,
                    sortDirection: 1
                };
                expect(sort(sortConfig)).toStrictEqual({
                    sortedData: [
                        [orderedData[3], orderedData[2], orderedData[1], orderedData[0],
                            { col3: 'A' }, { col3: 'A' }, { col3: 'A' }],
                        [...reversedData, { col3: 'B' }, { col3: 'B' }, { col3: 'B' }],
                        [unorderedData[3], unorderedData[0], unorderedData[2], unorderedData[1],
                            { col3: 'C' }, { col3: 'C' }, { col3: 'C' }]
                    ],
                    sortedIndicies: [
                        [6, 4, 2, 0, 1, 3, 5],
                        [0, 2, 4, 6, 1, 3, 5],
                        [6, 0, 4, 2, 1, 3, 5]
                    ]
                });
            });

            it('leaves groups unchanged if group column mismatched', () => {
                let localGroupInds = [[0, 1, 2], [0, 1, 2], [0, 1, 2]];
                let localGroupData = [
                    {
                        data: [orderedData[0], reversedData[0], unorderedData[0]],
                        groupInd: 0
                    },
                    {
                        data: [orderedData[1], reversedData[1], unorderedData[1]],
                        groupInd: 1
                    },
                    {
                        data: [orderedData[2], reversedData[2], unorderedData[2]],
                        groupInd: 2
                    }
                ];
                let sortConfig = {
                    groupedData: localGroupData,
                    groupedIndicies: localGroupInds,
                    groupColumnKey: 'col3',
                    columnKeys,
                    columnTypes: currentColumnTypes,
                    sortColumn: 0,
                    sortDirection: 1
                };
                expect(sort(sortConfig)).toStrictEqual({
                    sortedData: [localGroupData[0].data, localGroupData[1].data, localGroupData[2].data],
                    sortedIndicies: localGroupInds
                });
            });
        });
    });
});
