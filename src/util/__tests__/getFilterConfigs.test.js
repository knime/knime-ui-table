import { describe, it, expect } from 'vitest';
import { columnTypes } from '@/config/table.config';
import { getFilterConfigs, getInitialFilterValues, getDefaultFilterValues } from '../getFilterConfigs';

describe('getFilterConfigs', () => {
    let mockColumns = [];
    let mockTypes = {};
    let mockDomains = {};
    let mockValues = {};
    Object.values(columnTypes).forEach((colType, ind) => {
        let mockColumnName = `column-${ind}`;
        mockColumns.push(mockColumnName);
        mockTypes[mockColumnName] = colType;
        if ([columnTypes.Nominal, columnTypes.Boolean].includes(colType)) {
            mockDomains[mockColumnName] = ['test1', 'test2'];
        }
        mockValues[mockColumnName] = colType === columnTypes.Nominal ? [] : '';
    });

    it('gets default filter values', () => {
        expect(getDefaultFilterValues(mockColumns, mockTypes)).toStrictEqual(mockValues);
    });

    it('gets initial filter values', () => {
        expect(getInitialFilterValues(mockColumns, mockTypes, {})).toStrictEqual(mockValues);
        expect(getInitialFilterValues(
            ['col'],
            { col: columnTypes.String },
            { col: 'initial Value' }
        )).toStrictEqual({ col: 'initial Value' });
    });

    it('creates filter configs', () => {
        let filterConfigs = getFilterConfigs({
            domains: mockDomains, columns: mockColumns, types: mockTypes, values: mockValues
        });
        expect(filterConfigs).toStrictEqual([{
            is: 'ControlMultiselect',
            possibleValues: [{ id: 'test1', text: 'test1' }, { id: 'test2', text: 'test2' }],
            modelValue: []
        }, {
            is: 'FilterInputField',
            modelValue: ''
        }, {
            is: 'FilterInputField',
            modelValue: ''
        }, {
            is: 'FilterInputField',
            modelValue: ''
        }, {
            is: 'ControlDropdown',
            possibleValues: [{ id: 'test1', text: 'test1' }, { id: 'test2', text: 'test2' }],
            modelValue: ''
        }, {
            is: 'FilterInputField',
            modelValue: ''
        }, {
            is: 'FilterInputField',
            modelValue: ''
        }]);
    });
});
