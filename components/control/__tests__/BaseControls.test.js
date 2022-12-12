import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import BaseControls from '../BaseControls.vue';
import PageControls from '../PageControls.vue';

describe('BaseControls.vue', () => {
    let wrapper;

    it('renders page controls', () => {
        wrapper = shallowMount(BaseControls, {
            props: {
                totalItems: 100,
                currentItems: 100,
                pageSize: 25,
                currentPage: 1
            },
            slots: {
                default: '<h3>This is a Slot!</h3>'
            }
        });

        expect(wrapper.findComponent(BaseControls).exists()).toBe(true);
        expect(wrapper.findComponent(PageControls).exists()).toBe(true);
        expect(wrapper.find('h3').exists()).toBe(true);
    });

    it('emits next and previous page events', () => {
        wrapper = shallowMount(BaseControls, {
            props: {
                totalItems: 100,
                currentItems: 100,
                pageSize: 25,
                currentPage: 1
            },
            slots: {
                default: '<h3>This is a Slot!</h3>'
            }
        });
        expect(wrapper.emitted().nextPage).toBeFalsy();
        expect(wrapper.emitted().prevPage).toBeFalsy();
        wrapper.findComponent(PageControls).vm.$emit('nextPage');
        expect(wrapper.emitted().nextPage).toBeTruthy();
        expect(wrapper.emitted().prevPage).toBeFalsy();
        wrapper.findComponent(PageControls).vm.$emit('prevPage');
        expect(wrapper.emitted().prevPage).toBeTruthy();
    });
});
