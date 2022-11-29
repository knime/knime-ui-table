import { shallowMount } from '@vue/test-utils';
import PlaceholderRow from '~/components/layout/PlaceholderRow.vue';


describe('Dots', () => {
    it('computes top margin from given height', () => {
        const wrapper = shallowMount(PlaceholderRow, { height: 100 });
        expect(wrapper.vm.marginTop).toBe(-39);
    });
});

