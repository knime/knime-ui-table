import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shallowMount, mount } from '@vue/test-utils';

import Table from '../Table.vue';
import TableUI from '../TableUI.vue';

import { columnTypes } from '@/config/table.config';
import { MIN_COLUMN_SIZE } from '@/util/constants';

const headerSubMenuItems = [
    [{ text: 'Column 1: Item 1', id: 'c1s1i1', selected: true, section: 'section1' }],
    [{ text: 'Column 2: Item 1', id: 'c1s1i1', selected: true, section: 'section1' }]
];

describe('Table.vue', () => {
    const defaultProps = {
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
        enableVirtualScrolling: false,
        parentSelected: [0]
    };

    beforeEach(() => {
        window.IntersectionObserver = vi.fn(() => ({
            observe: () => null,
            unobserve: () => null,
            disconnect: () => null
        }));
    });


    const doMount = ({ customProps = {}, dataCount = 1, shallow = true } = {}) => {
        const props = {
            allData: [],
            ...defaultProps,
            ...customProps
        };
        if (props.allData.length === 0) {
            for (let i = 0; i < dataCount; i++) {
                props.allData.push({ a: i, b: i + 1 });
            }
        }

        const wrapper = shallow ? shallowMount(Table, { props }) : mount(Table, { props });

        return { wrapper };
    };

    describe('configurations', () => {
        beforeEach(() => {
            Object.defineProperty(window, 'ResizeObserver', {
                writable: true,
                value: vi.fn().mockImplementation((callback) => ({
                    observe: vi.fn(),
                    unobserve: vi.fn(),
                    disconnect: vi.fn()
                }))
            });
        });

        it('creates UI configurations', () => {
            const { wrapper } = doMount({ shallow: false });

            expect(wrapper.vm.dataConfig).toStrictEqual({
                columnConfigs: [{
                    classGenerator: [],
                    filterConfig: { is: 'FilterInputField', modelValue: '' },
                    formatter: expect.any(Function),
                    hasSlotContent: false,
                    header: 'A',
                    key: 'a',
                    popoverRenderer: expect.undefined,
                    size: 50,
                    type: columnTypes.Number
                }, {
                    classGenerator: [],
                    filterConfig: { is: 'FilterInputField', modelValue: '' },
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
                enableVirtualScrolling: false,
                enableColumnResizing: false,
                pageConfig: {
                    tableSize: 1,
                    currentSize: 1,
                    currentPage: 1,
                    pageSize: 10,
                    possiblePageSizes: [5, 10, 25, 50, 100],
                    fixHeader: false
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
                    customProps: { showSorting: true, defaultSortColumn: 1, defaultSortColumnDirection: 1 }
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
                    customProps: { showSorting: false, defaultSortColumn: 1, defaultSortColumnDirection: 1 }
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
                    customProps: { showColumnFilters: true, initialFilterValues: { a: '4', b: '10' } }
                }
            );

            expect(wrapper.vm.tableConfig.columnFilterInitiallyActive).toBe(true);
            expect(wrapper.vm.dataConfig.columnConfigs).toEqual(expect.arrayContaining([
                expect.objectContaining({ key: 'a', filterConfig: { is: 'FilterInputField', modelValue: '4' } }),
                expect.objectContaining({ key: 'b', filterConfig: { is: 'FilterInputField', modelValue: '10' } })
            ]));
        });

        it('ignores initial filtering if show coulmn filters is set to false', () => {
            const { wrapper } = doMount(
                {
                    shallow: false,
                    customProps: { showColumnFilters: false, initialFilterValues: { a: '4', b: '10' } }
                }
            );

            expect(wrapper.vm.tableConfig.columnFilterInitiallyActive).toBe(false);
            expect(wrapper.vm.dataConfig.columnConfigs).toEqual(expect.arrayContaining([
                expect.objectContaining({ key: 'a', filterConfig: { is: 'FilterInputField', modelValue: '' } }),
                expect.objectContaining({ key: 'b', filterConfig: { is: 'FilterInputField', modelValue: '' } })
            ]));
        });
    });

    it('generates the correct data config with isSortable key if there are column specific sort configs', () => {
        const { wrapper } = doMount({ customProps: { allColumnSpecificSortConfigs: [true, false] } });

        expect(wrapper.vm.dataConfig).toMatchObject({ columnConfigs: [{ isSortable: true }, { isSortable: false }] });
    });

    it('generates the correct data config with headerSubMenuItems key if there are sub menu items for the header',
        () => {
            const { wrapper } = doMount({ customProps: { headerSubMenuItems: [headerSubMenuItems, null] } });
            expect(wrapper.vm.dataConfig).toMatchObject({ columnConfigs: [
                { headerSubMenuItems }, { headerSubMenuItems: null }
            ] });
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
        it('updates column sizes from availableWidth', () => {
            const { wrapper } = doMount();

            let availableWidth = 100;
            wrapper.vm.updateAvailableWidth(availableWidth);
            expect(wrapper.vm.currentAvailableWidth).toBe(availableWidth);
            expect(wrapper.vm.currentColumnSizes).toStrictEqual([50, 50]);

            const allColumnsResizeSize = 123;
            wrapper.vm.onAllColumnsResize(allColumnsResizeSize);
            const firstColumnsResizeSize = 600;
            wrapper.vm.onColumnResize(0, firstColumnsResizeSize);
            expect(wrapper.vm.currentColumnSizes).toStrictEqual([firstColumnsResizeSize, allColumnsResizeSize]);

            availableWidth = 200;
            wrapper.vm.updateAvailableWidth(availableWidth);
            expect(wrapper.vm.currentAvailableWidth).toBe(availableWidth);
            expect(wrapper.vm.currentColumnSizes).toStrictEqual([firstColumnsResizeSize * 2, allColumnsResizeSize * 2]);
        });

        describe('page control', () => {
            it('registers pageChange events', () => {
                const { wrapper } = doMount({ dataCount: 100 });
                expect(wrapper.vm.currentPage).toBe(1);
                wrapper.findComponent(TableUI).vm.$emit('pageChange', 1);
                expect(wrapper.vm.currentPage).toBe(2);
                wrapper.findComponent(TableUI).vm.$emit('pageChange', -1);
                expect(wrapper.vm.currentPage).toBe(1);
            });

            it('registers search events and updates query', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.searchQuery).toBe('');
                wrapper.findComponent(TableUI).vm.$emit('search', 'Find me');
                expect(wrapper.vm.searchQuery).toBe('Find me');
            });

            it('empties search query if search event value is empty', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.searchQuery).toBe('');
                wrapper.findComponent(TableUI).vm.$emit('search', '');
                expect(wrapper.vm.searchQuery).toBeNull();
            });

            it('empties search query if search event value is missing', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.searchQuery).toBe('');
                wrapper.findComponent(TableUI).vm.$emit('search');
                expect(wrapper.vm.searchQuery).toBeNull();
            });

            it('registers groupUpdate events and updates the current group', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.currentGroup).toBeNull();
                wrapper.findComponent(TableUI).vm.$emit('groupUpdate', 'a');
                expect(wrapper.vm.currentGroup).toBe('a');
            });

            it('registers columnReorder events and updates the column order', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.currentAllColumnOrder).toStrictEqual([0, 1]);
                wrapper.findComponent(TableUI).vm.$emit('columnReorder', 1, 0);
                expect(wrapper.vm.currentAllColumnOrder).toStrictEqual([1, 0]);
            });

            it('registers columnUpdate events and updates the currentColumns', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.currentColumns).toStrictEqual([0, 1]);
                wrapper.findComponent(TableUI).vm.$emit('columnUpdate', ['A']);
                expect(wrapper.vm.currentColumns).toStrictEqual([0]);
            });

            it('registers timeFilterUpdate events and updates the time filter', () => {
                const { wrapper } = doMount({ customProps: { timeFilterKey: 'a' } });
                expect(wrapper.vm.currentTimeFilter).toBe('All time');
                wrapper.findComponent(TableUI).vm.$emit('timeFilterUpdate', 'Last year');
                expect(wrapper.vm.currentTimeFilter).toBe('Last year');
            });

            it('toggles the column filters', () => {
                const { wrapper } = doMount();

                expect(wrapper.vm.showFilter).toBe(false);
                wrapper.findComponent(TableUI).vm.$emit('toggleFilter', true);
                expect(wrapper.vm.showFilter).toBe(true);
            });
        });

        describe('columnar', () => {
            it('registers column sort events', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.columnSort).toBe(0);
                expect(wrapper.vm.columnSortDirection).toBe(-1);
                wrapper.findComponent(TableUI).vm.$emit('columnSort', 0);
                expect(wrapper.vm.columnSort).toBe(0);
                expect(wrapper.vm.columnSortDirection).toBe(1);
            });

            it('sorts columns in ascending order when the sort column changes', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.columnSort).toBe(0);
                expect(wrapper.vm.columnSortDirection).toBe(-1);
                wrapper.findComponent(TableUI).vm.$emit('columnSort', 1);
                expect(wrapper.vm.columnSort).toBe(1);
                expect(wrapper.vm.columnSortDirection).toBe(-1);
            });

            it('registers column filter events', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                wrapper.findComponent(TableUI).vm.$emit('columnFilter', 0, '10');
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '10', b: '' });
            });

            it('adjusts data on filter event if filters are active', async () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                expect(wrapper.vm.paginatedData[0].length).toBe(1);
                wrapper.findComponent(TableUI).vm.$emit('toggleFilter', true);
                wrapper.findComponent(TableUI).vm.$emit('columnFilter', 0, '10');
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.paginatedData[0].length).toBe(0);
            });

            it('resets filter to default if value is empty', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                wrapper.findComponent(TableUI).vm.$emit('clearFilter', 0, null);
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
            });

            it('resets filter to default if value is missing', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                wrapper.findComponent(TableUI).vm.$emit('clearFilter', 0);
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
            });

            it('registers clear filter events', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
                wrapper.vm.onToggleFilter();
                wrapper.findComponent(TableUI).vm.$emit('columnFilter', 0, '10');
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '10', b: '' });
                wrapper.findComponent(TableUI).vm.$emit('clearFilter');
                expect(wrapper.vm.filterValues).toStrictEqual({ a: '', b: '' });
            });
        });

        describe('selection', () => {
            it('registers select all events', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.masterSelected).toStrictEqual([1]);
                expect(wrapper.emitted().tableSelect).toBeFalsy();
                wrapper.findComponent(TableUI).vm.$emit('selectAll', false);
                expect(wrapper.vm.masterSelected).toStrictEqual([0]);
                expect(wrapper.emitted().tableSelect).toBeTruthy();
                expect(wrapper.emitted().tableSelect[0]).toStrictEqual([0]);
            });

            it('registers single row selection', () => {
                const { wrapper } = doMount();
                expect(wrapper.vm.masterSelected).toStrictEqual([1]);
                expect(wrapper.emitted().tableSelect).toBeFalsy();
                wrapper.findComponent(TableUI).vm.$emit('rowSelect', false, 0, 0);
                expect(wrapper.vm.masterSelected).toStrictEqual([0]);
                expect(wrapper.emitted().tableSelect).toBeTruthy();
                expect(wrapper.emitted().tableSelect[0]).toStrictEqual([0]);
            });

            it('registers and emits table input events', () => {
                let testEvent = { value: 'test' };
                const { wrapper } = doMount();
                expect(wrapper.emitted().tableInput).toBeFalsy();
                wrapper.findComponent(TableUI).vm.$emit('tableInput', testEvent);
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
            wrapper.findComponent(TableUI).vm.$emit('columnUpdate', ['A']);
            expect(wrapper.vm.currentColumns).toStrictEqual([0]);
            expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([5]);
            wrapper.findComponent(TableUI).vm.$emit('columnUpdate', ['B']);
            expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([10]);
        });

        it('computes currentColumnSizes correctly with min space', async () => {
            const availableWidth = 100;
            const { wrapper } = doMount();
            await wrapper.setData({ currentAvailableWidth: availableWidth });
            expect(wrapper.vm.currentColumnSizes).toStrictEqual([MIN_COLUMN_SIZE, MIN_COLUMN_SIZE]);
        });

        it('computes currentColumnSizes correctly with enouth space', async () => {
            const availableWidth = 500;
            const { wrapper } = doMount();
            await wrapper.setData({ currentAvailableWidth: availableWidth });
            expect(wrapper.vm.currentColumnSizes).toStrictEqual([availableWidth / 2, availableWidth / 2]);
        });

        it('computes currentColumnSizes with column size override', async () => {
            const availableWidth = 200;
            const columnSizeOverride = 100;
            const { wrapper } = doMount();
            await wrapper.setData({ currentAvailableWidth: availableWidth });
            wrapper.vm.onColumnResize(0, columnSizeOverride);
            expect(wrapper.vm.currentColumnSizes).toStrictEqual([
                columnSizeOverride, availableWidth - columnSizeOverride
            ]);
        });

        it('computes currentColumnSizes correctly when resizing all columns', async () => {
            const { wrapper } = doMount();
            await wrapper.setData({ clientWidth: 200 });
            wrapper.vm.onColumnResize(0, 1111); // This will be overwritten
            const allColumnsSize = 123;
            wrapper.vm.onAllColumnsResize(allColumnsSize);
            const resizedCol = 1;
            const resizedColSize = 200;
            wrapper.vm.onColumnResize(resizedCol, resizedColSize); // This overwrites the allColumnsResize for this column
            
            const nColumns = wrapper.vm.currentColumns.length;
            expect(wrapper.vm.currentColumnSizes).toStrictEqual(
                // eslint-disable-next-line vitest/no-conditional-tests
                Array.from({ length: nColumns }, (_v, i) => i === resizedCol ? resizedColSize : allColumnsSize)
            );
        });

        it('can deal with empty tables when computing currentColumnSizes', async () => {
            const { wrapper } = doMount();
            await wrapper.setData({ currentColumns: [] });
            expect(wrapper.vm.currentColumnSizes).toStrictEqual([]);
        });

        it('emits header sub menu selection events', () => {
            const { wrapper } = doMount({ customProps: { headerSubMenuItems } });
            expect(wrapper.emitted().headerSubMenuSelect).toBeFalsy();
            wrapper.findComponent(TableUI).vm.$emit('headerSubMenuItemSelection', headerSubMenuItems, 1);
            expect(wrapper.emitted().headerSubMenuSelect).toStrictEqual([[
                headerSubMenuItems, 1
            ]]);
        });
    });
});
