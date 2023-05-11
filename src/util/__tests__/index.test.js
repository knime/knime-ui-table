import { describe, expect, it } from 'vitest';
import { isMissingValue } from '..';

describe('index', () => {
    it.each([
        [true, null],
        [true, { metadata: 'Message' }],
        [false, undefined],
        [false, true],
        [false, false],
        [false, 0],
        [false, ''],
        [false, 'Message'],
        [false, []],
        [false, {}],
        [false, { data: 'Message' }]
    ])('isMissingValue returns %s for \'%s\'', (isMissing, value) => {
        expect(isMissingValue(value)).toBe(isMissing);
    });
});
