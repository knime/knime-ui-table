import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import StringRenderer from '@/components/popover/StringRenderer.vue';

describe('StringRenderer.vue', () => {
    let wrapper;

    it('renders string data', () => {
        wrapper = shallowMount(StringRenderer, {
            props: {
                data: 'test'
            }
        });

        expect(wrapper.findComponent(StringRenderer).exists()).toBe(true);
        expect(wrapper.find('div').text()).toBe('test');
    });

    it('does not render if data is missing', () => {
        wrapper = shallowMount(StringRenderer);

        expect(wrapper.findComponent(StringRenderer).exists()).toBe(true);
        expect(wrapper.find('div').exists()).toBe(false);
    });
});
