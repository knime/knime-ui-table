import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import BottomControls from '@/components/control/BottomControls.vue';
import BaseControls from '@/components/control/BaseControls.vue';
import ControlDropdown from '@/components/control/ControlDropdown.vue';
import { tablePageSizes } from '@/config/table.config';

describe('BottomControls.vue', () => {
    let wrapper;
    let props = {
        pageConfig: {
            tableSize: 100,
            currentSize: 100,
            possiblePageSizes: tablePageSizes,
            pageSize: 25,
            currentPage: 1
        }
    };

    it('renders table bottom controls', () => {
        wrapper = shallowMount(BottomControls, { props });

        expect(wrapper.findComponent(BottomControls).exists()).toBe(true);
        expect(wrapper.findComponent(BaseControls).exists()).toBe(true);
        expect(wrapper.findComponent(ControlDropdown).exists()).toBe(true);
    });

    it('creates page size text for display in the page size dropdown', () => {
        wrapper = shallowMount(BottomControls, { props });
        expect(wrapper.vm.createText(50)).toBe('50 per page');
        expect(wrapper.vm.createText(5)).toBe('5 per page');
    });

    it('parses page size text for consumption by the parent table', () => {
        wrapper = shallowMount(BottomControls, { props });
        expect(wrapper.vm.parseSize('50 per page')).toBe(50);
        expect(wrapper.vm.parseSize('5 per page')).toBe(5);
    });

    it('creates dropdown items when provided with a list of page sizes', () => {
        wrapper = shallowMount(BottomControls, { props });
        let items = wrapper.vm.getSelectItems(tablePageSizes);
        items.forEach((item, itemInd) => {
            expect(item).toStrictEqual({
                id: tablePageSizes[itemInd],
                text: tablePageSizes[itemInd]
            });
        });
    });

    it('emits pageSizeUpdate events', () => {
        wrapper = shallowMount(BottomControls, { props });
        expect(wrapper.emitted().prevPage).toBeFalsy();
        wrapper.findComponent(ControlDropdown).vm.$emit('update:modelValue', '50 per page');
        expect(wrapper.emitted().pageSizeUpdate[0][0]).toBe(50);
    });

    it('emits next and previous page events', () => {
        let nextPageMock = vi.fn();
        let prevPageMock = vi.fn();
        wrapper = shallowMount(BottomControls, {
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
