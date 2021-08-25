import { shallowMount } from '@vue/test-utils';
import TableActionButton from '~/components/ui/TableActionButton';
import Button from '~/webapps-common/ui/components/Button';

describe('TableActionButton.vue', () => {
    let wrapper;

    it('renders default', () => {
        wrapper = shallowMount(TableActionButton, {
            propsData: {
                actionButtonText: 'test',
                actionCallback: jest.fn()
            }
        });
        expect(wrapper.find(TableActionButton).exists()).toBe(true);
        expect(wrapper.find(Button).text()).toBe('test');
    });

    it('invokes a callback function on click', () => {
        let actionCallbackMock = jest.fn();
        wrapper = shallowMount(TableActionButton, {
            propsData: {
                actionButtonText: 'test',
                actionCallback: actionCallbackMock
            }
        });
        expect(actionCallbackMock).not.toHaveBeenCalled();
        wrapper.find(Button).vm.$emit('click');
        expect(actionCallbackMock).toHaveBeenCalled();
    });
});
