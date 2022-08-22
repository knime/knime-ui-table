import { shallowMount } from '@vue/test-utils';
import TopControls from '~/components/control/TopControls.vue';
import BaseControls from '~/components/control/BaseControls.vue';
import ControlDropdown from '~/components/control/ControlDropdown.vue';
import ControlMultiselect from '~/components/control/ControlMultiselect.vue';
import FilterInputField from '~/components/filter/FilterInputField.vue';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton.vue';

describe('TopControls.vue', () => {
    let propsData = {
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
        let wrapper = shallowMount(TopControls, { propsData });

        expect(wrapper.find(TopControls).exists()).toBe(true);
        expect(wrapper.find(BaseControls).exists()).toBe(true);
        expect(wrapper.findAll(ControlDropdown).length).toBe(2);
        expect(wrapper.find(ControlMultiselect).exists()).toBe(true);
        expect(wrapper.find(FunctionButton).exists()).toBe(true);
    });

    it('controls component visibility via prop', () => {
        let wrapper = shallowMount(TopControls, { propsData });

        expect(wrapper.find(TopControls).exists()).toBe(true);
        expect(wrapper.find(BaseControls).exists()).toBe(true);
        expect(wrapper.findAll(ControlDropdown).length).toBe(2);
        expect(wrapper.find(ControlMultiselect).exists()).toBe(true);
        expect(wrapper.find(FunctionButton).exists()).toBe(true);
        wrapper.setProps({ tableConfig: {
            ...propsData.tableConfig,
            timeFilterConfig: null
        } });
        expect(wrapper.findAll(ControlDropdown).length).toBe(1);
        wrapper.setProps({ tableConfig: {
            ...propsData.tableConfig,
            columnSelectionConfig: null
        } });
        expect(wrapper.find(ControlMultiselect).exists()).toBe(false);
        wrapper.setProps({ tableConfig: {
            ...propsData.tableConfig,
            groupByConfig: null,
            timeFilterConfig: null
        } });
        expect(wrapper.findAll(ControlDropdown).length).toBe(0);
        wrapper.setProps({ tableConfig: {
            ...propsData.tableConfig,
            searchConfig: null
        } });
        expect(wrapper.find(FunctionButton).exists()).toBe(false);
    });

    it('creates dropdown items when provided with a list of possible values', () => {
        let wrapper = shallowMount(TopControls);
        let columnHeaders = propsData.columnHeaders;
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
            let wrapper = shallowMount(TopControls, { propsData });
            let timeFilterControls = wrapper.findAll(ControlDropdown).at(0);

            expect(wrapper.emitted().timeFilterUpdate).toBeFalsy();
            timeFilterControls.vm.$emit('input', 'Last day');
            expect(wrapper.emitted().timeFilterUpdate[0][0]).toBe('Last day');
        });
    });

    describe('column controls', () => {
        it('emits columnUpdate when selected columns change', () => {
            let wrapper = shallowMount(TopControls, { propsData });

            expect(wrapper.emitted().columnUpdate).toBeFalsy();
            wrapper.find(ControlMultiselect).vm.$emit('input', ['User', 'Workflow']);
            expect(wrapper.emitted().columnUpdate[0][0]).toStrictEqual(['User', 'Workflow']);
        });

        it('emits columnReorder when column order changes', () => {
            let wrapper = shallowMount(TopControls, { propsData });

            expect(wrapper.emitted().columnReorder).toBeFalsy();
            wrapper.find(ControlMultiselect).vm.$emit('columnReorder', 'Workflow', 0);
            expect(wrapper.emitted().columnReorder[0]).toStrictEqual(['Workflow', 0]);
        });
    });

    describe('group controls', () => {
        it('emits groupUpdate when group value is updated', () => {
            let wrapper = shallowMount(TopControls, { propsData });
            let groupFilterControls = wrapper.findAll(ControlDropdown).at(1);

            expect(wrapper.emitted().groupUpdate).toBeFalsy();
            groupFilterControls.vm.$emit('input', 'Location');
            expect(wrapper.emitted().groupUpdate[0][0]).toBe('Location');
        });
    });

    describe('search controls', () => {
        it('toggles the search field visibility on button click', () => {
            let wrapper = shallowMount(TopControls, { propsData });

            expect(wrapper.find(FilterInputField).exists()).toBe(false);
            expect(wrapper.vm.searchActive).toBe(false);
            expect(wrapper.find(FunctionButton).exists()).toBe(true);
            
            wrapper.find(FunctionButton).vm.$emit('click');

            expect(wrapper.find(FilterInputField).exists()).toBe(true);
            expect(wrapper.vm.searchActive).toBe(true);
            expect(wrapper.find(FunctionButton).exists()).toBe(true);
        });

        it('toggles search visibility and clears query on search field blur event', async () => {
            let wrapper = shallowMount(TopControls, { propsData });
            wrapper.setData({ searchActive: true });

            expect(wrapper.find(FilterInputField).exists()).toBe(true);
            expect(wrapper.vm.searchActive).toBe(true);
            expect(wrapper.find(FunctionButton).exists()).toBe(true);
            expect(wrapper.emitted().searchUpdate).toBeFalsy();
            
            wrapper.find(FilterInputField).vm.$emit('blur');

            await wrapper.vm.$nextTick();

            expect(wrapper.find(FilterInputField).exists()).toBe(false);
            expect(wrapper.vm.searchActive).toBe(false);
            expect(wrapper.find(FunctionButton).exists()).toBe(true);
            expect(wrapper.emitted().searchUpdate[0][0]).toBe('');
        });

        it('emits searchUpdate event on search field input', () => {
            let wrapper = shallowMount(TopControls, { propsData });
            wrapper.setData({ searchActive: true });

            expect(wrapper.emitted().searchUpdate).toBeFalsy();
            wrapper.find(FilterInputField).vm.$emit('input', 'Find me');
            expect(wrapper.emitted().searchUpdate[0][0]).toBe('Find me');
        });
    });

    describe('page controls', () => {
        it('emits next and previous page events', () => {
            let nextPageMock = jest.fn();
            let prevPageMock = jest.fn();
            let wrapper = shallowMount(TopControls, {
                propsData,
                listeners: {
                    nextPage: nextPageMock,
                    prevPage: prevPageMock
                }
            });
            expect(nextPageMock).not.toHaveBeenCalled();
            expect(prevPageMock).not.toHaveBeenCalled();
            wrapper.find(BaseControls).vm.$emit('nextPage');
            expect(nextPageMock).toHaveBeenCalled();
            expect(prevPageMock).not.toHaveBeenCalled();
            wrapper.find(BaseControls).vm.$emit('prevPage');
            expect(prevPageMock).toHaveBeenCalled();
        });
    });
});
