import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';
import { ref, unref } from 'vue';

import ControlMultiselect from '../ControlMultiselect.vue';
import CircleHelpIcon from 'webapps-common/ui/assets/img/icons/circle-help.svg';

const dropdownNavigation = { currentIndex: ref(1), resetNavigation: vi.fn(), onKeydown: vi.fn() };
vi.mock('webapps-common/ui/composables/useDropdownNavigation', () => ({ default: vi.fn(() => dropdownNavigation) }));

const dropdownPopper = { updatePopper: vi.fn(), popperInstance: { setOptions: vi.fn() } };
vi.mock('../../../composables/useDropdownPopper', () => ({ default: vi.fn(() => dropdownPopper) }));
vi.mock('webapps-common/ui/composables/useClickOutside', () => ({ default: vi.fn() }));

import useDropdownPopper from '../../../composables/useDropdownPopper';
import useClickOutside from 'webapps-common/ui/composables/useClickOutside';
import useDropdownNavigation from 'webapps-common/ui/composables/useDropdownNavigation';

window.scrollTo = vi.fn();

describe('ControlMultiselect.vue', () => {
    let props;
    
    
    beforeEach(() => {
        props = {
            possibleValues: [{
                id: 'test1',
                text: 'Test1'
            }, {
                id: 'test2',
                text: 'Test2'
            }, {
                id: 'test3',
                text: 'Test3'
            }]
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });
        
    it('renders', () => {
        const wrapper = mount(ControlMultiselect, { props });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.classes()).toContain('multiselect');
    });

    it('renders placeholder until options have been selected', async () => {
        const wrapper = mount(ControlMultiselect, {
            props: {
                ...props,
                placeholder: 'Test Title'
            }
        });

        let button = wrapper.find('[role="button"]');
        expect(button.text()).toBe('Test Title');
        expect(button.classes()).toContain('placeholder');

        wrapper.vm.onInput('test1', true);
        await wrapper.vm.$nextTick();
        expect(button.text()).toBe('Test1');
        expect(button.classes()).not.toContain('placeholder');
        
        wrapper.vm.onInput('test2', true);
        await wrapper.vm.$nextTick();
        expect(button.text()).toBe('Test1, Test2');
        expect(button.classes()).not.toContain('placeholder');
    });

    it('number of selected items if items are selected and isFilter is true', () => {
        const wrapper = mount(ControlMultiselect, {
            props: {
                ...props,
                placeholder: 'Test Title',
                isFilter: true,
                modelValue: ['test1', 'test3']
            }
        });

        let button = wrapper.find('[role="button"]');
        expect(button.text()).toBe('2 selected');
    });

    it('locks placeholder', () => {
        const wrapper = mount(ControlMultiselect, {
            props: {
                ...props,
                placeholder: 'Test Title',
                lockPlaceholder: true
            }
        });

        let button = wrapper.find('[role="button"]');
        expect(button.text()).toBe('Test Title');
        expect(button.classes()).toContain('placeholder');

        wrapper.vm.onInput('test1', true);
        expect(button.text()).toBe('Test Title');
        expect(button.classes()).toContain('placeholder');
        
        wrapper.vm.onInput('test2', true);
        expect(button.text()).toBe('Test Title');
        expect(button.classes()).toContain('placeholder');
    });

    it('renders a missing value icon when item.id is null, else it renders the item.text within the options', () => {
        const wrapper = mount(ControlMultiselect, {
            props: {
                possibleValues: [...props.possibleValues, { id: null, text: null }]
            }
        });
        const popover = wrapper.find({ ref: 'optionsPopover' });
        const options = popover.findAll('.boxes');
        expect(options[0].find('span').text()).toBe('Test1');
        expect(options[0].findComponent(CircleHelpIcon).exists()).toBeFalsy();
        expect(options[2].find('span').text()).toBe('Test3');
        expect(options[2].findComponent(CircleHelpIcon).exists()).toBeFalsy();
        expect(options[3].findComponent(CircleHelpIcon).exists()).toBeTruthy();
    });

    it('excludes possible values with undefined id', () => {
        const wrapper = mount(ControlMultiselect, {
            props: {
                ...props,
                possibleValues: [...props.possibleValues, { id: undefined, text: undefined }],
                value: 'test3'
            }
        });
        const popover = wrapper.find({ ref: 'optionsPopover' });
        const options = popover.findAll('.boxes');
        expect(wrapper.vm.possibleValues).toHaveLength(4);
        expect(options).toHaveLength(3);
    });

    it('emits update:modelValue events', () => {
        const wrapper = mount(ControlMultiselect, { props });
        wrapper.vm.onInput('test1', true);
        expect(wrapper.emitted()['update:modelValue']).toBeTruthy();
    });

    it('toggles properly', () => {
        const wrapper = mount(ControlMultiselect, { props });
        expect(wrapper.vm.isExpanded).toBe(false);
        wrapper.vm.toggle();
        expect(wrapper.vm.isExpanded).toBe(true);
        wrapper.vm.toggle();
        expect(wrapper.vm.isExpanded).toBe(false);
    });

    it('adds values to the checked values', () => {
        const wrapper = mount(ControlMultiselect, { props });
        wrapper.vm.onInput('test1', true);
        expect(wrapper.vm.checkedValue).toContain('test1');
    });

    it('removes values from the checked values', () => {
        const wrapper = mount(ControlMultiselect, { props });
        wrapper.vm.onInput('test1', true);
        expect(wrapper.vm.checkedValue).toContain('test1');
        expect(wrapper.vm.checkedValue).toHaveLength(1);
        wrapper.vm.onInput('test1', false);
        expect(wrapper.vm.checkedValue).toHaveLength(0);
    });


    it('show options on space', () => {
        const wrapper = mount(ControlMultiselect, { props });
        let button = wrapper.find('[role=button]');
        button.trigger('keydown.space');
        expect(wrapper.vm.isExpanded).toBe(true);
    });

    describe('dropdown navigation', () => {
        it('does not call keydown callback when not expanded', () => {
            const wrapper = mount(ControlMultiselect, { props });

            wrapper.find('[role="button"]').trigger('keydown');

            expect(dropdownNavigation.onKeydown).toHaveBeenCalledTimes(0);
        });

        it('calls keydown callback when expanded', () => {
            const wrapper = mount(ControlMultiselect, { props });

            wrapper.find('[role="button"]').trigger('keydown.space');
            wrapper.find('[role="button"]').trigger('keydown');

            expect(dropdownNavigation.onKeydown).toHaveBeenCalled();
        });

        it('marks active element', () => {
            const wrapper = mount(ControlMultiselect, { props });
            wrapper.vm.toggle();
            const currentfocusedIndex = dropdownNavigation.currentIndex.value;
            const popover = wrapper.find({ ref: 'optionsPopover' });
            const options = popover.findAll('.focused');
            expect(options.length).toBe(1);
            expect(options[0].html()).toContain(props.possibleValues[currentfocusedIndex].text);
        });
    
        it('uses close function which emits @close', () => {
            useDropdownNavigation.reset();
            const wrapper = shallowMount(ControlMultiselect, { props });
            const { close } = useDropdownNavigation.mock.calls[0][0];
            wrapper.vm.toggle();
         
            expect(wrapper.vm.isExpanded).toBe(true);
            close();
            expect(wrapper.vm.isExpanded).toBe(false);
        });
    
        describe('getNextElement', () => {
            let elementClickSpy,
                getNextElement;
    
            beforeEach(() => {
                useDropdownNavigation.reset();
                const wrapper = mount(ControlMultiselect, { props, attachTo: document.body });
                wrapper.vm.toggle();
                getNextElement = useDropdownNavigation.mock.calls[0][0].getNextElement;
                
                elementClickSpy = (i) => {
                    const popover = wrapper.find({ ref: 'optionsPopover' });
                    const element = popover.findAll('.boxes')[i].find('input').element;
                    return vi.spyOn(element, 'click');
                };
            });

            const expectNextElement = ({ index, onClick }, expectedIndex) => {
                expect(index).toBe(expectedIndex);
                const clickSpy = elementClickSpy(index);
                clickSpy.reset();
                onClick();
                expect(clickSpy).toHaveBeenCalled();
            };
    
            it('yields the first element on downward navigation if there is no previous selection', () => {
                expectNextElement(getNextElement(-1, 1), 0);
            });
    
            it('yields next element on downwards navigation and wraps around', () => {
                expectNextElement(getNextElement(0, 1), 1);
                expectNextElement(getNextElement(1, 1), 2);
                expectNextElement(getNextElement(2, 1), 0);
            });
    
            it('yields the last element on upwards navigation if there is no previous selection', () => {
                expectNextElement(getNextElement(null, -1), 2);
            });
    
            it('yields next element on upwards navigation and wraps around', () => {
                expectNextElement(getNextElement(2, -1), 1);
                expectNextElement(getNextElement(1, -1), 0);
                expectNextElement(getNextElement(0, -1), 2);
            });

            it('yields first element', () => {
                const getFirstElement = useDropdownNavigation.mock.calls[0][0].getFirstElement;
                expectNextElement(getFirstElement(), 0);
            });

            it('yields last element', () => {
                const getLastElement = useDropdownNavigation.mock.calls[0][0].getLastElement;
                expectNextElement(getLastElement(), 2);
            });

            /* Since it is not possible to simulate the full browser functionality here, we instead mock the
            accessed window parameters */
            // eslint-disable-next-line vitest/max-nested-describe
            describe('scrolls to current active element', () => {
                it('scrolls down if the element is not visible at the bottom of the screen', () => {
                    window.pageYOffset = -1000;
                    window.innerHeight = 400;
                    getNextElement(2, -1);
                    expect(window.scrollTo).toHaveBeenCalledWith(window.pageXOffset, 20 - window.innerHeight);
                });

                it('scrolls up if the element is not visible at the top of the screen', () => {
                    window.pageYOffset = 1000;
                    window.innerHeight = 400;
                    getNextElement(2, -1);
                    expect(window.scrollTo).toHaveBeenCalledWith(window.pageXOffset, -20);
                });
            });
        });

        it('sets aria-owns and aria-activedescendant label', () => {
            const wrapper = mount(ControlMultiselect, { props });
            const button = wrapper.find('[role="button"]');
            const selectedElementId = wrapper.find({ ref: 'optionsPopover' }).find('.focused').element.id;
            expect(button.attributes('aria-owns')).toBe(selectedElementId);
            expect(button.attributes('aria-activedescendant')).toBe(selectedElementId);
        });


        it('resets navigation on toggle', () => {
            const wrapper = mount(ControlMultiselect, { props });
            const button = wrapper.find('[role="button"]');
            button.trigger('click');
            expect(dropdownNavigation.resetNavigation).toHaveBeenCalled();
        });
    });

    it('uses dropdown popper', () => {
        useDropdownPopper.reset();
        const wrapper = mount(ControlMultiselect, { props });
        const [{ popperTarget, referenceEl }] = useDropdownPopper.mock.calls[0];
        
        expect(unref(referenceEl)).toStrictEqual(wrapper.find('[role="button"]').element);
        expect(unref(popperTarget)).toStrictEqual(wrapper.find({ ref: 'optionsPopover' }).element);
    });

    it('uses click outside', () => {
        useClickOutside.reset();
        const wrapper = mount(ControlMultiselect, { props });
        const [{ targets, callback }, active] = useClickOutside.mock.calls[0];
        
        expect(targets.length).toBe(2);
        expect(targets[0].value).toStrictEqual(wrapper.find('[role="button"]').element);
        expect(targets[1].value).toStrictEqual(wrapper.find({ ref: 'optionsPopover' }).element);
        expect(active.value).toBe(wrapper.vm.isExpanded);

        wrapper.vm.toggle();
        expect(wrapper.vm.isExpanded).toBe(true);
        callback();
        expect(wrapper.vm.isExpanded).toBe(false);
    });

    describe('drag reordering', () => {
        it('reorders items on drag', () => {
            const wrapper = mount(ControlMultiselect, { props });
            let dragEvent = {
                dataTransfer: {
                    setDragImage: vi.fn()
                }
            };
            const popover = wrapper.find({ ref: 'optionsPopover' });
            expect(wrapper.emitted().columnReorder).toBeFalsy();
            popover.find('.drag-handle').trigger('dragstart', dragEvent, 0);
            expect(wrapper.vm.dragInd).toBe(0);
            expect(wrapper.vm.dragGhost).toBeTruthy();
            expect(wrapper.emitted().columnReorder).toBeFalsy();
            // test only switching hover ind after halfway over next item
            dragEvent.offsetY = 10;
            let secondItem = popover.findAll('.drag-handle').at(1);
            secondItem.trigger('dragover', dragEvent, 1);
            expect(wrapper.vm.dragInd).toBe(0);
            expect(wrapper.vm.hoverInd).toBe(0);
            expect(wrapper.vm.dragGhost).toBeTruthy();
            expect(wrapper.emitted().columnReorder).toBeFalsy();
            // test only switching hover ind after halfway over next item
            dragEvent.offsetY = 20;
            secondItem.trigger('dragover', dragEvent, 1);
            expect(wrapper.vm.dragInd).toBe(0);
            expect(wrapper.vm.hoverInd).toBe(1);
            expect(wrapper.vm.dragGhost).toBeTruthy();
            expect(wrapper.emitted().columnReorder).toBeFalsy();

            secondItem.trigger('dragend', dragEvent);
            expect(wrapper.vm.dragInd).toBeNull();
            expect(wrapper.vm.hoverInd).toBeNull();
            expect(wrapper.vm.dragGhost).toBeNull();
            expect(wrapper.emitted().columnReorder).toStrictEqual([[0, 2]]);
        });

        it('clears hover ind when drag leaves multiselect', () => {
            const wrapper = mount(ControlMultiselect, { props });
            let dragEvent = {
                dataTransfer: {
                    setDragImage: vi.fn()
                }
            };
            const popover = wrapper.find({ ref: 'optionsPopover' });
            expect(wrapper.emitted().columnReorder).toBeFalsy();

            popover.find('.drag-handle').trigger('dragstart', dragEvent, 0);
            expect(wrapper.vm.dragInd).toBe(0);
            expect(wrapper.vm.dragGhost).toBeTruthy();
            expect(wrapper.emitted().columnReorder).toBeFalsy();
            wrapper.find('.multiselect').trigger('dragleave');
            dragEvent.offsetY = 10;
            let secondItem = popover.findAll('.drag-handle').at(1);
            secondItem.trigger('dragover', dragEvent, 1);
            expect(wrapper.vm.dragInd).toBe(0);
            expect(wrapper.vm.hoverInd).toBe(0);
            expect(wrapper.vm.dragGhost).toBeTruthy();
            expect(wrapper.emitted().columnReorder).toBeFalsy();
            wrapper.find('.multiselect').trigger('dragleave');
            expect(wrapper.vm.hoverInd).toBeNull();
            expect(wrapper.emitted().columnReorder).toBeFalsy();
        });

        it('does not allow reoridering if it is a filter', () => {
            const wrapper = mount(ControlMultiselect, {
                props: {
                    ...props,
                    isFilter: true
                }
            });
            expect(wrapper.find({ ref: 'optionsPopover' }).find('.drag-handle').exists()).toBeFalsy();
        });
    });
});
