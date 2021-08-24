import { shallowMount } from '@vue/test-utils';
import TableColumnFilter from '~/components/table/filter/TableColumnFilter';
import TableFilterMultiselect from '~/components/table/filter/TableFilterMultiselect';
import TableFilterInputField from '~/components/table/filter/TableFilterInputField';
import TableFilterDropdown from '~/components/table/filter/TableFilterDropdown';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton';
import CloseIcon from '~/webapps-common/ui/assets/img/icons/close.svg?inline';
import { columnTypes } from '~/config/table.config';

describe('TableColumnFilter.vue', () => {
    let propsData = {
        columns: ['User', 'Count', 'Enabled'],
        columnWidths: [33, 33, 33],
        filterConfigs: [
            {
                domain: ['Root', 'Alice', 'Bob']
            },
            {},
            {
                domain: ['Yes', 'No', '-']
            }
        ],
        types: [columnTypes.Nominal, columnTypes.Number, columnTypes.Boolean]
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

    it('emits headerFilter events', () => {
        let wrapper = shallowMount(TableColumnFilter, { propsData });
        expect(wrapper.emitted().headerFilter).toBeFalsy();
        wrapper.find(TableFilterInputField).vm.$emit('input', 'New Value');
        expect(wrapper.emitted().headerFilter).toBeTruthy();
        expect(wrapper.emitted().headerFilter[0][0]).toStrictEqual({ colInd: 1, values: 'New Value' });
    });

    it('emits clearFilter events', () => {
        let wrapper = shallowMount(TableColumnFilter, { propsData });
        expect(wrapper.emitted().clearFilter).toBeFalsy();
        wrapper.find(FunctionButton).vm.$emit('click');
        expect(wrapper.emitted().clearFilter).toBeTruthy();
    });
});
