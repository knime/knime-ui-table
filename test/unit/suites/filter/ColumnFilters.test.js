import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ColumnFilters from '@/components/filter/ColumnFilters.vue';
import FilterMultiselect from '@/components/filter/FilterMultiselect.vue';
import FilterInputField from '@/components/filter/FilterInputField.vue';
import FilterDropdown from '@/components/filter/FilterDropdown.vue';
import FunctionButton from 'webapps-common/ui/components/FunctionButton.vue';
import CloseIcon from 'webapps-common/ui/assets/img/icons/close.svg';

require('consola');

describe('ColumnFilters.vue', () => {
    let props = {
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
        let wrapper = shallowMount(ColumnFilters, { props });

        expect(wrapper.findComponent(ColumnFilters).exists()).toBe(true);
        expect(wrapper.findComponent(FilterMultiselect).exists()).toBe(true);
        expect(wrapper.findComponent(FilterDropdown).exists()).toBe(true);
        expect(wrapper.findComponent(FilterInputField).exists()).toBe(true);
        expect(wrapper.findComponent(FunctionButton).exists()).toBe(true);
        expect(wrapper.findComponent(CloseIcon).exists()).toBe(true);
    });

    it('emits columnFilter events', () => {
        let wrapper = shallowMount(ColumnFilters, { props });
        expect(wrapper.emitted().columnFilter).toBeFalsy();
        wrapper.findComponent(FilterInputField).vm.$emit('input', 'New Value');
        expect(wrapper.emitted().columnFilter).toBeTruthy();
        expect(wrapper.emitted().columnFilter[0]).toStrictEqual([1, 'New Value']);
    });

    it('emits clearFilter events', () => {
        let wrapper = shallowMount(ColumnFilters, { props });
        expect(wrapper.emitted().clearFilter).toBeFalsy();
        wrapper.findComponent(FunctionButton).vm.$emit('click');
        expect(wrapper.emitted().clearFilter).toBeTruthy();
    });
});
