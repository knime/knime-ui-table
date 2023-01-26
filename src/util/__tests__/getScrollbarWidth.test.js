import { describe, expect, it } from 'vitest';
import getScrollbarWidth from '../getScrollbarWidth';


describe('getScrollbarWidth', () => {
    it('returns a valid number', () => {
        const width = getScrollbarWidth();
        expect(typeof width).toBe('number');
        expect(width).not.toBeNaN();
    });
});
