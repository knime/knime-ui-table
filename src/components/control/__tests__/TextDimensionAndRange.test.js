import { describe, it, expect } from 'vitest';
import TextDimensionAndRange from '../TextDimensionAndRange.vue';

import { shallowMount } from '@vue/test-utils';

describe('TextDimensionAndRange.vue', () => {
    let wrapper;

    it('has dynamic range text without dimension information', async () => {
        wrapper = shallowMount(TextDimensionAndRange, {
            props: {
                totalItems: 100,
                currentItems: 100,
                pageSize: 25,
                currentPage: 1,
                columnCount: 4,
                showTableSize: true,
                pageRangeStart: 1,
                pageRangeEnd: 25
            }
        });
        expect(wrapper.findAll('span').at(0).text()).toBe('Rows: 1-25 of 100');
        await wrapper.setProps({ currentItems: 50 });
        expect(wrapper.findAll('span').at(1).text()).toBe('(100 total)');
        await wrapper.setProps({ currentPage: 2, pageRangeStart: 26, pageRangeEnd: 50 });
        expect(wrapper.findAll('span').at(0).text()).toBe('Rows: 26-50 of 50');
        await wrapper.setProps({ currentItems: 0 });
        expect(wrapper.findAll('span').at(0).text()).toBe('No data (100 hidden)');
    });

    it('has dynamic range text with dimension information', async () => {
        wrapper = shallowMount(TextDimensionAndRange, {
            props: {
                totalItems: 100,
                currentItems: 100,
                pageSize: 25,
                currentPage: 1,
                columnCount: 10,
                showTableSize: true,
                pageRangeStart: 1,
                pageRangeEnd: 25
            }
        });
        expect(wrapper.findAll('span').at(0).text()).toBe('Rows: 1-25 of 100');
        expect(wrapper.findAll('span').at(1).text()).toBe('|   Columns: 10');
        await wrapper.setProps({ currentItems: 50 });
        expect(wrapper.findAll('span').at(0).text()).toBe('Rows: 1-25 of 50');
        expect(wrapper.findAll('span').at(1).text()).toBe('(100 total)');
        expect(wrapper.findAll('span').at(2).text()).toBe('|   Columns: 10');
        await wrapper.setProps({ currentPage: 2, pageRangeStart: 26, pageRangeEnd: 50 });
        expect(wrapper.findAll('span').at(0).text()).toBe('Rows: 26-50 of 50');
        expect(wrapper.findAll('span').at(1).text()).toBe('(100 total)');
        expect(wrapper.findAll('span').at(2).text()).toBe('|   Columns: 10');
        await wrapper.setProps({ currentItems: 0 });
        expect(wrapper.findAll('span').at(0).text()).toBe('No data (100 hidden)');
        expect(wrapper.findAll('span').at(1).text()).toBe('|   Columns: 10');
        await wrapper.setProps({ pageSize: 10, totalItems: 10, currentItems: 10 });
        expect(wrapper.findAll('span').at(0).text()).toBe('Rows: 10');
        expect(wrapper.findAll('span').at(1).text()).toBe('|   Columns: 10');
    });

    it('hides "total" count if 0 rows', () => {
        wrapper = shallowMount(TextDimensionAndRange, {
            props: {
                totalItems: 0,
                currentItems: 0,
                pageSize: 25,
                currentPage: 1,
                columnCount: 4,
                showTableSize: true,
                pageRangeStart: 1,
                pageRangeEnd: 4
            }
        });
        expect(wrapper.find('span').text()).toBe('No data');
        expect(wrapper.find('span').text()).not.toContain('hidden');
    });
});
    
