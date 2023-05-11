import { describe, it, expect } from 'vitest';
import getColumnDomains from '../getColumnDomains';
import { columnTypes, typeFormatters } from '@/config/table.config';

describe('getColumnDomains', () => {
    let dataMock = [
        { col1: true, col2: 'A' },
        { col1: true, col2: 'B' },
        { col1: true, col2: 'C' },
        { col1: false, col2: 'D' },
        { col1: false, col2: 'E' }
    ];
    let types = {
        col1: columnTypes.Boolean,
        col2: columnTypes.Nominal
    };
    let formatters = {
        col1: item => item ? 'Yes' : 'No',
        col2: item => item.toLowerCase()
    };

    it('creates filter configurations for Nominal, Numeric and Boolean', () => {
        expect(getColumnDomains({ data: dataMock, formatters, types })).toStrictEqual({
            col1: ['Yes', 'No'],
            col2: ['a', 'b', 'c', 'd', 'e']
        });
    });

    it('removes duplicate values', () => {
        expect(getColumnDomains({ data: [...dataMock, ...dataMock], formatters, types })).toStrictEqual({
            col1: ['Yes', 'No'],
            col2: ['a', 'b', 'c', 'd', 'e']
        });
    });

    it('allows mapping from different type', () => {
        let cardinalData = dataMock.map((row, rowInd) => {
            let newRow = JSON.parse(JSON.stringify(row));
            newRow.col2 = rowInd;
            return newRow;
        });
        formatters.col2 = item => item;
        expect(getColumnDomains({ data: [...cardinalData, ...cardinalData], formatters, types })).toStrictEqual({
            col1: ['Yes', 'No'],
            col2: [0, 1, 2, 3, 4]
        });
    });

    it('can use formatters to transform domain', () => {
        let dataMock = [
            { col1: true, col2: 'A' },
            { col1: true, col2: 'B' },
            { col1: null, col2: 'C' },
            { col1: undefined, col2: 'D' },
            { col1: false, col2: 'E' },
            { col1: false, col2: 'Missing label' }
        ];
        let nominalMap = {
            A: 'Class A',
            B: 'Class B',
            C: 'Class C',
            D: 'Class D',
            E: 'Class E'
        };
        let formatters = {
            col1: item => {
                if (typeof item === 'boolean') {
                    return item ? 'Yes' : 'No';
                }
                return '-';
            },
            col2: item => nominalMap[item] || 'No Data'
        };
        expect(getColumnDomains({ data: [...dataMock, ...dataMock], formatters, types })).toStrictEqual({
            col1: ['Yes', '-', 'No'],
            col2: [
                'Class A',
                'Class B',
                'Class C',
                'Class D',
                'Class E',
                'No Data'
            ]
        });
    });

    it('creates the entry null in the domain for missing values when using the default formatters', () => {
        const dataMock = [
            { col1: true, col2: 'A' },
            { col1: true, col2: 'B' },
            { col1: null, col2: 'C' },
            { col1: undefined, col2: 'D' },
            { col1: { metadata: 'Dummy message' }, col2: 'E' },
            { col1: false, col2: 'Missing label' }
        ];

        const formatters = {
            col1: typeFormatters.Boolean,
            col2: typeFormatters.Nominal
        };

        expect(getColumnDomains({ data: dataMock, formatters, types })).toStrictEqual({
            col1: [true, null, undefined, false],
            col2: ['A', 'B', 'C', 'D', 'E', 'Missing label']
        });
    });
});
