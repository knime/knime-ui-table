import { shallowMount } from '@vue/test-utils';
import TableHeader from '~/components/table/TableHeader';
import Checkbox from '~/webapps-common/ui/components/forms/Checkbox';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton';
import ArrowIcon from '~/webapps-common/ui/assets/img/icons/arrow-down.svg?inline';
import FilterIcon from '~/webapps-common/ui/assets/img/icons/filter.svg?inline';

describe('TableHeader.vue', () => {
    let wrapper;

    let row = ['Column 1', 'Column 2', 'Column 3', 'Column 4', 'Column 5'];
    let columnWidths = [20, 20, 20, 20, 20];

    it('renders default table header', () => {
        wrapper = shallowMount(TableHeader, {
            propsData: {
                row,
                columnWidths
            }
        });

        expect(wrapper.find(TableHeader).exists()).toBe(true);
        expect(wrapper.find(Checkbox).exists()).toBe(true);
        expect(wrapper.find(FunctionButton).exists()).toBe(true);
        expect(wrapper.find(FilterIcon).exists()).toBe(true);
        expect(wrapper.find(ArrowIcon).exists()).toBe(true);
        expect(wrapper.find('.collapser-cell-spacer').exists()).toBe(false);
        let columns = wrapper.findAll('th.column-header');
        expect(columns.length).toBe(5);
        expect(columns.at(0).text()).toContain(row[0]);
        expect(columns.at(1).text()).toContain(row[1]);
        expect(columns.at(2).text()).toContain(row[2]);
        expect(columns.at(3).text()).toContain(row[3]);
        expect(columns.at(4).text()).toContain(row[4]);
    });

    it('hides "tr" element if no data provided', () => {
        wrapper = shallowMount(TableHeader);

        expect(wrapper.find(TableHeader).exists()).toBe(true);
        expect(wrapper.find(Checkbox).exists()).toBe(false);
        expect(wrapper.find(FunctionButton).exists()).toBe(false);
        expect(wrapper.find(ArrowIcon).exists()).toBe(false);
        expect(wrapper.find('.collapser-cell-spacer').exists()).toBe(false);
        expect(wrapper.find('th.column-header').exists()).toBe(false);
    });

    it('hides the checkbox via prop', () => {
        wrapper = shallowMount(TableHeader, {
            propsData: {
                row,
                columnSort: 0,
                showSelection: false,
                columnWidths
            }
        });

        expect(wrapper.find(TableHeader).exists()).toBe(true);
        expect(wrapper.find(Checkbox).exists()).toBe(false);
    });

    it('hides the column filter toggle via prop', () => {
        wrapper = shallowMount(TableHeader, {
            propsData: {
                row,
                columnSort: 0,
                showColumnFilters: false,
                columnWidths
            }
        });

        expect(wrapper.find(TableHeader).exists()).toBe(true);
        expect(wrapper.find(FunctionButton).exists()).toBe(false);
    });

    it('adds a collapser control spacer via prop', () => {
        wrapper = shallowMount(TableHeader, {
            propsData: {
                row,
                columnSort: 0,
                showCollapser: true,
                columnWidths
            }
        });

        expect(wrapper.find(TableHeader).exists()).toBe(true);
        expect(wrapper.find('.collapser-cell-spacer').exists()).toBe(true);
    });

    it('emits a rowSelect event when the global checkbox is clicked', () => {
        wrapper = shallowMount(TableHeader, {
            propsData: {
                row,
                columnSort: 0,
                showCollapser: true,
                columnWidths
            }
        });

        expect(wrapper.find(TableHeader).emitted().rowSelect).toBeFalsy();
        wrapper.find(Checkbox).vm.$emit('input');
        expect(wrapper.find(TableHeader).emitted().rowSelect).toBeTruthy();
        expect(wrapper.find(TableHeader).emitted().rowSelect[0]).toStrictEqual([true, true]);
    });

    it('emits a headerSort event when a column is clicked', () => {
        wrapper = shallowMount(TableHeader, {
            propsData: {
                row,
                columnSort: 0,
                showCollapser: true,
                columnWidths
            }
        });

        expect(wrapper.find(TableHeader).emitted().headerSort).toBeFalsy();
        wrapper.findAll('th.column-header').at(0).trigger('click', 0);
        expect(wrapper.find(TableHeader).emitted().headerSort).toBeTruthy();
        expect(wrapper.find(TableHeader).emitted().headerSort[0][0]).toStrictEqual({
            ind: 0,
            type: 'sort',
            value: 'Column 1'
        });
    });

    it('emits a toggleFilter event when the filter toggle is clicked', () => {
        wrapper = shallowMount(TableHeader, {
            propsData: {
                row,
                columnSort: 0,
                showCollapser: true,
                columnWidths
            }
        });

        expect(wrapper.find(TableHeader).emitted().toggleFilter).toBeFalsy();
        wrapper.find(FunctionButton).vm.$emit('click');
        expect(wrapper.find(TableHeader).emitted().toggleFilter).toBeTruthy();
    });
});
