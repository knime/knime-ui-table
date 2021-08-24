import { mount, createLocalVue } from '@vue/test-utils';

const localVue = createLocalVue();

import TableControlMultiselect from '~/components/table/control/TableControlMultiselect';

describe('TableControlMultiselect.vue', () => {
    it('renders', () => {
        const wrapper = mount(TableControlMultiselect, {
            propsData: {
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
            localVue
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.classes()).toContain('multiselect');
    });

    it('renders placeholder until options have been selected', () => {
        const wrapper = mount(TableControlMultiselect, {
            propsData: {
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
            },
            localVue
        });

        let button = wrapper.find('[role="button"]');
        expect(button.text()).toBe('Test Title');
        expect(button.classes()).toContain('placeholder');

        wrapper.vm.onInput('test1', true);
        expect(button.text()).toBe('test1');
        expect(button.classes()).not.toContain('placeholder');
        
        wrapper.vm.onInput('test2', true);
        expect(button.text()).toBe('test1, Test2');
        expect(button.classes()).not.toContain('placeholder');
    });

    it('locks placeholder', () => {
        const wrapper = mount(TableControlMultiselect, {
            propsData: {
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
            },
            localVue
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
        const wrapper = mount(TableControlMultiselect, {
            propsData: {
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
            localVue
        });
        wrapper.vm.onInput('test1', true);
        expect(wrapper.emitted().input).toBeTruthy();
    });

    it('toggles properly', () => {
        const wrapper = mount(TableControlMultiselect, {
            propsData: {
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
            localVue
        });
        expect(wrapper.vm.collapsed).toBe(true);
        wrapper.vm.toggle();
        expect(wrapper.vm.collapsed).toBe(false);
        wrapper.vm.toggle();
        expect(wrapper.vm.collapsed).toBe(true);
    });

    it('adds values to the checked values', () => {
        const wrapper = mount(TableControlMultiselect, {
            propsData: {
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
            localVue
        });
        wrapper.vm.onInput('test1', true);
        expect(wrapper.vm.checkedValue).toContain('test1');
    });

    it('removes values from the checked values', () => {
        const wrapper = mount(TableControlMultiselect, {
            propsData: {
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
            localVue
        });
        wrapper.vm.onInput('test1', true);
        expect(wrapper.vm.checkedValue).toContain('test1');
        expect(wrapper.vm.checkedValue).toHaveLength(1);
        wrapper.vm.onInput('test1', false);
        expect(wrapper.vm.checkedValue).toHaveLength(0);
    });

    describe('keyboard interaction', () => {
        it('show options on space', () => {
            const wrapper = mount(TableControlMultiselect, {
                propsData: {
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
                localVue
            });
            let button = wrapper.find('[role=button]');
            button.trigger('keydown.space');
            expect(wrapper.vm.collapsed).toBe(false);
        });

        it('hide options on esc', () => {
            jest.useFakeTimers();
            const wrapper = mount(TableControlMultiselect, {
                propsData: {
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
                localVue
            });
            let toggleFocusMock = jest.spyOn(wrapper.vm.$refs.toggle, 'focus');
            let button = wrapper.find('[role=button]');
            wrapper.vm.collapsed = false;
            button.trigger('keydown.esc');
            jest.runAllTimers();
            expect(wrapper.vm.collapsed).toBe(true);
            expect(toggleFocusMock).toHaveBeenCalled();
        });

        describe('arrow key navigation', () => {
            it('gets next item to focus', () => {
                const wrapper = mount(TableControlMultiselect, {
                    propsData: {
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
                    localVue
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
    
            it('focuses next element on key down', () => {
                const wrapper = mount(TableControlMultiselect, {
                    propsData: {
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
                    localVue
                });
                let onDownMock = jest.spyOn(wrapper.vm, 'onDown');
                expect(wrapper.vm.collapsed).toBe(true);
                wrapper.setData({ collapsed: false });
                expect(wrapper.vm.collapsed).toBe(false);
                // eslint-disable-next-line no-magic-numbers
                expect(wrapper.vm.focusOptions.length).toBe(3);
                wrapper.vm.focusOptions[0].focus();
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[0]);
    
                wrapper.trigger('keydown.down');
    
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[1]);
                expect(onDownMock).toHaveBeenCalled();
            });
    
            it('focuses previous element on key up', () => {
                const wrapper = mount(TableControlMultiselect, {
                    propsData: {
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
                    localVue
                });
                let onUpMock = jest.spyOn(wrapper.vm, 'onUp');
                expect(wrapper.vm.collapsed).toBe(true);
                wrapper.setData({ collapsed: false });
                expect(wrapper.vm.collapsed).toBe(false);
                // eslint-disable-next-line no-magic-numbers
                expect(wrapper.vm.focusOptions.length).toBe(3);
                wrapper.vm.focusOptions[1].focus();
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[1]);
    
                wrapper.trigger('keydown.up');
    
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[0]);
                expect(onUpMock).toHaveBeenCalled();
            });
    
            it('focuses first element on key down at list end', () => {
                const wrapper = mount(TableControlMultiselect, {
                    propsData: {
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
                    localVue
                });
                let onDownMock = jest.spyOn(wrapper.vm, 'onDown');
                expect(wrapper.vm.collapsed).toBe(true);
                wrapper.setData({ collapsed: false });
                expect(wrapper.vm.collapsed).toBe(false);
                // eslint-disable-next-line no-magic-numbers
                expect(wrapper.vm.focusOptions.length).toBe(3);
                wrapper.vm.focusOptions[2].focus();
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[2]);
    
                wrapper.trigger('keydown.down');
    
                expect(document.activeElement).toBe(wrapper.vm.focusOptions[0]);
                expect(onDownMock).toHaveBeenCalled();
            });
    
            it('focuses last element on key up at list start', () => {
                const wrapper = mount(TableControlMultiselect, {
                    propsData: {
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
                    localVue
                });
                let onUpMock = jest.spyOn(wrapper.vm, 'onUp');
                expect(wrapper.vm.collapsed).toBe(true);
                wrapper.setData({ collapsed: false });
                expect(wrapper.vm.collapsed).toBe(false);
                // eslint-disable-next-line no-magic-numbers
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
                const wrapper = mount(TableControlMultiselect, {
                    propsData: {
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
                    localVue
                });
                let dragEvent = {
                    dataTransfer: {
                        setDragImage: jest.fn()
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
                expect(wrapper.vm.dragInd).toBe(null);
                expect(wrapper.vm.hoverInd).toBe(null);
                expect(wrapper.vm.dragGhost).toBe(null);
                expect(wrapper.emitted().columnReorder).toStrictEqual([[0, 2]]);
            });

            it('clears hover ind when drag leaves multiselect', () => {
                const wrapper = mount(TableControlMultiselect, {
                    propsData: {
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
                    localVue
                });
                let dragEvent = {
                    dataTransfer: {
                        setDragImage: jest.fn()
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
                expect(wrapper.vm.hoverInd).toBe(null);
                expect(wrapper.emitted().columnReorder).toBeFalsy();
            });
        });
    });
});
