import { shallowMount } from '@vue/test-utils';
import Dots from '~/components/layout/Dots.vue';


describe('Dots', () => {
    it('computes top margin from given height', () => {
        const wrapper = shallowMount(Dots, { height: 100 });
        expect(wrapper.vm.marginTop).toBe(-39);
    });
});

