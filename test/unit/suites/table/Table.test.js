import { shallowMount, mount } from '@vue/test-utils';
import Table from '~/components/Table.vue';
import TableUI from '~/components/TableUI.vue';

import { columnTypes } from '~/config/table.config';
import { MIN_COLUMN_SIZE, SPECIAL_COLUMNS_SIZE, DATA_COLUMNS_MARGIN } from '~/util/constants';

jest.mock('raf-throttle', () => function (func) {
    return function (...args) {
        // eslint-disable-next-line no-invalid-this
        return func.apply(this, args);
    };
});

describe('Table.vue', () => {
    const defaultPropsData = {
        allColumnHeaders: ['A', 'B'],
        allColumnKeys: ['a', 'b'],
        allColumnTypes: { a: columnTypes.Number, b: columnTypes.Number },
        allFormatters: { a: x => x, b: x => x },
        allClassGenerators: {},
        defaultColumns: ['a', 'b'],
        showSorting: true,
        showColumnSelection: true,
        showGroupBy: true,
        showSearch: true,
        showColumnFilters: true,
        showBottomControls: true,
        showSelection: true,
        showPopovers: true,
        parentSelected: [0]
    };

    beforeEach(() => {
        window.IntersectionObserver = jest.fn(() => ({
            observe: () => null,
            unobserve: () => null,
            disconnect: () => null
        }));
    });


    const doMount = ({ customPropsData = {}, dataCount = 1, shallow = true } = {}) => {
        const propsData = {
            allData: [],
            ...defaultPropsData,
            ...customPropsData
        };
        if (propsData.allData.length === 0) {
            for (let i = 0; i < dataCount; i++) {
                propsData.allData.push({ a: i, b: i + 1 });
            }
        }

        const wrapper = shallow ? shallowMount(Table, { propsData }) : mount(Table, { propsData });

        return { wrapper };
    };

    describe('configurations', () => {
        it('creates UI configurations', () => {
            const { wrapper } = doMount({ shallow: false });

            expect(wrapper.vm.dataConfig).toStrictEqual({
                columnConfigs: [{
                    classGenerator: [],
                    filterConfig: { is: 'FilterInputField', value: '' },
                    formatter: expect.any(Function),
                    hasSlotContent: false,
                    header: 'A',
                    key: 'a',
                    popoverRenderer: expect.undefined,
                    size: 50,
                    type: columnTypes.Number
                }, {
                    classGenerator: [],
                    filterConfig: { is: 'FilterInputField', value: '' },
                    formatter: expect.any(Function),
                    hasSlotContent: false,
                    header: 'B',
                    key: 'b',
                    popoverRenderer: expect.undefined,
                    size: 50,
                    type: columnTypes.Number
                }],
                rowConfig: { compactMode: false }
            });
            expect(wrapper.vm.tableConfig).toStrictEqual({
                showBottomControls: true,
                showCollapser: false,
                showColumnFilters: true,
                showPopovers: true,
                showSelection: true,
                pageConfig: {
                    tableSize: 1,
                    currentSize: 1,
                    currentPage: 1,
                    pageSize: 10,
                    possiblePageSizes: [5, 10, 25, 50, 100]
                },
                columnSelectionConfig: {
                    currentColumns: ['A', 'B'],
                    possibleColumns: ['A', 'B']
                },
                groupByConfig: {
                    currentGroup: null,
                    possibleGroups: [],
                    currentGroupValues: ['None']
                },
                searchConfig: { searchQuery: '' },
                sortConfig: { sortColumn: 0, sortDirection: -1 },
                subMenuItems: [],
                groupSubMenuItems: [],
                columnFilterInitiallyActive: false
            });
        });

        it('supports default sorting when showSort is true', () => {
            const { wrapper } = doMount(
                {
                    shallow: false,
                    customPropsData: { showSorting: true, defaultSortColumn: 1, defaultSortColumnDirection: 1 }
                }
            );

            expect(wrapper.vm.tableConfig).toEqual(expect.objectContaining({
                sortConfig: { sortColumn: 1, sortDirection: 1 }
            }));
            expect(wrapper.vm.columnSort).toBe(1);
            expect(wrapper.vm.columnSortDirection).toBe(1);
        });

        it('supports default sorting when showSort is false', () => {
            const { wrapper } = doMount(
                {
                    shallow: false,
                    customPropsData: { showSorting: false, defaultSortColumn: 1, defaultSortColumnDirection: 1 }
                }
            );

            expect(wrapper.vm.tableConfig).not.toHaveProperty('sortConfig');
            expect(wrapper.vm.columnSort).toBe(1);
            expect(wrapper.vm.columnSortDirection).toBe(1);
        });

        it('supports initial filtering', () => {
            const { wrapper } = doMount(
                {
                    shallow: false,
                    customPropsData: { showColumnFilters: true, initialFilterValues: { a: '4', b: '10' } }
                }
            );

            expect(wrapper.vm.tableConfig.columnFilterInitiallyActive).toBe(true);
            expect(wrapper.vm.dataConfig.columnConfigs).toEqual(expect.arrayContaining([
                expect.objectContaining({ key: 'a', filterConfig: { is: 'FilterInputField', value: '4' } }),
                expect.objectContaining({ key: 'b', filterConfig: { is: 'FilterInputField', value: '10' } })
            ]));
        });

        it('ignores initial filtering if show coulmn filters is set to false', () => {
            const { wrapper } = doMount(
                {
                    shallow: false,
                    customPropsData: { showColumnFilters: false, initialFilterValues: { a: '4', b: '10' } }
                }
            );

            expect(wrapper.vm.tableConfig.columnFilterInitiallyActive).toBe(false);
            expect(wrapper.vm.dataConfig.columnConfigs).toEqual(expect.arrayContaining([
                expect.objectContaining({ key: 'a', filterConfig: { is: 'FilterInputField', value: '' } }),
                expect.objectContaining({ key: 'b', filterConfig: { is: 'FilterInputField', value: '' } })
            ]));
        });
    });

    it('generates the correct data config with isSortable key if there are column specific sort configs', () => {
        const { wrapper } = doMount({ customPropsData: { allColumnSpecificSortConfigs: [true, false] } });

        expect(wrapper.vm.dataConfig).toMatchObject({ columnConfigs: [{ isSortable: true }, { isSortable: false }] });
    });

    describe('component lifecycle', () => {
        it('creates internally required index reference lists on creation', () => {
            const { wrapper } = doMount();

            expect(wrapper.vm.masterSelected).toStrictEqual([1]);
            expect(wrapper.vm.processedIndicies).toStrictEqual([[0]]);
        });

        it('updates internal reference lists when data changes', async () => {
            const { wrapper } = doMount();
            const expectedMasterSelection = [1];
            const expectedProcessedIndicies = [[0]];

            expect(wrapper.vm.masterSelected).toStrictEqual(expectedMasterSelection);
            expect(wrapper.vm.processedIndicies).toStrictEqual(expectedProcessedIndicies);

            let newAllData = [];
            for (let i = 0; i < 10; i++) {
                newAllData.push({ a: i, b: i + 1 });
            }
            await wrapper.setProps({ allData: newAllData });

            for (let i = 1; i < 10; i++) {
                expectedMasterSelection.push(0);
                expectedProcessedIndicies[0].unshift(i);
            }
            expect(wrapper.vm.masterSelected).toStrictEqual(expectedMasterSelection);
            expect(wrapper.vm.processedIndicies).toStrictEqual(expectedProcessedIndicies);
        });
    });

    describe('events', () => {
        it('adds / removes intersection observer / resize listener and updates client width accordingly', () => {
            const observe = jest.fn();
            const unobserve = jest.fn();
            window.IntersectionObserver = jest.fn(() => ({
                observe,
                unobserve
            }));
            jest.spyOn(window, 'addEventListener');
            jest.spyOn(window, 'removeEventListener');

            const { wrapper } = doMount();

            expect(wrapper.vm.clientWidth).toBe(0);
            expect(window.IntersectionObserver).toHaveBeenCalledTimes(1);
            expect(observe).toHaveBeenCalledTimes(1);
            expect(observe).toHaveBeenCalledWith(wrapper.vm.$el);

            let clientWidth = 100;
            const mockedEntries = [{
                target: null
            }, {
                target: wrapper.vm.$el,
                boundingClientRect: { width: 0 }
            }, {
                target: wrapper.vm.$el,
                boundingClientRect: { width: clientWidth }
            }];
            const [callback] = window.IntersectionObserver.mock.calls[0];
            callback(mockedEntries, window.IntersectionObserver.mock.results[0].value);
            expect(wrapper.vm.clientWidth).toBe(clientWidth);
            expect(unobserve).toHaveBeenCalledTimes(1);
            expect(unobserve).toHaveBeenCalledWith(wrapper.vm.$el);
            expect(window.addEventListener).toHaveBeenCalledTimes(1);
            expect(window.addEventListener).toHaveBeenCalledWith('resize', wrapper.vm.onResize);

            wrapper.vm.$el.getBoundingClientRect = function () {
                return { width: 0 };
            };
            window.dispatchEvent(new Event('resize'));
            expect(wrapper.vm.clientWidth).toBe(clientWidth);
            expect(window.removeEventListener).toHaveBeenCalledTimes(1);
            expect(window.removeEventListener).toHaveBeenCalledWith('resize', wrapper.vm.onResize);
            expect(window.IntersectionObserver).toHaveBeenCalledTimes(2);
            expect(observe).toHaveBeenCalledTimes(2);
            expect(observe).toHaveBeenLastCalledWith(wrapper.vm.$el);

            callback(mockedEntries, window.IntersectionObserver.mock.results[0].value);
            expect(wrapper.vm.clientWidth).toBe(clientWidth);
            expect(unobserve).toHaveBeenCalledTimes(2);
            expect(unobserve).toHaveBeenLastCalledWith(wrapper.vm.$el);
            expect(window.addEventListener).toHaveBeenCalledTimes(2);
            expect(window.addEventListener).toHaveBeenLastCalledWith('resize', wrapper.vm.onResize);

            clientWidth = 200;
            wrapper.vm.$el.getBoundingClientRect = function () {
                return { width: clientWidth };
            };
            window.dispatchEvent(new Event('resize'));
            expect(wrapper.vm.clientWidth).toBe(clientWidth);
    
            wrapper.destroy();
            expect(window.removeEventListener).toHaveBeenCalledTimes(2);
            expect(window.removeEventListener).toHaveBeenLastCalledWith('resize', wrapper.vm.onResize);
        });

        describe('page control', () => {
            it('registers pageChange events', () => {
                const { wrapper } = doMount({ dataCount: 100 });
                expect(wrapper.vm.currentPage).toBe(1);
                wrapper.find(TableUI).vm.$emit('pageChange', 1);
                expect(wrapper.vm.currentPage).toBe(2);
                wrapper.find(TableUI).vm.$emit('pageChange', -1);
                expect(wrapper.vm.currentPage).toBe(1);
            });

            it('registers search events and updates query', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.searchQuery).toBe('');
                wrapper.find(TableUI).vm.$emit('search', 'Find me');
                expect(wrapper.vm.searchQuery).toBe('Find me');
            });

            it('empties search query if search event value is empty', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.searchQuery).toBe('');
                wrapper.find(TableUI).vm.$emit('search', '');
                expect(wrapper.vm.searchQuery).toBe(null);
            });

            it('empties search query if search event value is missing', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.searchQuery).toBe('');
                wrapper.find(TableUI).vm.$emit('search');
                expect(wrapper.vm.searchQuery).toBe(null);
            });

            it('registers groupUpdate events and updates the current group', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.currentGroup).toBe(null);
                wrapper.find(TableUI).vm.$emit('groupUpdate', 'a');
                expect(wrapper.vm.currentGroup).toBe('a');
            });

            it('registers columnReorder events and updates the column order', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.currentAllColumnOrder).toStrictEqual([0, 1]);
                wrapper.find(TableUI).vm.$emit('columnReorder', 1, 0);
                expect(wrapper.vm.currentAllColumnOrder).toStrictEqual([1, 0]);
            });

            it('registers columnUpdate events and updates the currentColumns', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.currentColumns).toStrictEqual([0, 1]);
                wrapper.find(TableUI).vm.$emit('columnUpdate', ['A']);
                expect(wrapper.vm.currentColumns).toStrictEqual([0]);
            });

            it('registers timeFilterUpdate events and updates the time filter', () => {
                const { wrapper } = doMount({ customPropsData: { timeFilterKey: 'a' } });
                expect(wrapper.vm.currentTimeFilter).toBe('Last month');
                wrapper.find(TableUI).vm.$emit('timeFilterUpdate', 'Last year');
                expect(wrapper.vm.currentTimeFilter).toBe('Last year');
            });

            it('toggles the column filters', () => {
                const { wrapper } = doMount();

                expect(wrapper.vm.showFilter).toBe(false);
                wrapper.find(TableUI).vm.$emit('toggleFilter', true);
                expect(wrapper.vm.showFilter).toBe(true);
            });
        });

        describe('columnar', () => {
            it('registers column sort events', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.columnSort).toBe(0);
                expect(wrapper.vm.columnSortDirection).toBe(-1);
                wrapper.find(TableUI).vm.$emit('columnSort', 0);
                expect(wrapper.vm.columnSort).toBe(0);
                expect(wrapper.vm.columnSortDirection).toBe(1);
            });

            it('sorts columns in ascending order when the sort column changes', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.columnSort).toBe(0);
                expect(wrapper.vm.columnSortDirection).toBe(-1);
                wrapper.find(TableUI).vm.$emit('columnSort', 1);
                expect(wrapper.vm.columnSort).toBe(1);
                expect(wrapper.vm.columnSortDirection).toBe(-1);
            });

            it('registers column filter events', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                wrapper.find(TableUI).vm.$emit('columnFilter', 0, '10');
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '10', b: '' });
            });

            it('resets filter to default if value is empty', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                wrapper.find(TableUI).vm.$emit('clearFilter', 0, null);
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
            });

            it('resets filter to default if value is missing', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                wrapper.find(TableUI).vm.$emit('clearFilter', 0);
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
            });

            it('registers clear filter events', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                wrapper.find(TableUI).vm.$emit('columnFilter', 0, '10');
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '10', b: '' });
                wrapper.find(TableUI).vm.$emit('clearFilter');
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
            });
        });

        describe('selection', () => {
            it('registers select all events', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.masterSelected).toStrictEqual([1]);
                expect(wrapper.emitted().tableSelect).toBeFalsy();
                wrapper.find(TableUI).vm.$emit('selectAll', false);
                expect(wrapper.vm.masterSelected).toStrictEqual([0]);
                expect(wrapper.emitted().tableSelect).toBeTruthy();
                expect(wrapper.emitted().tableSelect[0]).toStrictEqual([0]);
            });

            it('registers single row selection', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.masterSelected).toStrictEqual([1]);
                expect(wrapper.emitted().tableSelect).toBeFalsy();
                wrapper.find(TableUI).vm.$emit('rowSelect', false, 0, 0);
                expect(wrapper.vm.masterSelected).toStrictEqual([0]);
                expect(wrapper.emitted().tableSelect).toBeTruthy();
                expect(wrapper.emitted().tableSelect[0]).toStrictEqual([0]);
            });

            it('registers and emits table input events', () => {
                let testEvent = { value: 'test' };
                const { wrapper } = doMount();
                expect(wrapper.emitted().tableInput).toBeFalsy();
                wrapper.find(TableUI).vm.$emit('tableInput', testEvent);
                expect(wrapper.emitted().tableInput).toBeTruthy();
                expect(wrapper.emitted().tableInput[0][0]).toStrictEqual(testEvent);
            });
        });
    });


    describe('utilities', () => {
        it('provides method to get current selection to parent component', () => {
            const { wrapper } = doMount();
            expect(wrapper.vm.masterSelected).toStrictEqual([1]);
            expect(wrapper.vm.getSelected()).toStrictEqual([0]);
        });

        it('provides method to programmatically clear selection', () => {
            const { wrapper } = doMount();
            expect(wrapper.vm.masterSelected).toStrictEqual([1]);
            wrapper.vm.clearSelection();
            expect(wrapper.vm.masterSelected).toStrictEqual([0]);
        });

        it('can filter an array based on the current columns', () => {
            const { wrapper } = doMount();
            expect(wrapper.vm.currentColumns).toStrictEqual([0, 1]);
            expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([5, 10]);
            wrapper.find(TableUI).vm.$emit('columnUpdate', ['A']);
            expect(wrapper.vm.currentColumns).toStrictEqual([0]);
            expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([5]);
            wrapper.find(TableUI).vm.$emit('columnUpdate', ['B']);
            expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([10]);
        });

        it('computes currentColumnSizes correctly', () => {
            let checkCurrentColumnSizes = async (clientWidth, showCollapser, showSelection, columnSizeOverride) => {
                const { wrapper } = doMount({ customPropsData: { showCollapser, showSelection } });
                await wrapper.setData({ clientWidth });
                const nColumns = wrapper.vm.currentColumns.length;
                let currentColumnSizes;
                if (columnSizeOverride) {
                    for (let i = 0; i < nColumns; i++) {
                        wrapper.vm.onColumnResize(i, columnSizeOverride);
                    }
                    currentColumnSizes = Array(nColumns).fill(columnSizeOverride);
                } else {
                    const specialColumnsSizeTotal = SPECIAL_COLUMNS_SIZE + (showSelection ? SPECIAL_COLUMNS_SIZE : 0) +
                        (showCollapser ? SPECIAL_COLUMNS_SIZE : 0);
                    const dataColumnsSizeTotal = clientWidth - specialColumnsSizeTotal - nColumns * DATA_COLUMNS_MARGIN;
                    const defaultColumnSize = Math.max(MIN_COLUMN_SIZE, dataColumnsSizeTotal / nColumns);
                    currentColumnSizes = Array(nColumns).fill(defaultColumnSize);
                }
                expect(wrapper.vm.currentColumnSizes).toStrictEqual(currentColumnSizes);
            };

            checkCurrentColumnSizes(0, false, false, null);
            checkCurrentColumnSizes(200, false, false, null);
            checkCurrentColumnSizes(200, false, true, null);
            checkCurrentColumnSizes(200, true, false, null);
            checkCurrentColumnSizes(200, true, true, null);
            checkCurrentColumnSizes(200, true, true, 100);
        });

        it('can deal with empty tables when computing currentColumnSizes', async () => {
            const { wrapper } = doMount();
            await wrapper.setData({ currentColumns: [] });
            expect(wrapper.vm.currentColumnSizes).toStrictEqual([]);
        });
    });
});
