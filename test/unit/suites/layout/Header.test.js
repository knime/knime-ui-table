import { shallowMount } from '@vue/test-utils';
import Header from '~/components/layout/Header';
import Checkbox from '~/webapps-common/ui/components/forms/Checkbox';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton';
import ArrowIcon from '~/webapps-common/ui/assets/img/icons/arrow-down.svg?inline';
import FilterIcon from '~/webapps-common/ui/assets/img/icons/filter.svg?inline';

describe('Header.vue', () => {
    let wrapper;

    let propsData = {
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
        columnSizes: [20, 20, 20, 20, 20],
        isSelected: false,
        filtersActive: false
    };

    it('renders default table header', () => {
        wrapper = shallowMount(Header, { propsData });
        expect(wrapper.find(Header).exists()).toBe(true);
        expect(wrapper.find(Checkbox).exists()).toBe(true);
        expect(wrapper.find(FunctionButton).exists()).toBe(true);
        expect(wrapper.find(FilterIcon).exists()).toBe(true);
        expect(wrapper.find(ArrowIcon).exists()).toBe(true);
        expect(wrapper.find('.collapser-cell-spacer').exists()).toBe(false);
        let columns = wrapper.findAll('th.column-header');
        expect(columns.length).toBe(5);
        expect(columns.at(0).text()).toContain(propsData.columnHeaders[0]);
        expect(columns.at(1).text()).toContain(propsData.columnHeaders[1]);
        expect(columns.at(2).text()).toContain(propsData.columnHeaders[2]);
        expect(columns.at(3).text()).toContain(propsData.columnHeaders[3]);
        expect(columns.at(4).text()).toContain(propsData.columnHeaders[4]);
        expect(wrapper.find('.sub-header-text-container').exists()).toBe(false);
    });

    it('renders sub headers', () => {
        propsData.columnSubHeaders = ['SubHeader 1', 'SubHeader 2', 'SubHeader 3', 'SubHeader 4', 'SubHeader 5'];
        wrapper = shallowMount(Header, { propsData });
        let columns = wrapper.findAll('.sub-header-text-container');
        expect(columns.length).toBe(5);
        expect(columns.at(0).text()).toContain(propsData.columnSubHeaders[0]);
        expect(columns.at(1).text()).toContain(propsData.columnSubHeaders[1]);
        expect(columns.at(2).text()).toContain(propsData.columnSubHeaders[2]);
        expect(columns.at(3).text()).toContain(propsData.columnSubHeaders[3]);
        expect(columns.at(4).text()).toContain(propsData.columnSubHeaders[4]);
    });


    it('hides "tr" element if no headers provided', () => {
        wrapper = shallowMount(Header);

        expect(wrapper.find(Header).exists()).toBe(true);
        expect(wrapper.find(Checkbox).exists()).toBe(false);
        expect(wrapper.find(FunctionButton).exists()).toBe(false);
        expect(wrapper.find(ArrowIcon).exists()).toBe(false);
        expect(wrapper.find('.collapser-cell-spacer').exists()).toBe(false);
        expect(wrapper.find('th.column-header').exists()).toBe(false);
    });

    it('hides the checkbox via config', () => {
        wrapper = shallowMount(Header, { propsData: {
            ...propsData,
            tableConfig: {
                ...propsData.tableConfig,
                showSelection: false
            }
        } });

        expect(wrapper.find(Header).exists()).toBe(true);
        expect(wrapper.find(Checkbox).exists()).toBe(false);
    });

    it('hides the column filter toggle via config', () => {
        wrapper = shallowMount(Header, { propsData: {
            ...propsData,
            tableConfig: {
                ...propsData.tableConfig,
                showColumnFilters: false
            }
        } });

        expect(wrapper.find(Header).exists()).toBe(true);
        expect(wrapper.find(FunctionButton).exists()).toBe(false);
    });

    it('adds a collapser control spacer via config', () => {
        wrapper = shallowMount(Header, { propsData: {
            ...propsData,
            tableConfig: {
                ...propsData.tableConfig,
                showCollapser: true
            }
        } });

        expect(wrapper.find(Header).exists()).toBe(true);
        expect(wrapper.find('.collapser-cell-spacer').exists()).toBe(true);
    });

    it('emits a rowSelect event when the header checkbox is selected', () => {
        wrapper = shallowMount(Header, { propsData });

        expect(wrapper.find(Header).emitted().headerSelect).toBeFalsy();
        wrapper.find(Checkbox).vm.$emit('input');
        expect(wrapper.find(Header).emitted().headerSelect).toBeTruthy();
        expect(wrapper.find(Header).emitted().headerSelect[0]).toStrictEqual([true]);
    });

    it('emits a headerSort event when a column is clicked', () => {
        wrapper = shallowMount(Header, { propsData });

        expect(wrapper.find(Header).emitted().columnSort).toBeFalsy();
        wrapper.findAll('th.column-header').at(0).trigger('click', 0);
        expect(wrapper.find(Header).emitted().columnSort).toBeTruthy();
        expect(wrapper.find(Header).emitted().columnSort[0]).toStrictEqual([0, 'Column 1']);
    });

    it('emits a toggleFilter event when the filter toggle is clicked', () => {
        wrapper = shallowMount(Header, { propsData });

        expect(wrapper.find(Header).emitted().toggleFilter).toBeFalsy();
        wrapper.find(FunctionButton).vm.$emit('click');
        expect(wrapper.find(Header).emitted().toggleFilter).toBeTruthy();
    });

    it('disables sorting via config', () => {
        wrapper = shallowMount(Header, { propsData: {
            ...propsData,
            tableConfig: {
                ...propsData.tableConfig,
                sortConfig: null
            }
        } });

        expect(wrapper.find(Header).emitted().columnSort).toBeFalsy();
        wrapper.findAll('th.column-header').wrappers.forEach(thWrapper => {
            expect(thWrapper.classes).not.toContain('sortable');
        });
        wrapper.findAll(ArrowIcon).wrappers.forEach(iconWrapper => {
            expect(iconWrapper.classes).not.toContain('active');
        });
        wrapper.findAll('th.column-header').at(0).trigger('click', 0);
        expect(wrapper.find(Header).emitted().columnSort).toBeFalsy();
    });
});
