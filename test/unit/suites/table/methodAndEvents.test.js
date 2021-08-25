import { shallowMount } from '@vue/test-utils';
import Table from '~/components/Table';
import TableControlsTop from '~/components/control/TableControlTop';
import TableControlsBottom from '~/components/control/TableControlBottom';
import TableColumnFilters from '~/components/filter/TableColumnFilter';
import TableHeader from '~/components/TableHeader';
import TableGroup from '~/components/TableGroup';
import TableRow from '~/components/TableRow';

import { columnTypes } from '~/config/table.config';

describe('Table.vue', () => {
    let wrapper;

    let propsData = {
        allData: [{ a: 1, b: 2 }],
        allColumnHeaders: ['A', 'B'],
        allColumnKeys: ['a', 'b'],
        allColumnTypes: { a: columnTypes.Number, b: columnTypes.Number },
        allFormatters: { a: x => x, b: x => x },
        allClassGenerators: {}
    };

    describe('Table methods/events', () => {
        it('provides method to get current selection to parent component', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    parentSelected: [0]
                }
            });
            expect(wrapper.vm.masterSelected).toStrictEqual([1]);
            expect(wrapper.vm.getSelected()).toStrictEqual([0]);
        });

        it('provides method to programmatically clear selection', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    parentSelected: [0]
                }
            });
            expect(wrapper.vm.masterSelected).toStrictEqual([1]);
            wrapper.vm.clearSelection();
            expect(wrapper.vm.masterSelected).toStrictEqual([0]);
        });

        it('opens and closes table popover', () => {
            let renderer = {
                type: 'MessageRenderer',
                process: data => data
            };
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b'],
                    popoverRenderers: {
                        a: renderer
                    }
                }
            });
            wrapper.vm.openPopover({
                colInd: 0,
                rowInd: 0,
                groupInd: 0,
                cell: 'Test cell'
            });
            expect(wrapper.vm.popoverColumn).toBe('a');
            expect(wrapper.vm.popoverRenderer).toStrictEqual(renderer);
            expect(wrapper.vm.popoverData).toBe(1);
            expect(wrapper.vm.popoverTarget).toBe('Test cell');
            wrapper.vm.onPopoverClose();
            expect(wrapper.vm.popoverColumn).toBe(null);
            expect(wrapper.vm.popoverRenderer).toBe(null);
            expect(wrapper.vm.popoverData).toBe(null);
            expect(wrapper.vm.popoverTarget).toBe(null);
        });
    });

    describe('Row methods/events', () => {
        it('registers single row selection', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.masterSelected).toStrictEqual([0]);
            expect(wrapper.emitted().tableSelect).toBeFalsy();
            wrapper.find(TableRow).vm.$emit('rowSelect', {
                selected: true
            });
            expect(wrapper.vm.masterSelected).toStrictEqual([1]);
            expect(wrapper.emitted().tableSelect).toBeTruthy();
            expect(wrapper.emitted().tableSelect[0]).toStrictEqual([0, 1]);
        });

        it('emits table input events', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.emitted().tableInput).toBeFalsy();
            wrapper.find(TableRow).vm.$emit('rowInput', {});
            expect(wrapper.emitted().tableInput).toBeTruthy();
            expect(wrapper.emitted().tableInput[0][0]).toStrictEqual({
                groupInd: 0,
                id: undefined,
                rowInd: 0
            });
        });

        it('registers group submenu clicks', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b'],
                    groupSubMenuItems: [{ id: 'action', text: 'Action' }]
                }
            });
            let callbackMock = jest.fn();
            wrapper.find(TableGroup).vm.$emit('groupSubMenuClick', {
                callback: callbackMock,
                row: 0
            });
            expect(callbackMock).toHaveBeenCalledWith(propsData.allData, expect.anything());
        });

        it('registers row submenu clicks', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b'],
                    subMenuItems: [{ id: 'action', text: 'Action' }]
                }
            });
            let callbackMock = jest.fn();
            wrapper.find(TableRow).vm.$emit('rowSubMenuClick', {
                callback: callbackMock,
                row: 0
            });
            expect(callbackMock).toHaveBeenCalledWith(propsData.allData[0], expect.anything());
        });
    });

    describe('Column filter methods/events', () => {
        it('registers header filter events', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.filterValues).toStrictEqual({});
            wrapper.vm.onToggleFilter();
            wrapper.find(TableColumnFilters).vm.$emit('headerFilter', { colInd: 0, values: [10] });
            expect(wrapper.vm.filterValues).toStrictEqual({ a: [10] });
        });

        it('resets filter to default if value is empty', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.filterValues).toStrictEqual({});
            wrapper.vm.onToggleFilter();
            wrapper.find(TableColumnFilters).vm.$emit('headerFilter', { colInd: 0, values: [] });
            expect(wrapper.vm.filterValues).toStrictEqual({ a: [] });
        });

        it('resets filter to default if value is missing', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.filterValues).toStrictEqual({});
            wrapper.vm.onToggleFilter();
            wrapper.find(TableColumnFilters).vm.$emit('headerFilter', { colInd: 0 });
            expect(wrapper.vm.filterValues).toStrictEqual({ a: [] });
        });

        it('registers clear filter events', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.filterValues).toStrictEqual({});
            wrapper.vm.onToggleFilter();
            wrapper.find(TableColumnFilters).vm.$emit('headerFilter', { colInd: 0, values: [10] });
            expect(wrapper.vm.filterValues).toStrictEqual({ a: [10] });
            wrapper.find(TableColumnFilters).vm.$emit('clearFilter');
            expect(wrapper.vm.filterValues).toStrictEqual({});
        });
    });

    describe('Column header methods/events', () => {
        it('registers header sort events', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.columnSort).toBe(0);
            expect(wrapper.vm.columnSortDirection).toBe(-1);
            wrapper.find(TableHeader).vm.$emit('headerSort', { type: 'sort', ind: 0, value: 1 });
            expect(wrapper.vm.columnSort).toBe(0);
            expect(wrapper.vm.columnSortDirection).toBe(1);
        });

        it('sorts columns in ascending order when the sort column changes', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.columnSort).toBe(0);
            expect(wrapper.vm.columnSortDirection).toBe(-1);
            wrapper.find(TableHeader).vm.$emit('headerSort', { type: 'sort', ind: 1, value: 1 });
            expect(wrapper.vm.columnSort).toBe(1);
            expect(wrapper.vm.columnSortDirection).toBe(-1);
        });

        it('toggles the column filters', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.showFilter).toBe(false);
            wrapper.find(TableHeader).vm.$emit('toggleFilter');
            expect(wrapper.vm.showFilter).toBe(true);
        });

        it('emits selection events', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.masterSelected).toStrictEqual([0]);
            expect(wrapper.emitted().tableSelect).toBeFalsy();
            wrapper.find(TableHeader).vm.$emit('rowSelect', true, true, 0);
            expect(wrapper.vm.masterSelected).toStrictEqual([1]);
            expect(wrapper.emitted().tableSelect).toBeTruthy();
            expect(wrapper.emitted().tableSelect[0]).toStrictEqual([0, 1]);
        });
    });

    describe('Table bottom control methods/events', () => {
        it('registers pageSizeUpdate events', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.currentPageSize).toBe(10);
            wrapper.find(TableControlsBottom).vm.$emit('pageSizeUpdate', 25);
            expect(wrapper.vm.currentPageSize).toBe(25);
        });

        it('registers pageChange events', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            let onPageChangeSpy = jest.spyOn(wrapper.vm, 'onPageChange');
            expect(onPageChangeSpy).not.toHaveBeenCalled();
            wrapper.find(TableControlsBottom).vm.$emit('nextPage');
            expect(onPageChangeSpy).toHaveBeenCalledWith(1);
            wrapper.find(TableControlsBottom).vm.$emit('prevPage');
            expect(onPageChangeSpy).toHaveBeenCalledWith(-1);
        });
    });

    describe('Table top control methods/events', () => {
        it('registers pageChange events', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            let onPageChangeSpy = jest.spyOn(wrapper.vm, 'onPageChange');
            expect(onPageChangeSpy).not.toHaveBeenCalled();
            wrapper.find(TableControlsTop).vm.$emit('nextPage');
            expect(onPageChangeSpy).toHaveBeenCalledWith(1);
            wrapper.find(TableControlsTop).vm.$emit('prevPage');
            expect(onPageChangeSpy).toHaveBeenCalledWith(-1);
        });

        it('registers searchUpdate events and update query', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.searchQuery).toBe('');
            wrapper.find(TableControlsTop).vm.$emit('searchUpdate', 'Find me');
            expect(wrapper.vm.searchQuery).toBe('Find me');
        });

        it('empties search query if search update event value is empty', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.searchQuery).toBe('');
            wrapper.find(TableControlsTop).vm.$emit('searchUpdate', '');
            expect(wrapper.vm.searchQuery).toBe(null);
        });

        it('empties search query if search update event value is missing', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.searchQuery).toBe('');
            wrapper.find(TableControlsTop).vm.$emit('searchUpdate');
            expect(wrapper.vm.searchQuery).toBe(null);
        });

        it('registers groupUpdate events and updates the current group', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.currentGroup).toBe(null);
            wrapper.find(TableControlsTop).vm.$emit('groupUpdate', 'a');
            expect(wrapper.vm.currentGroup).toBe('a');
        });

        it('registers columnReorder events and updates the column order', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.currentAllColumnOrder).toStrictEqual([0, 1]);
            wrapper.find(TableControlsTop).vm.$emit('columnReorder', 1, 0);
            expect(wrapper.vm.currentAllColumnOrder).toStrictEqual([1, 0]);
        });

        it('registers columnUpdate events and updates the currentColumns', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.currentColumns).toStrictEqual([0, 1]);
            wrapper.find(TableControlsTop).vm.$emit('columnUpdate', ['A']);
            expect(wrapper.vm.currentColumns).toStrictEqual([0]);
        });

        it('registers timeFilterUpdate events and updates the time filter', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b'],
                    timeFilterKey: 'a',
                    defaultTimeFilter: 'Last month'
                }
            });
            expect(wrapper.vm.currentTimeFilter).toBe('Last month');
            wrapper.find(TableControlsTop).vm.$emit('timeFilterUpdate', 'Last year');
            expect(wrapper.vm.currentTimeFilter).toBe('Last year');
        });
    });

    describe('Table utilities', () => {
        it('can filter an array based on the current columns', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.currentColumns).toStrictEqual([0, 1]);
            expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([5, 10]);
            wrapper.find(TableControlsTop).vm.$emit('columnUpdate', ['A']);
            expect(wrapper.vm.currentColumns).toStrictEqual([0]);
            expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([5]);
            wrapper.find(TableControlsTop).vm.$emit('columnUpdate', ['B']);
            expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([10]);
        });

        it('can create form items for input fields from an array of values', () => {
            wrapper = shallowMount(Table, {
                propsData: {
                    ...propsData,
                    defaultColumns: ['a', 'b']
                }
            });
            expect(wrapper.vm.createFormItems([5, 10])).toStrictEqual([
                {
                    id: 5,
                    text: 5
                },
                {
                    id: 10,
                    text: 10
                }
            ]);
        });
    });
});
