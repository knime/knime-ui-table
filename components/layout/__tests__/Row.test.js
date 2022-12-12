import { describe, it, expect } from 'vitest';
import { shallowMount, mount } from '@vue/test-utils';

import Row from '../Row.vue';
import CollapserToggle from '@/components/ui/CollapserToggle.vue';
import SubMenu from 'webapps-common/ui/components/SubMenu.vue';
import Checkbox from 'webapps-common/ui/components/forms/Checkbox.vue';
import FunctionButton from 'webapps-common/ui/components/FunctionButton.vue';
import OptionsIcon from 'webapps-common/ui/assets/img/icons/menu-options.svg';
import CloseIcon from 'webapps-common/ui/assets/img/icons/close.svg';

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
        key: i.toString(),
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

            expect(wrapper.findComponent(Row).exists()).toBe(true);
            expect(wrapper.findComponent(CollapserToggle).exists()).toBe(false);
            expect(wrapper.findComponent(SubMenu).exists()).toBe(false);
            expect(wrapper.findComponent(Checkbox).exists()).toBe(false);
            expect(wrapper.findComponent(FunctionButton).exists()).toBe(false);
            expect(wrapper.findComponent(OptionsIcon).exists()).toBe(false);
            expect(wrapper.findComponent(CloseIcon).exists()).toBe(false);
            expect(wrapper.find('td.data-cell').exists()).toBe(false);
            expect(wrapper.find('tr td').text()).toBe('-');
        });

        it('renders default table row', () => {
            wrapper = shallowMount(Row, {
                props
            });
            expect(wrapper.findComponent(Row).exists()).toBe(true);
            expect(wrapper.findComponent(CollapserToggle).exists()).toBe(false);
            expect(wrapper.findComponent(SubMenu).exists()).toBe(true);
            expect(wrapper.findComponent(Checkbox).exists()).toBe(true);
            expect(wrapper.findComponent(FunctionButton).exists()).toBe(false);
            expect(wrapper.findComponent(OptionsIcon).exists()).toBe(true);
            expect(wrapper.findComponent(CloseIcon).exists()).toBe(false);
            expect(wrapper.find('td.data-cell').exists()).toBe(true);
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

            expect(wrapper.findComponent(Row).exists()).toBe(true);
            expect(wrapper.findComponent(CollapserToggle).exists()).toBe(true);
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

            expect(wrapper.findComponent(Row).exists()).toBe(true);
            expect(wrapper.findComponent(Checkbox).exists()).toBe(false);
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

            expect(wrapper.findComponent(Row).exists()).toBe(true);
            expect(wrapper.findComponent(SubMenu).exists()).toBe(false);
        });

        it('selectively generates slots for specific columns', () => {
            let props = getUpdatedProps('hasSlotContent', [
                false, false, true, false, false
            ]);
            wrapper = shallowMount(Row, {
                props,
                slots: {
                    'cellContent-2': '<iframe> Custom content </iframe>'
                }
            });

            expect(wrapper.findComponent(Row).exists()).toBe(true);
            expect(wrapper.vm.$refs.dataCell[2].innerHTML).toBe('<iframe> Custom content </iframe>');
        });

        it('provides column data to the slotted column', () => {
            let props = getUpdatedProps('hasSlotContent', [
                false, false, true, false, false
            ]);
            wrapper = mount(Row, {
                props,
                slots: {
                    'cellContent-2': props => `<div>${props.row}</div>`
                }
            });

            expect(wrapper.findComponent(Row).exists()).toBe(true);
            expect(wrapper.vm.$refs.dataCell[2].innerHTML).toContain('data3');
        });

        it('uses formatters for rendering', () => {
            let props = getUpdatedProps('formatter', [
                val => val.toUpperCase(),
                val => val.value,
                val => typeof val,
                val => val || '-',
                val => val % 33
            ]);
            wrapper = mount(Row, {
                props: {
                    ...props,
                    row: ['val', { value: 'val' }, [null], false, 100]
                }
            });
            let cells = wrapper.vm.$refs.dataCell;
            expect(cells[0].innerHTML).toContain('VAL');
            expect(cells[1].innerHTML).toContain('val');
            expect(cells[2].innerHTML).toContain('object');
            expect(cells[3].innerHTML).toContain('-');
            expect(cells[4].innerHTML).toContain('1');
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
            expect(wrapper.find('.expandable-content').exists()).toBe(false);
            await wrapper.setData({ showContent: true });
            expect(wrapper.find('.expandable-content').exists()).toBe(true);
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
            expect(wrapper.findComponent(Row).emitted().rowSelect[0][0]).toBe(true);
        });

        it('emits a rowInput event when a cell is clicked if popover column', () => {
            let props = getUpdatedProps('popoverRenderer', [
                true, false, false, false, false
            ]);
            wrapper = shallowMount(Row, {
                props
            });
            let event = new MouseEvent('click');
            let clickEvent = { event, colInd: 0, data: props.row[0] };
            expect(wrapper.findComponent(Row).emitted().rowInput).toBeFalsy();
            wrapper.findAll('td.data-cell').at(0).trigger('click', clickEvent);
            expect(wrapper.findComponent(Row).emitted().rowInput).toBeTruthy();
            expect(wrapper.findComponent(Row).emitted().rowInput[0][0]).toStrictEqual({
                ...clickEvent,
                clickable: true,
                event: expect.anything(),
                cell: wrapper.vm.$refs.dataCell[0],
                type: 'click',
                value: null
            });
        });

        it('does not emit a rowInput event when a cell is clicked if not popover column', () => {
            wrapper = shallowMount(Row, {
                props
            });
            let event = new MouseEvent('click');
            let clickEvent = { event, colInd: 1, data: props.row[1] };
            expect(wrapper.findComponent(Row).emitted().rowInput).toBeFalsy();
            wrapper.findAll('td.data-cell').at(1).trigger('click', clickEvent);
            expect(wrapper.findComponent(Row).emitted().rowInput).toBeFalsy();
        });

        it('emits a rowInput event when a there is input in a cell', () => {
            wrapper = shallowMount(Row, {
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
            expect(wrapper.vm.showContent).toBe(false);
            wrapper.findComponent(CollapserToggle).vm.$emit('collapserExpand');
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.showContent).toBe(true);
            expect(wrapper.findComponent(CloseIcon).exists()).toBe(true);
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

    describe('classes and styles', () => {
        it('applies object map class generators to the data', () => {
            let classMap = {
                data1: 'width-1',
                data2: 'width-2',
                data3: 'width-3',
                data4: 'width-4',
                data5: 'width-5'
            };
            let props = getUpdatedProps('classGenerator', [
                [classMap],
                [classMap],
                [classMap],
                [classMap],
                [classMap]
            ]);
            wrapper = shallowMount(Row, { props });

            expect(wrapper.vm.classes).toStrictEqual([
                ['width-1'], ['width-2'], ['width-3'], ['width-4'], ['width-5']
            ]);
            let cells = wrapper.vm.$refs.dataCell;
            expect(cells[0].classList.contains('width-1')).toBeTruthy();
            expect(cells[1].classList.contains('width-2')).toBeTruthy();
            expect(cells[2].classList.contains('width-3')).toBeTruthy();
            expect(cells[3].classList.contains('width-4')).toBeTruthy();
            expect(cells[4].classList.contains('width-5')).toBeTruthy();
        });

        it('applies function class generators to the data', () => {
            let classFunction = data => `width-${data.slice(-1)}`;
            let props = getUpdatedProps('classGenerator', [
                [classFunction],
                [classFunction],
                [classFunction],
                [classFunction],
                [classFunction]
            ]);
            wrapper = shallowMount(Row, { props });

            expect(wrapper.vm.classes).toStrictEqual([
                ['width-1'], ['width-2'], ['width-3'], ['width-4'], ['width-5']
            ]);
            let cells = wrapper.vm.$refs.dataCell;
            expect(cells[0].classList.contains('width-1')).toBeTruthy();
            expect(cells[1].classList.contains('width-2')).toBeTruthy();
            expect(cells[2].classList.contains('width-3')).toBeTruthy();
            expect(cells[3].classList.contains('width-4')).toBeTruthy();
            expect(cells[4].classList.contains('width-5')).toBeTruthy();
        });

        it('uses custom classes', () => {
            let props = getUpdatedProps('classGenerator', [
                ['width-1'], ['width-2'], ['width-3'], ['width-4'], ['width-5']
            ]);
            wrapper = shallowMount(Row, { props });

            expect(wrapper.vm.classes).toStrictEqual([
                ['width-1'], ['width-2'], ['width-3'], ['width-4'], ['width-5']
            ]);
            let cells = wrapper.vm.$refs.dataCell;
            expect(cells[0].classList.contains('width-1')).toBeTruthy();
            expect(cells[1].classList.contains('width-2')).toBeTruthy();
            expect(cells[2].classList.contains('width-3')).toBeTruthy();
            expect(cells[3].classList.contains('width-4')).toBeTruthy();
            expect(cells[4].classList.contains('width-5')).toBeTruthy();
        });
    });
});
