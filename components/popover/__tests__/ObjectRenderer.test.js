import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import ObjectRenderer from '@/components/popover/ObjectRenderer.vue';

describe('ObjectRenderer.vue', () => {
    let wrapper;

    it('renders object data', () => {
        wrapper = shallowMount(ObjectRenderer, {
            props: {
                data: {
                    important: 'property'
                }
            }
        });

        expect(wrapper.findComponent(ObjectRenderer).exists()).toBe(true);
        expect(wrapper.find('div').text()).toBe(`{\n  "important": "property"\n}`);
    });

    it('renders string data', () => {
        wrapper = shallowMount(ObjectRenderer, {
            props: {
                data: 'test'
            }
        });

        expect(wrapper.findComponent(ObjectRenderer).exists()).toBe(true);
        expect(wrapper.find('div').text()).toBe('test');
    });

    it('parses and formats valid object strings', () => {
        wrapper = shallowMount(ObjectRenderer, {
            props: {
                data: '{"important":"property"}'
            }
        });

        expect(wrapper.findComponent(ObjectRenderer).exists()).toBe(true);
        expect(wrapper.find('div').text()).toBe(`{\n  "important": "property"\n}`);
    });

    it('does not render if data is missing', () => {
        wrapper = shallowMount(ObjectRenderer);

        expect(wrapper.findComponent(ObjectRenderer).exists()).toBe(true);
        expect(wrapper.find('div').exists()).toBe(false);
    });
});
