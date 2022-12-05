import { describe, it, expect, vi } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';
import Header from '@/components/layout/Header.vue';
import Checkbox from 'webapps-common/ui/components/forms/Checkbox.vue';
import SubMenu from 'webapps-common/ui/components/SubMenu.vue';
import FunctionButton from 'webapps-common/ui/components/FunctionButton.vue';
import ArrowIcon from 'webapps-common/ui/assets/img/icons/arrow-down.svg';
import FilterIcon from 'webapps-common/ui/assets/img/icons/filter.svg';

vi.mock('raf-throttle', () => ({
    default(func) {
        return function (...args) {
            // eslint-disable-next-line no-invalid-this
            return func.apply(this, args);
        };
    }
}));

const columnSubMenuItems = [
    { text: 'Data renderer', separator: true, sectionHeadline: true },
    { text: 'renderer1', id: 'rend1', section: 'dataRendering', selected: false, showTooltip: true },
    { text: 'renderer2', id: 'rend2', section: 'dataRendering', selected: true, showTooltip: true }
];

describe('Header.vue', () => {
    let wrapper;

    let props = {
        tableConfig: {
            sortConfig: {
                sortColumn: '',
                sortDirection: ''
            },
            showCollapser: false,
            showSelection: true,
            showColumnFilters: true
        },
        columnHeaders: ['Column 1', 'Column 2', 'Column 3', 'Column 4', 'Column 5'],
        columnSubHeaders: [],
        columnSizes: [75, 75, 75, 75, 75],
        columnSubMenuItems: [],
        columnSortConfigs: [true, true, true, true, true],
        isSelected: false,
        filtersActive: false
    };

    it('renders default table header', () => {
        wrapper = shallowMount(Header, { props });
        expect(wrapper.findComponent(Header).exists()).toBe(true);
        expect(wrapper.findComponent(Checkbox).exists()).toBe(true);
        expect(wrapper.findComponent(FunctionButton).exists()).toBe(true);
        expect(wrapper.findComponent(FilterIcon).exists()).toBe(true);
        expect(wrapper.findComponent(ArrowIcon).exists()).toBe(true);
        expect(wrapper.find('.collapser-cell-spacer').exists()).toBe(false);
        let columns = wrapper.findAll('th.column-header');
        expect(columns.length).toBe(5);
        expect(columns.at(0).text()).toContain(props.columnHeaders[0]);
        expect(columns.at(1).text()).toContain(props.columnHeaders[1]);
        expect(columns.at(2).text()).toContain(props.columnHeaders[2]);
        expect(columns.at(3).text()).toContain(props.columnHeaders[3]);
        expect(columns.at(4).text()).toContain(props.columnHeaders[4]);
        expect(wrapper.find('.sub-header-text-container').exists()).toBe(false);
    });

    it('renders sub headers', () => {
        props.columnSubHeaders = ['SubHeader 1', 'SubHeader 2', 'SubHeader 3', 'SubHeader 4', 'SubHeader 5'];
        wrapper = shallowMount(Header, { props });
        let columns = wrapper.findAll('.sub-header-text-container');
        expect(columns.length).toBe(5);
        expect(columns.at(0).text()).toContain(props.columnSubHeaders[0]);
        expect(columns.at(1).text()).toContain(props.columnSubHeaders[1]);
        expect(columns.at(2).text()).toContain(props.columnSubHeaders[2]);
        expect(columns.at(3).text()).toContain(props.columnSubHeaders[3]);
        expect(columns.at(4).text()).toContain(props.columnSubHeaders[4]);
    });

    it('renders drag handles', () => {
        wrapper = shallowMount(Header, { props });
        let handles = wrapper.findAll('.drag-handle');
        expect(handles.length).toBe(5);
    });

    it('hides "tr" element if no headers provided', () => {
        wrapper = shallowMount(Header);

        expect(wrapper.findComponent(Header).exists()).toBe(true);
        expect(wrapper.findComponent(Checkbox).exists()).toBe(false);
        expect(wrapper.findComponent(FunctionButton).exists()).toBe(false);
        expect(wrapper.findComponent(ArrowIcon).exists()).toBe(false);
        expect(wrapper.find('.collapser-cell-spacer').exists()).toBe(false);
        expect(wrapper.find('th.column-header').exists()).toBe(false);
    });

    it('hides the checkbox via config', () => {
        wrapper = shallowMount(Header, { props: {
            ...props,
            tableConfig: {
                ...props.tableConfig,
                showSelection: false
            }
        } });

        expect(wrapper.findComponent(Header).exists()).toBe(true);
        expect(wrapper.findComponent(Checkbox).exists()).toBe(false);
    });

    it('hides the column filter toggle via config', () => {
        wrapper = shallowMount(Header, { props: {
            ...props,
            tableConfig: {
                ...props.tableConfig,
                showColumnFilters: false
            }
        } });

        expect(wrapper.findComponent(Header).exists()).toBe(true);
        expect(wrapper.findComponent(FunctionButton).exists()).toBe(false);
    });

    it('adds a collapser control spacer via config', () => {
        wrapper = shallowMount(Header, { props: {
            ...props,
            tableConfig: {
                ...props.tableConfig,
                showCollapser: true
            }
        } });

        expect(wrapper.findComponent(Header).exists()).toBe(true);
        expect(wrapper.find('.collapser-cell-spacer').exists()).toBe(true);
    });

    it('emits a rowSelect event when the header checkbox is selected', () => {
        wrapper = shallowMount(Header, { props });

        expect(wrapper.findComponent(Header).emitted().headerSelect).toBeFalsy();
        wrapper.findComponent(Checkbox).vm.$emit('update:modelValue');
        expect(wrapper.findComponent(Header).emitted().headerSelect).toBeTruthy();
        expect(wrapper.findComponent(Header).emitted().headerSelect[0]).toStrictEqual([true]);
    });

    it('emits a headerSort event when a column is clicked', () => {
        wrapper = shallowMount(Header, { props });

        expect(wrapper.findComponent(Header).emitted().columnSort).toBeFalsy();
        wrapper.findAll('th.column-header .column-header-content').at(0).trigger('click', 0);
        expect(wrapper.findComponent(Header).emitted().columnSort).toBeTruthy();
        expect(wrapper.findComponent(Header).emitted().columnSort[0]).toStrictEqual([0, 'Column 1']);
    });

    it('emits a toggleFilter event when the filter toggle is clicked', () => {
        wrapper = shallowMount(Header, { props });

        expect(wrapper.findComponent(Header).emitted().toggleFilter).toBeFalsy();
        wrapper.findComponent(FunctionButton).vm.$emit('click');
        expect(wrapper.findComponent(Header).emitted().toggleFilter).toBeTruthy();
    });

    it('sets dragIndex on drag handle pointerdown', () => {
        wrapper = shallowMount(Header, { props });
        const dragHandle = wrapper.findAll('.drag-handle').at(0);
        dragHandle.element.setPointerCapture = (pointerId) => null;

        expect(wrapper.vm.dragIndex).toBe(null);
        dragHandle.trigger('pointerdown', 0);
        expect(wrapper.vm.dragIndex).toBe(0);
    });

    it('emits a columnResize event on pointermove during drag', () => {
        wrapper = shallowMount(Header, { props });
        const header = wrapper.findComponent(Header);
        const dragHandle = wrapper.findAll('.drag-handle').at(0);
        dragHandle.element.setPointerCapture = (pointerId) => null;

        dragHandle.trigger('pointermove');
        expect(header.emitted().columnResize).toBeFalsy();
        dragHandle.trigger('pointerdown', 0);
        dragHandle.trigger('pointermove');
        expect(header.emitted().columnResize).toBeTruthy();
    });

    it('unsets dragIndex on drag handle lostpointercapture', () => {
        wrapper = shallowMount(Header, { props });
        const dragHandle = wrapper.findAll('.drag-handle').at(0);
        dragHandle.element.setPointerCapture = (pointerId) => null;

        dragHandle.trigger('pointerdown', 0);
        dragHandle.trigger('lostpointercapture');
        expect(wrapper.vm.dragIndex).toBe(null);
    });

    it('emits a subMenuItemSelection event when another subMenuItem is selected', () => {
        const subMenuClickedItem = { text: 'renderer1', id: 'rend1', section: 'dataRendering' };
        wrapper = mount(Header, { props: { ...props,
            columnSubMenuItems: new Array(5).fill(columnSubMenuItems) } });
        wrapper.findAllComponents(SubMenu).at(1).vm.$emit('item-click', {}, subMenuClickedItem);
        expect(wrapper.findComponent(Header).emitted().subMenuItemSelection).toBeTruthy();
        expect(wrapper.findComponent(Header).emitted().subMenuItemSelection).toStrictEqual([[subMenuClickedItem, 1]]);
    });

    it('sets hover index on drag handle pointerover', () => {
        wrapper = shallowMount(Header, { props });

        expect(wrapper.vm.hoverIndex).toBe(null);
        wrapper.findAll('.drag-handle')[0].trigger('pointerover', 0);
        expect(wrapper.vm.hoverIndex).toBe(0);
    });

    it('does not set hover index on drag handle pointerover during drag', () => {
        wrapper = shallowMount(Header, { props });
        const dragHandle = wrapper.findAll('.drag-handle')[0];
        dragHandle.element.setPointerCapture = (pointerId) => null;

        dragHandle.trigger('pointerdown', 1);
        dragHandle.trigger('pointerover', 0);
        expect(wrapper.vm.hoverIndex).toBe(null);
    });

    it('unsets hover index on on drag handle pointerleave after pointerover', () => {
        wrapper = shallowMount(Header, { props });
        const dragHandle = wrapper.findAll('.drag-handle')[0];

        dragHandle.trigger('pointerover', 0);
        dragHandle.trigger('pointerleave');
        expect(wrapper.vm.hoverIndex).toBe(null);
    });

    it('does not unset hover index on drag handle pointerleave after pointerover during drag', () => {
        wrapper = shallowMount(Header, { props });
        const dragHandle = wrapper.findAll('.drag-handle')[0];
        dragHandle.element.setPointerCapture = (pointerId) => null;

        dragHandle.trigger('pointerover', 0);
        dragHandle.trigger('pointerdown', 0);
        dragHandle.trigger('pointerleave');
        expect(wrapper.vm.hoverIndex).toBe(0);
    });

    it('disables sorting via config', () => {
        wrapper = shallowMount(Header, { props: {
            ...props,
            tableConfig: {
                ...props.tableConfig,
                sortConfig: null
            }
        } });

        expect(wrapper.findComponent(Header).emitted().columnSort).toBeFalsy();
        wrapper.findAll('th > .column-header-content').forEach(thWrapper => {
            expect(thWrapper.classes()).not.toContain('sortable');
        });
        wrapper.findAllComponents(ArrowIcon).forEach(iconWrapper => {
            expect(iconWrapper.classes()).not.toContain('active');
        });
        wrapper.findAll('th > .column-header-content')[0].trigger('click', 0);
        expect(wrapper.findComponent(Header).emitted().columnSort).toBeFalsy();
    });

    it('disables sorting for specific columns via the columnSortConfig', () => {
        wrapper = shallowMount(Header, { props: {
            ...props,
            columnSortConfigs: [true, true, false, false, true]
        } });

        const wrappers = wrapper.findAll('th > .column-header-content');
        expect(wrappers[2].classes()).not.toContain('sortable');
        expect(wrappers[3].classes()).not.toContain('sortable');

        wrapper.findAll('th > .column-header-content')[2].trigger('click', 2);
        expect(wrapper.findComponent(Header).emitted().columnSort).toBeFalsy();
    });

    it('enables sorting for specific columns via the columnSortConfig', () => {
        wrapper = shallowMount(Header, { props: {
            ...props,
            columnSortConfigs: [true, true, false, false, true]
        } });

        const wrappers = wrapper.findAll('th > .column-header-content');
        expect(wrappers[0].classes()).toContain('sortable');
        expect(wrappers[1].classes()).toContain('sortable');
        expect(wrappers[4].classes()).toContain('sortable');

        wrapper.findAll('th > .column-header-content')[0].trigger('click', 0);
        expect(wrapper.findComponent(Header).emitted().columnSort).toBeTruthy();
    });

    it('general sortConfig overrides columns specific columnSortConfig', () => {
        wrapper = shallowMount(Header, { props: {
            ...props,
            tableConfig: {
                ...props.tableConfig,
                sortConfig: null
            },
            columnSortConfigs: [true, true, false, false, true]
        } });

        wrapper.findAll('th > .column-header-content').forEach(thWrapper => {
            expect(thWrapper.classes()).not.toContain('sortable');
        });
        wrapper.findAll('th > .column-header-content')[0].trigger('click', 0);
        expect(wrapper.findComponent(Header).emitted().columnSort).toBeFalsy();
    });
});
