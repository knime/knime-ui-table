import { describe, it, expect } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';
import Carousel from 'webapps-common/ui/components/Carousel.vue';

import BaseControls from '../BaseControls.vue';
import PageControls from '../PageControls.vue';

describe('BaseControls.vue', () => {
    let wrapper;

    it('renders page controls and slots if pageConfig is defined', () => {
        wrapper = mount(BaseControls, {
            props: {
                pageConfig: {
                    totalItems: 100,
                    currentItems: 100,
                    pageSize: 25,
                    currentPage: 1
                }
            },
            slots: {
                carousel: '<h2>This is a Slot inside a carousel!</h2>',
                'rightmost-control': '<h3>This is a Slot on the right!</h3>'
            }
        });

        expect(wrapper.findComponent(BaseControls).exists()).toBe(true);
        expect(wrapper.findComponent(PageControls).exists()).toBe(true);
        expect(wrapper.findComponent(Carousel).find('h2').exists()).toBe(true);
        expect(wrapper.find('h3').exists()).toBe(true);
    });

    it('emits next and previous page events', () => {
        wrapper = shallowMount(BaseControls, {
            props: {
                pageConfig: {
                    totalItems: 100,
                    currentItems: 100,
                    pageSize: 25,
                    currentPage: 1
                }
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
