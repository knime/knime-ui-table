import { shallowMount } from '@vue/test-utils';
import PopoverPageControls from '~/components/popover/PopoverPageControls.vue';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton.vue';
import ArrowNextIcon from '~/webapps-common/ui/assets/img/icons/arrow-next.svg?inline';
import ArrowPrevIcon from '~/webapps-common/ui/assets/img/icons/arrow-prev.svg?inline';

describe('PopoverPageControls.vue', () => {
    let wrapper;

    it('renders page controls', () => {
        wrapper = shallowMount(PopoverPageControls, {
            propsData: {
                totalPages: 5,
                currentPage: 0
            }
        });

        expect(wrapper.find(PopoverPageControls).exists()).toBe(true);
        expect(wrapper.find(FunctionButton).exists()).toBe(true);
        expect(wrapper.find(ArrowNextIcon).exists()).toBe(true);
        expect(wrapper.find(ArrowPrevIcon).exists()).toBe(true);
        expect(wrapper.find('.controls').text()).toContain('1 of 5');
    });

    it('emits next and previous page events', () => {
        wrapper = shallowMount(PopoverPageControls, {
            propsData: {
                totalPages: 5,
                currentPage: 0
            }
        });
        let buttons = wrapper.findAll(FunctionButton);
        expect(wrapper.emitted().nextPage).toBeFalsy();
        expect(wrapper.emitted().prevPage).toBeFalsy();
        buttons.at(1).vm.$emit('click');
        expect(wrapper.emitted().nextPage).toBeTruthy();
        expect(wrapper.emitted().prevPage).toBeFalsy();
        buttons.at(0).vm.$emit('click');
        expect(wrapper.emitted().prevPage).toBeTruthy();
    });
});
