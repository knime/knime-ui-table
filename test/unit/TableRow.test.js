import { shallowMount, mount } from '@vue/test-utils';
import TableRow from '~/components/table/TableRow';
import TableCollapserToggle from '~/components/table/ui/TableCollapserToggle';
import SubMenu from '~/webapps-common/ui/components/SubMenu';
import Checkbox from '~/webapps-common/ui/components/forms/Checkbox';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton';
import OptionsIcon from '~/webapps-common/ui/assets/img/icons/menu-options.svg?inline';
import CloseIcon from '~/webapps-common/ui/assets/img/icons/close.svg?inline';

describe('TableRow.vue', () => {
    let wrapper;

    let f = item => item;
    let propsData = {
        row: ['data1', 'data2', 'data3', 'data4', 'data5'],
        formatters: [f, f, f, f, f],
        classGenerators: [[], [], [], [], []],
        editableColumns: [null, null, null, null, null],
        slottedColumns: [],
        popoverColumns: [0],
        columnWidths: [20, 20, 20, 20, 20],
        subMenuItems: [{ id: 'action', text: 'Action' }]
    };

    describe('rendering', () => {
        it('displays empty "tr" element if no data provided', () => {
            wrapper = shallowMount(TableRow);

            expect(wrapper.find(TableRow).exists()).toBe(true);
            expect(wrapper.find(TableCollapserToggle).exists()).toBe(false);
            expect(wrapper.find(SubMenu).exists()).toBe(false);
            expect(wrapper.find(Checkbox).exists()).toBe(false);
            expect(wrapper.find(FunctionButton).exists()).toBe(false);
            expect(wrapper.find(OptionsIcon).exists()).toBe(false);
            expect(wrapper.find(CloseIcon).exists()).toBe(false);
            expect(wrapper.find('td.data-cell').exists()).toBe(false);
            expect(wrapper.find('tr td').text()).toBe('-');
        });

        it('renders default table row', () => {
            wrapper = shallowMount(TableRow, {
                propsData
            });
            expect(wrapper.find(TableRow).exists()).toBe(true);
            expect(wrapper.find(TableCollapserToggle).exists()).toBe(false);
            expect(wrapper.find(SubMenu).exists()).toBe(true);
            expect(wrapper.find(Checkbox).exists()).toBe(true);
            expect(wrapper.find(FunctionButton).exists()).toBe(false);
            expect(wrapper.find(OptionsIcon).exists()).toBe(true);
            expect(wrapper.find(CloseIcon).exists()).toBe(false);
            expect(wrapper.find('td.data-cell').exists()).toBe(true);
        });

        it('shows the collapser toggle via prop', () => {
            wrapper = shallowMount(TableRow, {
                propsData: {
                    ...propsData,
                    showCollapser: true
                }
            });

            expect(wrapper.find(TableRow).exists()).toBe(true);
            expect(wrapper.find(TableCollapserToggle).exists()).toBe(true);
        });

        it('hides the checkbox via prop', () => {
            wrapper = shallowMount(TableRow, {
                propsData: {
                    ...propsData,
                    showSelection: false
                }
            });

            expect(wrapper.find(TableRow).exists()).toBe(true);
            expect(wrapper.find(Checkbox).exists()).toBe(false);
        });

        it('hides the submenu if no items are provided', () => {
            wrapper = shallowMount(TableRow, {
                propsData: {
                    ...propsData,
                    subMenuItems: []
                }
            });

            expect(wrapper.find(TableRow).exists()).toBe(true);
            expect(wrapper.find(SubMenu).exists()).toBe(false);
        });

        it('selectively generates slots for specific columns', () => {
            wrapper = shallowMount(TableRow, {
                propsData: {
                    ...propsData,
                    slottedColumns: [2]
                },
                slots: {
                    cellContent2: '<iframe> Custom content </iframe>'
                }
            });

            expect(wrapper.find(TableRow).exists()).toBe(true);
            expect(wrapper.vm.$refs.dataCell[2].innerHTML).toBe('<iframe> Custom content </iframe>');
        });

        it('provides column data to the slotted column', () => {
            wrapper = mount(TableRow, {
                propsData: {
                    ...propsData,
                    slottedColumns: [2]
                },
                scopedSlots: {
                    cellContent2: props => `<div>${props.row}</div>`
                }
            });

            expect(wrapper.find(TableRow).exists()).toBe(true);
            expect(wrapper.vm.$refs.dataCell[2].innerHTML).toContain('data3');
        });

        it('provides column data to dynamic, slotted cell components', () => {
            let MagicComponent = {
                props: ['magicLevel'],
                template: '<div>Magic Level {{ magicLevel }} <slot/></div>'
            };
            let localRow = [...propsData.row];
            localRow[2] = { magicLevel: 100 };
            wrapper = mount(TableRow, {
                propsData: {
                    ...propsData,
                    row: localRow,
                    editableColumns: [null, null, MagicComponent]
                },
                slots: {
                    componentSlot: `(Awesome)`
                }
            });

            expect(wrapper.find(TableRow).exists()).toBe(true);
            expect(wrapper.vm.$refs.dataCell[2].innerHTML).toContain('<div>Magic Level 100 (Awesome)</div>');
        });

        it('uses formatters for default rendering', () => {
            wrapper = mount(TableRow, {
                propsData: {
                    ...propsData,
                    row: ['val', { value: 'val' }, [null], false, 100],
                    formatters: [
                        val => val.toUpperCase(),
                        val => val.value,
                        val => typeof val,
                        val => val || '-',
                        val => val % 33
                    ]
                }
            });
            let cells = wrapper.vm.$refs.dataCell;
            expect(cells[0].innerHTML).toContain('VAL');
            expect(cells[1].innerHTML).toContain('val');
            expect(cells[2].innerHTML).toContain('object');
            expect(cells[3].innerHTML).toContain('-');
            expect(cells[4].innerHTML).toContain('1');
        });

        it('conditionally renders expandable row content', () => {
            wrapper = mount(TableRow, {
                propsData: {
                    ...propsData,
                    showCollapser: true
                }
            });
            expect(wrapper.find('.expandable-content').exists()).toBe(false);
            wrapper.setData({ showContent: true });
            expect(wrapper.find('.expandable-content').exists()).toBe(true);
        });
    });

    describe('events', () => {
        it('emits a rowSelect event when the checkbox is clicked', () => {
            wrapper = shallowMount(TableRow, {
                propsData
            });

            expect(wrapper.find(TableRow).emitted().rowSelect).toBeFalsy();
            wrapper.find(Checkbox).vm.$emit('input', true);
            expect(wrapper.find(TableRow).emitted().rowSelect).toBeTruthy();
            expect(wrapper.find(TableRow).emitted().rowSelect[0]).toStrictEqual([true, false]);
        });

        it('emits a rowInput event when a cell is clicked if popover column', () => {
            wrapper = shallowMount(TableRow, {
                propsData
            });
            let event = new MouseEvent('click');
            let clickEvent = { event, colInd: 0, data: propsData.row[0] };
            expect(wrapper.find(TableRow).emitted().rowInput).toBeFalsy();
            wrapper.findAll('td.data-cell').at(0).trigger('click', clickEvent);
            expect(wrapper.find(TableRow).emitted().rowInput).toBeTruthy();
            expect(wrapper.find(TableRow).emitted().rowInput[0][0]).toStrictEqual({
                ...clickEvent,
                clickable: true,
                event: expect.anything(),
                cell: wrapper.vm.$refs.dataCell[0],
                type: 'click',
                value: null
            });
        });

        it('does not emit a rowInput event when a cell is clicked if not popover column', () => {
            wrapper = shallowMount(TableRow, {
                propsData
            });
            let event = new MouseEvent('click');
            let clickEvent = { event, colInd: 1, data: propsData.row[1] };
            expect(wrapper.find(TableRow).emitted().rowInput).toBeFalsy();
            wrapper.findAll('td.data-cell').at(1).trigger('click', clickEvent);
            expect(wrapper.find(TableRow).emitted().rowInput).toBeFalsy();
        });

        it('emits a rowInput event when a there is input in a cell', () => {
            wrapper = shallowMount(TableRow, {
                propsData
            });
            expect(wrapper.find(TableRow).emitted().rowInput).toBeFalsy();
            wrapper.findAll('td.data-cell').at(0).trigger('input', 0);
            expect(wrapper.find(TableRow).emitted().rowInput).toBeTruthy();
        });

        it('toggles the expandable content when the collapser toggle is clicked', () => {
            wrapper = shallowMount(TableRow, {
                propsData: {
                    ...propsData,
                    showCollapser: true
                }
            });
            expect(wrapper.vm.showContent).toBe(false);
            wrapper.find(TableCollapserToggle).vm.$emit('collapserExpand');
            expect(wrapper.vm.showContent).toBe(true);
            expect(wrapper.find(CloseIcon).exists()).toBe(true);
        });

        it('emits a rowSubMenuClick event when the submenu is clicked', () => {
            wrapper = shallowMount(TableRow, {
                propsData
            });
            expect(wrapper.emitted().rowSubMenuClick).toBeFalsy();
            wrapper.find(SubMenu).vm.$emit(
                'item-click',
                new MouseEvent('click'),
                propsData.subMenuItems[0]
            );
            expect(wrapper.emitted().rowSubMenuClick).toBeTruthy();
            expect(wrapper.emitted().rowSubMenuClick[0][0]).toBe(propsData.subMenuItems[0]);
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
            wrapper = shallowMount(TableRow, {
                propsData: {
                    ...propsData,
                    classGenerators: [
                        [classMap],
                        [classMap],
                        [classMap],
                        [classMap],
                        [classMap]
                    ]
                }
            });

            expect(wrapper.vm.classes).toStrictEqual([
                ['width-1'], ['width-2'], ['width-3'], ['width-4'], ['width-5']
            ]);
            let cells = wrapper.vm.$refs.dataCell;
            expect(cells[0].classList).toContain('width-1');
            expect(cells[1].classList).toContain('width-2');
            expect(cells[2].classList).toContain('width-3');
            expect(cells[3].classList).toContain('width-4');
            expect(cells[4].classList).toContain('width-5');
        });

        it('applies function class generators to the data', () => {
            let classFunction = data => `width-${data.slice(-1)}`;
            wrapper = shallowMount(TableRow, {
                propsData: {
                    ...propsData,
                    classGenerators: [
                        [classFunction],
                        [classFunction],
                        [classFunction],
                        [classFunction],
                        [classFunction]
                    ]
                }
            });

            expect(wrapper.vm.classes).toStrictEqual([
                ['width-1'], ['width-2'], ['width-3'], ['width-4'], ['width-5']
            ]);
            let cells = wrapper.vm.$refs.dataCell;
            expect(cells[0].classList).toContain('width-1');
            expect(cells[1].classList).toContain('width-2');
            expect(cells[2].classList).toContain('width-3');
            expect(cells[3].classList).toContain('width-4');
            expect(cells[4].classList).toContain('width-5');
        });

        it('uses custom classes', () => {
            wrapper = shallowMount(TableRow, {
                propsData: {
                    ...propsData,
                    classGenerators: [['width-1'], ['width-2'], ['width-3'], ['width-4'], ['width-5']]
                }
            });

            expect(wrapper.vm.classes).toStrictEqual([
                ['width-1'], ['width-2'], ['width-3'], ['width-4'], ['width-5']
            ]);
            let cells = wrapper.vm.$refs.dataCell;
            expect(cells[0].classList).toContain('width-1');
            expect(cells[1].classList).toContain('width-2');
            expect(cells[2].classList).toContain('width-3');
            expect(cells[3].classList).toContain('width-4');
            expect(cells[4].classList).toContain('width-5');
        });
    });
});
