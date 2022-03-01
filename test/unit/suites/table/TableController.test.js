/* eslint-disable no-magic-numbers */
import { shallowMount } from '@vue/test-utils';
import TableController from '~/components/TableController';
import TableUI from '~/components/TableUI';

import { columnTypes } from '~/config/table.config';

describe('TableController.vue', () => {
    let wrapper;

    let propsData = {
        allData: [{ a: 1, b: 2 }],
        allColumnHeaders: ['A', 'B'],
        allColumnKeys: ['a', 'b'],
        allColumnTypes: { a: columnTypes.Number, b: columnTypes.Number },
        allFormatters: { a: x => x, b: x => x },
        allClassGenerators: {},
        defaultColumns: ['a', 'b'],
        parentSelected: [0]
    };

    it('creates UI configurations', () => {
        wrapper = shallowMount(TableController, { propsData });

        expect(wrapper.vm.dataConfig).toStrictEqual({ columnConfigs: [{
            classGenerator: [],
            filterConfig: { is: 'TableFilterInputField', value: '' },
            formatter: expect.any(Function),
            hasSlotContent: false,
            header: 'A',
            key: 'a',
            popoverRenderer: expect.undefined,
            size: 50,
            type: columnTypes.Number
        }, {
            classGenerator: [],
            filterConfig: { is: 'TableFilterInputField', value: '' },
            formatter: expect.any(Function),
            hasSlotContent: false,
            header: 'B',
            key: 'b',
            popoverRenderer: expect.undefined,
            size: 50,
            type: columnTypes.Number
        }] });
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
            timeFilterConfig: { currentTimeFilter: null },
            sortConfig: { sortColumn: 0, sortDirection: -1 },
            subMenuItems: [],
            groupSubMenuItems: []
        });
    });

    describe('events', () => {
        describe('page control', () => {
            it('registers pageChange events', () => {
                let localPropsData = {
                    ...propsData,
                    allData: []
                };
                for (let i = 0; i < 100; i++) {
                    localPropsData.allData.push({ a: i, b: i + 1 });
                }
                wrapper = shallowMount(TableController, { propsData: localPropsData });
                expect(wrapper.vm.currentPage).toBe(1);
                wrapper.find(TableUI).vm.$emit('pageChange', 1);
                expect(wrapper.vm.currentPage).toBe(2);
                wrapper.find(TableUI).vm.$emit('pageChange', -1);
                expect(wrapper.vm.currentPage).toBe(1);
            });

            it('registers search events and updates query', () => {
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.vm.searchQuery).toBe('');
                wrapper.find(TableUI).vm.$emit('search', 'Find me');
                expect(wrapper.vm.searchQuery).toBe('Find me');
            });

            it('empties search query if search event value is empty', () => {
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.vm.searchQuery).toBe('');
                wrapper.find(TableUI).vm.$emit('search', '');
                expect(wrapper.vm.searchQuery).toBe(null);
            });

            it('empties search query if search event value is missing', () => {
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.vm.searchQuery).toBe('');
                wrapper.find(TableUI).vm.$emit('search');
                expect(wrapper.vm.searchQuery).toBe(null);
            });

            it('registers groupUpdate events and updates the current group', () => {
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.vm.currentGroup).toBe(null);
                wrapper.find(TableUI).vm.$emit('groupUpdate', 'a');
                expect(wrapper.vm.currentGroup).toBe('a');
            });

            it('registers columnReorder events and updates the column order', () => {
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.vm.currentAllColumnOrder).toStrictEqual([0, 1]);
                wrapper.find(TableUI).vm.$emit('columnReorder', 1, 0);
                expect(wrapper.vm.currentAllColumnOrder).toStrictEqual([1, 0]);
            });

            it('registers columnUpdate events and updates the currentColumns', () => {
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.vm.currentColumns).toStrictEqual([0, 1]);
                wrapper.find(TableUI).vm.$emit('columnUpdate', ['A']);
                expect(wrapper.vm.currentColumns).toStrictEqual([0]);
            });

            it('registers timeFilterUpdate events and updates the time filter', () => {
                wrapper = shallowMount(TableController, {
                    propsData: {
                        ...propsData,
                        timeFilterKey: 'a',
                        defaultTimeFilter: 'Last month'
                    }
                });
                expect(wrapper.vm.currentTimeFilter).toBe('Last month');
                wrapper.find(TableUI).vm.$emit('timeFilterUpdate', 'Last year');
                expect(wrapper.vm.currentTimeFilter).toBe('Last year');
            });

            it('toggles the column filters', () => {
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.vm.showFilter).toBe(false);
                wrapper.find(TableUI).vm.$emit('toggleFilter', true);
                expect(wrapper.vm.showFilter).toBe(true);
            });
        });

        describe('columnar', () => {
            it('registers column sort events', () => {
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.vm.columnSort).toBe(0);
                expect(wrapper.vm.columnSortDirection).toBe(-1);
                wrapper.find(TableUI).vm.$emit('columnSort', 0);
                expect(wrapper.vm.columnSort).toBe(0);
                expect(wrapper.vm.columnSortDirection).toBe(1);
            });

            it('sorts columns in ascending order when the sort column changes', () => {
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.vm.columnSort).toBe(0);
                expect(wrapper.vm.columnSortDirection).toBe(-1);
                wrapper.find(TableUI).vm.$emit('columnSort', 1);
                expect(wrapper.vm.columnSort).toBe(1);
                expect(wrapper.vm.columnSortDirection).toBe(-1);
            });

            it('registers column filter events', () => {
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                wrapper.find(TableUI).vm.$emit('columnFilter', 0, '10');
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '10', b: '' });
            });

            it('resets filter to default if value is empty', () => {
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                wrapper.find(TableUI).vm.$emit('clearFilter', 0, null);
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
            });

            it('resets filter to default if value is missing', () => {
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                wrapper.find(TableUI).vm.$emit('clearFilter', 0);
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
            });

            it('registers clear filter events', () => {
                wrapper = shallowMount(TableController, { propsData });
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
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.vm.masterSelected).toStrictEqual([1]);
                expect(wrapper.emitted().tableSelect).toBeFalsy();
                wrapper.find(TableUI).vm.$emit('selectAll', false);
                expect(wrapper.vm.masterSelected).toStrictEqual([0]);
                expect(wrapper.emitted().tableSelect).toBeTruthy();
                expect(wrapper.emitted().tableSelect[0]).toStrictEqual([0]);
            });

            it('registers single row selection', () => {
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.vm.masterSelected).toStrictEqual([1]);
                expect(wrapper.emitted().tableSelect).toBeFalsy();
                wrapper.find(TableUI).vm.$emit('rowSelect', false, 0, 0);
                expect(wrapper.vm.masterSelected).toStrictEqual([0]);
                expect(wrapper.emitted().tableSelect).toBeTruthy();
                expect(wrapper.emitted().tableSelect[0]).toStrictEqual([0]);
            });

            it('registers and emits table input events', () => {
                let testEvent = { value: 'test' };
                wrapper = shallowMount(TableController, { propsData });
                expect(wrapper.emitted().tableInput).toBeFalsy();
                wrapper.find(TableUI).vm.$emit('tableInput', testEvent);
                expect(wrapper.emitted().tableInput).toBeTruthy();
                expect(wrapper.emitted().tableInput[0][0]).toStrictEqual(testEvent);
            });
        });
    });


    describe('utilities', () => {
        it('provides method to get current selection to parent component', () => {
            wrapper = shallowMount(TableController, { propsData });
            expect(wrapper.vm.masterSelected).toStrictEqual([1]);
            expect(wrapper.vm.getSelected()).toStrictEqual([0]);
        });

        it('provides method to programmatically clear selection', () => {
            wrapper = shallowMount(TableController, { propsData });
            expect(wrapper.vm.masterSelected).toStrictEqual([1]);
            wrapper.vm.clearSelection();
            expect(wrapper.vm.masterSelected).toStrictEqual([0]);
        });

        it('can filter an array based on the current columns', () => {
            wrapper = shallowMount(TableController, { propsData });
            expect(wrapper.vm.currentColumns).toStrictEqual([0, 1]);
            expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([5, 10]);
            wrapper.find(TableUI).vm.$emit('columnUpdate', ['A']);
            expect(wrapper.vm.currentColumns).toStrictEqual([0]);
            expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([5]);
            wrapper.find(TableUI).vm.$emit('columnUpdate', ['B']);
            expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([10]);
        });
    });
});
