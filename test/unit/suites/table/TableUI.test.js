import { shallowMount } from '@vue/test-utils';
import TableUI from '~/components/TableUI';
import TopControls from '~/components/control/TopControls';
import BottomControls from '~/components/control/BottomControls';
import ColumnFilters from '~/components/filter/ColumnFilters';
import Header from '~/components/layout/Header';
import Group from '~/components/layout/Group';
import Row from '~/components/layout/Row';
import ActionButton from '~/components/ui/ActionButton';
import TablePopover from '~/components/popover/TablePopover';

import { columnTypes } from '~/config/table.config';

describe('TableUI.vue', () => {
    let wrapper;

    let propsData = {
        data: [[{ a: 1, b: 2 }]],
        currentSelection: [[false]],
        dataConfig: {
            columnConfigs: [{
                key: 'a',
                header: 'a',
                subHeader: 'a',
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
                hasSlotContent: false
            }, {
                key: 'b',
                header: 'b',
                subHeader: 'b',
                type: columnTypes.Number,
                size: 50,
                filterConfig: {
                    value: '',
                    is: 'FilterInputField'
                },
                formatter: (x) => x,
                classGenerator: [],
                hasSlotContent: false
            }]
        },
        tableConfig: {
            pageConfig: {
                currentSize: 1,
                tableSize: 1,
                pageSize: 5,
                possiblePageSizes: [5, 10, 25],
                currentPage: 1
            },
            showColumnFilters: true,
            showBottomControls: true,
            searchConfig: {
                searchQuery: ''
            },
            timeFilterConfig: {
                currentTimeFilter: ''
            },
            columnSelectionConfig: {
                possibleColumns: ['a', 'b'],
                currentColumns: ['a', 'b']
            }
        }
    };

    describe('configuration', () => {
        it('renders', () => {
            wrapper = shallowMount(TableUI, { propsData });
            expect(wrapper.find(TableUI).exists()).toBe(true);
            expect(wrapper.find(TopControls).exists()).toBe(true);
            expect(wrapper.find(BottomControls).exists()).toBe(true);
            expect(wrapper.find(ColumnFilters).exists()).toBe(false);
            expect(wrapper.find(Header).exists()).toBe(true);
            expect(wrapper.find(Group).exists()).toBe(true);
            expect(wrapper.find(Row).exists()).toBe(true);
        });

        it('shows column filters via data', () => {
            wrapper = shallowMount(TableUI, { propsData });
            expect(wrapper.find(TableUI).exists()).toBe(true);
            expect(wrapper.find(Header).exists()).toBe(true);
            expect(wrapper.find(ColumnFilters).exists()).toBe(false);
            wrapper.setData({ filterActive: true });
            expect(wrapper.find(ColumnFilters).exists()).toBe(true);
        });

        it('shows action button via config', () => {
            wrapper = shallowMount(TableUI, { propsData: {
                ...propsData,
                tableConfig: {
                    ...propsData.tableConfig,
                    actionButtonConfig: { text: 'Test Button', callback: () => {} },
                    showBottomControls: false
                }
            } });

            expect(wrapper.find(TableUI).exists()).toBe(true);
            expect(wrapper.find(BottomControls).exists()).toBe(false);
            expect(wrapper.find(ActionButton).exists()).toBe(true);
        });
    });

    describe('events', () => {
        describe('top controls', () => {
            it('handles next page events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().pageChange).toBeFalsy();
                wrapper.find(TopControls).vm.$emit('nextPage');
                expect(wrapper.emitted().pageChange).toStrictEqual([[1]]);
            });
    
            it('handles prev page events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().pageChange).toBeFalsy();
                wrapper.find(TopControls).vm.$emit('prevPage');
                expect(wrapper.emitted().pageChange).toStrictEqual([[-1]]);
            });

            it('handles column update events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().columnUpdate).toBeFalsy();
                wrapper.find(TopControls).vm.$emit('columnUpdate', ['A']);
                expect(wrapper.emitted().columnUpdate).toStrictEqual([[['A']]]);
            });

            it('handles column reorder events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().columnReorder).toBeFalsy();
                wrapper.find(TopControls).vm.$emit('columnReorder', 1, 0);
                expect(wrapper.emitted().columnReorder).toStrictEqual([[1, 0]]);
            });

            it('handles group update events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().groupUpdate).toBeFalsy();
                wrapper.find(TopControls).vm.$emit('groupUpdate', 'New Group');
                expect(wrapper.emitted().groupUpdate).toStrictEqual([['New Group']]);
            });

            it('handles search events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().search).toBeFalsy();
                wrapper.find(TopControls).vm.$emit('searchUpdate', 'Query');
                expect(wrapper.emitted().search).toStrictEqual([['Query']]);
            });

            it('handles time filter update events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().timeFilterUpdate).toBeFalsy();
                wrapper.find(TopControls).vm.$emit('timeFilterUpdate', 'Last year');
                expect(wrapper.emitted().timeFilterUpdate).toStrictEqual([['Last year']]);
            });
        });

        describe('header', () => {
            it('handles time header selection events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().selectAll).toBeFalsy();
                wrapper.find(Header).vm.$emit('headerSelect', true);
                expect(wrapper.emitted().selectAll).toStrictEqual([[true]]);
            });

            it('handles column sort events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().columnSort).toBeFalsy();
                wrapper.find(Header).vm.$emit('columnSort', 0);
                expect(wrapper.emitted().columnSort).toStrictEqual([[0]]);
            });

            it('handles toggle filter events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().toggleFilter).toBeFalsy();
                wrapper.find(Header).vm.$emit('toggleFilter', true);
                expect(wrapper.emitted().toggleFilter).toStrictEqual([[true]]);
            });
        });

        describe('column filter', () => {
            it('handles column filter events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                wrapper.find(Header).vm.$emit('toggleFilter', true);
                expect(wrapper.emitted().columnFilter).toBeFalsy();
                wrapper.find(ColumnFilters).vm.$emit('columnFilter', 0, '0');
                expect(wrapper.emitted().columnFilter).toStrictEqual([[0, '0']]);
            });

            it('handles clear filter events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                wrapper.find(Header).vm.$emit('toggleFilter', true);
                expect(wrapper.emitted().clearFilter).toBeFalsy();
                wrapper.find(ColumnFilters).vm.$emit('clearFilter');
                expect(wrapper.emitted().clearFilter).toBeTruthy();
            });
        });

        it('handles group sub menu items', () => {
            wrapper = shallowMount(TableUI, { propsData });
            let callbackMock = jest.fn();
            wrapper.find(Group).vm.$emit('groupSubMenuClick', { callback: callbackMock });
            expect(callbackMock).toHaveBeenCalledWith(propsData.data[0], expect.anything());
        });

        describe('rows', () => {
            it('handles select events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().rowSelect).toBeFalsy();
                wrapper.find(Row).vm.$emit('rowSelect', true);
                expect(wrapper.emitted().rowSelect).toStrictEqual([[true, 0, 0]]);
            });

            it('handles input events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().tableInput).toBeFalsy();
                wrapper.find(Row).vm.$emit('rowInput', { cell: true });
                expect(wrapper.emitted().tableInput).toStrictEqual(
                    [[{ cell: true, rowInd: 0, groupInd: 0, id: expect.undefined }]]
                );
            });

            it('handles submenu clicks', () => {
                wrapper = shallowMount(TableUI, { propsData });
                let callbackMock = jest.fn();
                wrapper.find(Row).vm.$emit('rowSubMenuClick', { callback: callbackMock });
                expect(callbackMock).toHaveBeenCalledWith(propsData.data[0][0], expect.anything());
            });
        });

        describe('bottom controls', () => {
            it('handles next page events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().pageChange).toBeFalsy();
                wrapper.find(BottomControls).vm.$emit('nextPage');
                expect(wrapper.emitted().pageChange).toStrictEqual([[1]]);
            });
    
            it('handles prev page events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().pageChange).toBeFalsy();
                wrapper.find(BottomControls).vm.$emit('prevPage');
                expect(wrapper.emitted().pageChange).toStrictEqual([[-1]]);
            });

            it('registers pageSizeUpdate events', () => {
                wrapper = shallowMount(TableUI, { propsData });
                expect(wrapper.emitted().pageSizeUpdate).toBeFalsy();
                wrapper.find(BottomControls).vm.$emit('pageSizeUpdate', 25);
                expect(wrapper.emitted().pageSizeUpdate).toStrictEqual([[25]]);
            });
        });

        describe('table popover', () => {
            it('opens and closes default Popover', () => {
                wrapper = shallowMount(TableUI, { propsData });
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
                expect(wrapper.vm.popoverData).toStrictEqual(2);
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
                wrapper.findAll(Row).at(0).vm.$emit('rowInput', {
                    colInd: 0,
                    cell: '<td>1</td>'
                });
                expect(wrapper.vm.popoverRenderer).toStrictEqual({
                    process: expect.any(Function),
                    type: 'MessageRenderer'
                });
            });
        });
    });
});
