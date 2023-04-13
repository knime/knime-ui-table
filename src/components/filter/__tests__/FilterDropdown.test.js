import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import FilterDropdown from '../FilterDropdown.vue';
import CircleHelpIcon from 'webapps-common/ui/assets/img/icons/circle-help.svg';

vi.mock('vue-clickaway2', () => ({
    mixin: {}
}), { virtual: true });

describe('FilterDropdown.vue', () => {
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
        const wrapper = mount(FilterDropdown, {
            props
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.findAll('[role=option]').length).toBe(props.possibleValues.length);
    });

    it('sets the correct aria-* attributes', () => {
        const wrapper = mount(FilterDropdown, {
            props
        });

        let button = wrapper.find('[role=button]');
        expect(button.attributes('aria-label')).toBe(props.ariaLabel);
    });

    it('renders value text or placeholder if no or empty value set', async () => {
        let placeholder = 'my-placeholder';
        const wrapper = mount(FilterDropdown, {
            props: {
                ...props,
                placeholder,
                value: 'test3'
            }
        });

        let button = wrapper.find('[role=button]');
        expect(button.text()).toBe('Text 3');

        await wrapper.setProps({ value: undefined });
        expect(button.text()).toBe(placeholder);
        await wrapper.setProps({ value: '' });
        expect(button.text()).toBe(placeholder);
    });

    it('renders a missing value icon if missing value set', async () => {
        const wrapper = mount(FilterDropdown, {
            props: {
                ...props,
                possibleValues: [...props.possibleValues, { id: null, text: null }],
                value: 'test3'
            }
        });

        const button = wrapper.find('[role=button]');
        expect(button.text()).toBe('Text 3');
        expect(button.findComponent(CircleHelpIcon).exists()).toBeFalsy();

        await wrapper.setProps({ value: null });
        expect(button.findComponent(CircleHelpIcon).exists()).toBeTruthy();
    });

    it('opens the listbox on click of button and emits event for clicked value', async () => {
        const wrapper = mount(FilterDropdown, {
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

        expect(wrapper.emitted().input[0][0]).toEqual(props.possibleValues[newValueIndex].id);

        // listbox closed
        await wrapper.vm.$nextTick();
        expect(listbox.isVisible()).toBe(false);
    });

    it('renders a missing value icon when item.id is null, else it renders the item.text within the options', () => {
        const wrapper = mount(FilterDropdown, {
            props: {
                ...props,
                possibleValues: [...props.possibleValues, { id: null, text: null }],
                value: 'test3'
            }
        });
        const options = wrapper.findAll('[role=option]');
        expect(options[0].find('span').text()).toBe('Text 1');
        expect(options[0].findComponent(CircleHelpIcon).exists()).toBeFalsy();
        expect(options[4].find('span').text()).toBe('Text 5');
        expect(options[4].findComponent(CircleHelpIcon).exists()).toBeFalsy();
        expect(options[5].find('span').exists()).toBeFalsy();
        expect(options[5].findComponent(CircleHelpIcon).exists()).toBeTruthy();
    });

    describe('keyboard navigation', () => {
        it('opens and closes the listbox on enter/space/esc', async () => {
            const wrapper = mount(FilterDropdown, {
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
            const wrapper = mount(FilterDropdown, {
                props: {
                    ...props,
                    value: 'test2' // defines start point
                }
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.down');
            expect(wrapper.emitted().input[0][0]).toBe('test3');
        });

        it('sets the values on keyup navigation', () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    ...props,
                    value: 'test2' // defines start point
                }
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.up');
            expect(wrapper.emitted().input[0][0]).toBe('test1');
        });

        it('sets no values on keyup navigation at the start', () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    ...props,
                    value: 'test1' // defines start point
                }
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.up');
            expect(wrapper.emitted().input).toBeFalsy();
        });

        it('sets no values on keydown navigation at the end', () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    ...props,
                    value: 'test5' // defines start point
                }
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.down');
            expect(wrapper.emitted().input).toBeFalsy();
        });

        it('sets the values to the first value on home key', () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    ...props,
                    value: 'test3' // defines start point
                }
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.home');
            expect(wrapper.emitted().input[0][0]).toBe('test1');
        });

        it('sets the values to the last value on end key', () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    ...props,
                    value: 'test3' // defines start point
                }
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.end');
            expect(wrapper.emitted().input[0][0]).toBe('test5');
        });
    });
});
