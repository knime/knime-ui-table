import { shallowMount, mount } from '@vue/test-utils';
import CollapserToggle from '~/components/ui/CollapserToggle.vue';
import DropdownIcon from '~/webapps-common/ui/assets/img/icons/arrow-next.svg';

describe('CollapserToggle.vue', () => {
    let wrapper;

    it('renders default', () => {
        wrapper = shallowMount(CollapserToggle);
        expect(wrapper.find(CollapserToggle).exists()).toBe(true);
        expect(wrapper.find(DropdownIcon).exists()).toBe(true);
    });

    it('emit a collapserExpand event when clicked', () => {
        wrapper = mount(CollapserToggle);
        wrapper.find('.button').trigger('click');
        expect(wrapper.emitted().collapserExpand).toBeTruthy();
    });

    it('changes icon classes when expanded', () => {
        wrapper = shallowMount(CollapserToggle);
        expect(wrapper.find(DropdownIcon).classes()).not.toContain('flip');
        wrapper.setProps({ expanded: true });
        expect(wrapper.find(DropdownIcon).classes()).toContain('flip');
    });
});
