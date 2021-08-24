import { filter } from '~/components/table/util/transform/filter';
import { columnTypes } from '~/config/table.config';

describe('filter', () => {
    let now = new Date().toString();
    let getParams = () => ({
        data: [
            { col1: 1, col2: now, col3: 'A' },
            { col1: 2, col2: now, col3: 'B' },
            { col1: 2, col2: now, col3: 'A' },
            { col1: 3, col2: now, col3: 'B' },
            { col1: 3, col2: now, col3: 'C' }
        ],
        columnKeys: ['col1', 'col2', 'col3'],
        formatters: {
            col1: item => item.toString(),
            col2: item => item,
            col3: item => item
        },
        types: {
            col1: columnTypes.Number,
            col2: columnTypes.DateTime,
            col3: columnTypes.Nominal
        },
        filterValues: {},
        timeFilter: null,
        timeFilterKey: null,
        searchQuery: '',
        showFilter: false
    });

    it('returns all data if there are no filter values', () => {
        let params = getParams();
        let { filteredData, filteredIndicies } = filter(params);
        expect(filteredData).toStrictEqual(params.data);
        expect(filteredIndicies).toStrictEqual([0, 1, 2, 3, 4]);
    });

    describe('time filters', () => {
        it('filters data outside of the provided time filter', () => {
            let lastMonth = new Date(new Date().setMonth(new Date(now).getMonth() - 1)).toString();
            let params = getParams();
            params.data[1].col2 = lastMonth;
            params.data[4].col2 = lastMonth;
            params.timeFilterKey = 'col2';
            params.timeFilter = 'Last week';
            let { filteredData, filteredIndicies } = filter(params);
            expect(filteredData).toStrictEqual([params.data[0], params.data[2], params.data[3]]);
            expect(filteredIndicies).toStrictEqual([0, 2, 3]);
        });

        it('includes data in the final set if its parsed time filter column value is InvalidDate', () => {
            let lastMonth = new Date(new Date().setMonth(new Date(now).getMonth() - 1)).toString();
            let invalidISOString = '21-01-1901:00[Europe/Berlin]';
            let params = getParams();
            params.data[1].col2 = lastMonth;
            params.data[4].col2 = invalidISOString;
            params.timeFilterKey = 'col2';
            params.timeFilter = 'Last week';
            let { filteredData, filteredIndicies } = filter(params);
            expect(filteredData).toStrictEqual([params.data[0], params.data[2], params.data[3], params.data[4]]);
            expect(filteredIndicies).toStrictEqual([0, 2, 3, 4]);
        });

        it('includes data in the final set if it cannot parse its time filter column value', () => {
            let lastMonth = new Date(new Date().setMonth(new Date(now).getMonth() - 1)).toString();
            let params = getParams();
            params.data[1].col2 = lastMonth;
            params.data[4].col2 = null;
            params.timeFilterKey = 'col2';
            params.timeFilter = 'Last week';
            let { filteredData, filteredIndicies } = filter(params);
            expect(filteredData).toStrictEqual([params.data[0], params.data[2], params.data[3], params.data[4]]);
            expect(filteredIndicies).toStrictEqual([0, 2, 3, 4]);
        });
    });

    describe('global search filter', () => {
        it('filters data that does not match the global search query', () => {
            let params = getParams();
            params.searchQuery = 'A';
            // prevent tests from changing over time with different months, etc.
            params.data = params.data.map(item => {
                item.col2 = null;
                return item;
            });
            let { filteredData, filteredIndicies } = filter(params);
            expect(filteredData).toStrictEqual([params.data[0], params.data[2]]);
            expect(filteredIndicies).toStrictEqual([0, 2]);
        });
    });

    describe('column filters', () => {
        it('filters nominal data when provided a domain', () => {
            let params = getParams();
            params.filterValues = {
                col3: ['A', 'C']
            };
            params.showFilter = true;
            let { filteredData, filteredIndicies } = filter(params);
            expect(filteredData).toStrictEqual([params.data[0], params.data[2], params.data[4]]);
            expect(filteredIndicies).toStrictEqual([0, 2, 4]);
        });

        it('filters numeric data when provided filter', () => {
            let params = getParams();
            params.filterValues = {
                col1: '3'
            };
            params.showFilter = true;
            let { filteredData, filteredIndicies } = filter(params);
            expect(filteredData).toStrictEqual([params.data[3], params.data[4]]);
            expect(filteredIndicies).toStrictEqual([3, 4]);
        });

        it('filters DateTime data when provided filter', () => {
            let currentMonth = '2020-11-11T10:07:30.477Z';
            let lastMonth = '2020-10-10T10:07:30.477Z';
            let params = getParams();
            params.data[0].col2 = lastMonth;
            params.data[1].col2 = lastMonth;
            params.data[2].col2 = currentMonth;
            params.data[3].col2 = currentMonth;
            params.data[4].col2 = currentMonth;
            params.filterValues = {
                col2: currentMonth
            };
            params.showFilter = true;
            let { filteredData, filteredIndicies } = filter(params);
            expect(filteredData).toStrictEqual([params.data[2], params.data[3], params.data[4]]);
            expect(filteredIndicies).toStrictEqual([2, 3, 4]);
        });

        it('includes columns with missing types in the filter', () => {
            let params = getParams();
            params.filterValues = {
                col4: '10'
            };
            // add a column of unknown type to the data set
            params.data = params.data.map(item => {
                item.col4 = '9';
                return item;
            });
            params.columnKeys.push('col4');
            params.showFilter = true;
            let { filteredData, filteredIndicies } = filter(params);
            expect(filteredData).toStrictEqual(params.data);
            expect(filteredIndicies).toStrictEqual([0, 1, 2, 3, 4]);
        });

        it('excludes rows with undefined values for the column being filter', () => {
            let params = getParams();
            params.filterValues = {
                col3: ['A', 'C']
            };
            params.showFilter = true;
            params.data[0].col3 = undefined;
            let { filteredData, filteredIndicies } = filter(params);
            expect(filteredData).toStrictEqual([params.data[2], params.data[4]]);
            expect(filteredIndicies).toStrictEqual([2, 4]);
        });

        it('does not filter with empty or missing column filter values', () => {
            let params = getParams();
            params.filterValues = {
                col3: undefined
            };
            params.showFilter = true;
            let { filteredData, filteredIndicies } = filter(params);
            expect(filteredData).toStrictEqual(params.data);
            expect(filteredIndicies).toStrictEqual([0, 1, 2, 3, 4]);
            params.filterValues = {
                col3: []
            };
            ({ filteredData, filteredIndicies } = filter(params));
            expect(filteredData).toStrictEqual(params.data);
            expect(filteredIndicies).toStrictEqual([0, 1, 2, 3, 4]);
            params.filterValues = {
                col3: null
            };
            ({ filteredData, filteredIndicies } = filter(params));
            expect(filteredData).toStrictEqual(params.data);
            expect(filteredIndicies).toStrictEqual([0, 1, 2, 3, 4]);
        });
    });

    it('combines all filters', () => {
        let testDataPoint = { col1: 3, col2: now, col3: 'A' };
        let testDate = new Date().setFullYear(2019, 10, 31).toString();
        let params = getParams();
        // prevent tests from changing over time with different months, etc.
        params.data = params.data.map(item => {
            item.col2 = null;
            return item;
        });
        // set a matching search term item to the filtered date
        params.data[0].col2 = testDate;
        // add an extra item to test the column specific filter
        params.data.push(testDataPoint);
        params.timeFilterKey = 'col2';
        params.timeFilter = 'Last year';
        params.searchQuery = 'A';
        params.filterValues = {
            col1: '3'
        };
        params.showFilter = true;
        let { filteredData, filteredIndicies } = filter(params);
        expect(filteredData).toStrictEqual([testDataPoint]);
        expect(filteredIndicies).toStrictEqual([5]);
    });
});
