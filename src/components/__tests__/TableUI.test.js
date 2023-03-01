/* eslint-disable max-lines */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import TableUI from '../TableUI.vue';
import TopControls from '@/components/control/TopControls.vue';
import BottomControls from '@/components/control/BottomControls.vue';
import ColumnFilters from '@/components/filter/ColumnFilters.vue';
import Header from '@/components/layout/Header.vue';
import Group from '@/components/layout/Group.vue';
import Row from '@/components/layout/Row.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import TablePopover from '@/components/popover/TablePopover.vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import { columnTypes } from '@/config/table.config';

const expectedNormalRowHeight = 41;

const getProps = ({
    includeSubHeaders = true,
    compactMode = false,
    showSelection = true,
    showColumnFilters = true,
    showBottomControls = true,
    enableVirtualScrolling = false,
    rowHeight = null,
    actionButtonConfig = null,
    columnFilterInitiallyActive = null,
    enableIsSortable = false,
    data = [[{ a: 'cellA', b: 'cellB' }]],
    currentSelection = [[false]],
    currentBottomSelection = [],
    pageConfig = {
        currentSize: 1,
        tableSize: 1,
        pageSize: 5,
        visibleSize: 5,
        possiblePageSizes: [5, 10, 25],
        currentPage: 1,
        fixHeader: false
    },
    numRowsAbove = 0,
    bottomData = []
}) => ({
    data,
    bottomData,
    numRowsAbove,
    currentSelection,
    currentBottomSelection,
    dataConfig: {
        columnConfigs: [{
            key: 'a',
            header: 'a',
            ...includeSubHeaders && { subHeader: 'a' },
            type: columnTypes.Number,
            size: 50,
            filterConfig: {
                value: '',
                is: 'FilterInputField'
            },
            formatter: (x) => x,
            classGenerator: [],
            popoverRenderer: {
                type: 'MessageRenderer',
                process: data => data
            },
            hasSlotContent: false,
            ...enableIsSortable && { isSortable: false }
        }, {
            key: 'b',
            header: 'b',
            ...includeSubHeaders && { subHeader: 'b' },
            type: columnTypes.Number,
            size: 50,
            filterConfig: {
                value: '',
                is: 'FilterInputField'
            },
            formatter: (x) => x,
            classGenerator: [],
            hasSlotContent: false,
            ...enableIsSortable && { isSortable: true }
        }],
        rowConfig: {
            compactMode,
            ...rowHeight ? { rowHeight } : {}
        }
    },
    tableConfig: {
        pageConfig,
        showColumnFilters,
        showSelection,
        showBottomControls,
        searchConfig: {
            searchQuery: ''
        },
        timeFilterConfig: {
            currentTimeFilter: ''
        },
        enableVirtualScrolling,
        subMenuItems: [],
        columnSelectionConfig: {
            possibleColumns: ['a', 'b'],
            currentColumns: ['a', 'b']
        },
        groupByConfig: {
            currentGroup: null
        },
        ...columnFilterInitiallyActive === null ? {} : { columnFilterInitiallyActive },
        ...actionButtonConfig ? { actionButtonConfig } : {}
    }
});

describe('TableUI.vue', () => {
    let bodySizeEvent;
    const doMount = ({
        includeSubHeaders = true,
        compactMode = false,
        showSelection = true,
        showColumnFilters = true,
        showBottomControls = true,
        enableVirtualScrolling = false,
        fitToContainer = false,
        rowHeight = null,
        actionButtonConfig = {},
        columnFilterInitiallyActive = false,
        enableIsSortable = false,
        data = [[{ a: 'cellA', b: 'cellB' }]],
        currentSelection = [[false]],
        currentBottomSelection = [],
        pageConfig = {
            currentSize: 1,
            tableSize: 1,
            pageSize: 5,
            visibleSize: 5,
            possiblePageSizes: [5, 10, 25],
            currentPage: 1,
            fixHeader: false
        },
        numRowsAbove = 0,
        shallow = true,
        wrapperHeight = 1000,
        bottomData = []
    } = {}) => {
        const props = getProps({
            includeSubHeaders,
            compactMode,
            showSelection,
            showColumnFilters,
            showBottomControls,
            enableVirtualScrolling,
            rowHeight,
            actionButtonConfig,
            columnFilterInitiallyActive,
            enableIsSortable,
            data,
            currentSelection,
            currentBottomSelection,
            pageConfig,
            numRowsAbove,
            bottomData
        });

        bodySizeEvent.push({ contentRect: { height: wrapperHeight } });

        const wrapper = mount(TableUI, { props, shallow });

        return { wrapper, props };
    };

    beforeEach(() => {
        bodySizeEvent = [];
        Object.defineProperty(window, 'ResizeObserver', {
            writable: true,
            value: vi.fn().mockImplementation((callback) => ({
                observe: vi.fn(() => {
                    callback(bodySizeEvent);
                }),
                unobserve: vi.fn(),
                disconnect: vi.fn()
            }))
        });
    });

    describe('configuration', () => {
        it('renders', () => {
            const { wrapper } = doMount();

            expect(wrapper.findComponent(TableUI).exists()).toBe(true);
            expect(wrapper.findComponent(TopControls).exists()).toBe(true);
            expect(wrapper.findComponent(BottomControls).exists()).toBe(true);
            expect(wrapper.findComponent(ColumnFilters).exists()).toBe(false);
            expect(wrapper.findComponent(Header).exists()).toBe(true);
            expect(wrapper.findComponent(Group).exists()).toBe(true);
            expect(wrapper.findComponent(Row).exists()).toBe(true);
        });

        it('renders with column filters initially active', () => {
            const { wrapper } = doMount({ columnFilterInitiallyActive: true });

            expect(wrapper.findComponent(ColumnFilters).exists()).toBe(true);
        });

        it('renders with column filters inactive if columnFilterInitiallyActive not provided', () => {
            const { wrapper } = doMount({ columnFilterInitiallyActive: null });

            expect(wrapper.findComponent(ColumnFilters).exists()).toBe(false);
        });

        it('shows column filters via data', async () => {
            const { wrapper } = doMount();

            expect(wrapper.findComponent(TableUI).exists()).toBe(true);
            expect(wrapper.findComponent(Header).exists()).toBe(true);
            expect(wrapper.findComponent(ColumnFilters).exists()).toBe(false);
            await wrapper.setData({ filterActive: true });
            expect(wrapper.findComponent(ColumnFilters).exists()).toBe(true);
        });

        it('shows action button via config', () => {
            const { wrapper } = doMount({
                actionButtonConfig: { text: 'Test Button', callback: () => { } },
                showBottomControls: false
            });

            expect(wrapper.findComponent(TableUI).exists()).toBe(true);
            expect(wrapper.findComponent(BottomControls).exists()).toBe(false);
            expect(wrapper.findComponent(ActionButton).exists()).toBe(true);
        });
    });

    describe('events', () => {
        describe('top controls', () => {
            it('handles next page events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().pageChange).toBeFalsy();
                wrapper.findComponent(TopControls).vm.$emit('nextPage');
                expect(wrapper.emitted().pageChange).toStrictEqual([[1]]);
            });

            it('handles prev page events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().pageChange).toBeFalsy();
                wrapper.findComponent(TopControls).vm.$emit('prevPage');
                expect(wrapper.emitted().pageChange).toStrictEqual([[-1]]);
            });

            it('handles column update events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().columnUpdate).toBeFalsy();
                wrapper.findComponent(TopControls).vm.$emit('columnUpdate', ['A']);
                expect(wrapper.emitted().columnUpdate).toStrictEqual([[['A']]]);
            });

            it('handles column reorder events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().columnReorder).toBeFalsy();
                wrapper.findComponent(TopControls).vm.$emit('columnReorder', 1, 0);
                expect(wrapper.emitted().columnReorder).toStrictEqual([[1, 0]]);
            });

            it('handles group update events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().groupUpdate).toBeFalsy();
                wrapper.findComponent(TopControls).vm.$emit('groupUpdate', 'New Group');
                expect(wrapper.emitted().groupUpdate).toStrictEqual([['New Group']]);
            });

            it('handles search events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().search).toBeFalsy();
                wrapper.findComponent(TopControls).vm.$emit('searchUpdate', 'Query');
                expect(wrapper.emitted().search).toStrictEqual([['Query']]);
            });

            it('handles time filter update events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().timeFilterUpdate).toBeFalsy();
                wrapper.findComponent(TopControls).vm.$emit('timeFilterUpdate', 'Last year');
                expect(wrapper.emitted().timeFilterUpdate).toStrictEqual([['Last year']]);
            });
        });

        describe('header', () => {
            it('handles time header selection events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().selectAll).toBeFalsy();
                wrapper.findComponent(Header).vm.$emit('headerSelect', true);
                expect(wrapper.emitted().selectAll).toStrictEqual([[true]]);
            });

            it('handles column sort events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().columnSort).toBeFalsy();
                wrapper.findComponent(Header).vm.$emit('columnSort', 0);
                expect(wrapper.emitted().columnSort).toStrictEqual([[0]]);
            });

            it('handles toggle filter events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().toggleFilter).toBeFalsy();
                wrapper.findComponent(Header).vm.$emit('toggleFilter', true);
                expect(wrapper.emitted().toggleFilter).toStrictEqual([[true]]);
            });

            it('handles header submenu events', () => {
                const subMenuItem = { text: 'renderer1', id: 'rend1', section: 'dataRendering', selected: true };
                const { wrapper } = doMount();
                expect(wrapper.emitted().headerSubMenuItemSelection).toBeFalsy();
                wrapper.findComponent(Header).vm.$emit('subMenuItemSelection', subMenuItem, 1);
                expect(wrapper.emitted().headerSubMenuItemSelection).toStrictEqual([[subMenuItem, 1]]);
            });
        });

        describe('column filter', () => {
            it('handles column filter events', async () => {
                const { wrapper } = doMount();

                wrapper.findComponent(Header).vm.$emit('toggleFilter', true);
                await wrapper.vm.$nextTick();
                expect(wrapper.emitted().columnFilter).toBeFalsy();
                wrapper.findComponent(ColumnFilters).vm.$emit('columnFilter', 0, '0');
                expect(wrapper.emitted().columnFilter).toStrictEqual([[0, '0']]);
            });

            it('handles clear filter events', async () => {
                const { wrapper } = doMount();

                wrapper.findComponent(Header).vm.$emit('toggleFilter', true);
                await wrapper.vm.$nextTick();
                expect(wrapper.emitted().clearFilter).toBeFalsy();
                wrapper.findComponent(ColumnFilters).vm.$emit('clearFilter');
                expect(wrapper.emitted().clearFilter).toBeTruthy();
            });
        });

        it('handles group sub menu items', () => {
            const { wrapper } = doMount();

            let callbackMock = vi.fn();
            wrapper.findComponent(Group).vm.$emit('groupSubMenuClick', { callback: callbackMock });
            expect(callbackMock).toHaveBeenCalledWith(
                [{
                    data: { a: 'cellA', b: 'cellB' },
                    id: '0',
                    index: 0,
                    size: expectedNormalRowHeight,
                    scrollIndex: 0,
                    isTop: true
                }], expect.anything()
            );
        });

        describe('rows', () => {
            it('handles select events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().rowSelect).toBeFalsy();
                wrapper.findComponent(Row).vm.$emit('rowSelect', true);
                expect(wrapper.emitted().rowSelect).toStrictEqual([[true, 0, 0, true]]);
            });

            it('handles input events', () => {
                const id = 'uuid';
                const { wrapper } = doMount({ data: [[{ id }]] });

                expect(wrapper.emitted().tableInput).toBeFalsy();
                wrapper.findComponent(Row).vm.$emit('rowInput', { cell: true });
                expect(wrapper.emitted().tableInput).toStrictEqual(
                    [[{ cell: true, rowInd: 0, groupInd: 0, id, isTop: true }]]
                );
            });

            it('handles submenu clicks', () => {
                const { wrapper, props } = doMount();

                let callbackMock = vi.fn();
                wrapper.findComponent(Row).vm.$emit('rowSubMenuClick', { callback: callbackMock });
                expect(callbackMock).toHaveBeenCalledWith(props.data[0][0], expect.anything());
            });
        });

        describe('bottom controls', () => {
            it('handles next page events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().pageChange).toBeFalsy();
                wrapper.findComponent(BottomControls).vm.$emit('nextPage');
                expect(wrapper.emitted().pageChange).toStrictEqual([[1]]);
            });

            it('handles prev page events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().pageChange).toBeFalsy();
                wrapper.findComponent(BottomControls).vm.$emit('prevPage');
                expect(wrapper.emitted().pageChange).toStrictEqual([[-1]]);
            });

            it('registers pageSizeUpdate events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().pageSizeUpdate).toBeFalsy();
                wrapper.findComponent(BottomControls).vm.$emit('pageSizeUpdate', 25);
                expect(wrapper.emitted().pageSizeUpdate).toStrictEqual([[25]]);
            });
        });

        describe('table popover', () => {
            it('opens and closes default Popover', async () => {
                const { wrapper } = doMount();

                expect(wrapper.findComponent(TablePopover).exists()).toBeFalsy();
                expect(wrapper.vm.popoverColumn).toBeFalsy();
                expect(wrapper.vm.popoverData).toBeFalsy();
                expect(wrapper.vm.popoverRenderer).toBeFalsy();
                expect(wrapper.vm.popoverTarget).toBeFalsy();
                wrapper.findAllComponents(Row).at(0).vm.$emit('rowInput', {
                    colInd: 1,
                    cell: '<td>1</td>'
                });
                await wrapper.vm.$nextTick();
                expect(wrapper.findComponent(TablePopover).exists()).toBeTruthy();
                expect(wrapper.vm.popoverColumn).toBe('b');
                expect(wrapper.vm.popoverData).toBe('cellB');
                expect(wrapper.vm.popoverRenderer).toStrictEqual(columnTypes.Number);
                expect(wrapper.vm.popoverTarget).toBe('<td>1</td>');
                wrapper.findComponent(TablePopover).vm.$emit('close');
                await wrapper.vm.$nextTick();
                expect(wrapper.findComponent(TablePopover).exists()).toBeFalsy();
                expect(wrapper.vm.popoverColumn).toBeFalsy();
                expect(wrapper.vm.popoverData).toBeFalsy();
                expect(wrapper.vm.popoverRenderer).toBeFalsy();
                expect(wrapper.vm.popoverTarget).toBeFalsy();
            });

            it('uses configured popover renderer', () => {
                const { wrapper } = doMount();

                wrapper.findAllComponents(Row).at(0).vm.$emit('rowInput', {
                    colInd: 0,
                    cell: '<td>cellA</td>'
                });
                expect(wrapper.vm.popoverRenderer).toStrictEqual({
                    process: expect.any(Function),
                    type: 'MessageRenderer'
                });
            });
        });

        describe('column resize', () => {
            it('emits a columnResize event on columnResize', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().columnResize).toBeFalsy();
                wrapper.findComponent(Header).vm.$emit('columnResize', 0, 30);
                expect(wrapper.emitted().columnResize).toBeTruthy();
            });
        });
    });

    describe('the width of the table, its header and its body', () => {
        it('gets the correct width of the table-body when selection & filtering are enabled', () => {
            const { wrapper } = doMount({
                showSelection: true, showColumnFilters: true
            });

            wrapper.vm.onToggleFilter();
            expect(wrapper.vm.currentBodyWidth).toBe(180);
        });

        it('gets the correct width of the table-body when selection & filtering are disabled', () => {
            const { wrapper } = doMount({
                showSelection: false, showColumnFilters: false
            });

            wrapper.vm.onToggleFilter();
            expect(wrapper.vm.currentBodyWidth).toBe(120);
        });
    });

    describe('column specific sort config', () => {
        it('adds true to the columnSortConfigs for column configs that do not have the isSortable key', () => {
            const { wrapper } = doMount({ enableIsSortable: false });

            expect(wrapper.vm.columnSortConfigs).toEqual([true, true]);
        });

        it('adds the corresponding isSortable value to the columnSortConfigs if specified', () => {
            const { wrapper } = doMount({ enableIsSortable: true });

            expect(wrapper.vm.columnSortConfigs).toEqual([false, true]);
        });
    });

    describe('the height of the rows, of the body and of the table', () => {
        it('sets default height of rows if no height is given', () => {
            const { wrapper } = doMount();

            expect(wrapper.vm.rowHeight).toBe(40);
        });

        it('sets given rowHeight', () => {
            const rowHeight = 35;
            const { wrapper } = doMount({ rowHeight });

            expect(wrapper.vm.rowHeight).toEqual(rowHeight);
        });

        it('sets small height of rows on compact mode', () => {
            const { wrapper } = doMount({ compactMode: true });

            expect(wrapper.vm.rowHeight).toBe(24);
        });


        it('computes height from number of rows', () => {
            const { wrapper } = doMount({ pageConfig: {
                currentSize: 1,
                tableSize: 1,
                pageSize: 1,
                possiblePageSizes: [1],
                currentPage: 1
            } });

            expect(wrapper.vm.fullBodyHeight).toEqual(expectedNormalRowHeight);
        });

        it('sets current body height to zero if there is no available space', () => {
            const { wrapper } = doMount({ pageConfig: {
                currentSize: 1,
                tableSize: 1,
                pageSize: 1,
                possiblePageSizes: [1],
                currentPage: 1
            },
            wrapperHeight: 10 });

            expect(wrapper.vm.currentBodyHeight).toBe(0);
        });

        it('sets current body height to available space if it the full body size is larger than it', async () => {
            const { wrapper } = doMount({ pageConfig: {
                currentSize: 1,
                tableSize: 1,
                pageSize: 1,
                possiblePageSizes: [1],
                currentPage: 1
            },
            wrapperHeight: 150 });

            expect(wrapper.vm.currentBodyHeight).toBe(39);
            await wrapper.setData({ filterActive: true });
            expect(wrapper.vm.currentBodyHeight).toBe(1);
        });

        it('increases computed table height if filters are visible', async () => {
            const { wrapper } = doMount({ pageConfig: {
                currentSize: 1,
                tableSize: 1,
                pageSize: 1,
                possiblePageSizes: [1],
                currentPage: 1
            } });

            expect(wrapper.vm.currentTableHeight).toBe(81);
            await wrapper.setData({ filterActive: true });
            expect(wrapper.vm.currentTableHeight).toBe(119);
        });
    });

    describe('virtual scrolling', () => {
        beforeEach(() => {
            window.IntersectionObserver = vi.fn(() => ({
                observe: () => null,
                unobserve: () => null,
                disconnect: () => null
            }));
        });

        it('renders dynamic scroller when virtual scrolling is enabled', () => {
            const { wrapper } = doMount({ enableVirtualScrolling: true, shallow: false });

            expect(wrapper.findComponent(RecycleScroller).exists()).toBeTruthy();
        });

        it('emits lazyloading event onScroll', () => {
            const { wrapper } = doMount({ enableVirtualScrolling: true, shallow: false });

            wrapper.vm.onScroll(0, 0);
            expect(wrapper.emitted().lazyload).toBeFalsy();
            wrapper.vm.onScroll(0, 10);
            expect(wrapper.emitted().lazyload).toBeTruthy();
        });

        it('supplies data with ids and sizes', () => {
            const { wrapper } = doMount({ enableVirtualScrolling: true, shallow: false });
            expect(wrapper.vm.scrollData).toStrictEqual([[
                {
                    data: { a: 'cellA', b: 'cellB' },
                    id: '0',
                    index: 0,
                    size: expectedNormalRowHeight,
                    scrollIndex: 0,
                    isTop: true
                }
            ]]);
        });

        it('adds bottom data to the scroll data', () => {
            const { wrapper } = doMount({
                enableVirtualScrolling: true,
                bottomData: [['foo'], ['bar']],
                shallow: false
            });
            expect(wrapper.vm.scrollData).toStrictEqual([[
                {
                    data: { a: 'cellA', b: 'cellB' },
                    id: '0',
                    index: 0,
                    size: expectedNormalRowHeight,
                    scrollIndex: 0,
                    isTop: true
                },
                { dots: true, id: 'dots', size: 41 },
                { data: ['foo'], id: '2', index: 0, size: expectedNormalRowHeight, scrollIndex: 2, isTop: false },
                { data: ['bar'], id: '3', index: 1, size: expectedNormalRowHeight, scrollIndex: 3, isTop: false }
            ]]);
        });
        

        it('adds bottom data to the scroll data without top data', () => {
            const { wrapper } = doMount({
                enableVirtualScrolling: true,
                numRowsAbove: 2,
                data: [[]],
                bottomData: [['foo'], ['bar']],
                shallow: false
            });
            expect(wrapper.vm.scrollData).toStrictEqual([[
                { data: ['foo'], id: '2', index: 0, size: expectedNormalRowHeight, scrollIndex: 2, isTop: false },
                { data: ['bar'], id: '3', index: 1, size: expectedNormalRowHeight, scrollIndex: 3, isTop: false }
            ]]);
        });

        it('shifts data by number of rows above', () => {
            const numRowsAbove = 3;
            const { wrapper } = doMount({
                enableVirtualScrolling: true,
                numRowsAbove,
                shallow: false
            });
            expect(wrapper.vm.scrollData).toStrictEqual([[
                {
                    data: { a: 'cellA', b: 'cellB' },
                    id: `${numRowsAbove}`,
                    index: 0,
                    scrollIndex: numRowsAbove,
                    size: expectedNormalRowHeight,
                    isTop: true
                }
            ]]);
        });

        it('computes selection for top and bottom rows', () => {
            const numRowsAbove = 3;
            const { wrapper } = doMount({
                enableVirtualScrolling: true,
                shallow: false,
                numRowsAbove,
                currentSelection: [[true, false, true]],
                currentBottomSelection: [true, true]
            });
            const selectionMap = wrapper.vm.currentSelectionMap;

            expect(selectionMap(0, true)).toBe(true);
            expect(selectionMap(1, true)).toBe(false);
            expect(selectionMap(2, true)).toBe(true);
            expect(selectionMap(0, false)).toBe(true);
            expect(selectionMap(1, false)).toBe(true);
            expect(selectionMap(undefined, true)).toBe(false);
        });

        describe('supports expanding and collapsing rows', () => {
            const rowWithoutSize = { data: { a: 'cellA', b: 'cellB' }, id: '0', index: 0, scrollIndex: 0, isTop: true };

            it('changes the size of the rows if they are expanded', async () => {
                const { wrapper } = doMount({ enableVirtualScrolling: true, shallow: false, attachTo: document.body });
                // simulate the expanded content
                const expandedContentHeight = 20;
                const scroller = wrapper.findComponent(RecycleScroller);
                Object.defineProperty(scroller.vm.$el, 'clientHeight', { value: 1000 });
                scroller.vm.updateVisibleItems();
                await wrapper.vm.$nextTick();
                const firstRow = wrapper.vm.$refs['row-0'][0];
                firstRow.onRowExpand();
                await wrapper.vm.$nextTick();
                Object.defineProperty(firstRow.$el.children[1], 'clientHeight', { value: expandedContentHeight });
                
                expect(wrapper.vm.currentExpanded).toContain(0);

                expect(wrapper.vm.scrollData).toStrictEqual([[
                    { ...rowWithoutSize, size: expectedNormalRowHeight + expandedContentHeight }
                ]]);
                firstRow.onRowExpand();
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.currentExpanded).not.toContain(0);
                expect(wrapper.vm.scrollData).toStrictEqual([[
                    { ...rowWithoutSize, size: expectedNormalRowHeight }
                ]]);
            });

            it('calculates the height with virtual elements', () => {
                const { wrapper } = doMount({ enableVirtualScrolling: true, shallow: false });
                const currentExpanded = wrapper.vm.currentExpanded;
                wrapper.vm.onRowExpand(false, 0);
                expect(wrapper.vm.currentExpanded).toBe(currentExpanded);
            });

            it('collapses unused rows on scroll', () => {
                const { wrapper } = doMount({ enableVirtualScrolling: true, shallow: false });
                wrapper.vm.onRowExpand(true, 0);
                expect(wrapper.vm.currentExpanded).toContain(0);
                wrapper.vm.onScroll(1, 2);
                expect(wrapper.vm.currentExpanded).not.toContain(0);
            });
        });
    });
});
