import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import ControlDropdown from '../ControlDropdown.vue';

vi.mock('vue-clickaway2', () => ({
    mixin: {}
}), { virtual: true });

describe('ControlDropdown.vue', () => {
    let props;


    beforeEach(() => {
        props = {
            possibleValues: [{
                id: 'test1',
                text: 'Text 1'
            }, {
                id: 'test2',
                text: 'Text 2'
            }, {
                id: 'test3',
                text: 'Text 3'
            }, {
                id: 'test4',
                text: 'Text 4'
            }, {
                id: 'test5',
                text: 'Text 5'
            }],
            ariaLabel: 'Test Label'
        };
    });

    it('renders', () => {
        const wrapper = mount(ControlDropdown, {
            props
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.findAll('[role=option]').length).toBe(props.possibleValues.length);
    });

    it('includes placeholder value in options if enabled', () => {
        let placeholder = 'Groups';
        let itemCount = props.possibleValues.length;
        const wrapper = mount(ControlDropdown, {
            props: {
                ...props,
                placeholder,
                includePlaceholder: true
            }
        });
        expect(wrapper.findAll('[role=option]').length).toBe(itemCount + 1);
        expect(wrapper.vm.localValues.some(item => item.text === placeholder)).toBe(true);
    });

    it('sets the correct aria-* attributes', () => {
        const wrapper = mount(ControlDropdown, {
            props
        });

        let button = wrapper.find('[role=button]');
        expect(button.attributes('aria-label')).toBe(props.ariaLabel);
    });

    it('renders modelValue text or placeholder if no or empty modelValue set', async () => {
        let placeholder = 'my-placeholder';
        const wrapper = mount(ControlDropdown, {
            props: {
                ...props,
                placeholder,
                modelValue: 'test3'
            }
        });

        let button = wrapper.find('[role=button]');
        expect(button.text()).toBe('Text 3');

        await wrapper.setProps({ modelValue: null });
        expect(button.text()).toBe(placeholder);
        await wrapper.setProps({ modelValue: '' });
        expect(button.text()).toBe(placeholder);
    });

    it('renders value text using a formatter function if provided', async () => {
        let placeholder = 'my-placeholder';
        const wrapper = mount(ControlDropdown, {
            props: {
                ...props,
                placeholder,
                formatter: group => `Grouped by '${group}'`,
                modelValue: 'test1'
            }
        });

        let button = wrapper.find('[role=button]');
        expect(button.text()).toBe('Grouped by \'Text 1\'');
        await wrapper.setProps({ modelValue: 'test3' });
        expect(button.text()).toBe('Grouped by \'Text 3\'');
    });

    it('emits an empty value input event if placeholder included and selected', () => {
        let placeholder = 'Groups';
        const wrapper = mount(ControlDropdown, {
            props: {
                ...props,
                placeholder,
                includePlaceholder: true
            }
        });
        let placeholderItemIndex = wrapper.vm.localValues.findIndex(item => item.text === placeholder);
        let input = wrapper.findAll('li[role=option]').at(placeholderItemIndex);
        input.trigger('click');
        expect(wrapper.emitted()['update:modelValue'][0][0]).toBe('');
    });

    it('opens the listbox on click of button and emits event for clicked value', async () => {
        const wrapper = mount(ControlDropdown, {
            props
        });
        let newValueIndex = 1;
        let listbox = wrapper.find('[role=listbox]');

        // open list
        wrapper.find('[role=button]').trigger('click');
        await wrapper.vm.$nextTick();
        expect(listbox.isVisible()).toBe(true);

        let input = wrapper.findAll('li[role=option]').at(newValueIndex);
        input.trigger('click');

        expect(wrapper.emitted()['update:modelValue'][0][0]).toEqual(props.possibleValues[newValueIndex].id);

        // listbox closed
        await wrapper.vm.$nextTick();
        expect(listbox.isVisible()).toBe(false);
    });

    describe('keyboard navigation', () => {
        it('opens and closes the listbox on enter/space/esc', async () => {
            const wrapper = mount(ControlDropdown, {
                props
            });

            let listbox = wrapper.find('[role=listbox]');

            // open list
            wrapper.find('[role=button]').trigger('keydown.enter');
            await wrapper.vm.$nextTick();
            expect(listbox.isVisible()).toBe(true);
            // close listbox
            listbox.trigger('keydown.esc');
            await wrapper.vm.$nextTick();
            expect(listbox.isVisible()).toBe(false);
            // open list
            wrapper.find('[role=button]').trigger('keydown.space');
            await wrapper.vm.$nextTick();
            expect(listbox.isVisible()).toBe(true);
            // close listbox
            listbox.trigger('keydown.esc');
            await wrapper.vm.$nextTick();
            expect(listbox.isVisible()).toBe(false);
        });

        it('sets the values on keydown navigation', () => {
            const wrapper = mount(ControlDropdown, {
                props: {
                    ...props,
                    modelValue: 'test2' // defines start point
                }
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.down');
            expect(wrapper.emitted()['update:modelValue'][0][0]).toEqual('test3');
        });

        it('sets the values on keyup navigation', () => {
            const wrapper = mount(ControlDropdown, {
                props: {
                    ...props,
                    modelValue: 'test2' // defines start point
                }
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.up');
            expect(wrapper.emitted()['update:modelValue'][0][0]).toEqual('test1');
        });

        it('sets no values on keyup navigation at the start', () => {
            const wrapper = mount(ControlDropdown, {
                props: {
                    ...props,
                    modelValue: 'test1' // defines start point
                }
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.up');
            expect(wrapper.emitted()['update:modelValue']).toBeFalsy();
        });

        it('sets no values on keydown navigation at the end', () => {
            const wrapper = mount(ControlDropdown, {
                props: {
                    ...props,
                    modelValue: 'test5' // defines start point
                }
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.down');
            expect(wrapper.emitted()['update:modelValue']).toBeFalsy();
        });

        it('sets the values to the first value on home key', () => {
            const wrapper = mount(ControlDropdown, {
                props: {
                    ...props,
                    modelValue: 'test3' // defines start point
                }
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.home');
            expect(wrapper.emitted()['update:modelValue'][0][0]).toBe('test1');
        });

        it('sets the values to the last value on end key', () => {
            const wrapper = mount(ControlDropdown, {
                props: {
                    ...props,
                    modelValue: 'test3' // defines start point
                }
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.end');
            expect(wrapper.emitted()['update:modelValue'][0][0]).toBe('test5');
        });
    });
});
