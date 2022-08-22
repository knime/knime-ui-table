import { shallowMount } from '@vue/test-utils';
import ArrayRenderer from '~/components/popover/ArrayRenderer.vue';
import PopoverPageControls from '~/components/popover/PopoverPageControls.vue';

describe('ArrayRenderer.vue', () => {
    let wrapper;

    it('renders array data', () => {
        wrapper = shallowMount(ArrayRenderer, {
            propsData: {
                data: ['test']
            }
        });

        expect(wrapper.find(ArrayRenderer).exists()).toBe(true);
        expect(wrapper.find('div').text()).toBe(`test`);
        expect(wrapper.find(PopoverPageControls).exists()).toBe(false);
    });

    it('renders page controls for multi-item arrays', () => {
        wrapper = shallowMount(ArrayRenderer, {
            propsData: {
                data: ['test', 'data']
            }
        });

        expect(wrapper.find(ArrayRenderer).exists()).toBe(true);
        expect(wrapper.find('div').text()).toBe(`test`);
        expect(wrapper.find(PopoverPageControls).exists()).toBe(true);
    });

    it('reacts to page events by updating the content of the page', () => {
        wrapper = shallowMount(ArrayRenderer, {
            propsData: {
                data: ['test', 'data']
            }
        });

        expect(wrapper.find(ArrayRenderer).exists()).toBe(true);
        expect(wrapper.find(PopoverPageControls).exists()).toBe(true);
        expect(wrapper.find('div').text()).toBe(`test`);
        wrapper.find(PopoverPageControls).vm.$emit('nextPage');
        expect(wrapper.find('div').text()).toBe(`data`);
        wrapper.find(PopoverPageControls).vm.$emit('prevPage');
        expect(wrapper.find('div').text()).toBe(`test`);
    });

    it('parses and formats valid object within arrays', () => {
        wrapper = shallowMount(ArrayRenderer, {
            propsData: {
                data: [{
                    important: 'property'
                }]
            }
        });

        expect(wrapper.find(ArrayRenderer).exists()).toBe(true);
        expect(wrapper.find('div').text()).toBe(`{\n  "important": "property"\n}`);
    });

    it('does not render for empty arrays', () => {
        wrapper = shallowMount(ArrayRenderer, {
            propsData: {
                data: []
            }
        });

        expect(wrapper.find(ArrayRenderer).exists()).toBe(true);
        expect(wrapper.find('div').exists()).toBe(false);
    });

    it('does not render if data is missing', () => {
        wrapper = shallowMount(ArrayRenderer);

        expect(wrapper.find(ArrayRenderer).exists()).toBe(true);
        expect(wrapper.find('div').exists()).toBe(false);
    });
});
