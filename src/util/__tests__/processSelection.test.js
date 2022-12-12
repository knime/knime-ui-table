import { describe, it, expect } from 'vitest';
import { getProcessedRowInd } from '../processSelection';

describe('getProcessedRowInd', () => {
    it('returns the index of a row on the first page with no groups', () => {
        const params = {
            relativeInd: 1,
            groupInd: 0,
            currentPage: 1,
            currentPageSize: 10,
            currentGroup: null,
            processedIndicies: [[3, 1, 2, 5, 4]]
        };
        expect(getProcessedRowInd(params)).toBe(1);
    });

    it('returns the index of a row when not on the first page with no groups', () => {
        const params = {
            relativeInd: 1,
            groupInd: 0,
            currentPage: 2,
            currentPageSize: 5,
            currentGroup: null,
            processedIndicies: [[3, 1, 2, 5, 4, 6, 9, 7, 0, 8]]
        };
        expect(getProcessedRowInd(params)).toBe(6);
    });

    it('returns the index of a row in a leading group on the first page', () => {
        const params = {
            relativeInd: 1,
            groupInd: 0,
            currentPage: 1,
            currentPageSize: 5,
            currentGroup: 'Agent',
            processedIndicies: [[3, 1, 2], [5, 4, 6, 9, 7, 0, 8]]
        };
        expect(getProcessedRowInd(params)).toBe(1);
    });

    it('returns the index of a row in a trailing group on the first page', () => {
        const params = {
            relativeInd: 1,
            groupInd: 1,
            currentPage: 1,
            currentPageSize: 5,
            currentGroup: 'Agent',
            processedIndicies: [[3, 1, 2], [5, 4, 6, 9, 7, 0, 8]]
        };
        expect(getProcessedRowInd(params)).toBe(1);
    });

    it('returns the index of a row in a leading group when not on the first page', () => {
        const params = {
            relativeInd: 1,
            groupInd: 2,
            currentPage: 2,
            currentPageSize: 5,
            currentGroup: 'Agent',
            processedIndicies: [[3, 1, 2], [5, 4], [6, 9], [7, 0, 8]]
        };
        expect(getProcessedRowInd(params)).toBe(1);
    });

    it('returns the index of a row in a trailing group when not on the first page', () => {
        const params = {
            relativeInd: 1,
            groupInd: 2,
            currentPage: 2,
            currentPageSize: 5,
            currentGroup: 'Agent',
            processedIndicies: [[3, 1, 2], [5, 4], [6, 9], [7, 0, 8]]
        };
        expect(getProcessedRowInd(params)).toBe(1);
    });

    it('returns the index of a row in a split group when not on the first page', () => {
        const params = {
            relativeInd: 3,
            groupInd: 1,
            currentPage: 2,
            currentPageSize: 5,
            currentGroup: 'Agent',
            processedIndicies: [[3, 1, 2], [5, 4, 6, 9, 7, 0, 8]]
        };
        expect(getProcessedRowInd(params)).toBe(5);
    });

    it('returns the index of a row in a split multi-page group when not on the first page', () => {
        const params = {
            relativeInd: 2,
            groupInd: 1,
            currentPage: 3,
            currentPageSize: 5,
            currentGroup: 'Agent',
            processedIndicies: [[3, 1, 2], [5, 4, 6, 9, 7, 0, 8, 10, 11, 12]]
        };
        expect(getProcessedRowInd(params)).toBe(9);
    });
});
