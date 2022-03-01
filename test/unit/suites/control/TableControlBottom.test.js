/* eslint-disable no-magic-numbers */
import { shallowMount } from '@vue/test-utils';
import TableControlBottom from '~/components/control/TableControlBottom';
import TableControlsBase from '~/components/control/TableControlBase';
import TableControlDropdown from '~/components/control/TableControlDropdown';
import { tablePageSizes } from '~/config/table.config';

describe('TableControlBottom.vue', () => {
    let wrapper;
    let propsData = {
        pageConfig: {
            tableSize: 100,
            currentSize: 100,
            possiblePageSizes: tablePageSizes,
            pageSize: 25,
            currentPage: 1
        }
    };

    it('renders table bottom controls', () => {
        wrapper = shallowMount(TableControlBottom, { propsData });

        expect(wrapper.find(TableControlBottom).exists()).toBe(true);
        expect(wrapper.find(TableControlsBase).exists()).toBe(true);
        expect(wrapper.find(TableControlDropdown).exists()).toBe(true);
    });

    it('creates page size text for display in the page size dropdown', () => {
        wrapper = shallowMount(TableControlBottom, { propsData });
        expect(wrapper.vm.createText(50)).toBe('50 per page');
        expect(wrapper.vm.createText(5)).toBe('5 per page');
    });

    it('parses page size text for consumption by the parent table', () => {
        wrapper = shallowMount(TableControlBottom, { propsData });
        expect(wrapper.vm.parseSize('50 per page')).toBe(50);
        expect(wrapper.vm.parseSize('5 per page')).toBe(5);
    });

    it('creates dropdown items when provided with a list of page sizes', () => {
        wrapper = shallowMount(TableControlBottom, { propsData });
        let items = wrapper.vm.getSelectItems(tablePageSizes);
        items.forEach((item, itemInd) => {
            expect(item).toStrictEqual({
                id: tablePageSizes[itemInd],
                text: tablePageSizes[itemInd]
            });
        });
    });

    it('emits pageSizeUpdate events', () => {
        wrapper = shallowMount(TableControlBottom, { propsData });
        expect(wrapper.emitted().prevPage).toBeFalsy();
        wrapper.find(TableControlDropdown).vm.$emit('input', '50 per page');
        expect(wrapper.emitted().pageSizeUpdate[0][0]).toBe(50);
    });

    it('emits next and previous page events', () => {
        let nextPageMock = jest.fn();
        let prevPageMock = jest.fn();
        wrapper = shallowMount(TableControlBottom, {
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
