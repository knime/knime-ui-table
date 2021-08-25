import { shallowMount } from '@vue/test-utils';
import TableControlBase from '~/components/control/TableControlBase';
import TablePageControl from '~/components/control/TablePageControl';

describe('TableControlBase.vue', () => {
    let wrapper;

    it('renders page controls', () => {
        wrapper = shallowMount(TableControlBase, {
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

        expect(wrapper.find(TableControlBase).exists()).toBe(true);
        expect(wrapper.find(TablePageControl).exists()).toBe(true);
        expect(wrapper.find('h3').exists()).toBe(true);
    });

    it('emits next and previous page events', () => {
        wrapper = shallowMount(TableControlBase, {
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
        wrapper.find(TablePageControl).vm.$emit('nextPage');
        expect(wrapper.emitted().nextPage).toBeTruthy();
        expect(wrapper.emitted().prevPage).toBeFalsy();
        wrapper.find(TablePageControl).vm.$emit('prevPage');
        expect(wrapper.emitted().prevPage).toBeTruthy();
    });
});
