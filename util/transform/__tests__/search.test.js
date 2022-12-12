import { describe, it, expect } from 'vitest';
import { searchCell } from '../search';
import { columnTypes } from '@/config/table.config';

describe('searchData', () => {
    let cb = x => x;

    describe('searchCell', () => {
        it('returns false if field is "undefined"', () => {
            expect(searchCell()).toBe(false);
            expect(searchCell(undefined)).toBe(false);
        });

        it('compared string values if missing type', () => {
            expect(searchCell('1', null, cb, '1')).toBe(true);
            expect(searchCell('James', null, cb, 'James')).toBe(true);
            expect(searchCell(1, null, cb, '1')).toBe(true);
            expect(searchCell(NaN, null, cb, 'NaN')).toBe(true);
            expect(searchCell(Infinity, null, cb, 'Infinity')).toBe(true);
            expect(searchCell([1], null, cb, '1')).toBe(true);
            expect(searchCell({}, null, cb, 'Object')).toBe(true);
            expect(searchCell('2020-10-28T13:02:36+00:00', null, cb, '2020')).toBe(true);
            expect(searchCell(1603890181, null, cb, '181')).toBe(true);
            expect(searchCell(true, null, cb, 'true')).toBe(true);
            expect(searchCell(null, null, cb, 'x')).toBe(false);
        });

        it('compared string values if missing type and formatter', () => {
            expect(searchCell('1', null, null, '1')).toBe(true);
            expect(searchCell('James', null, null, 'James')).toBe(true);
            expect(searchCell(1, null, null, '1')).toBe(true);
            expect(searchCell(NaN, null, null, 'NaN')).toBe(true);
            expect(searchCell(Infinity, null, null, 'Infinity')).toBe(true);
            expect(searchCell([1], null, null, '1')).toBe(true);
            expect(searchCell({}, null, null, 'Object')).toBe(true);
            expect(searchCell('2020-10-28T13:02:36+00:00', null, null, '2020')).toBe(true);
            expect(searchCell(1603890181, null, null, '181')).toBe(true);
            expect(searchCell(true, null, null, 'true')).toBe(true);
            expect(searchCell(null, null, null, 'x')).toBe(false);
        });

        it('returns false if query is missing', () => {
            // null
            expect(searchCell('1', columnTypes.String, cb, null)).toBe(false);
            expect(searchCell('James', columnTypes.Nominal, cb, null)).toBe(false);
            expect(searchCell(1, columnTypes.Number, cb, null)).toBe(false);
            expect(searchCell(NaN, columnTypes.Number, cb, null)).toBe(false);
            expect(searchCell(Infinity, columnTypes.Number, cb, null)).toBe(false);
            expect(searchCell([1], columnTypes.Array, cb, null)).toBe(false);
            expect(searchCell({}, columnTypes.Object, cb, null)).toBe(false);
            expect(searchCell('2020-10-28T13:02:36+00:00', columnTypes.DateTime, cb, null)).toBe(false);
            expect(searchCell(1603890181, columnTypes.DateTime, cb, null)).toBe(false);
            expect(searchCell(true, columnTypes.Boolean, cb, null)).toBe(false);
            expect(searchCell(null, columnTypes.Object, cb, null)).toBe(false);
            // undefined
            expect(searchCell('1', columnTypes.String, cb)).toBe(false);
            expect(searchCell('James', columnTypes.Nominal, cb)).toBe(false);
            expect(searchCell(1, columnTypes.Number, cb)).toBe(false);
            expect(searchCell(NaN, columnTypes.Number, cb)).toBe(false);
            expect(searchCell(Infinity, columnTypes.Number, cb)).toBe(false);
            expect(searchCell([1], columnTypes.Array, cb)).toBe(false);
            expect(searchCell({}, columnTypes.Object, cb)).toBe(false);
            expect(searchCell('2020-10-28T13:02:36+00:00', columnTypes.DateTime, cb)).toBe(false);
            expect(searchCell(1603890181, columnTypes.DateTime, cb)).toBe(false);
            expect(searchCell(true, columnTypes.Boolean, cb)).toBe(false);
            expect(searchCell(null, columnTypes.Object, cb)).toBe(false);
        });

        it('is case insensitive', () => {
            expect(searchCell('test', columnTypes.String, cb, 't')).toBe(true);
            expect(searchCell('James', columnTypes.Nominal, cb, 'j')).toBe(true);
            expect(searchCell(NaN, columnTypes.Number, x => x.toString(), 'n')).toBe(true);
            expect(searchCell(['Help'], columnTypes.Array, x => JSON.stringify(x), 'h')).toBe(true);
            expect(searchCell({ test: 'test' }, columnTypes.Object, x => JSON.stringify(x), 'T')).toBe(true);
            expect(searchCell('2020-10-28T13:02:36+00:00', columnTypes.DateTime, cb, 'T')).toBe(true);
            expect(searchCell(true, columnTypes.Boolean, x => JSON.stringify(x), 'T')).toBe(true);
            expect(searchCell(null, columnTypes.Object, x => JSON.stringify(x), 'N')).toBe(true);
        });

        describe('formatted searches', () => {
            it('returns false types where a formatter is required but missing', () => {
                // null
                expect(searchCell('1', columnTypes.String, null, '1')).toBe(false);
                expect(searchCell('James', columnTypes.Nominal, null, 'James')).toBe(false);
                expect(searchCell(1, columnTypes.Number, null, '1')).toBe(false);
                expect(searchCell(NaN, columnTypes.Number, null, 'NaN')).toBe(false);
                expect(searchCell(Infinity, columnTypes.Number, null, 'Infinity')).toBe(false);
                expect(searchCell('2020-10-28T13:02:36+00:00', columnTypes.DateTime, null, '2020')).toBe(false);
                expect(searchCell(1603890181, columnTypes.DateTime, null, '181')).toBe(false);
                expect(searchCell(true, columnTypes.Boolean, null, 'true')).toBe(false);
                // undefined
                expect(searchCell('1', columnTypes.String, undefined, '1')).toBe(false);
                expect(searchCell('James', columnTypes.Nominal, undefined, 'James')).toBe(false);
                expect(searchCell(1, columnTypes.Number, undefined, '1')).toBe(false);
                expect(searchCell(NaN, columnTypes.Number, undefined, 'NaN')).toBe(false);
                expect(searchCell(Infinity, columnTypes.Number, undefined, 'Infinity')).toBe(false);
                expect(searchCell('2020-10-28T13:02:36+00:00', columnTypes.DateTime, undefined, '2020')).toBe(false);
                expect(searchCell(1603890181, columnTypes.DateTime, undefined, '181')).toBe(false);
                expect(searchCell(true, columnTypes.Boolean, undefined, 'true')).toBe(false);
            });

            it('uses formatters during search for supported types', () => {
                let cb = () => '2';
                expect(searchCell('1', columnTypes.String, cb, '2')).toBe(true);
                expect(searchCell('James', columnTypes.Nominal, cb, '2')).toBe(true);
                expect(searchCell(1, columnTypes.Number, cb, '2')).toBe(true);
                expect(searchCell(NaN, columnTypes.Number, cb, '2')).toBe(true);
                expect(searchCell(Infinity, columnTypes.Number, cb, '2')).toBe(true);
                expect(searchCell('2020-10-28T13:02:36+00:00', columnTypes.DateTime, cb, '2')).toBe(true);
                expect(searchCell(1603890181, columnTypes.DateTime, cb, '2')).toBe(true);
                expect(searchCell(true, columnTypes.Boolean, cb, '2')).toBe(true);
            });
        });

        describe('searching objects', () => {
            let t = columnTypes.Object;
            let cb = () => { };

            it('searches stringified objects', () => {
                expect(searchCell({}, t, cb, '{')).toBe(true);
                expect(searchCell({ some: '1' }, t, cb, 'some')).toBe(true);
                expect(searchCell({ some: '1' }, t, cb, '1')).toBe(true);
                expect(searchCell({ some: 'James' }, t, cb, 'James')).toBe(true);
                expect(searchCell({ some: 1 }, t, cb, '1')).toBe(true);
                expect(searchCell({ some: NaN }, t, cb, 'NaN')).toBe(false);
                expect(searchCell({ some: Infinity }, t, cb, 'Infinity')).toBe(false);
                expect(searchCell({ some: [1] }, t, cb, '1')).toBe(true);
                expect(searchCell({ some: {} }, t, cb, '{}')).toBe(true);
                expect(searchCell({ some: '2020-10-28T13:02:36+00:00' }, t, cb, '2020')).toBe(true);
                expect(searchCell({ some: 1603890181 }, t, cb, '181')).toBe(true);
                expect(searchCell({ some: true }, t, cb, 'true')).toBe(true);
                expect(searchCell({ some: null }, t, cb, 'null')).toBe(true);
            });

            it('deep searches stringified objects', () => {
                expect(searchCell({ value: undefined }, t, cb, '{}')).toBe(true);
                expect(searchCell({ value: {} }, t, cb, '{')).toBe(true);
                expect(searchCell({ value: { some: '1' } }, t, cb, 'some')).toBe(true);
                expect(searchCell({ value: { some: '1' } }, t, cb, '1')).toBe(true);
                expect(searchCell({ value: { some: 'James' } }, t, cb, 'James')).toBe(true);
                expect(searchCell({ value: { some: 1 } }, t, cb, '1')).toBe(true);
                expect(searchCell({ value: { some: NaN } }, t, cb, 'NaN')).toBe(false);
                expect(searchCell({ value: { some: Infinity } }, t, cb, 'Infinity')).toBe(false);
                expect(searchCell({ value: { some: [1] } }, t, cb, '1')).toBe(true);
                expect(searchCell({ value: { some: {} } }, t, cb, '{}')).toBe(true);
                expect(searchCell({ value: { some: '2020-10-28T13:02:36+00:00' } }, t, cb, '2020')).toBe(true);
                expect(searchCell({ value: { some: 1603890181 } }, t, cb, '181')).toBe(true);
                expect(searchCell({ value: { some: true } }, t, cb, 'true')).toBe(true);
                expect(searchCell({ value: { some: null } }, t, cb, 'null')).toBe(true);
            });

            it('searches formatted objects and object properties', () => {
                let cb = x => `${Object.keys(x)[0]}Value`;
                expect(searchCell({ some: '1' }, t, cb, 'someValue')).toBe(true);
                expect(searchCell({ some: '1' }, t, cb, '1')).toBe(true);
                expect(searchCell({ some: 'James' }, t, cb, 'someValue')).toBe(true);
                expect(searchCell({ some: 'James' }, t, cb, 'James')).toBe(true);
                expect(searchCell({ some: 1 }, t, cb, 'someValue')).toBe(true);
                expect(searchCell({ some: 1 }, t, cb, '1')).toBe(true);
                expect(searchCell({ some: NaN }, t, cb, 'someValue')).toBe(true);
                expect(searchCell({ some: NaN }, t, cb, 'NaN')).toBe(false);
                expect(searchCell({ some: Infinity }, t, cb, 'someValue')).toBe(true);
                expect(searchCell({ some: Infinity }, t, cb, 'Infinity')).toBe(false);
                expect(searchCell({ some: [1] }, t, cb, 'someValue')).toBe(true);
                expect(searchCell({ some: [1] }, t, cb, '1')).toBe(true);
                expect(searchCell({ some: {} }, t, cb, 'someValue')).toBe(true);
                expect(searchCell({ some: {} }, t, cb, '{}')).toBe(true);
                expect(searchCell({ some: '2020-10-28T13:02:36+00:00' }, t, cb, 'someValue')).toBe(true);
                expect(searchCell({ some: '2020-10-28T13:02:36+00:00' }, t, cb, '2020')).toBe(true);
                expect(searchCell({ some: 1603890181 }, t, cb, 'someValue')).toBe(true);
                expect(searchCell({ some: 1603890181 }, t, cb, '181')).toBe(true);
                expect(searchCell({ some: true }, t, cb, 'someValue')).toBe(true);
                expect(searchCell({ some: true }, t, cb, 'true')).toBe(true);
                expect(searchCell({ some: null }, t, cb, 'someValue')).toBe(true);
                expect(searchCell({ some: null }, t, cb, 'null')).toBe(true);
            });
        });

        describe('searching arrays', () => {
            let t = columnTypes.Array;
            let cb = () => { };

            it('searches stringified arrays', () => {
                expect(searchCell([undefined], t, cb, '[null]')).toBe(true);
                expect(searchCell([], t, cb, ']')).toBe(true);
                expect(searchCell(['1'], t, cb, '1')).toBe(true);
                expect(searchCell(['James'], t, cb, 'James')).toBe(true);
                expect(searchCell([1], t, cb, '1')).toBe(true);
                expect(searchCell([NaN], t, cb, 'NaN')).toBe(false);
                expect(searchCell([Infinity], t, cb, 'Infinity')).toBe(false);
                expect(searchCell([[1]], t, cb, '1')).toBe(true);
                expect(searchCell([{}], t, cb, '{}')).toBe(true);
                expect(searchCell(['2020-10-28T13:02:36+00:00'], t, cb, '2020')).toBe(true);
                expect(searchCell([1603890181], t, cb, '181')).toBe(true);
                expect(searchCell([true], t, cb, 'true')).toBe(true);
                expect(searchCell([null], t, cb, 'null')).toBe(true);
            });

            it('deep searches stringified arrays', () => {
                expect(searchCell([{ value: undefined }], t, cb, '{}')).toBe(true);
                expect(searchCell([{ value: {} }], t, cb, '{')).toBe(true);
                expect(searchCell([{ value: { some: '1' } }], t, cb, 'some')).toBe(true);
                expect(searchCell([{ value: { some: '1' } }], t, cb, '1')).toBe(true);
                expect(searchCell([{ value: { some: 'James' } }], t, cb, 'James')).toBe(true);
                expect(searchCell([{ value: { some: 1 } }], t, cb, '1')).toBe(true);
                expect(searchCell([{ value: { some: NaN } }], t, cb, 'NaN')).toBe(false);
                expect(searchCell([{ value: { some: Infinity } }], t, cb, 'Infinity')).toBe(false);
                expect(searchCell([{ value: { some: [1] } }], t, cb, '1')).toBe(true);
                expect(searchCell([{ value: { some: {} } }], t, cb, '{}')).toBe(true);
                expect(searchCell([{ value: { some: '2020-10-28T13:02:36+00:00' } }], t, cb, '2020')).toBe(true);
                expect(searchCell([{ value: { some: 1603890181 } }], t, cb, '181')).toBe(true);
                expect(searchCell([{ value: { some: true } }], t, cb, 'true')).toBe(true);
                expect(searchCell([{ value: { some: null } }], t, cb, 'null')).toBe(true);
            });
        });
    });
});
