import { shallowMount } from '@vue/test-utils';
import StringRenderer from '~/components/popover/StringRenderer';

describe('StringRenderer.vue', () => {
    let wrapper;

    it('renders string data', () => {
        wrapper = shallowMount(StringRenderer, {
            propsData: {
                data: 'test'
            }
        });

        expect(wrapper.find(StringRenderer).exists()).toBe(true);
        expect(wrapper.find('div').text()).toBe('test');
    });

    it('does not render if data is missing', () => {
        wrapper = shallowMount(StringRenderer);

        expect(wrapper.find(StringRenderer).exists()).toBe(true);
        expect(wrapper.find('div').exists()).toBe(false);
    });
});
