import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import TopControls from '../TopControls.vue';
import BaseControls from '../BaseControls.vue';
import ControlDropdown from '../ControlDropdown.vue';
import ControlMultiselect from '../ControlMultiselect.vue';
import FilterInputField from '@/components/filter/FilterInputField.vue';
import FunctionButton from 'webapps-common/ui/components/FunctionButton.vue';


describe('TopControls.vue', () => {
    let props = {
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

    it('renders table top controls', () => {
        let wrapper = shallowMount(TopControls, {
            props
        });

        expect(wrapper.findComponent(TopControls).exists()).toBe(true);
        expect(wrapper.findComponent(BaseControls).exists()).toBe(true);
        expect(wrapper.findAllComponents(ControlDropdown).length).toBe(2);
        expect(wrapper.findComponent(ControlMultiselect).exists()).toBe(true);
        expect(wrapper.findComponent(FunctionButton).exists()).toBe(true);
    });

    it('controls component visibility via prop', async () => {
        let wrapper = shallowMount(TopControls, { props });

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
            let wrapper = shallowMount(TopControls, { props });
            let timeFilterControls = wrapper.findAllComponents(ControlDropdown).at(0);

            expect(wrapper.emitted().timeFilterUpdate).toBeFalsy();
            timeFilterControls.vm.$emit('update:model-value', 'Last day');
            expect(wrapper.emitted().timeFilterUpdate[0][0]).toBe('Last day');
        });
    });

    describe('column controls', () => {
        it('emits columnUpdate when selected columns change', () => {
            let wrapper = shallowMount(TopControls, { props });

            expect(wrapper.emitted().columnUpdate).toBeFalsy();
            wrapper.findComponent(ControlMultiselect).vm.$emit('update:model-value', ['User', 'Workflow']);
            expect(wrapper.emitted().columnUpdate[0][0]).toStrictEqual(['User', 'Workflow']);
        });

        it('emits columnReorder when column order changes', () => {
            let wrapper = shallowMount(TopControls, { props });

            expect(wrapper.emitted().columnReorder).toBeFalsy();
            wrapper.findComponent(ControlMultiselect).vm.$emit('columnReorder', 'Workflow', 0);
            expect(wrapper.emitted().columnReorder[0]).toStrictEqual(['Workflow', 0]);
        });
    });

    describe('group controls', () => {
        it('emits groupUpdate when group value is updated', () => {
            let wrapper = shallowMount(TopControls, { props });
            let groupFilterControls = wrapper.findAllComponents(ControlDropdown).at(1);

            expect(wrapper.emitted().groupUpdate).toBeFalsy();
            groupFilterControls.vm.$emit('update:model-value', 'Location');
            expect(wrapper.emitted().groupUpdate[0][0]).toBe('Location');
        });
    });

    describe('search controls', () => {
        it('toggles the search field visibility on button click', async () => {
            let wrapper = shallowMount(TopControls, { props });

            expect(wrapper.findComponent(FilterInputField).exists()).toBe(false);
            expect(wrapper.vm.searchActive).toBe(false);
            expect(wrapper.findComponent(FunctionButton).exists()).toBe(true);
            
            await wrapper.findComponent(FunctionButton).vm.$emit('click');

            expect(wrapper.findComponent(FilterInputField).exists()).toBe(true);
            expect(wrapper.vm.searchActive).toBe(true);
            expect(wrapper.findComponent(FunctionButton).exists()).toBe(true);
        });

        it('toggles search visibility and clears query on search field blur event', async () => {
            let wrapper = shallowMount(TopControls, { props });
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
            let wrapper = shallowMount(TopControls, { props });
            await wrapper.setData({ searchActive: true });

            
            expect(wrapper.emitted().searchUpdate).toBeFalsy();
            wrapper.findComponent(FilterInputField).vm.$emit('input', 'Find me');
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
});