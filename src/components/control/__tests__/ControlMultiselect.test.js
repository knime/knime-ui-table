import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import ControlMultiselect from '../ControlMultiselect.vue';

describe('ControlMultiselect.vue', () => {
    it('renders', () => {
        const wrapper = mount(ControlMultiselect, {
            props: {
                possibleValues: [{
                    id: 'test1',
                    text: 'test1'
                }, {
                    id: 'test2',
                    text: 'test2'
                }, {
                    id: 'test3',
                    text: 'test3'
                }]
            }
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.classes()).toContain('multiselect');
    });

    it('renders placeholder until options have been selected', async () => {
        const wrapper = mount(ControlMultiselect, {
            props: {
                possibleValues: [{
                    id: 'test1',
                    text: 'test1'
                }, {
                    id: 'test2',
                    text: 'test2',
                    selectedText: 'Test2'
                }, {
                    id: 'test3',
                    text: 'test3'
                }],
                placeholder: 'Test Title'
            }
        });

        let button = wrapper.find('[role="button"]');
        expect(button.text()).toBe('Test Title');
        expect(button.classes()).toContain('placeholder');

        wrapper.vm.onInput('test1', true);
        await wrapper.vm.$nextTick();
        expect(button.text()).toBe('test1');
        expect(button.classes()).not.toContain('placeholder');
        
        wrapper.vm.onInput('test2', true);
        await wrapper.vm.$nextTick();
        expect(button.text()).toBe('test1, Test2');
        expect(button.classes()).not.toContain('placeholder');
    });

    it('locks placeholder', () => {
        const wrapper = mount(ControlMultiselect, {
            props: {
                possibleValues: [{
                    id: 'test1',
                    text: 'test1'
                }, {
                    id: 'test2',
                    text: 'test2',
                    selectedText: 'Test2'
                }, {
                    id: 'test3',
                    text: 'test3'
                }],
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

    it('emits input events', () => {
        const wrapper = mount(ControlMultiselect, {
            props: {
                possibleValues: [{
                    id: 'test1',
                    text: 'test1'
                }, {
                    id: 'test2',
                    text: 'test2'
                }, {
                    id: 'test3',
                    text: 'test3'
                }]
            }
        });
        wrapper.vm.onInput('test1', true);
        expect(wrapper.emitted()['update:modelValue']).toBeTruthy();
    });

    it('toggles properly', () => {
        const wrapper = mount(ControlMultiselect, {
            props: {
                possibleValues: [{
                    id: 'test1',
                    text: 'test1'
                }, {
                    id: 'test2',
                    text: 'test2'
                }, {
                    id: 'test3',
                    text: 'test3'
                }]
            }
        });
        expect(wrapper.vm.collapsed).toBe(true);
        wrapper.vm.toggle();
        expect(wrapper.vm.collapsed).toBe(false);
        wrapper.vm.toggle();
        expect(wrapper.vm.collapsed).toBe(true);
    });

    it('adds values to the checked values', () => {
        const wrapper = mount(ControlMultiselect, {
            props: {
                possibleValues: [{
                    id: 'test1',
                    text: 'test1'
                }, {
                    id: 'test2',
                    text: 'test2'
                }, {
                    id: 'test3',
                    text: 'test3'
                }]
            }
        });
        wrapper.vm.onInput('test1', true);
        expect(wrapper.vm.checkedValue).toContain('test1');
    });

    it('removes values from the checked values', () => {
        const wrapper = mount(ControlMultiselect, {
            props: {
                possibleValues: [{
                    id: 'test1',
                    text: 'test1'
                }, {
                    id: 'test2',
                    text: 'test2'
                }, {
                    id: 'test3',
                    text: 'test3'
                }]
            }
        });
        wrapper.vm.onInput('test1', true);
        expect(wrapper.vm.checkedValue).toContain('test1');
        expect(wrapper.vm.checkedValue).toHaveLength(1);
        wrapper.vm.onInput('test1', false);
        expect(wrapper.vm.checkedValue).toHaveLength(0);
    });

    describe('keyboard interaction', () => {
        it('show options on space', () => {
            const wrapper = mount(ControlMultiselect, {
                props: {
                    possibleValues: [{
                        id: 'test1',
                        text: 'test1'
                    }, {
                        id: 'test2',
                        text: 'test2'
                    }, {
                        id: 'test3',
                        text: 'test3'
                    }]
                }
            });
            let button = wrapper.find('[role=button]');
            button.trigger('keydown.space');
            expect(wrapper.vm.collapsed).toBe(false);
        });

        it('hide options on esc', () => {
            vi.useFakeTimers();
            const wrapper = mount(ControlMultiselect, {
                props: {
                    possibleValues: [{
                        id: 'test1',
                        text: 'test1'
                    }, {
                        id: 'test2',
                        text: 'test2'
                    }, {
                        id: 'test3',
                        text: 'test3'
                    }]
                }
            });
            let toggleFocusMock = vi.spyOn(wrapper.vm.$refs.toggle, 'focus');
            let button = wrapper.find('[role=button]');
            wrapper.vm.collapsed = false;
            button.trigger('keydown.esc');
            vi.runAllTimers();
            expect(wrapper.vm.collapsed).toBe(true);
            expect(toggleFocusMock).toHaveBeenCalled();
        });

        describe('arrow key navigation', () => {
            it('gets next item to focus', () => {
                const wrapper = mount(ControlMultiselect, {
                    props: {
                        possibleValues: [{
                            id: 'test1',
                            text: 'test1'
                        }, {
                            id: 'test2',
                            text: 'test2'
                        }, {
                            id: 'test3',
                            text: 'test3'
                        }]
                    },
                    attachTo: document.body
                });
                // up and down
                wrapper.vm.focusOptions[1].focus();
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[1]);
                expect(wrapper.vm.getNextElement(-1)).toBe(wrapper.vm.focusOptions[0]);
                expect(wrapper.vm.getNextElement(1)).toBe(wrapper.vm.focusOptions[2]);
                // jumps to end of list
                wrapper.vm.focusOptions[0].focus();
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[0]);
                expect(wrapper.vm.getNextElement(1)).toBe(wrapper.vm.focusOptions[1]);
                expect(wrapper.vm.getNextElement(-1)).toBe(wrapper.vm.focusOptions[2]);
                // jumps to start of list
                wrapper.vm.focusOptions[2].focus();
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[2]);
                expect(wrapper.vm.getNextElement(-1)).toBe(wrapper.vm.focusOptions[1]);
                expect(wrapper.vm.getNextElement(1)).toBe(wrapper.vm.focusOptions[0]);
            });
    
            it('focuses next element on key down', async () => {
                const wrapper = mount(ControlMultiselect, {
                    props: {
                        possibleValues: [{
                            id: 'test1',
                            text: 'test1'
                        }, {
                            id: 'test2',
                            text: 'test2'
                        }, {
                            id: 'test3',
                            text: 'test3'
                        }]
                    },
                    attachTo: document.body
                });
                let onDownMock = vi.spyOn(wrapper.vm, 'onDown');
                expect(wrapper.vm.collapsed).toBe(true);
                await wrapper.setData({ collapsed: false });
                expect(wrapper.vm.collapsed).toBe(false);
                expect(wrapper.vm.focusOptions.length).toBe(3);
                wrapper.vm.focusOptions[0].focus();
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[0]);
    
                wrapper.trigger('keydown.down');
    
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[1]);
                expect(onDownMock).toHaveBeenCalled();
            });
    
            it('focuses previous element on key up', async () => {
                const wrapper = mount(ControlMultiselect, {
                    props: {
                        possibleValues: [{
                            id: 'test1',
                            text: 'test1'
                        }, {
                            id: 'test2',
                            text: 'test2'
                        }, {
                            id: 'test3',
                            text: 'test3'
                        }]
                    },
                    attachTo: document.body
                });
                let onUpMock = vi.spyOn(wrapper.vm, 'onUp');
                expect(wrapper.vm.collapsed).toBe(true);
                await wrapper.setData({ collapsed: false });
                expect(wrapper.vm.collapsed).toBe(false);
                expect(wrapper.vm.focusOptions.length).toBe(3);
                wrapper.vm.focusOptions[1].focus();
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[1]);
    
                wrapper.trigger('keydown.up');
    
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[0]);
                expect(onUpMock).toHaveBeenCalled();
            });
    
            it('focuses first element on key down at list end', async () => {
                const wrapper = mount(ControlMultiselect, {
                    props: {
                        possibleValues: [{
                            id: 'test1',
                            text: 'test1'
                        }, {
                            id: 'test2',
                            text: 'test2'
                        }, {
                            id: 'test3',
                            text: 'test3'
                        }]
                    },
                    attachTo: document.body
                });
                let onDownMock = vi.spyOn(wrapper.vm, 'onDown');
                expect(wrapper.vm.collapsed).toBe(true);
                await wrapper.setData({ collapsed: false });
                expect(wrapper.vm.collapsed).toBe(false);
                expect(wrapper.vm.focusOptions.length).toBe(3);
                wrapper.vm.focusOptions[2].focus();
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[2]);
    
                wrapper.trigger('keydown.down');
    
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[0]);
                expect(onDownMock).toHaveBeenCalled();
            });
    
            it('focuses last element on key up at list start', async () => {
                const wrapper = mount(ControlMultiselect, {
                    props: {
                        possibleValues: [{
                            id: 'test1',
                            text: 'test1'
                        }, {
                            id: 'test2',
                            text: 'test2'
                        }, {
                            id: 'test3',
                            text: 'test3'
                        }]
                    },
                    attachTo: document.body
                });
                let onUpMock = vi.spyOn(wrapper.vm, 'onUp');
                expect(wrapper.vm.collapsed).toBe(true);
                await wrapper.setData({ collapsed: false });
                expect(wrapper.vm.collapsed).toBe(false);
                expect(wrapper.vm.focusOptions.length).toBe(3);
                wrapper.vm.focusOptions[0].focus();
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[0]);
    
                wrapper.trigger('keydown.up');
    
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[2]);
                expect(onUpMock).toHaveBeenCalled();
            });
        });

        describe('drag reordering', () => {
            it('reorders items on drag', () => {
                const wrapper = mount(ControlMultiselect, {
                    props: {
                        possibleValues: [{
                            id: 'test1',
                            text: 'test1'
                        }, {
                            id: 'test2',
                            text: 'test2'
                        }, {
                            id: 'test3',
                            text: 'test3'
                        }]
                    }
                });
                let dragEvent = {
                    dataTransfer: {
                        setDragImage: vi.fn()
                    }
                };
                expect(wrapper.emitted().columnReorder).toBeFalsy();
                wrapper.find('.drag-handle').trigger('dragstart', dragEvent, 0);
                expect(wrapper.vm.dragInd).toBe(0);
                expect(wrapper.vm.dragGhost).toBeTruthy();
                expect(wrapper.emitted().columnReorder).toBeFalsy();
                // test only switching hover ind after halfway over next item
                dragEvent.offsetY = 10;
                let secondItem = wrapper.findAll('.drag-handle').at(1);
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
                const wrapper = mount(ControlMultiselect, {
                    props: {
                        possibleValues: [{
                            id: 'test1',
                            text: 'test1'
                        }, {
                            id: 'test2',
                            text: 'test2'
                        }, {
                            id: 'test3',
                            text: 'test3'
                        }]
                    }
                });
                let dragEvent = {
                    dataTransfer: {
                        setDragImage: vi.fn()
                    }
                };
                expect(wrapper.emitted().columnReorder).toBeFalsy();
                wrapper.find('.drag-handle').trigger('dragstart', dragEvent, 0);
                expect(wrapper.vm.dragInd).toBe(0);
                expect(wrapper.vm.dragGhost).toBeTruthy();
                expect(wrapper.emitted().columnReorder).toBeFalsy();
                wrapper.find('.multiselect').trigger('dragleave');
                dragEvent.offsetY = 10;
                let secondItem = wrapper.findAll('.drag-handle').at(1);
                secondItem.trigger('dragover', dragEvent, 1);
                expect(wrapper.vm.dragInd).toBe(0);
                expect(wrapper.vm.hoverInd).toBe(0);
                expect(wrapper.vm.dragGhost).toBeTruthy();
                expect(wrapper.emitted().columnReorder).toBeFalsy();
                wrapper.find('.multiselect').trigger('dragleave');
                expect(wrapper.vm.hoverInd).toBeNull();
                expect(wrapper.emitted().columnReorder).toBeFalsy();
            });
        });
    });
});
