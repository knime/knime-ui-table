import { describe, it, expect } from 'vitest';
import { shallowMount, mount } from '@vue/test-utils';

import Row from '../Row.vue';
import Cell from '../Cell.vue';
import CollapserToggle from '@/components/ui/CollapserToggle.vue';
import SubMenu from 'webapps-common/ui/components/SubMenu.vue';
import Checkbox from 'webapps-common/ui/components/forms/Checkbox.vue';
import FunctionButton from 'webapps-common/ui/components/FunctionButton.vue';
import OptionsIcon from 'webapps-common/ui/assets/img/icons/menu-options.svg';
import CloseIcon from 'webapps-common/ui/assets/img/icons/close.svg';
import MenuItems from 'webapps-common/ui/components/MenuItems.vue';

describe('Row.vue', () => {
    let wrapper;

    let f = item => item;
    let props = {
        row: ['data1', 'data2', 'data3', 'data4', 'data5'],
        tableConfig: {
            showPopovers: true,
            showSelection: true,
            showCollapser: false,
            subMenuItems: [{ id: 'action', text: 'Action' }]
        },
        columnConfigs: []
    };
    props.row.forEach((data, i) => props.columnConfigs.push({
        key: `col${i.toString()}`,
        formatter: f,
        classGenerator: [],
        size: 20,
        hasSlotContent: false,
        popoverRenderer: false
    }));
    let getUpdatedProps = (colProp, values) => {
        let updatedProps = JSON.parse(JSON.stringify(props));
        updatedProps.columnConfigs.forEach((colConfig, colInd) => {
            colConfig.formatter = f;
            colConfig[colProp] = values[colInd];
        });
        return updatedProps;
    };

    describe('rendering', () => {
        it('displays empty "tr" element if no data provided', () => {
            wrapper = shallowMount(Row);

            expect(wrapper.findComponent(Row).exists()).toBeTruthy();
            expect(wrapper.findComponent(CollapserToggle).exists()).toBeFalsy();
            expect(wrapper.findComponent(SubMenu).exists()).toBeFalsy();
            expect(wrapper.findComponent(Checkbox).exists()).toBeFalsy();
            expect(wrapper.findComponent(FunctionButton).exists()).toBeFalsy();
            expect(wrapper.findComponent(OptionsIcon).exists()).toBeFalsy();
            expect(wrapper.findComponent(CloseIcon).exists()).toBeFalsy();
            expect(wrapper.find('td.data-cell').exists()).toBeFalsy();
            expect(wrapper.find('tr td').text()).toBe('-');
        });

        it('renders default table row', () => {
            wrapper = shallowMount(Row, {
                props
            });
            expect(wrapper.findComponent(Row).exists()).toBeTruthy();
            expect(wrapper.findComponent(CollapserToggle).exists()).toBeFalsy();
            expect(wrapper.findComponent(SubMenu).exists()).toBeTruthy();
            expect(wrapper.findComponent(Checkbox).exists()).toBeTruthy();
            expect(wrapper.findComponent(FunctionButton).exists()).toBeFalsy();
            expect(wrapper.findComponent(OptionsIcon).exists()).toBeTruthy();
            expect(wrapper.findComponent(CloseIcon).exists()).toBeFalsy();
            expect(wrapper.findComponent(Cell).exists()).toBeTruthy();
        });

        it('shows the collapser toggle via prop', () => {
            wrapper = shallowMount(Row, {
                props: {
                    ...props,
                    tableConfig: {
                        ...props.tableConfig,
                        showCollapser: true
                    }
                }
            });

            expect(wrapper.findComponent(Row).exists()).toBeTruthy();
            expect(wrapper.findComponent(CollapserToggle).exists()).toBeTruthy();
        });

        it('hides the checkbox via prop', () => {
            wrapper = shallowMount(Row, {
                props: {
                    ...props,
                    tableConfig: {
                        ...props.tableConfig,
                        showSelection: false
                    }
                }
            });

            expect(wrapper.findComponent(Row).exists()).toBeTruthy();
            expect(wrapper.findComponent(Checkbox).exists()).toBeFalsy();
        });

        it('hides the submenu if no items are provided', () => {
            wrapper = shallowMount(Row, {
                props: {
                    ...props,
                    tableConfig: {
                        ...props.tableConfig,
                        subMenuItems: []
                    }
                }
            });

            expect(wrapper.findComponent(Row).exists()).toBeTruthy();
            expect(wrapper.findComponent(SubMenu).exists()).toBeFalsy();
        });

        it('hides submenu items if hideOn function is given', () => {
            const subMenuItems = [{
                name: 'delete',
                text: 'Delete'
            }, {
                name: 'manage',
                text: 'Manage access',
                hideOn: () => true
            }];
            wrapper = mount(Row, {
                props: {
                    ...props,
                    tableConfig: {
                        ...props.tableConfig,
                        subMenuItems
                    }
                }
            });

            const menuItems = wrapper.findComponent(MenuItems);
            const listItem = menuItems.findAll('.list-item');
            expect(listItem.length).toBe(subMenuItems.length - 1);
        });

        it('does not hide submenu items if hideOn is not a function', () => {
            const subMenuItems = [{
                name: 'delete',
                text: 'Delete'
            }, {
                name: 'manage',
                text: 'Manage access',
                hideOn: false
            }];
            wrapper = mount(Row, {
                props: {
                    ...props,
                    tableConfig: {
                        ...props.tableConfig,
                        subMenuItems
                    }
                }
            });

            const menuItems = wrapper.findComponent(MenuItems);
            const listItem = menuItems.findAll('.list-item');
            expect(listItem.length).toBe(subMenuItems.length);
        });

        it('selectively generates slots for specific columns', () => {
            let props = getUpdatedProps('hasSlotContent', [
                false, false, true, false, false
            ]);
            wrapper = shallowMount(Row, {
                props,
                slots: {
                    'cellContent-col2': '<iframe> Custom content </iframe>'
                }
            });

            expect(wrapper.findComponent(Row).exists()).toBeTruthy();
            expect(wrapper.findAllComponents(Cell)[2].element.innerHTML).toBe('<iframe> Custom content </iframe>');
        });

        it('provides column data to the slotted column', () => {
            let props = getUpdatedProps('hasSlotContent', [
                false, false, true, false, false
            ]);
            wrapper = mount(Row, {
                props,
                slots: {
                    'cellContent-col2': props => `{cell:${props.cell},row:${props.row}}`
                }
            });

            expect(wrapper.findComponent(Row).exists()).toBeTruthy();
            expect(wrapper.findAllComponents(Cell)[2].text()).toBe('{cell:data3,row:data1,data2,data3,data4,data5}');
        });

        describe('formatters', () => {
            it('uses formatters for rendering', () => {
                let props = getUpdatedProps('formatter', [
                    val => val.toUpperCase(),
                    val => val.val,
                    val => typeof val,
                    val => val || '-',
                    val => val % 33
                ]);
                wrapper = mount(Row, {
                    props: {
                        ...props,
                        row: ['val', { val: 'val' }, [null], false, 100]
                    }
                });
                let cells = wrapper.findAllComponents(Cell);
                expect(cells[0].text()).toBe('VAL');
                expect(cells[1].text()).toBe('val');
                expect(cells[2].text()).toBe('object');
                expect(cells[3].text()).toBe('-');
                expect(cells[4].text()).toBe('1');
            });
    
            it('unpacks and formats values with object representation', () => {
                let props = getUpdatedProps('formatter', [
                    val => val.toUpperCase(),
                    val => val.val,
                    val => typeof val,
                    val => val || '-',
                    val => val % 33
                ]);
                wrapper = mount(Row, {
                    props: {
                        ...props,
                        row: [{ value: 'val' }, { value: { val: 'val' } }, { color: '#123456' }, false, 100]
                    }
                });
                let cells = wrapper.findAllComponents(Cell);
                expect(cells[0].text()).toBe('VAL');
                expect(cells[1].text()).toBe('val');
                expect(cells[2].text()).toBe('undefined');
                expect(cells[3].text()).toBe('-');
                expect(cells[4].text()).toBe('1');
            });
        });

        it('provides color to the cells', () => {
            const propsWithColoredRows = { ...props, row: [{ value: 'Text', color: '#123456' }, ...props.row.slice(1)] };
            const wrapper = mount(Row, { props: propsWithColoredRows });
            const firstCell = wrapper.findComponent(Cell);
            expect(firstCell.text()).toBe('Text');
            expect(firstCell.attributes('style')).toContain('background-color: rgb(18, 52, 86);');
            expect(firstCell.attributes('style')).toContain('color: white;');
        });

        it('conditionally renders expandable row content', async () => {
            wrapper = mount(Row, {
                props: {
                    ...props,
                    tableConfig: {
                        ...props.tableConfig,
                        showCollapser: true
                    }
                }
            });
            expect(wrapper.find('.expandable-content').exists()).toBeFalsy();
            await wrapper.setData({ showContent: true });
            expect(wrapper.find('.expandable-content').exists()).toBeTruthy();
        });

        it('renders the correct title', () => {
            wrapper = mount(Row, {
                props: {
                    ...props,
                    row: ['data1', undefined, { metadata: 'Col2' }, 'data4', null]
                }
            });
            expect(wrapper.findAll('.data-cell').at(0).attributes('title')).toBe('data1');
            expect(wrapper.findAll('.data-cell').at(1).attributes('title')).toBeUndefined();
            expect(wrapper.findAll('.data-cell').at(2).attributes('title')).toBe('Missing Value (Col2)');
            expect(wrapper.findAll('.data-cell').at(3).attributes('title')).toBe('data4');
            expect(wrapper.findAll('.data-cell').at(4).attributes('title')).toBe('Missing Value');
        });
    });

    describe('events', () => {
        it('emits a rowSelect event when the checkbox is clicked', () => {
            wrapper = shallowMount(Row, {
                props
            });

            expect(wrapper.findComponent(Row).emitted().rowSelect).toBeFalsy();
            wrapper.findComponent(Checkbox).vm.$emit('update:model-value', true);
            expect(wrapper.findComponent(Row).emitted().rowSelect).toBeTruthy();
            expect(wrapper.findComponent(Row).emitted().rowSelect[0][0]).toBeTruthy();
        });

        it('emits a rowInput event when a cell is clicked if popover column', () => {
            let props = getUpdatedProps('popoverRenderer', [
                true, false, false, false, false
            ]);
            wrapper = mount(Row, {
                props
            });
            let event = new MouseEvent('click');
            let clickEvent = { event, colInd: 0, data: props.row[0] };
            expect(wrapper.findComponent(Row).emitted().rowInput).toBeFalsy();
            wrapper.findAll('td.data-cell').at(0).trigger('click', clickEvent);
            expect(wrapper.findComponent(Row).emitted().rowInput).toBeTruthy();
            expect(wrapper.findComponent(Row).emitted().rowInput[0][0]).toStrictEqual({
                ...clickEvent,
                event: expect.anything(),
                cell: wrapper.findComponent(Cell).element,
                type: 'click',
                value: null
            });
        });

        it('does not emit a rowInput event when a cell is clicked if not popover column', () => {
            wrapper = mount(Row, {
                props
            });
            let event = new MouseEvent('click');
            let clickEvent = { event, colInd: 1, data: props.row[1] };
            expect(wrapper.findComponent(Row).emitted().rowInput).toBeFalsy();
            wrapper.findAll('td.data-cell').at(1).trigger('click', clickEvent);
            expect(wrapper.findComponent(Row).emitted().rowInput).toBeFalsy();
        });

        it('emits a rowInput event when a there is input in a cell', () => {
            wrapper = mount(Row, {
                props
            });
            expect(wrapper.findComponent(Row).emitted().rowInput).toBeFalsy();
            wrapper.findAll('td.data-cell').at(0).trigger('input', 0);
            expect(wrapper.findComponent(Row).emitted().rowInput).toBeTruthy();
        });

        it('toggles the expandable content when the collapser toggle is clicked and emits rowExpand', async () => {
            wrapper = shallowMount(Row, {
                props: {
                    ...props,
                    tableConfig: {
                        ...props.tableConfig,
                        showCollapser: true
                    }
                }
            });
            expect(wrapper.vm.showContent).toBeFalsy();
            wrapper.findComponent(CollapserToggle).vm.$emit('collapserExpand');
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.showContent).toBe(true);
            expect(wrapper.findComponent(CloseIcon).exists()).toBeTruthy();
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted().rowExpand).toBeTruthy();
            expect(wrapper.emitted().rowExpand[0][0]).toBe(false);
            expect(wrapper.emitted().rowExpand[1][0]).toBe(true);
        });

        it('emits a rowSubMenuClick event when the submenu is clicked', () => {
            wrapper = shallowMount(Row, {
                props
            });
            expect(wrapper.emitted().rowSubMenuClick).toBeFalsy();
            wrapper.findComponent(SubMenu).vm.$emit(
                'item-click',
                new MouseEvent('click'),
                props.tableConfig.subMenuItems[0]
            );
            expect(wrapper.emitted().rowSubMenuClick).toBeTruthy();
            expect(wrapper.emitted().rowSubMenuClick[0][0]).toBe(props.tableConfig.subMenuItems[0]);
        });
    });
});
