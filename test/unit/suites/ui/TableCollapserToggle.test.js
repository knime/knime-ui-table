import { shallowMount, mount } from '@vue/test-utils';
import TableCollapserToggle from '~/components/ui/TableCollapserToggle';
import DropdownIcon from '~/webapps-common/ui/assets/img/icons/arrow-next.svg?inline';

describe('TableCollapserToggle.vue', () => {
    let wrapper;

    it('renders default', () => {
        wrapper = shallowMount(TableCollapserToggle);
        expect(wrapper.find(TableCollapserToggle).exists()).toBe(true);
        expect(wrapper.find(DropdownIcon).exists()).toBe(true);
    });

    it('emit a collapserExpand event when clicked', () => {
        wrapper = mount(TableCollapserToggle);
        wrapper.find('.button').trigger('click');
        expect(wrapper.emitted().collapserExpand).toBeTruthy();
    });

    it('changes icon classes when expanded', () => {
        wrapper = shallowMount(TableCollapserToggle);
        expect(wrapper.find(DropdownIcon).classes()).not.toContain('flip');
        wrapper.setProps({ expanded: true });
        expect(wrapper.find(DropdownIcon).classes()).toContain('flip');
    });
});
