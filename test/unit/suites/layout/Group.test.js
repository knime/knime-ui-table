import { shallowMount } from '@vue/test-utils';
import Group from '~/components/layout/Group';
import OptionsIcon from '~/webapps-common/ui/assets/img/icons/menu-options.svg?inline';
import SubMenu from '~/webapps-common/ui/components/SubMenu';

describe('Group.vue', () => {
    let wrapper;

    it('renders a table group', () => {
        wrapper = shallowMount(Group, {
            propsData: {
                title: 'Group 1',
                show: true,
                groupSubMenuItems: [{
                    text: 'test'
                }]
            }
        });

        expect(wrapper.find(Group).exists()).toBe(true);
        expect(wrapper.find('.table-group').exists()).toBe(true);
        expect(wrapper.find(SubMenu).exists()).toBe(true);
        expect(wrapper.find(OptionsIcon).exists()).toBe(true);
        expect(wrapper.find('td').text()).toContain('Group 1');
    });

    it('shows slotted content', () => {
        wrapper = shallowMount(Group, {
            propsData: {
                title: 'Group 1',
                show: true,
                groupSubMenuItems: [{
                    text: 'test'
                }]
            },
            slots: {
                default: '<tr class="data">Some Data</tr>'
            }
        });

        expect(wrapper.find(Group).exists()).toBe(true);
        expect(wrapper.find('.table-group').exists()).toBe(true);
        expect(wrapper.find(SubMenu).exists()).toBe(true);
        expect(wrapper.find(OptionsIcon).exists()).toBe(true);
        expect(wrapper.find('td').text()).toContain('Group 1');
        expect(wrapper.find('.data').text()).toContain('Some Data');
    });

    it('hides group but shows slotted content', () => {
        wrapper = shallowMount(Group, {
            propsData: {
                title: 'Group 1',
                show: false,
                groupSubMenuItems: [{
                    text: 'test'
                }]
            },
            slots: {
                default: '<tr class="data">Some Data</tr>'
            }
        });

        expect(wrapper.find(Group).exists()).toBe(true);
        expect(wrapper.find('.table-group').exists()).toBe(false);
        expect(wrapper.find(SubMenu).exists()).toBe(false);
        expect(wrapper.find(OptionsIcon).exists()).toBe(false);
        expect(wrapper.find('.data').text()).toContain('Some Data');
    });

    it('hides group submenu if no items', () => {
        wrapper = shallowMount(Group, {
            propsData: {
                title: 'Group 1',
                show: true,
                groupSubMenuItems: []
            },
            slots: {
                default: '<tr class="data">Some Data</tr>'
            }
        });

        expect(wrapper.find(Group).exists()).toBe(true);
        expect(wrapper.find('.table-group').exists()).toBe(true);
        expect(wrapper.find(SubMenu).exists()).toBe(false);
        expect(wrapper.find(OptionsIcon).exists()).toBe(false);
        expect(wrapper.find('td').text()).toContain('Group 1');
        expect(wrapper.find('.data').text()).toContain('Some Data');
    });

    it('emits a groupSubMenuClick event when the submenu is clicked', () => {
        let groupSubMenuItems = [{
            text: 'test'
        }];
        wrapper = shallowMount(Group, {
            propsData: {
                title: 'Group 1',
                show: true,
                groupSubMenuItems
            },
            slots: {
                default: '<tr class="data">Some Data</tr>'
            }
        });
        expect(wrapper.find(Group).exists()).toBe(true);
        expect(wrapper.find('.table-group').exists()).toBe(true);
        expect(wrapper.find(SubMenu).exists()).toBe(true);
        expect(wrapper.emitted().groupSubMenuClick).toBeFalsy();
        wrapper.find(SubMenu).vm.$emit(
            'item-click',
            new MouseEvent('click'),
            groupSubMenuItems[0]
        );
        expect(wrapper.emitted().groupSubMenuClick).toBeTruthy();
        expect(wrapper.emitted().groupSubMenuClick[0][0]).toBe(groupSubMenuItems[0]);
    });
});
