import { columnTypes } from '~/config/table.config';
import { getFilterConfigs, getDefaultFilterValues } from '~/util/getFilterConfigs';

describe('getFilterConfigs', () => {
    let mockColumns = [];
    let mockTypes = {};
    let mockDomains = {};
    let mockValues = {};
    Object.values(columnTypes).forEach((colType, ind) => {
        let mockColumnName = `column-${ind}`;
        mockColumns.push(mockColumnName);
        mockTypes[mockColumnName] = colType;
        let expectedValue = '';
        if ([columnTypes.Nominal, columnTypes.Boolean].includes(colType)) {
            expectedValue = [];
            mockDomains[mockColumnName] = ['test1', 'test2'];
        }
        mockValues[mockColumnName] = expectedValue;
    });

    it('gets default filter values', () => {
        expect(getDefaultFilterValues(mockColumns, mockTypes)).toStrictEqual(mockValues);
    });

    it('creates filter configs', () => {
        let filterConfigs = getFilterConfigs({
            domains: mockDomains, columns: mockColumns, types: mockTypes, values: mockValues
        });
        expect(filterConfigs).toStrictEqual([{
            is: 'FilterMultiselect',
            possibleValues: [{ id: 'test1', text: 'test1' }, { id: 'test2', text: 'test2' }],
            value: []
        }, {
            is: 'FilterInputField',
            value: ''
        }, {
            is: 'FilterInputField',
            value: ''
        }, {
            is: 'FilterInputField',
            value: ''
        }, {
            is: 'FilterDropdown',
            possibleValues: [{ id: 'test1', text: 'test1' }, { id: 'test2', text: 'test2' }],
            value: []
        }, {
            is: 'FilterInputField',
            value: ''
        }, {
            is: 'FilterInputField',
            value: ''
        }]);
    });
});
