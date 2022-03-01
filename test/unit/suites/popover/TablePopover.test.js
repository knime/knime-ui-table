/* eslint-disable no-magic-numbers */
import { shallowMount, createLocalVue } from '@vue/test-utils';
import { columnTypes } from '~/config/table.config';
import TablePopover from '~/components/popover/TablePopover.vue';
import StringRenderer from '~/components/popover/StringRenderer';
import ObjectRenderer from '~/components/popover/ObjectRenderer';
import ArrayRenderer from '~/components/popover/ArrayRenderer';
import MessageRenderer from '~/components/popover/MessageRenderer';

jest.mock('vue-clickaway', () => ({
    mixin: {}
}), { virtual: true });

const localVue = createLocalVue();
localVue.directive('onClickaway', () => { });

describe('TablePopover.vue', () => {
    const target = {
        clientHeight: 10,
        offsetTop: 10,
        offsetLeft: 10,
        offsetHeight: 10,
        offsetWidth: 10,
        offsetParent: {
            clientHeight: 10
        }
    };

    it('renders the default state', () => {
        const wrapper = shallowMount(TablePopover, {
            slots: {
                content: 'contentText'
            },
            propsData: { target, data: [] },
            localVue
        });
        expect(wrapper.find('.content').isVisible()).toBeFalsy();
        expect(wrapper.find('.content .closer').exists()).toBeTruthy();
        expect(wrapper.find('.content').text()).toContain('contentText');
    });

    it('renders the different data renders based on type', () => {
        const wrapper = shallowMount(TablePopover, {
            propsData: { target, data: [] },
            localVue
        });
        expect(wrapper.find(ObjectRenderer).exists()).toBeTruthy();
        wrapper.setProps({ renderer: columnTypes.Nominal });
        expect(wrapper.find(StringRenderer).exists()).toBeTruthy();
        wrapper.setProps({ renderer: columnTypes.String });
        expect(wrapper.find(StringRenderer).exists()).toBeTruthy();
        wrapper.setProps({ renderer: columnTypes.DateTime });
        expect(wrapper.find(ObjectRenderer).exists()).toBeTruthy();
        wrapper.setProps({ renderer: columnTypes.Number });
        expect(wrapper.find(ObjectRenderer).exists()).toBeTruthy();
        wrapper.setProps({ renderer: columnTypes.Boolean });
        expect(wrapper.find(ObjectRenderer).exists()).toBeTruthy();
        wrapper.setProps({ renderer: columnTypes.Object });
        expect(wrapper.find(ObjectRenderer).exists()).toBeTruthy();
        wrapper.setProps({ renderer: columnTypes.Array, data: ['1', '2', '3'] });
        expect(wrapper.find(ArrayRenderer).exists()).toBeTruthy();
    });

    it('renders dynamic components with data processing functions', () => {
        const wrapper = shallowMount(TablePopover, {
            propsData: {
                target,
                data: [1, 2, 3],
                renderer: {
                    type: 'MessageRenderer',
                    process: data => data.map(item => item + 1)
                }
            },
            localVue
        });
        expect(wrapper.find(MessageRenderer).exists()).toBeTruthy();
        expect(wrapper.vm.processedData).toStrictEqual([2, 3, 4]);
    });

    it('computes the vertical direction to render based on the client height', () => {
        let wrapper = shallowMount(TablePopover, {
            propsData: {
                target,
                data: 1
            },
            localVue
        });
        expect(wrapper.vm.displayTop).toBe(true);
        wrapper = shallowMount(TablePopover, {
            propsData: {
                target: {
                    ...target,
                    offsetTop: 1,
                    offsetParent: {
                        clientHeight: 10
                    }
                },
                data: 1
            },
            localVue
        });
        expect(wrapper.vm.displayTop).toBe(false);
    });

    it('computes display coordinates based on the provided event target', () => {
        let wrapper = shallowMount(TablePopover, {
            propsData: {
                target: {
                    clientHeight: 4,
                    offsetTop: 1,
                    offsetLeft: 1,
                    offsetHeight: 8,
                    offsetWidth: 8,
                    offsetParent: {
                        clientHeight: 10
                    }
                },
                data: 1,
                rowHeight: 4
            },
            localVue
        });
        expect(wrapper.vm.displayTop).toBe(false);
        expect(wrapper.vm.top).toBe(5);
        expect(wrapper.vm.left).toBe(5);
        expect(wrapper.vm.maxHeight).toBe(300);
        expect(wrapper.vm.style).toStrictEqual({
            top: '5px',
            left: '5px'
        });
        expect(wrapper.vm.contentStyle).toStrictEqual({
            top: '4px',
            'max-height': `300px`
        });
        expect(wrapper.vm.childMaxHeight).toStrictEqual({
            'max-height': `296px`
        });

        wrapper = shallowMount(TablePopover, {
            propsData: {
                target: {
                    clientHeight: 8,
                    offsetTop: 6,
                    offsetLeft: 6,
                    offsetHeight: 8,
                    offsetWidth: 8,
                    offsetParent: {
                        clientHeight: 10
                    }
                },
                data: 1,
                rowHeight: 4
            },
            localVue
        });
        expect(wrapper.vm.displayTop).toBe(true);
        expect(wrapper.vm.top).toBe(10);
        expect(wrapper.vm.left).toBe(10);
        expect(wrapper.vm.maxHeight).toBe(300);
        expect(wrapper.vm.style).toStrictEqual({
            top: '10px',
            left: '10px'
        });
        expect(wrapper.vm.contentStyle).toStrictEqual({
            bottom: '8px',
            'max-height': `300px`
        });
        expect(wrapper.vm.childMaxHeight).toStrictEqual({
            'max-height': `296px`
        });
    });

    it('emits close events when the close button is clicked', () => {
        const wrapper = shallowMount(TablePopover, {
            propsData: {
                target,
                data: [1, 2, 3],
                renderer: {
                    type: 'MessageRenderer',
                    process: data => data.map(item => item + 1)
                }
            },
            localVue
        });
        expect(wrapper.emitted().close).toBeFalsy();
        expect(wrapper.find('.closer').exists()).toBeTruthy();
        wrapper.find('.closer').vm.$emit('click');
        expect(wrapper.emitted().close).toBeTruthy();
    });

    it('does not open if there is no data to display', () => {
        const wrapper = shallowMount(TablePopover, {
            propsData: {
                target,
                data: null
            },
            localVue
        });
        expect(wrapper.vm.show).toBe(false);
        expect(wrapper.find('.content').isVisible()).toBeFalsy();
    });
});
