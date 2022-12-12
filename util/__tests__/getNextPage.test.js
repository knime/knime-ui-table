import { describe, it, expect } from 'vitest';
import { getNextPage } from '../getNextPage';

describe('getNextPage', () => {
    it('returns 1 if the pageSize is greater than the total number of rows', () => {
        const pageSize = 5;
        const currentPage = 1;
        const availableRows = 3;
        const pageRows = 3;
        expect(getNextPage(pageSize, currentPage, availableRows, pageRows)).toBe(1);
    });

    it('returns null if no page change is needed', () => {
        const pageSize = 5;
        const currentPage = 1;
        const availableRows = 10;
        const pageRows = 5;
        expect(getNextPage(pageSize, currentPage, availableRows, pageRows)).toBe(null);
    });

    it('finds the closest viable page if the current page is out of range', () => {
        const pageSize = 5;
        const currentPage = 3;
        const availableRows = 10;
        expect(getNextPage(pageSize, currentPage, availableRows)).toBe(2);
    });

    it('finds the closest viable page if the current page has no rows', () => {
        const pageSize = 5;
        const currentPage = 2;
        const availableRows = 10;
        const pageRows = 0;
        expect(getNextPage(pageSize, currentPage, availableRows, pageRows)).toBe(2);
    });
});
