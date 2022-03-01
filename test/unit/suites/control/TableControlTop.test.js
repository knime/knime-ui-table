import { shallowMount } from '@vue/test-utils';
import TableControlTop from '~/components/control/TableControlTop';
import TableControlsBase from '~/components/control/TableControlBase';
import TableControlDropdown from '~/components/control/TableControlDropdown';
import TableControlMultiselect from '~/components/control/TableControlMultiselect';
import TableFilterInputField from '~/components/filter/TableFilterInputField';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton';

describe('TableControlTop.vue', () => {
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
        // totalItems: 100,
        // currentItems: 100,
        // pageSize: 25,
        // currentPage: 1,
        // allColumns,
        // currentColumns,
        // allGroups,
        // currentGroups,
        // showSearch: true,
        // timeFilter: 'Last month'
    };

    it('renders table top controls', () => {
        let wrapper = shallowMount(TableControlTop, { propsData });

        expect(wrapper.find(TableControlTop).exists()).toBe(true);
        expect(wrapper.find(TableControlsBase).exists()).toBe(true);
        expect(wrapper.findAll(TableControlDropdown).length).toBe(2);
        expect(wrapper.find(TableControlMultiselect).exists()).toBe(true);
        expect(wrapper.find(FunctionButton).exists()).toBe(true);
    });

    it('controls component visibility via prop', () => {
        let wrapper = shallowMount(TableControlTop, { propsData });

        expect(wrapper.find(TableControlTop).exists()).toBe(true);
        expect(wrapper.find(TableControlsBase).exists()).toBe(true);
        expect(wrapper.findAll(TableControlDropdown).length).toBe(2);
        expect(wrapper.find(TableControlMultiselect).exists()).toBe(true);
        expect(wrapper.find(FunctionButton).exists()).toBe(true);
        wrapper.setProps({ tableConfig: {
            ...propsData.tableConfig,
            timeFilterConfig: null
        } });
        expect(wrapper.findAll(TableControlDropdown).length).toBe(1);
        wrapper.setProps({ tableConfig: {
            ...propsData.tableConfig,
            columnSelectionConfig: null
        } });
        expect(wrapper.find(TableControlMultiselect).exists()).toBe(false);
        wrapper.setProps({ tableConfig: {
            ...propsData.tableConfig,
            groupByConfig: null,
            timeFilterConfig: null
        } });
        expect(wrapper.findAll(TableControlDropdown).length).toBe(0);
        wrapper.setProps({ tableConfig: {
            ...propsData.tableConfig,
            searchConfig: null
        } });
        expect(wrapper.find(FunctionButton).exists()).toBe(false);
    });

    it('creates dropdown items when provided with a list of possible values', () => {
        let wrapper = shallowMount(TableControlTop);
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
            let wrapper = shallowMount(TableControlTop, { propsData });
            let timeFilterControls = wrapper.findAll(TableControlDropdown).at(0);

            expect(wrapper.emitted().timeFilterUpdate).toBeFalsy();
            timeFilterControls.vm.$emit('input', 'Last day');
            expect(wrapper.emitted().timeFilterUpdate[0][0]).toBe('Last day');
        });
    });

    describe('column controls', () => {
        it('emits columnUpdate when selected columns change', () => {
            let wrapper = shallowMount(TableControlTop, { propsData });

            expect(wrapper.emitted().columnUpdate).toBeFalsy();
            wrapper.find(TableControlMultiselect).vm.$emit('input', ['User', 'Workflow']);
            expect(wrapper.emitted().columnUpdate[0][0]).toStrictEqual(['User', 'Workflow']);
        });

        it('emits columnReorder when column order changes', () => {
            let wrapper = shallowMount(TableControlTop, { propsData });

            expect(wrapper.emitted().columnReorder).toBeFalsy();
            wrapper.find(TableControlMultiselect).vm.$emit('columnReorder', 'Workflow', 0);
            expect(wrapper.emitted().columnReorder[0]).toStrictEqual(['Workflow', 0]);
        });
    });

    describe('group controls', () => {
        it('emits groupUpdate when group value is updated', () => {
            let wrapper = shallowMount(TableControlTop, { propsData });
            let groupFilterControls = wrapper.findAll(TableControlDropdown).at(1);

            expect(wrapper.emitted().groupUpdate).toBeFalsy();
            groupFilterControls.vm.$emit('input', 'Location');
            expect(wrapper.emitted().groupUpdate[0][0]).toBe('Location');
        });
    });

    describe('search controls', () => {
        it('toggles the search field visibility on button click', () => {
            let wrapper = shallowMount(TableControlTop, { propsData });

            expect(wrapper.find(TableFilterInputField).exists()).toBe(false);
            expect(wrapper.vm.searchActive).toBe(false);
            expect(wrapper.find(FunctionButton).exists()).toBe(true);
            
            wrapper.find(FunctionButton).vm.$emit('click');

            expect(wrapper.find(TableFilterInputField).exists()).toBe(true);
            expect(wrapper.vm.searchActive).toBe(true);
            expect(wrapper.find(FunctionButton).exists()).toBe(true);
        });

        it('toggles search visibility and clears query on search field blur event', async () => {
            let wrapper = shallowMount(TableControlTop, { propsData });
            wrapper.setData({ searchActive: true });

            expect(wrapper.find(TableFilterInputField).exists()).toBe(true);
            expect(wrapper.vm.searchActive).toBe(true);
            expect(wrapper.find(FunctionButton).exists()).toBe(true);
            expect(wrapper.emitted().searchUpdate).toBeFalsy();
            
            wrapper.find(TableFilterInputField).vm.$emit('blur');

            await wrapper.vm.$nextTick();

            expect(wrapper.find(TableFilterInputField).exists()).toBe(false);
            expect(wrapper.vm.searchActive).toBe(false);
            expect(wrapper.find(FunctionButton).exists()).toBe(true);
            expect(wrapper.emitted().searchUpdate[0][0]).toBe('');
        });

        it('emits searchUpdate event on search field input', () => {
            let wrapper = shallowMount(TableControlTop, { propsData });
            wrapper.setData({ searchActive: true });

            expect(wrapper.emitted().searchUpdate).toBeFalsy();
            wrapper.find(TableFilterInputField).vm.$emit('input', 'Find me');
            expect(wrapper.emitted().searchUpdate[0][0]).toBe('Find me');
        });
    });

    describe('page controls', () => {
        it('emits next and previous page events', () => {
            let nextPageMock = jest.fn();
            let prevPageMock = jest.fn();
            let wrapper = shallowMount(TableControlTop, {
                propsData,
                listeners: {
                    nextPage: nextPageMock,
                    prevPage: prevPageMock
                }
            });
            expect(nextPageMock).not.toHaveBeenCalled();
            expect(prevPageMock).not.toHaveBeenCalled();
            wrapper.find(TableControlsBase).vm.$emit('nextPage');
            expect(nextPageMock).toHaveBeenCalled();
            expect(prevPageMock).not.toHaveBeenCalled();
            wrapper.find(TableControlsBase).vm.$emit('prevPage');
            expect(prevPageMock).toHaveBeenCalled();
        });
    });
});
