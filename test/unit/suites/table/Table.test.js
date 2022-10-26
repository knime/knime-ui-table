import { shallowMount, mount } from '@vue/test-utils';
import Table from '~/components/Table.vue';
import TableUI from '~/components/TableUI.vue';

import { columnTypes } from '~/config/table.config';
import { MIN_COLUMN_SIZE, SPECIAL_COLUMNS_SIZE, DATA_COLUMNS_MARGIN, TABLE_BORDER_SPACING } from '~/util/constants';

jest.mock('raf-throttle', () => function (func) {
    return function (...args) {
        // eslint-disable-next-line no-invalid-this
        return func.apply(this, args);
    };
});

describe('Table.vue', () => {
    let wrapper;

    let propsData = {
        allData: [{ a: 1, b: 2 }],
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

    const mockTablePropsWithData = (newSize) => {
        let localPropsData = {
            ...propsData,
            allData: []
        };
        for (let i = 0; i < newSize; i++) {
            localPropsData.allData.push({ a: i, b: i + 1 });
        }
        return localPropsData;
    };

    it('creates UI configurations', () => {
        wrapper = mount(Table, { propsData });

        expect(wrapper.vm.dataConfig).toStrictEqual({ columnConfigs: [{
            classGenerator: [],
            filterConfig: { is: 'FilterInputField', value: '' },
            formatter: expect.any(Function),
            hasSlotContent: false,
            header: 'A',
            key: 'a',
            popoverRenderer: expect.undefined,
            size: 30,
            type: columnTypes.Number
        }, {
            classGenerator: [],
            filterConfig: { is: 'FilterInputField', value: '' },
            formatter: expect.any(Function),
            hasSlotContent: false,
            header: 'B',
            key: 'b',
            popoverRenderer: expect.undefined,
            size: 30,
            type: columnTypes.Number
        }],
        rowConfig: { compactMode: false } });
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
            groupSubMenuItems: []
        });
    });

    it('generates the correct data config with isSortable key if there are column specific sort configs', () => {
        wrapper = shallowMount(Table, { propsData: { ...propsData, allColumnSpecificSortConfigs: [true, false] } });
        expect(wrapper.vm.dataConfig).toMatchObject({ columnConfigs: [{ isSortable: true }, { isSortable: false }] });
    });

    describe('component lifecycle', () => {
        it('creates internally required index reference lists on creation', () => {
            wrapper = shallowMount(Table, { propsData });

            expect(wrapper.vm.masterSelected).toStrictEqual([1]);
            expect(wrapper.vm.processedIndicies).toStrictEqual([[0]]);
        });

        it('updates internal reference lists when data changes', () => {
            wrapper = shallowMount(Table, { propsData });
            const expectedMasterSelection = [1];
            const expectedProcessedIndicies = [[0]];

            expect(wrapper.vm.masterSelected).toStrictEqual(expectedMasterSelection);
            expect(wrapper.vm.processedIndicies).toStrictEqual(expectedProcessedIndicies);

            const newTableSize = 10;
            let localPropsData = mockTablePropsWithData(newTableSize);
            wrapper = shallowMount(Table, { propsData: localPropsData });

            for (let i = 1; i < newTableSize; i++) {
                expectedMasterSelection.push(0);
                expectedProcessedIndicies[0].unshift(i);
            }
            expect(wrapper.vm.masterSelected).toStrictEqual(expectedMasterSelection);
            expect(wrapper.vm.processedIndicies).toStrictEqual(expectedProcessedIndicies);
        });
    });

    describe('events', () => {
        it('adds resize listener, updates client width on resize, and removes resize listener', () => {
            jest.spyOn(window, 'addEventListener');
            jest.spyOn(window, 'removeEventListener');
    
            wrapper = shallowMount(Table, { propsData });
            expect(window.addEventListener).toHaveBeenCalledWith('resize', wrapper.vm.updateClientWidth);
    
            expect(wrapper.vm.clientWidth).toBe(0);
            wrapper.vm.$el = { clientWidth: 500 };
            window.dispatchEvent(new Event('resize'));
            expect(wrapper.vm.clientWidth).toBe(500);
    
            wrapper.destroy();
            expect(window.removeEventListener).toHaveBeenCalledWith('resize', wrapper.vm.updateClientWidth);
        });

        describe('page control', () => {
            it('registers pageChange events', () => {
                let localPropsData = mockTablePropsWithData(100);
                wrapper = shallowMount(Table, { propsData: localPropsData });
                expect(wrapper.vm.currentPage).toBe(1);
                wrapper.find(TableUI).vm.$emit('pageChange', 1);
                expect(wrapper.vm.currentPage).toBe(2);
                wrapper.find(TableUI).vm.$emit('pageChange', -1);
                expect(wrapper.vm.currentPage).toBe(1);
            });

            it('registers search events and updates query', () => {
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.vm.searchQuery).toBe('');
                wrapper.find(TableUI).vm.$emit('search', 'Find me');
                expect(wrapper.vm.searchQuery).toBe('Find me');
            });

            it('empties search query if search event value is empty', () => {
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.vm.searchQuery).toBe('');
                wrapper.find(TableUI).vm.$emit('search', '');
                expect(wrapper.vm.searchQuery).toBe(null);
            });

            it('empties search query if search event value is missing', () => {
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.vm.searchQuery).toBe('');
                wrapper.find(TableUI).vm.$emit('search');
                expect(wrapper.vm.searchQuery).toBe(null);
            });

            it('registers groupUpdate events and updates the current group', () => {
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.vm.currentGroup).toBe(null);
                wrapper.find(TableUI).vm.$emit('groupUpdate', 'a');
                expect(wrapper.vm.currentGroup).toBe('a');
            });

            it('registers columnReorder events and updates the column order', () => {
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.vm.currentAllColumnOrder).toStrictEqual([0, 1]);
                wrapper.find(TableUI).vm.$emit('columnReorder', 1, 0);
                expect(wrapper.vm.currentAllColumnOrder).toStrictEqual([1, 0]);
            });

            it('registers columnUpdate events and updates the currentColumns', () => {
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.vm.currentColumns).toStrictEqual([0, 1]);
                wrapper.find(TableUI).vm.$emit('columnUpdate', ['A']);
                expect(wrapper.vm.currentColumns).toStrictEqual([0]);
            });

            it('registers timeFilterUpdate events and updates the time filter', () => {
                wrapper = shallowMount(Table, { propsData: {
                    ...propsData,
                    timeFilterKey: 'a'
                } });
                expect(wrapper.vm.currentTimeFilter).toBe('Last month');
                wrapper.find(TableUI).vm.$emit('timeFilterUpdate', 'Last year');
                expect(wrapper.vm.currentTimeFilter).toBe('Last year');
            });

            it('toggles the column filters', () => {
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.vm.showFilter).toBe(false);
                wrapper.find(TableUI).vm.$emit('toggleFilter', true);
                expect(wrapper.vm.showFilter).toBe(true);
            });
        });

        describe('columnar', () => {
            it('registers column sort events', () => {
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.vm.columnSort).toBe(0);
                expect(wrapper.vm.columnSortDirection).toBe(-1);
                wrapper.find(TableUI).vm.$emit('columnSort', 0);
                expect(wrapper.vm.columnSort).toBe(0);
                expect(wrapper.vm.columnSortDirection).toBe(1);
            });

            it('sorts columns in ascending order when the sort column changes', () => {
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.vm.columnSort).toBe(0);
                expect(wrapper.vm.columnSortDirection).toBe(-1);
                wrapper.find(TableUI).vm.$emit('columnSort', 1);
                expect(wrapper.vm.columnSort).toBe(1);
                expect(wrapper.vm.columnSortDirection).toBe(-1);
            });

            it('registers column filter events', () => {
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                wrapper.find(TableUI).vm.$emit('columnFilter', 0, '10');
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '10', b: '' });
            });

            it('resets filter to default if value is empty', () => {
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                wrapper.find(TableUI).vm.$emit('clearFilter', 0, null);
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
            });

            it('resets filter to default if value is missing', () => {
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                wrapper.find(TableUI).vm.$emit('clearFilter', 0);
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
            });

            it('registers clear filter events', () => {
                wrapper = shallowMount(Table, { propsData });
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
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.vm.masterSelected).toStrictEqual([1]);
                expect(wrapper.emitted().tableSelect).toBeFalsy();
                wrapper.find(TableUI).vm.$emit('selectAll', false);
                expect(wrapper.vm.masterSelected).toStrictEqual([0]);
                expect(wrapper.emitted().tableSelect).toBeTruthy();
                expect(wrapper.emitted().tableSelect[0]).toStrictEqual([0]);
            });

            it('registers single row selection', () => {
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.vm.masterSelected).toStrictEqual([1]);
                expect(wrapper.emitted().tableSelect).toBeFalsy();
                wrapper.find(TableUI).vm.$emit('rowSelect', false, 0, 0);
                expect(wrapper.vm.masterSelected).toStrictEqual([0]);
                expect(wrapper.emitted().tableSelect).toBeTruthy();
                expect(wrapper.emitted().tableSelect[0]).toStrictEqual([0]);
            });

            it('registers and emits table input events', () => {
                let testEvent = { value: 'test' };
                wrapper = shallowMount(Table, { propsData });
                expect(wrapper.emitted().tableInput).toBeFalsy();
                wrapper.find(TableUI).vm.$emit('tableInput', testEvent);
                expect(wrapper.emitted().tableInput).toBeTruthy();
                expect(wrapper.emitted().tableInput[0][0]).toStrictEqual(testEvent);
            });
        });
    });


    describe('utilities', () => {
        it('provides method to get current selection to parent component', () => {
            wrapper = shallowMount(Table, { propsData });
            expect(wrapper.vm.masterSelected).toStrictEqual([1]);
            expect(wrapper.vm.getSelected()).toStrictEqual([0]);
        });

        it('provides method to programmatically clear selection', () => {
            wrapper = shallowMount(Table, { propsData });
            expect(wrapper.vm.masterSelected).toStrictEqual([1]);
            wrapper.vm.clearSelection();
            expect(wrapper.vm.masterSelected).toStrictEqual([0]);
        });

        it('can filter an array based on the current columns', () => {
            wrapper = shallowMount(Table, { propsData });
            expect(wrapper.vm.currentColumns).toStrictEqual([0, 1]);
            expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([5, 10]);
            wrapper.find(TableUI).vm.$emit('columnUpdate', ['A']);
            expect(wrapper.vm.currentColumns).toStrictEqual([0]);
            expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([5]);
            wrapper.find(TableUI).vm.$emit('columnUpdate', ['B']);
            expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([10]);
        });

        it('computes currentColumnSizes correctly', () => {
            let checkCurrentColumnSizes = (clientWidth, showCollapser, showSelection, columnSizeOverride) => {
                wrapper = shallowMount(Table, { propsData: { ...propsData, showCollapser, showSelection } });
                wrapper.setData({ clientWidth });
                const nColumns = wrapper.vm.currentColumns.length;
                let currentColumnSizes;
                if (columnSizeOverride) {
                    for (let i = 0; i < nColumns; i++) {
                        wrapper.vm.onColumnResize(i, columnSizeOverride);
                    }
                    currentColumnSizes = Array(nColumns).fill(columnSizeOverride);
                } else {
                    let reservedSize = SPECIAL_COLUMNS_SIZE + nColumns * DATA_COLUMNS_MARGIN + 2 * TABLE_BORDER_SPACING;
                    if (showCollapser) {
                        reservedSize += SPECIAL_COLUMNS_SIZE;
                    } if (showSelection) {
                        reservedSize += SPECIAL_COLUMNS_SIZE;
                    }
                    const defaultColumnWidth = Math.max((clientWidth - reservedSize) / nColumns, MIN_COLUMN_SIZE);
                    currentColumnSizes = Array(nColumns).fill(defaultColumnWidth);
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
    });
});
