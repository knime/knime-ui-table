import { describe, it, expect } from 'vitest';
import isSinglePage from '../isSinglePage';

describe('isSinglePage', () => {
    it('returns true if pagination is disabled with less items than page size', () => {
        const currentItems = 3;
        const pageSize = 4;
        expect(isSinglePage(currentItems, pageSize)).toBe(true);
    });

    it('returns true if pagination is disabled with equal items and page size', () => {
        const currentItems = 4;
        const pageSize = 4;
        expect(isSinglePage(currentItems, pageSize)).toBe(true);
    });

    it('returns false if pagination is enabled', () => {
        const currentItems = 6;
        const pageSize = 4;
        expect(isSinglePage(currentItems, pageSize)).toBe(false);
    });
});
