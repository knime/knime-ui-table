import { shallowMount } from '@vue/test-utils';
import TableGroup from '~/components/table/TableGroup';
import OptionsIcon from '~/webapps-common/ui/assets/img/icons/menu-options.svg?inline';
import SubMenu from '~/webapps-common/ui/components/SubMenu';

describe('TableGroup.vue', () => {
    let wrapper;

    it('renders a table group', () => {
        wrapper = shallowMount(TableGroup, {
            propsData: {
                title: 'Group 1',
                show: true,
                subMenuItems: [{
                    text: 'test'
                }]
            }
        });

        expect(wrapper.find(TableGroup).exists()).toBe(true);
        expect(wrapper.find('.table-group').exists()).toBe(true);
        expect(wrapper.find(SubMenu).exists()).toBe(true);
        expect(wrapper.find(OptionsIcon).exists()).toBe(true);
        expect(wrapper.find('td').text()).toContain('Group 1');
    });

    it('shows slotted content', () => {
        wrapper = shallowMount(TableGroup, {
            propsData: {
                title: 'Group 1',
                show: true,
                subMenuItems: [{
                    text: 'test'
                }]
            },
            slots: {
                default: '<tr class="data">Some Data</tr>'
            }
        });

        expect(wrapper.find(TableGroup).exists()).toBe(true);
        expect(wrapper.find('.table-group').exists()).toBe(true);
        expect(wrapper.find(SubMenu).exists()).toBe(true);
        expect(wrapper.find(OptionsIcon).exists()).toBe(true);
        expect(wrapper.find('td').text()).toContain('Group 1');
        expect(wrapper.find('.data').text()).toContain('Some Data');
    });

    it('hides group but shows slotted content', () => {
        wrapper = shallowMount(TableGroup, {
            propsData: {
                title: 'Group 1',
                show: false,
                subMenuItems: [{
                    text: 'test'
                }]
            },
            slots: {
                default: '<tr class="data">Some Data</tr>'
            }
        });

        expect(wrapper.find(TableGroup).exists()).toBe(true);
        expect(wrapper.find('.table-group').exists()).toBe(false);
        expect(wrapper.find(SubMenu).exists()).toBe(false);
        expect(wrapper.find(OptionsIcon).exists()).toBe(false);
        expect(wrapper.find('.data').text()).toContain('Some Data');
    });

    it('hides group submenu if no items', () => {
        wrapper = shallowMount(TableGroup, {
            propsData: {
                title: 'Group 1',
                show: true,
                subMenuItems: []
            },
            slots: {
                default: '<tr class="data">Some Data</tr>'
            }
        });

        expect(wrapper.find(TableGroup).exists()).toBe(true);
        expect(wrapper.find('.table-group').exists()).toBe(true);
        expect(wrapper.find(SubMenu).exists()).toBe(false);
        expect(wrapper.find(OptionsIcon).exists()).toBe(false);
        expect(wrapper.find('td').text()).toContain('Group 1');
        expect(wrapper.find('.data').text()).toContain('Some Data');
    });

    it('emits a groupSubMenuClick event when the submenu is clicked', () => {
        let subMenuItems = [{
            text: 'test'
        }];
        wrapper = shallowMount(TableGroup, {
            propsData: {
                title: 'Group 1',
                show: true,
                subMenuItems
            },
            slots: {
                default: '<tr class="data">Some Data</tr>'
            }
        });
        expect(wrapper.find(TableGroup).exists()).toBe(true);
        expect(wrapper.find('.table-group').exists()).toBe(true);
        expect(wrapper.find(SubMenu).exists()).toBe(true);
        expect(wrapper.emitted().groupSubMenuClick).toBeFalsy();
        wrapper.find(SubMenu).vm.$emit(
            'item-click',
            new MouseEvent('click'),
            subMenuItems[0]
        );
        expect(wrapper.emitted().groupSubMenuClick).toBeTruthy();
        expect(wrapper.emitted().groupSubMenuClick[0][0]).toBe(subMenuItems[0]);
    });
});
