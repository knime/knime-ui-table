import { shallowMount } from '@vue/test-utils';
import BaseControls from '~/components/control/BaseControls';
import PageControls from '~/components/control/PageControls';

describe('BaseControls.vue', () => {
    let wrapper;

    it('renders page controls', () => {
        wrapper = shallowMount(BaseControls, {
            propsData: {
                totalItems: 100,
                currentItems: 100,
                pageSize: 25,
                currentPage: 1
            },
            slots: {
                default: '<h3>This is a Slot!</h3>'
            }
        });

        expect(wrapper.find(BaseControls).exists()).toBe(true);
        expect(wrapper.find(PageControls).exists()).toBe(true);
        expect(wrapper.find('h3').exists()).toBe(true);
    });

    it('emits next and previous page events', () => {
        wrapper = shallowMount(BaseControls, {
            propsData: {
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
        wrapper.find(PageControls).vm.$emit('nextPage');
        expect(wrapper.emitted().nextPage).toBeTruthy();
        expect(wrapper.emitted().prevPage).toBeFalsy();
        wrapper.find(PageControls).vm.$emit('prevPage');
        expect(wrapper.emitted().prevPage).toBeTruthy();
    });
});
