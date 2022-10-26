import { shallowMount } from '@vue/test-utils';
import ObjectRenderer from '@/components/popover/ObjectRenderer.vue';

describe('ObjectRenderer.vue', () => {
    let wrapper;

    it('renders object data', () => {
        wrapper = shallowMount(ObjectRenderer, {
            propsData: {
                data: {
                    important: 'property'
                }
            }
        });

        expect(wrapper.find(ObjectRenderer).exists()).toBe(true);
        expect(wrapper.find('div').text()).toBe(`{\n  "important": "property"\n}`);
    });

    it('renders string data', () => {
        wrapper = shallowMount(ObjectRenderer, {
            propsData: {
                data: 'test'
            }
        });

        expect(wrapper.find(ObjectRenderer).exists()).toBe(true);
        expect(wrapper.find('div').text()).toBe('test');
    });

    it('parses and formats valid object strings', () => {
        wrapper = shallowMount(ObjectRenderer, {
            propsData: {
                data: '{"important":"property"}'
            }
        });

        expect(wrapper.find(ObjectRenderer).exists()).toBe(true);
        expect(wrapper.find('div').text()).toBe(`{\n  "important": "property"\n}`);
    });

    it('does not render if data is missing', () => {
        wrapper = shallowMount(ObjectRenderer);

        expect(wrapper.find(ObjectRenderer).exists()).toBe(true);
        expect(wrapper.find('div').exists()).toBe(false);
    });
});
