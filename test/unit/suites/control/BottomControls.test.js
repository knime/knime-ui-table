/* eslint-disable no-magic-numbers */
import { shallowMount } from '@vue/test-utils';
import BottomControls from '~/components/control/BottomControls';
import BaseControls from '~/components/control/BaseControls';
import ControlDropdown from '~/components/control/ControlDropdown';
import { tablePageSizes } from '~/config/table.config';

describe('BottomControls.vue', () => {
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
        wrapper = shallowMount(BottomControls, { propsData });

        expect(wrapper.find(BottomControls).exists()).toBe(true);
        expect(wrapper.find(BaseControls).exists()).toBe(true);
        expect(wrapper.find(ControlDropdown).exists()).toBe(true);
    });

    it('creates page size text for display in the page size dropdown', () => {
        wrapper = shallowMount(BottomControls, { propsData });
        expect(wrapper.vm.createText(50)).toBe('50 per page');
        expect(wrapper.vm.createText(5)).toBe('5 per page');
    });

    it('parses page size text for consumption by the parent table', () => {
        wrapper = shallowMount(BottomControls, { propsData });
        expect(wrapper.vm.parseSize('50 per page')).toBe(50);
        expect(wrapper.vm.parseSize('5 per page')).toBe(5);
    });

    it('creates dropdown items when provided with a list of page sizes', () => {
        wrapper = shallowMount(BottomControls, { propsData });
        let items = wrapper.vm.getSelectItems(tablePageSizes);
        items.forEach((item, itemInd) => {
            expect(item).toStrictEqual({
                id: tablePageSizes[itemInd],
                text: tablePageSizes[itemInd]
            });
        });
    });

    it('emits pageSizeUpdate events', () => {
        wrapper = shallowMount(BottomControls, { propsData });
        expect(wrapper.emitted().prevPage).toBeFalsy();
        wrapper.find(ControlDropdown).vm.$emit('input', '50 per page');
        expect(wrapper.emitted().pageSizeUpdate[0][0]).toBe(50);
    });

    it('emits next and previous page events', () => {
        let nextPageMock = jest.fn();
        let prevPageMock = jest.fn();
        wrapper = shallowMount(BottomControls, {
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
