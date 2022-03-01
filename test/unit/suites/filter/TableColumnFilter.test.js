import { shallowMount } from '@vue/test-utils';
import TableColumnFilter from '~/components/filter/TableColumnFilter';
import TableFilterMultiselect from '~/components/filter/TableFilterMultiselect';
import TableFilterInputField from '~/components/filter/TableFilterInputField';
import TableFilterDropdown from '~/components/filter/TableFilterDropdown';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton';
import CloseIcon from '~/webapps-common/ui/assets/img/icons/close.svg?inline';

describe('TableColumnFilter.vue', () => {
    let propsData = {
        columnHeaders: ['User', 'Count', 'Enabled'],
        // eslint-disable-next-line no-magic-numbers
        columnSizes: [33, 33, 33],
        filterConfigs: [
            {
                is: 'TableFilterMultiselect',
                value: [],
                possibleValues: [
                    { id: 'Root', text: 'Root' },
                    { id: 'Alice', text: 'Alice' },
                    { id: 'Bob', text: 'Bob' }
                ],
                placeholder: 'Column1'
            },
            { is: 'TableFilterInputField', value: '', placeholder: 'Column2' },
            {
                is: 'TableFilterDropdown',
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
        let wrapper = shallowMount(TableColumnFilter, { propsData });

        expect(wrapper.find(TableColumnFilter).exists()).toBe(true);
        expect(wrapper.find(TableFilterMultiselect).exists()).toBe(true);
        expect(wrapper.find(TableFilterDropdown).exists()).toBe(true);
        expect(wrapper.find(TableFilterInputField).exists()).toBe(true);
        expect(wrapper.find(FunctionButton).exists()).toBe(true);
        expect(wrapper.find(CloseIcon).exists()).toBe(true);
    });

    it('emits columnFilter events', () => {
        let wrapper = shallowMount(TableColumnFilter, { propsData });
        expect(wrapper.emitted().columnFilter).toBeFalsy();
        wrapper.find(TableFilterInputField).vm.$emit('input', 'New Value');
        expect(wrapper.emitted().columnFilter).toBeTruthy();
        expect(wrapper.emitted().columnFilter[0]).toStrictEqual([1, 'New Value']);
    });

    it('emits clearFilter events', () => {
        let wrapper = shallowMount(TableColumnFilter, { propsData });
        expect(wrapper.emitted().clearFilter).toBeFalsy();
        wrapper.find(FunctionButton).vm.$emit('click');
        expect(wrapper.emitted().clearFilter).toBeTruthy();
    });
});
