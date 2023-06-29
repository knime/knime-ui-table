/* eslint-disable vitest/max-nested-describe */
/* eslint-disable max-lines */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import TableUI from '../TableUI.vue';
import TopControls from '@/components/control/TopControls.vue';
import PageControls from '@/components/control/PageControls.vue';
import BottomControls from '@/components/control/BottomControls.vue';
import ColumnFilters from '@/components/filter/ColumnFilters.vue';
import Header from '@/components/layout/Header.vue';
import Group from '@/components/layout/Group.vue';
import Row from '@/components/layout/Row.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import TablePopover from '@/components/popover/TablePopover.vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import { columnTypes } from '@/config/table.config';
import useAvailableWidth from '../composables/useAvailableWidth';
import { unref } from 'vue';
import { SPECIAL_COLUMNS_SIZE } from '@/util/constants';

const expectedNormalRowHeight = 41;

const bodyWidthResult = 123;
const availableWidthMock = {
    innerWidthToBodyWidth: vi.fn(() => bodyWidthResult)
};
vi.mock('../composables/useAvailableWidth', () => ({ default: vi.fn(() => availableWidthMock) }));


const getProps = ({
    includeSubHeaders = true,
    enableRowResize = true,
    compactMode = false,
    showSelection = true,
    showCollapser = false,
    showSubMenuItems = false,
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
            ...rowHeight ? { rowHeight } : {},
            enableResizing: enableRowResize
        }
    },
    tableConfig: {
        pageConfig,
        showColumnFilters,
        showSelection,
        showCollapser,
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
        ...actionButtonConfig ? { actionButtonConfig } : {},
        ...showSubMenuItems ? { subMenuItems: [{ text: 'test' }] } : {}
    }
});

describe('TableUI.vue', () => {
    let bodySizeEvent;
    const doMount = ({
        includeSubHeaders = true,
        enableRowResize = true,
        compactMode = false,
        showSelection = true,
        showCollapser = false,
        showSubMenuItems = false,
        showColumnFilters = true,
        showBottomControls = true,
        enableVirtualScrolling = false,
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
    } = {}, stubs = {}) => {
        const props = getProps({
            enableRowResize,
            includeSubHeaders,
            compactMode,
            showSelection,
            showCollapser,
            showSubMenuItems,
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

        const wrapper = mount(TableUI, { props, shallow, global: { stubs } });

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
            it('does not show top controls if there are no page controls', () => {
                const { wrapper } = doMount({ pageConfig: false });
                expect(wrapper.findComponent(TopControls).exists()).toBeFalsy();
            });

            it('does not show top controls text if there showTableSize is false', () => {
                const { wrapper } = doMount({ shallow: false,
                    pageConfig: {
                        showTableSize: false,
                        pageSize: 1,
                        possiblePageSizes: []
                    } });
                expect(wrapper.findComponent(PageControls).text()).toBe('');
            });

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

        describe('row and group submenus', () => {
            beforeEach(() => {
                vi.useFakeTimers();
            });

            it('handles row sub menu clicks', () => {
                const { wrapper, props } = doMount();

                let callbackMock = vi.fn();
                wrapper.findComponent(Row).vm.$emit('rowSubMenuClick', { callback: callbackMock });
                expect(callbackMock).toHaveBeenCalledWith(props.data[0][0], expect.anything());
            });
            
            it('handles group sub menu clicks', () => {
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

            it('collapses expanded submenu on scroll', () => {
                const { wrapper } = doMount();
    
                let callbackMockRow = vi.fn();
                wrapper.findComponent(Row).vm.$emit('rowSubMenuExpand', callbackMockRow);
                vi.advanceTimersToNextTimer();
                expect(callbackMockRow).toHaveBeenCalledTimes(0);
                wrapper.find('.vertical-scroll').element.dispatchEvent(new Event('scroll'));
                expect(callbackMockRow).toHaveBeenCalledTimes(1);

                let callbackMockGroup = vi.fn();
                wrapper.findComponent(Group).vm.$emit('groupSubMenuExpand', callbackMockGroup);
                vi.advanceTimersToNextTimer();
                expect(callbackMockGroup).toHaveBeenCalledTimes(0);
                wrapper.find('.vertical-scroll').element.dispatchEvent(new Event('scroll'));
                expect(callbackMockRow).toHaveBeenCalledTimes(1);
                expect(callbackMockGroup).toHaveBeenCalledTimes(1);
            });
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

            it('disables row resizing via row config', () => {
                const { wrapper } = doMount({ enableRowResize: false });
                expect(wrapper.findComponent(Row).props().showDragHandle).toBe(false);
            });

            describe('watches row config', () => {
                it('updates row height if row height was changed in parent', async () => {
                    const { wrapper } = doMount();
                    const resetRowHeightSpy = vi.spyOn(wrapper.vm, 'resetRowHeight');
                    const props = wrapper.vm.$props;
                    wrapper.setProps({
                        dataConfig: {
                            ...props.dataConfig,
                            rowConfig: {
                                ...props.dataConfig.rowConfig,
                                rowHeight: 999
                            }
                        }
                    });
                    await wrapper.vm.$nextTick();
                    expect(resetRowHeightSpy).toHaveBeenCalled();
                });

                it('updates row height if compact mode was changed in parent', async () => {
                    const { wrapper } = doMount();
                    const resetRowHeightSpy = vi.spyOn(wrapper.vm, 'resetRowHeight');
                    const props = wrapper.vm.$props;
                    wrapper.setProps({
                        dataConfig: {
                            ...props.dataConfig,
                            rowConfig: {
                                ...props.dataConfig.rowConfig,
                                compactMode: !props.dataConfig.rowConfig.compactMode
                            }
                        }
                    });
                    await wrapper.vm.$nextTick();
                    expect(resetRowHeightSpy).toHaveBeenCalled();
                });
            });
            
            describe('row resize with virtual scrolling disabled', () => {
                it('does not emit row resize event if virtual scrolling is disabled', () => {
                    const { wrapper } = doMount();
                    const resizeRowSpy = vi.spyOn(wrapper.vm, 'onResizeRow');
                    const row = wrapper.findComponent(Row);
                    expect(row.exists()).toBeTruthy();
                    row.vm.$emit('resizeRow', 123);
                    expect(resizeRowSpy).not.toHaveBeenCalled();
                });

                it('handles resize all rows event', () => {
                    const { wrapper } = doMount();
                    const row = wrapper.findComponent(Row);
                    const scrollIntoViewSpy = vi.fn();
                    row.vm.$el.scrollIntoView = scrollIntoViewSpy;
                    row.vm.$emit('resizeAllRows', 123, row.vm.$el);
                    expect(wrapper.vm.currentRowSizeDelta).toBe(0);
                    expect(wrapper.vm.currentRowHeight).toBe(123);
                    expect(scrollIntoViewSpy).toHaveBeenCalled();
                });
            });

            describe('row resize with virtual scrolling enabled', () => {
                const fillRecycleScroller = async (wrapper) => {
                    const scroller = wrapper.findComponent(RecycleScroller);
                    Object.defineProperty(scroller.vm.$el, 'clientHeight', { value: 1000 });
                    scroller.vm.updateVisibleItems();
                    await wrapper.vm.$nextTick();
                };

                it('handles rowResize event for single row', async () => {
                    const { wrapper } = doMount({
                        enableVirtualScrolling: true, shallow: false
                    });
                    const resizeRowSpy = vi.spyOn(wrapper.vm, 'onResizeRow');
                    await fillRecycleScroller(wrapper);
                    const row = wrapper.findComponent(Row);
                    expect(row.exists()).toBeTruthy();
                    row.vm.$emit('resizeRow', 123);
                    expect(resizeRowSpy).toHaveBeenCalledWith(123, 0);
                });

                it('handles resizeAllRows event', async () => {
                    const { wrapper } = doMount({
                        enableVirtualScrolling: true, shallow: false
                    });
                    const resizeRowSpy = vi.spyOn(wrapper.vm, 'onResizeAllRows');
                    await fillRecycleScroller(wrapper);
                    const row = wrapper.findComponent(Row);
                    row.vm.$emit('resizeAllRows', 123, row);
                    expect(resizeRowSpy).toHaveBeenCalled();
                });

                it('onResizeAllRows updates all row sizes', () => {
                    vi.useFakeTimers();
                    const scrollToPosition = vi.fn();
                    const start = 100;
                    const stubs = {
                        RecycleScroller: {
                            template: '<span/>',
                            methods: {
                                getScroll: () => ({
                                    start
                                }),
                                scrollToPosition
                            }
                            
                        }
                    };
                    let resizeObserverCallback = () => {};
                    window.ResizeObserver = vi.fn((callback) => {
                        resizeObserverCallback = callback;
                        return {
                            observe: () => null,
                            unobserve: () => null,
                            disconnect: () => null
                        };
                    });
                    const { wrapper } = doMount({
                        enableVirtualScrolling: true, shallow: false
                    }, stubs);
    
                    const oldSize = 99;
                    const newSize = 123;
                    const scrollIndex = 5;
    
                    wrapper.vm.resizedRowHeight = oldSize;
                    wrapper.vm.currentResizedScrollIndex = 5;
    
                    wrapper.vm.onResizeAllRows(newSize, null, scrollIndex);
                    expect(wrapper.vm.currentRowHeight).toBe(newSize);
                    resizeObserverCallback();
                    vi.runAllTimers();
                    expect(wrapper.vm.currentResizedScrollIndex).toBeNull();
                    const offset = scrollIndex * oldSize - start;
                    expect(scrollToPosition).toHaveBeenCalledWith(scrollIndex * newSize - offset);
                    vi.useRealTimers();
                });
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
        it('uses available width composable navigation', async () => {
            useAvailableWidth.reset();
            const { wrapper } = doMount();
            const [{
                emitAvailableWidth,
                refs: {
                    scrolledElement,
                    root: providedWrapper
                }
            }] = useAvailableWidth.mock.calls[0];
            await wrapper.vm.$nextTick();
            expect(unref(providedWrapper)).toBe(wrapper.find('table').wrapperElement);
            expect(unref(scrolledElement)).toStrictEqual(wrapper.find('.vertical-scroll').element);

            emitAvailableWidth(123);
            expect(wrapper.emitted()['update:available-width']).toStrictEqual([[123]]);
        });

        describe('specialColumnsTotalWidth', () => {
            const getSpecialColumnsSizeTotal = (settings) => {
                useAvailableWidth.reset();
                doMount(settings);
                const [{ specialColumnsSizeTotal }] = useAvailableWidth.mock.calls[0];
                return specialColumnsSizeTotal;
            };

            let specialColumnsSettings;

            beforeEach(() => {
                specialColumnsSettings = {
                    showColumnFilters: false,
                    showCollapser: false,
                    showSelection: false,
                    showSubMenuItems: false
                };
            });

            it('is 0 for no special columns', () => {
                expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(0);
            });

            it('respects collapsers', () => {
                specialColumnsSettings.showCollapser = true;
                expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(SPECIAL_COLUMNS_SIZE);
            });

            it('respects selection', () => {
                specialColumnsSettings.showSelection = true;
                expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(SPECIAL_COLUMNS_SIZE);
            });

            it('respects column filters', () => {
                specialColumnsSettings.showColumnFilters = true;
                expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(SPECIAL_COLUMNS_SIZE);
            });

            it('respects sub menus', () => {
                specialColumnsSettings.showSubMenuItems = true;
                expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(SPECIAL_COLUMNS_SIZE);
            });

            it('respects multiple special columns', () => {
                specialColumnsSettings.showColumnFilters = true;
                specialColumnsSettings.showSelection = true;
                specialColumnsSettings.showCollapser = true;
                expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(SPECIAL_COLUMNS_SIZE * 3);
            });

            it('uses the same space for menu items and column filters', () => {
                specialColumnsSettings.showColumnFilters = true;
                specialColumnsSettings.showSubMenuItems = true;
                expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(SPECIAL_COLUMNS_SIZE);
            });
        });


        it('computes current body width from provided callback', () => {
            const { wrapper } = doMount();
            expect(availableWidthMock.innerWidthToBodyWidth).toHaveBeenCalledWith(100, false);
            expect(wrapper.vm.currentBodyWidth).toBe(bodyWidthResult);
        });

        it('uses different scrolled element in case of virtual scrolling', () => {
            useAvailableWidth.reset();
            const { wrapper } = doMount({ enableVirtualScrolling: true, shallow: false });
            const [{
                refs: {
                    scrolledElement
                }
            }] = useAvailableWidth.mock.calls[0];

            expect(unref(scrolledElement)).toBe(wrapper.findComponent(RecycleScroller).element);
        });

        it('uses the scrollbar width when creating the current body width', () => {
            const { wrapper } = doMount({ enableVirtualScrolling: true, shallow: false });
            expect(availableWidthMock.innerWidthToBodyWidth).toHaveBeenCalledWith(100, true);
            expect(wrapper.vm.currentBodyWidth).toBe(bodyWidthResult);
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

    describe('the height of the rows', () => {
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
                { dots: true, id: 'dots', scrollIndex: 1, size: 41 },
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

        it('selects nothing when selection is not shown', () => {
            const { wrapper } = doMount({
                showSelection: false
            });
            const selectionMap = wrapper.vm.currentSelectionMap;

            expect(selectionMap(0, true)).toBe(false);
            expect(selectionMap(1, true)).toBe(false);
            expect(selectionMap(2, true)).toBe(false);
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
                const firstRow = wrapper.vm.$refs['row-0'];
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

    it('computes drag handle height', () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.getDragHandleHeight()).toBeDefined();
        const { wrapper: wrapperWithScroller } = doMount({ enableVirtualScrolling: true, shallow: false });
        expect(wrapperWithScroller.vm.getDragHandleHeight()).toBeDefined();
    });
});
