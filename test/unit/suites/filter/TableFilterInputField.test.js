import { mount } from '@vue/test-utils';
import TableFilterInputField from '~/components/filter/TableFilterInputField';

describe('InputField.vue', () => {
    it('renders', () => {
        const wrapper = mount(TableFilterInputField, {
            propsData: {
                value: 'Test value'
            }
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.is('div')).toBeTruthy();
        let input = wrapper.find('input');
        expect(input.attributes('type')).toBe('text'); // default
        expect(input.element.value).toBe('Test value');
    });

    it('emits input events', () => {
        const wrapper = mount(TableFilterInputField);
        const newValue = 'new value';
        let input = wrapper.find('input');
        input.setValue(newValue);
        expect(wrapper.emitted().input[0][0]).toEqual(newValue);
    });

    it('emits input events', () => {
        const wrapper = mount(TableFilterInputField);
        wrapper.vm.focus();
        expect(wrapper.emitted().blur).toBeFalsy();
        wrapper.find('input').trigger('keydown.esc');
        expect(wrapper.emitted().blur).toBeTruthy();
    });

    it('focuses on focus call', () => {
        const wrapper = mount(TableFilterInputField);
        wrapper.vm.focus();
        expect(document.activeElement).toEqual(wrapper.find('input').element);
    });
});
