import { shallowMount } from '@vue/test-utils';
import PageControls from '~/components/control/PageControls.vue';
import FunctionButton from '~/webapps-common/ui/components/FunctionButton.vue';
import ArrowNextIcon from '~/webapps-common/ui/assets/img/icons/arrow-next.svg';
import ArrowPrevIcon from '~/webapps-common/ui/assets/img/icons/arrow-prev.svg';

describe('PageControls.vue', () => {
    let wrapper;

    it('renders page controls', () => {
        wrapper = shallowMount(PageControls);

        expect(wrapper.find(PageControls).exists()).toBe(true);
        expect(wrapper.find(FunctionButton).exists()).toBe(false);
        expect(wrapper.find(ArrowNextIcon).exists()).toBe(false);
        expect(wrapper.find(ArrowPrevIcon).exists()).toBe(false);
    });

    it('has dynamic range text without dimension information', () => {
        wrapper = shallowMount(PageControls, {
            propsData: {
                totalItems: 100,
                currentItems: 100,
                pageSize: 25,
                currentPage: 1
            }
        });
        expect(wrapper.find('span').text()).toBe('Showing 1-25 of 100');
        wrapper.setProps({ currentItems: 50 });
        expect(wrapper.find('span').text()).toBe('Showing 1-25 of 50 (100 total)');
        wrapper.setProps({ currentPage: 2 });
        expect(wrapper.find('span').text()).toBe('Showing 26-50 of 50 (100 total)');
        wrapper.setProps({ currentItems: 0 });
        expect(wrapper.find('span').text()).toBe('No data (100 hidden)');
    });

    it('has dynamic range text with dimension information', () => {
        wrapper = shallowMount(PageControls, {
            propsData: {
                totalItems: 100,
                currentItems: 100,
                pageSize: 25,
                currentPage: 1,
                columnCount: 10
            }
        });
        expect(wrapper.find('span').text()).toBe('Showing 1-25 of 100   |   Columns: 10');
        wrapper.setProps({ currentItems: 50 });
        expect(wrapper.find('span').text()).toBe('Showing 1-25 of 50 (100 total)   |   Columns: 10');
        wrapper.setProps({ currentPage: 2 });
        expect(wrapper.find('span').text()).toBe('Showing 26-50 of 50 (100 total)   |   Columns: 10');
        wrapper.setProps({ currentItems: 0 });
        expect(wrapper.find('span').text()).toBe('No data (100 hidden)   |   Columns: 10');
        wrapper.setProps({ pageSize: 10, totalItems: 10, currentItems: 10 });
        expect(wrapper.find('span').text()).toBe('Rows: 10   |   Columns: 10');
    });

    it('hides "total" count if 0 rows', () => {
        wrapper = shallowMount(PageControls, {
            propsData: {
                totalItems: 0,
                currentItems: 0,
                pageSize: 25,
                currentPage: 1
            }
        });
        expect(wrapper.find('span').text()).toBe('No data');
        expect(wrapper.find('span').text()).not.toContain('hidden');
    });


    it('disables next page button if no next page', () => {
        wrapper = shallowMount(PageControls, {
            propsData: {
                totalItems: 12,
                pageSize: 5,
                currentPage: 3
            }
        });
        expect(wrapper.findAll(FunctionButton).at(0).vm.$props.disabled).toBeFalsy();
        expect(wrapper.findAll(FunctionButton).at(1).vm.$props.disabled).toBe(true);
    });

    it('disables prev page button if no prev page', () => {
        wrapper = shallowMount(PageControls, {
            propsData: {
                totalItems: 12,
                currentItems: 10,
                pageSize: 5,
                currentPage: 1
            }
        });
        expect(wrapper.findAll(FunctionButton).at(0).vm.$props.disabled).toBe(true);
        expect(wrapper.findAll(FunctionButton).at(1).vm.$props.disabled).toBeFalsy();
    });

    it('emits next and previous page events', () => {
        wrapper = shallowMount(PageControls, {
            propsData: {
                totalItems: 100,
                currentItems: 100,
                pageSize: 25,
                currentPage: 2
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
