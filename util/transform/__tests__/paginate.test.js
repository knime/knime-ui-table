import { describe, it, expect } from 'vitest';
import { paginate } from '../paginate';

describe('paginate', () => {
    it('returns an empty page if no data', () => {
        let paginationConfig = {
            sortedData: [[]],
            processedIndicies: [[]],
            processedSelection: [[]],
            pageSize: 5,
            pageStart: 0,
            pageEnd: 5
        };
        expect(paginate(paginationConfig)).toStrictEqual({
            paginatedData: [[]],
            paginatedSelection: [[]],
            paginatedIndicies: [[]]
        });
    });

    it('returns a single page worth of data', () => {
        let paginationConfig = {
            sortedData: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
            processedIndicies: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
            processedSelection: [[0, 0, 1, 0, 0, 0, 0, 0, 0, 0]],
            pageSize: 5,
            pageStart: 0,
            pageEnd: 5
        };
        expect(paginate(paginationConfig)).toStrictEqual({
            paginatedData: [[1, 2, 3, 4, 5]],
            paginatedSelection: [[0, 0, 1, 0, 0]],
            paginatedIndicies: [[0, 1, 2, 3, 4]]
        });
    });

    it('returns a partial page worth of data if not enough rows', () => {
        let paginationConfig = {
            sortedData: [[1, 2, 3, 4, 5, 6, 7]],
            processedIndicies: [[0, 1, 2, 3, 4, 5, 6]],
            processedSelection: [[0, 0, 1, 0, 0, 0, 1]],
            pageSize: 5,
            pageStart: 5,
            pageEnd: 10
        };
        expect(paginate(paginationConfig)).toStrictEqual({
            paginatedData: [[6, 7]],
            paginatedSelection: [[0, 1]],
            paginatedIndicies: [[5, 6]]
        });
    });

    it('returns an empty page if not enough rows for a single page', () => {
        let paginationConfig = {
            sortedData: [[1, 2, 3, 4, 5]],
            processedIndicies: [[0, 1, 2, 3, 4]],
            processedSelection: [[0, 0, 1, 0, 0]],
            pageSize: 5,
            pageStart: 5,
            pageEnd: 10
        };
        expect(paginate(paginationConfig)).toStrictEqual({
            paginatedData: [[]],
            paginatedSelection: [[]],
            paginatedIndicies: [[]]
        });
    });

    it('returns grouped page data', () => {
        let paginationConfig = {
            sortedData: [[1, 2, 3], [4, 5], [6, 7, 8], [9, 10]],
            processedIndicies: [[0, 1, 2], [3, 4], [5, 6, 7], [8, 9]],
            processedSelection: [[0, 0, 1], [0, 0], [0, 0, 0], [0, 0]],
            pageSize: 5,
            pageStart: 0,
            pageEnd: 5
        };
        expect(paginate(paginationConfig)).toStrictEqual({
            paginatedData: [[1, 2, 3], [4, 5], [], []],
            paginatedIndicies: [[0, 1, 2], [3, 4], [], []],
            paginatedSelection: [[0, 0, 1], [0, 0], [], []]
        });
    });

    it('returns partial grouped data', () => {
        let paginationConfig = {
            sortedData: [[1, 2, 3], [4, 5], [6, 7, 8], [9, 10]],
            processedIndicies: [[0, 1, 2], [3, 4], [5, 6, 7], [8, 9]],
            processedSelection: [[0, 0, 1], [0, 0], [0, 0, 0], [0, 0]],
            pageSize: 4,
            pageStart: 5,
            pageEnd: 10
        };
        expect(paginate(paginationConfig)).toStrictEqual({
            paginatedData: [[], [], [6, 7, 8], [9]],
            paginatedIndicies: [[], [], [5, 6, 7], [8]],
            paginatedSelection: [[], [], [0, 0, 0], [0]]
        });
    });

    it('returns grouped data split across multiple pages', () => {
        let paginationConfig = {
            sortedData: [[1, 2, 3], [4, 5, 6, 7, 8], [9, 10]],
            processedIndicies: [[0, 1, 2], [3, 4, 5, 6, 7], [8, 9]],
            processedSelection: [[0, 0, 1], [0, 0, 0, 0, 0], [0, 0]],
            pageSize: 5,
            pageStart: 5,
            pageEnd: 11
        };
        expect(paginate(paginationConfig)).toStrictEqual({
            paginatedData: [[], [6, 7, 8], [9, 10]],
            paginatedIndicies: [[], [5, 6, 7], [8, 9]],
            paginatedSelection: [[], [0, 0, 0], [0, 0]]
        });
    });
});
