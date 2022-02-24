import { mount, createLocalVue } from '@vue/test-utils';
import TableFilterDropdown from '~/components/filter/TableFilterDropdown';

jest.mock('vue-clickaway2', () => ({
    mixin: {}
}), { virtual: true });

describe('TableFilterDropdown.vue', () => {
    let propsData, localVue;
    
    beforeAll(() => {
        localVue = createLocalVue();
        localVue.directive('onClickaway', () => {});
    });

    beforeEach(() => {
        propsData = {
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
        const wrapper = mount(TableFilterDropdown, {
            propsData,
            localVue
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.findAll('[role=option]').length).toBe(propsData.possibleValues.length);
    });

    it('sets the correct aria-* attributes', () => {
        const wrapper = mount(TableFilterDropdown, {
            propsData,
            localVue
        });

        let button = wrapper.find('[role=button]');
        expect(button.attributes('aria-label')).toBe(propsData.ariaLabel);
    });

    it('renders value text or placeholder if no or empty value set', () => {
        let placeholder = 'my-placeholder';
        const wrapper = mount(TableFilterDropdown, {
            propsData: {
                ...propsData,
                placeholder,
                value: 'test3'
            },
            localVue
        });

        let button = wrapper.find('[role=button]');
        expect(button.text()).toBe('Text 3');

        wrapper.setProps({ value: null });
        expect(button.text()).toBe(placeholder);
        wrapper.setProps({ value: '' });
        expect(button.text()).toBe(placeholder);
    });

    it('opens the listbox on click of button and emits event for clicked value', () => {
        const wrapper = mount(TableFilterDropdown, {
            propsData,
            localVue
        });
        let newValueIndex = 1;
        let listbox = wrapper.find('[role=listbox]');

        // open list
        wrapper.find('[role=button]').trigger('click');
        expect(listbox.isVisible()).toBe(true);

        let input = wrapper.findAll('li[role=option]').at(newValueIndex);
        input.trigger('click');

        expect(wrapper.emitted().input[0][0]).toEqual(propsData.possibleValues[newValueIndex].id);

        // listbox closed
        expect(listbox.isVisible()).toBe(false);
    });

    describe('keyboard navigation', () => {
        it('opens and closes the listbox on enter/space/esc', () => {
            const wrapper = mount(TableFilterDropdown, {
                propsData,
                localVue
            });

            let listbox = wrapper.find('[role=listbox]');

            // open list
            wrapper.find('[role=button]').trigger('keydown.enter');
            expect(listbox.isVisible()).toBe(true);
            // close listbox
            listbox.trigger('keydown.esc');
            expect(listbox.isVisible()).toBe(false);
            // open list
            wrapper.find('[role=button]').trigger('keydown.space');
            expect(listbox.isVisible()).toBe(true);
            // close listbox
            listbox.trigger('keydown.esc');
            expect(listbox.isVisible()).toBe(false);
        });

        it('sets the values on keydown navigation', () => {
            const wrapper = mount(TableFilterDropdown, {
                propsData: {
                    ...propsData,
                    value: 'test2' // defines start point
                },
                localVue
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.down');
            expect(wrapper.emitted().input[0][0]).toEqual('test3');
        });

        it('sets the values on keyup navigation', () => {
            const wrapper = mount(TableFilterDropdown, {
                propsData: {
                    ...propsData,
                    value: 'test2' // defines start point
                },
                localVue
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.up');
            expect(wrapper.emitted().input[0][0]).toEqual('test1');
        });

        it('sets no values on keyup navigation at the start', () => {
            const wrapper = mount(TableFilterDropdown, {
                propsData: {
                    ...propsData,
                    value: 'test1' // defines start point
                },
                localVue
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.up');
            expect(wrapper.emitted().input).toBeFalsy();
        });

        it('sets no values on keydown navigation at the end', () => {
            const wrapper = mount(TableFilterDropdown, {
                propsData: {
                    ...propsData,
                    value: 'test5' // defines start point
                },
                localVue
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.down');
            expect(wrapper.emitted().input).toBeFalsy();
        });

        it('sets the values to the first value on home key', () => {
            const wrapper = mount(TableFilterDropdown, {
                propsData: {
                    ...propsData,
                    value: 'test3' // defines start point
                },
                localVue
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.home');
            expect(wrapper.emitted().input[0][0]).toBe('test1');
        });

        it('sets the values to the last value on end key', () => {
            const wrapper = mount(TableFilterDropdown, {
                propsData: {
                    ...propsData,
                    value: 'test3' // defines start point
                },
                localVue
            });

            let ul = wrapper.find('ul');
            ul.trigger('keydown.end');
            expect(wrapper.emitted().input[0][0]).toBe('test5');
        });
    });
});
