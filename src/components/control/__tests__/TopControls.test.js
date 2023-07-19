import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';

import TopControls from '../TopControls.vue';
import BaseControls from '../BaseControls.vue';
import ControlDropdown from '../ControlDropdown.vue';
import ControlMultiselect from '../ControlMultiselect.vue';
import FilterInputField from '@/components/filter/FilterInputField.vue';
import FunctionButton from 'webapps-common/ui/components/FunctionButton.vue';


describe('TopControls.vue', () => {
    let props;

    beforeEach(() => {
        props = {
            tableConfig: {
                pageConfig: {
                    totalItems: 100,
                    currentItems: 100,
                    pageSize: 25,
                    currentPage: 1
                },
                searchConfig: {
                    searchQuery: ''
                },
                timeFilterConfig: {
                    currentTimeFilter: 'Last month'
                },
                columnSelectionConfig: {
                    possibleColumns: []
                },
                groupByConfig: {
                    currentGroup: '',
                    possibleGroups: []
                }
            },
            columnHeaders: ['Workflow', 'User', 'Date']
        };
    });

    it('renders table top controls', () => {
        let wrapper = mount(TopControls, {
            props
        });

        expect(wrapper.findComponent(TopControls).exists()).toBe(true);
        expect(wrapper.findComponent(BaseControls).exists()).toBe(true);
        expect(wrapper.findAllComponents(ControlDropdown).length).toBe(2);
        expect(wrapper.findComponent(ControlMultiselect).exists()).toBe(true);
        expect(wrapper.findComponent(FunctionButton).exists()).toBe(true);
    });

    it('controls component visibility via prop', async () => {
        let wrapper = mount(TopControls, { props });

        expect(wrapper.findComponent(TopControls).exists()).toBe(true);
        expect(wrapper.findComponent(BaseControls).exists()).toBe(true);
        expect(wrapper.findAllComponents(ControlDropdown).length).toBe(2);
        expect(wrapper.findComponent(ControlMultiselect).exists()).toBe(true);
        expect(wrapper.findComponent(FunctionButton).exists()).toBe(true);
        await wrapper.setProps({ tableConfig: {
            ...props.tableConfig,
            timeFilterConfig: null
        } });
        expect(wrapper.findAllComponents(ControlDropdown).length).toBe(1);
        await wrapper.setProps({ tableConfig: {
            ...props.tableConfig,
            columnSelectionConfig: null
        } });
        expect(wrapper.findComponent(ControlMultiselect).exists()).toBe(false);
        await wrapper.setProps({ tableConfig: {
            ...props.tableConfig,
            groupByConfig: null,
            timeFilterConfig: null
        } });
        expect(wrapper.findAllComponents(ControlDropdown).length).toBe(0);
        await wrapper.setProps({ tableConfig: {
            ...props.tableConfig,
            searchConfig: null
        } });
        expect(wrapper.findComponent(FunctionButton).exists()).toBe(false);
    });

    it('creates dropdown items when provided with a list of possible values', () => {
        let wrapper = shallowMount(TopControls);
        let columnHeaders = props.columnHeaders;
        let items = wrapper.vm.getSelectItems(columnHeaders);
        items.forEach((item, itemInd) => {
            expect(item).toStrictEqual({
                id: columnHeaders[itemInd],
                text: columnHeaders[itemInd]
            });
        });
    });

    describe('time controls', () => {
        it('emits timeFilterUpdate when timeFilter value is updated', () => {
            let wrapper = mount(TopControls, { props });
            let timeFilterControls = wrapper.findAllComponents(ControlDropdown).at(0);

            expect(wrapper.emitted().timeFilterUpdate).toBeFalsy();
            timeFilterControls.vm.$emit('update:modelValue', 'Last day');
            expect(wrapper.emitted().timeFilterUpdate[0][0]).toBe('Last day');
        });
    });

    describe('column controls', () => {
        it('emits columnUpdate when selected columns change', () => {
            let wrapper = mount(TopControls, { props });

            expect(wrapper.emitted().columnUpdate).toBeFalsy();
            wrapper.findComponent(ControlMultiselect).vm.$emit('update:modelValue', ['User', 'Workflow']);
            expect(wrapper.emitted().columnUpdate[0][0]).toStrictEqual(['User', 'Workflow']);
        });

        it('emits columnReorder when column order changes', () => {
            let wrapper = mount(TopControls, { props });

            expect(wrapper.emitted().columnReorder).toBeFalsy();
            wrapper.findComponent(ControlMultiselect).vm.$emit('columnReorder', 'Workflow', 0);
            expect(wrapper.emitted().columnReorder[0]).toStrictEqual(['Workflow', 0]);
        });
    });

    describe('group controls', () => {
        it('emits groupUpdate when group value is updated', () => {
            let wrapper = mount(TopControls, { props });
            let groupFilterControls = wrapper.findAllComponents(ControlDropdown).at(1);

            expect(wrapper.emitted().groupUpdate).toBeFalsy();
            groupFilterControls.vm.$emit('update:modelValue', 'Location');
            expect(wrapper.emitted().groupUpdate[0][0]).toBe('Location');
        });
    });

    describe('search controls', () => {
        it('toggles the search field visibility on button click', async () => {
            let wrapper = mount(TopControls, { props });

            expect(wrapper.findComponent(FilterInputField).exists()).toBe(false);
            expect(wrapper.vm.searchActive).toBe(false);
            expect(wrapper.findComponent(FunctionButton).exists()).toBe(true);
            
            await wrapper.findComponent(FunctionButton).vm.$emit('click');

            expect(wrapper.findComponent(FilterInputField).exists()).toBe(true);
            expect(wrapper.vm.searchActive).toBe(true);
            expect(wrapper.findComponent(FunctionButton).exists()).toBe(true);
        });

        it('toggles search visibility and clears query on search field blur event', async () => {
            let wrapper = mount(TopControls, { props });
            await wrapper.setData({ searchActive: true });

            expect(wrapper.findComponent(FilterInputField).exists()).toBe(true);
            expect(wrapper.vm.searchActive).toBe(true);
            expect(wrapper.findComponent(FunctionButton).exists()).toBe(true);
            expect(wrapper.emitted().searchUpdate).toBeFalsy();
            
            wrapper.findComponent(FilterInputField).vm.$emit('blur');

            await wrapper.vm.$nextTick();

            expect(wrapper.findComponent(FilterInputField).exists()).toBe(false);
            expect(wrapper.vm.searchActive).toBe(false);
            expect(wrapper.findComponent(FunctionButton).exists()).toBe(true);
            expect(wrapper.emitted().searchUpdate[0][0]).toBe('');
        });

        it('emits searchUpdate event on search field input', async () => {
            let wrapper = mount(TopControls, { props });
            await wrapper.setData({ searchActive: true });
         
            expect(wrapper.emitted().searchUpdate).toBeFalsy();
            wrapper.findComponent(FilterInputField).vm.$emit('update:modelValue', 'Find me');
            expect(wrapper.emitted().searchUpdate[0][0]).toBe('Find me');
        });
    });

    describe('page controls', () => {
        it('emits next and previous page events', () => {
            let nextPageMock = vi.fn();
            let prevPageMock = vi.fn();
            let wrapper = shallowMount(TopControls, {
                props: {
                    ...props,
                    onNextPage: nextPageMock,
                    onPrevPage: prevPageMock
                }
            });
            expect(nextPageMock).not.toHaveBeenCalled();
            expect(prevPageMock).not.toHaveBeenCalled();
            wrapper.findComponent(BaseControls).vm.$emit('nextPage');
            expect(nextPageMock).toHaveBeenCalled();
            expect(prevPageMock).not.toHaveBeenCalled();
            wrapper.findComponent(BaseControls).vm.$emit('prevPage');
            expect(prevPageMock).toHaveBeenCalled();
        });
    });

    describe('hide top controls', () => {
        beforeEach(() => {
            props.tableConfig.pageConfig = {
                showTableSize: false,
                pageSize: 10,
                currentSize: 10
            };
            props.tableConfig.searchConfig = null;
            props.tableConfig.groupByConfig = null;
            props.tableConfig.timeFilterConfig = null;
            props.tableConfig.columnSelectionConfig = null;
        });

        it('hides element when no data to be displayed', () => {
            const wrapper = shallowMount(TopControls, { props });

            expect(wrapper.findComponent(BaseControls).exists()).toBeFalsy();
        });

        it('shows TopControls when showTableSize is on and pagination and search are off', () => {
            props.tableConfig.pageConfig.showTableSize = true;
            const wrapper = shallowMount(TopControls, { props });
    
            expect(wrapper.findComponent(BaseControls).exists()).toBeTruthy();
        });

        it('shows TopControls when pagination is on and search and showTableSize are off', () => {
            props.tableConfig.pageConfig = {
                showTableSize: false,
                pageSize: 2,
                currentSize: 4
            };
            const wrapper = shallowMount(TopControls, { props });
    
            expect(wrapper.findComponent(BaseControls).exists()).toBeTruthy();
        });

        it('shows TopControls when search is enabled', () => {
            props.tableConfig.searchConfig = {};
            const wrapper = shallowMount(TopControls, { props });
    
            expect(wrapper.findComponent(BaseControls).exists()).toBeTruthy();
        });

        it('shows TopControls when time filters are enabled', () => {
            props.tableConfig.timeFilterConfig = {};
            const wrapper = shallowMount(TopControls, { props });
    
            expect(wrapper.findComponent(BaseControls).exists()).toBeTruthy();
        });

        it('shows TopControls when column selection is enabled', () => {
            props.tableConfig.columnSelectionConfig = {};
            const wrapper = shallowMount(TopControls, { props });
    
            expect(wrapper.findComponent(BaseControls).exists()).toBeTruthy();
        });

        it('shows TopControls when grouping is enabled', () => {
            props.tableConfig.groupByConfig = {};
            const wrapper = shallowMount(TopControls, { props });
    
            expect(wrapper.findComponent(BaseControls).exists()).toBeTruthy();
        });
    });
});
