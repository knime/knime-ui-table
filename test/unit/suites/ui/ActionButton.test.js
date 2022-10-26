import { shallowMount } from '@vue/test-utils';
import ActionButton from '@/components/ui/ActionButton.vue';
import Button from 'webapps-common/ui/components/Button.vue';

describe('ActionButton.vue', () => {
    let wrapper;

    it('renders default', () => {
        wrapper = shallowMount(ActionButton, {
            propsData: {
                config: {
                    text: 'test',
                    callback: jest.fn()
                }
            }
        });
        expect(wrapper.find(ActionButton).exists()).toBe(true);
        expect(wrapper.find(Button).text()).toBe('test');
    });

    it('invokes a callback function on click', () => {
        let actionCallbackMock = jest.fn();
        wrapper = shallowMount(ActionButton, {
            propsData: {
                config: {
                    text: 'test',
                    callback: actionCallbackMock
                }
            }
        });
        expect(actionCallbackMock).not.toHaveBeenCalled();
        wrapper.find(Button).vm.$emit('click');
        expect(actionCallbackMock).toHaveBeenCalled();
    });
});
