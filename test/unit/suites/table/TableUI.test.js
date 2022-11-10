import { shallowMount, mount } from '@vue/test-utils';
import TableUI from '~/components/TableUI.vue';
import TopControls from '~/components/control/TopControls.vue';
import BottomControls from '~/components/control/BottomControls.vue';
import ColumnFilters from '~/components/filter/ColumnFilters.vue';
import Header from '~/components/layout/Header.vue';
import Group from '~/components/layout/Group.vue';
import Row from '~/components/layout/Row.vue';
import ActionButton from '~/components/ui/ActionButton.vue';
import TablePopover from '~/components/popover/TablePopover.vue';
import { RecycleScroller } from 'vue-virtual-scroller';

import { columnTypes } from '~/config/table.config';

const getPropsData = ({
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
    pageConfig = {
        currentSize: 1,
        tableSize: 1,
        pageSize: 5,
        visibleSize: 5,
        possiblePageSizes: [5, 10, 25],
        currentPage: 1,
        fixHeader: false
    }
}) => ({
    data,
    currentSelection: [[false]],
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
    const doMount = ({
        includeSubHeaders = true,
        compactMode = false,
        showSelection = true,
        showColumnFilters = true,
        showBottomControls = true,
        enableVirtualScrolling = false,
        rowHeight = null,
        actionButtonConfig = {},
        columnFilterInitiallyActive = false,
        enableIsSortable = false,
        data = [[{ a: 'cellA', b: 'cellB' }]],
        pageConfig = {
            currentSize: 1,
            tableSize: 1,
            pageSize: 5,
            visibleSize: 5,
            possiblePageSizes: [5, 10, 25],
            currentPage: 1,
            fixHeader: false
        },
        shallow = true
    } = {}) => {
        const propsData = getPropsData({
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
            pageConfig
        });

        const wrapper = shallow ? shallowMount(TableUI, { propsData }) : mount(TableUI, { propsData });

        return { wrapper, propsData };
    };

    describe('configuration', () => {
        it('renders', () => {
            const { wrapper } = doMount();

            expect(wrapper.find(TableUI).exists()).toBe(true);
            expect(wrapper.find(TopControls).exists()).toBe(true);
            expect(wrapper.find(BottomControls).exists()).toBe(true);
            expect(wrapper.find(ColumnFilters).exists()).toBe(false);
            expect(wrapper.find(Header).exists()).toBe(true);
            expect(wrapper.find(Group).exists()).toBe(true);
            expect(wrapper.find(Row).exists()).toBe(true);
        });

        it('renders with column filters initially active', () => {
            const { wrapper } = doMount({ columnFilterInitiallyActive: true });

            expect(wrapper.find(ColumnFilters).exists()).toBe(true);
        });

        it('renders with column filters inactive if columnFilterInitiallyActive not provided', () => {
            const { wrapper } = doMount({ columnFilterInitiallyActive: null });

            expect(wrapper.find(ColumnFilters).exists()).toBe(false);
        });

        it('shows column filters via data', () => {
            const { wrapper } = doMount();

            expect(wrapper.find(TableUI).exists()).toBe(true);
            expect(wrapper.find(Header).exists()).toBe(true);
            expect(wrapper.find(ColumnFilters).exists()).toBe(false);
            wrapper.setData({ filterActive: true });
            expect(wrapper.find(ColumnFilters).exists()).toBe(true);
        });

        it('shows action button via config', () => {
            const { wrapper } = doMount({
                actionButtonConfig: { text: 'Test Button', callback: () => { } },
                showBottomControls: false
            });

            expect(wrapper.find(TableUI).exists()).toBe(true);
            expect(wrapper.find(BottomControls).exists()).toBe(false);
            expect(wrapper.find(ActionButton).exists()).toBe(true);
        });
    });

    describe('events', () => {
        describe('top controls', () => {
            it('handles next page events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().pageChange).toBeFalsy();
                wrapper.find(TopControls).vm.$emit('nextPage');
                expect(wrapper.emitted().pageChange).toStrictEqual([[1]]);
            });

            it('handles prev page events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().pageChange).toBeFalsy();
                wrapper.find(TopControls).vm.$emit('prevPage');
                expect(wrapper.emitted().pageChange).toStrictEqual([[-1]]);
            });

            it('handles column update events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().columnUpdate).toBeFalsy();
                wrapper.find(TopControls).vm.$emit('columnUpdate', ['A']);
                expect(wrapper.emitted().columnUpdate).toStrictEqual([[['A']]]);
            });

            it('handles column reorder events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().columnReorder).toBeFalsy();
                wrapper.find(TopControls).vm.$emit('columnReorder', 1, 0);
                expect(wrapper.emitted().columnReorder).toStrictEqual([[1, 0]]);
            });

            it('handles group update events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().groupUpdate).toBeFalsy();
                wrapper.find(TopControls).vm.$emit('groupUpdate', 'New Group');
                expect(wrapper.emitted().groupUpdate).toStrictEqual([['New Group']]);
            });

            it('handles search events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().search).toBeFalsy();
                wrapper.find(TopControls).vm.$emit('searchUpdate', 'Query');
                expect(wrapper.emitted().search).toStrictEqual([['Query']]);
            });

            it('handles time filter update events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().timeFilterUpdate).toBeFalsy();
                wrapper.find(TopControls).vm.$emit('timeFilterUpdate', 'Last year');
                expect(wrapper.emitted().timeFilterUpdate).toStrictEqual([['Last year']]);
            });
        });

        describe('header', () => {
            it('handles time header selection events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().selectAll).toBeFalsy();
                wrapper.find(Header).vm.$emit('headerSelect', true);
                expect(wrapper.emitted().selectAll).toStrictEqual([[true]]);
            });

            it('handles column sort events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().columnSort).toBeFalsy();
                wrapper.find(Header).vm.$emit('columnSort', 0);
                expect(wrapper.emitted().columnSort).toStrictEqual([[0]]);
            });

            it('handles toggle filter events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().toggleFilter).toBeFalsy();
                wrapper.find(Header).vm.$emit('toggleFilter', true);
                expect(wrapper.emitted().toggleFilter).toStrictEqual([[true]]);
            });
        });

        describe('column filter', () => {
            it('handles column filter events', () => {
                const { wrapper } = doMount();

                wrapper.find(Header).vm.$emit('toggleFilter', true);
                expect(wrapper.emitted().columnFilter).toBeFalsy();
                wrapper.find(ColumnFilters).vm.$emit('columnFilter', 0, '0');
                expect(wrapper.emitted().columnFilter).toStrictEqual([[0, '0']]);
            });

            it('handles clear filter events', () => {
                const { wrapper } = doMount();

                wrapper.find(Header).vm.$emit('toggleFilter', true);
                expect(wrapper.emitted().clearFilter).toBeFalsy();
                wrapper.find(ColumnFilters).vm.$emit('clearFilter');
                expect(wrapper.emitted().clearFilter).toBeTruthy();
            });
        });

        it('handles group sub menu items', () => {
            const { wrapper } = doMount();

            let callbackMock = jest.fn();
            wrapper.find(Group).vm.$emit('groupSubMenuClick', { callback: callbackMock });
            expect(callbackMock).toHaveBeenCalledWith(
                [{ data: { a: 'cellA', b: 'cellB' }, id: '0', index: 0, size: 41 }], expect.anything()
            );
        });

        describe('rows', () => {
            it('handles select events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().rowSelect).toBeFalsy();
                wrapper.find(Row).vm.$emit('rowSelect', true);
                expect(wrapper.emitted().rowSelect).toStrictEqual([[true, 0, 0]]);
            });

            it('handles input events', () => {
                const id = 'uuid';
                const { wrapper } = doMount({ data: [[{ id }]] });

                expect(wrapper.emitted().tableInput).toBeFalsy();
                wrapper.find(Row).vm.$emit('rowInput', { cell: true });
                expect(wrapper.emitted().tableInput).toStrictEqual(
                    [[{ cell: true, rowInd: 0, groupInd: 0, id }]]
                );
            });

            it('handles submenu clicks', () => {
                const { wrapper, propsData } = doMount();

                let callbackMock = jest.fn();
                wrapper.find(Row).vm.$emit('rowSubMenuClick', { callback: callbackMock });
                expect(callbackMock).toHaveBeenCalledWith(propsData.data[0][0], expect.anything());
            });
        });

        describe('bottom controls', () => {
            it('handles next page events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().pageChange).toBeFalsy();
                wrapper.find(BottomControls).vm.$emit('nextPage');
                expect(wrapper.emitted().pageChange).toStrictEqual([[1]]);
            });

            it('handles prev page events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().pageChange).toBeFalsy();
                wrapper.find(BottomControls).vm.$emit('prevPage');
                expect(wrapper.emitted().pageChange).toStrictEqual([[-1]]);
            });

            it('registers pageSizeUpdate events', () => {
                const { wrapper } = doMount();

                expect(wrapper.emitted().pageSizeUpdate).toBeFalsy();
                wrapper.find(BottomControls).vm.$emit('pageSizeUpdate', 25);
                expect(wrapper.emitted().pageSizeUpdate).toStrictEqual([[25]]);
            });
        });

        describe('table popover', () => {
            it('opens and closes default Popover', () => {
                const { wrapper } = doMount();

                expect(wrapper.find(TablePopover).exists()).toBeFalsy();
                expect(wrapper.vm.popoverColumn).toBeFalsy();
                expect(wrapper.vm.popoverData).toBeFalsy();
                expect(wrapper.vm.popoverRenderer).toBeFalsy();
                expect(wrapper.vm.popoverTarget).toBeFalsy();
                wrapper.findAll(Row).at(0).vm.$emit('rowInput', {
                    colInd: 1,
                    cell: '<td>1</td>'
                });
                expect(wrapper.find(TablePopover).exists()).toBeTruthy();
                expect(wrapper.vm.popoverColumn).toStrictEqual('b');
                expect(wrapper.vm.popoverData).toStrictEqual('cellB');
                expect(wrapper.vm.popoverRenderer).toStrictEqual(columnTypes.Number);
                expect(wrapper.vm.popoverTarget).toStrictEqual('<td>1</td>');
                wrapper.find(TablePopover).vm.$emit('close');
                expect(wrapper.find(TablePopover).exists()).toBeFalsy();
                expect(wrapper.vm.popoverColumn).toBeFalsy();
                expect(wrapper.vm.popoverData).toBeFalsy();
                expect(wrapper.vm.popoverRenderer).toBeFalsy();
                expect(wrapper.vm.popoverTarget).toBeFalsy();
            });

            it('uses configured popover renderer', () => {
                const { wrapper } = doMount();

                wrapper.findAll(Row).at(0).vm.$emit('rowInput', {
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
                wrapper.find(Header).vm.$emit('columnResize', 0, 30);
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
            expect(wrapper.vm.currentBodyWidth).toEqual(180);
        });

        it('gets the correct width of the table-body when selection & filtering are disabled', () => {
            const { wrapper } = doMount({
                showSelection: false, showColumnFilters: false
            });

            wrapper.vm.onToggleFilter();
            expect(wrapper.vm.currentBodyWidth).toEqual(120);
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

    describe('the height of the rows and of the body', () => {
        it('sets default height of rows if no height is given', () => {
            const { wrapper } = doMount();

            expect(wrapper.vm.rowHeight).toEqual(40);
        });

        it('sets given rowHeight', () => {
            const rowHeight = 35;
            const { wrapper } = doMount({ rowHeight });

            expect(wrapper.vm.rowHeight).toEqual(rowHeight);
        });

        it('sets small height of rows on compact mode', () => {
            const { wrapper } = doMount({ compactMode: true });

            expect(wrapper.vm.rowHeight).toEqual(24);
        });

        describe('body height', () => {
            const pageConfigWithoutVisibleSize = {
                currentSize: 1,
                tableSize: 1,
                pageSize: 1,
                possiblePageSizes: [1],
                currentPage: 1
            };

            it('computes height from number of rows when no visibleSize is given', () => {
                const { wrapper } = doMount({ pageConfig: pageConfigWithoutVisibleSize });

                expect(wrapper.vm.currentBodyHeight).toEqual(41);
            });

            it('computes height from number of rows when visibleSize is greater than it', () => {
                const { wrapper } = doMount({ pageConfig: { ...pageConfigWithoutVisibleSize, visibleSize: 3 } });

                expect(wrapper.vm.currentBodyHeight).toEqual(41);
            });

            it('computes height from visibleSize', () => {
                const visibleSize = 3;
                const { wrapper } = doMount({
                    data: [[{ a: 'cellA' }, { a: 'cellA' }, { a: 'cellA' }, { a: 'cellA' }]],
                    pageConfig: { ...pageConfigWithoutVisibleSize, visibleSize }
                });

                expect(wrapper.vm.currentBodyHeight).toEqual(visibleSize * 41);
            });
        });
    });

    describe('virtual scrolling', () => {
        it('renders dynamic scroller when virtual scrolling is enabled', () => {
            const { wrapper } = doMount({ enableVirtualScrolling: true });

            expect(wrapper.find(RecycleScroller).exists()).toBeTruthy();
        });

        it('emits lazyloading event onScroll', () => {
            const { wrapper } = doMount({ enableVirtualScrolling: true });

            wrapper.vm.onScroll(0, 0);
            expect(wrapper.emitted().lazyload).toBeFalsy();
            wrapper.vm.onScroll(0, 10);
            expect(wrapper.emitted().lazyload).toBeTruthy();
        });

        it('supplies data with ids and sizes', () => {
            const { wrapper } = doMount({ enableVirtualScrolling: true });
            expect(wrapper.vm.scrollData).toStrictEqual([[
                { data: { a: 'cellA', b: 'cellB' }, id: '0', index: 0, size: 41 }
            ]]);
        });

        describe('supports expanding and collapsing rows', () => {
            it('changes the size of the rows if they are expanded', () => {
                const { wrapper } = doMount({ enableVirtualScrolling: true });
                wrapper.vm.onRowExpand(true, 0);
                // simulate the expanded content
                const expandedContentHeight = 20;
                wrapper.vm.$refs['row-0'] = [{ $el: { children: [{}, { clientHeight: expandedContentHeight }] } }];
                expect(wrapper.vm.currentExpanded).toContain(0);
                wrapper.vm.onRowExpand(true, 1);
                wrapper.vm.onRowExpand(false, 1);
                expect(wrapper.vm.currentExpanded).not.toContain(1);
                expect(wrapper.vm.scrollData).toStrictEqual([[
                    { data: { a: 'cellA', b: 'cellB' }, id: '0', index: 0, size: 41 + expandedContentHeight }
                ]]);
            });

            it('collapses unused rows on scroll', () => {
                const { wrapper } = doMount({ enableVirtualScrolling: true });
                wrapper.vm.onRowExpand(true, 0);
                // simulate the expanded content
                wrapper.vm.$refs['row-0'] = [{ $el: { children: [{}, { clientHeight: 20 }] } }];
                expect(wrapper.vm.currentExpanded).toContain(0);
                wrapper.vm.onScroll(1, 2);
                expect(wrapper.vm.currentExpanded).not.toContain(0);
            });
        });
        
        it('refreshes scroller', async () => {
            const { wrapper } = doMount({ enableVirtualScrolling: true });

            let isUnmounted = false;
            wrapper.find(RecycleScroller).vm.$once('hook:beforeDestroy', () => {
                isUnmounted = true;
            });
            await wrapper.vm.$nextTick();
            wrapper.vm.refreshScroller();
            await wrapper.vm.$nextTick();
            expect(isUnmounted).toBeTruthy();
            const scroller = wrapper.find(RecycleScroller);
            expect(scroller.vm._isMounted).toBeTruthy();
        });
    });
});
