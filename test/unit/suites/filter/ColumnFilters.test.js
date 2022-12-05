import { shallowMount } from '@vue/test-utils';
import ColumnFilters from '~/components/filter/ColumnFilters.vue';
import FilterMultiselect from '~/components/filter/FilterMultiselect.vue';
import FilterInputField from '~/components/filter/FilterInputField.vue';
import FilterDropdown from '~/components/filter/FilterDropdown.vue';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton.vue';
import TrashIcon from '~/webapps-common/ui/assets/img/icons/trash.svg?inline';

describe('ColumnFilters.vue', () => {
    let propsData = {
        columnHeaders: ['User', 'Count', 'Enabled'],
        columnSizes: [33, 33, 33],
        filterConfigs: [
            {
                is: 'FilterMultiselect',
                value: [],
                possibleValues: [
                    { id: 'Root', text: 'Root' },
                    { id: 'Alice', text: 'Alice' },
                    { id: 'Bob', text: 'Bob' }
                ],
                placeholder: 'Column1'
            },
            { is: 'FilterInputField', value: '', placeholder: 'Column2' },
            {
                is: 'FilterDropdown',
                value: [],
                possibleValues: [
                    { id: 'Yes', text: 'Yes' },
                    { id: 'No', text: 'No' },
                    { id: '-', text: '-' }
                ],
                placeholder: 'Column3'
            }
        ]
    };

    it('renders column filters controls', () => {
        let wrapper = shallowMount(ColumnFilters, { propsData });

        expect(wrapper.find(ColumnFilters).exists()).toBe(true);
        expect(wrapper.find(FilterMultiselect).exists()).toBe(true);
        expect(wrapper.find(FilterDropdown).exists()).toBe(true);
        expect(wrapper.find(FilterInputField).exists()).toBe(true);
        expect(wrapper.find(FunctionButton).exists()).toBe(true);
        expect(wrapper.find(TrashIcon).exists()).toBe(true);
    });

    it('emits columnFilter events', () => {
        let wrapper = shallowMount(ColumnFilters, { propsData });
        expect(wrapper.emitted().columnFilter).toBeFalsy();
        wrapper.find(FilterInputField).vm.$emit('input', 'New Value');
        expect(wrapper.emitted().columnFilter).toBeTruthy();
        expect(wrapper.emitted().columnFilter[0]).toStrictEqual([1, 'New Value']);
    });

    it('emits clearFilter events', () => {
        let wrapper = shallowMount(ColumnFilters, { propsData });
        expect(wrapper.emitted().clearFilter).toBeFalsy();
        wrapper.find(FunctionButton).vm.$emit('click');
        expect(wrapper.emitted().clearFilter).toBeTruthy();
    });
});
