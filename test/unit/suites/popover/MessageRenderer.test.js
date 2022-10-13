import { shallowMount } from '@vue/test-utils';
import MessageRenderer from '~/components/popover/MessageRenderer.vue';
import PopoverPageControls from '~/components/popover/PopoverPageControls.vue';
import ErrorIcon from '~/webapps-common/ui/assets/img/icons/sign-warning.svg';
import WarnIcon from '~/webapps-common/ui/assets/img/icons/circle-info.svg';

const testMessages = [
    {
        itemTitle: 'Node',
        messageTitle: 'Node Message',
        item: '0:1:2:3',
        message: 'An error occurred',
        type: 'ERROR'
    },
    {
        itemTitle: 'Node',
        messageTitle: 'Node Message',
        item: '4:5:6:7',
        message: 'Some warning',
        type: 'WARNING'
    }
];

describe('MessageRenderer.vue', () => {
    let wrapper;

    it('renders message data', () => {
        wrapper = shallowMount(MessageRenderer, {
            propsData: {
                data: testMessages
            }
        });

        expect(wrapper.find(MessageRenderer).exists()).toBe(true);
        expect(wrapper.find(PopoverPageControls).exists()).toBe(true);
        expect(wrapper.find(ErrorIcon).exists()).toBe(true);
    });

    it('renders defaults for missing message data', () => {
        wrapper = shallowMount(MessageRenderer, {
            propsData: {
                data: [{}]
            }
        });
        let messageContent = wrapper.find('.content').text();
        expect(messageContent).toContain('Item');
        expect(messageContent).toContain('Missing item.');
        expect(messageContent).toContain('Message');
        expect(messageContent).toContain('No message found.');
        expect(wrapper.find(ErrorIcon).exists()).toBe(true);
    });

    it('renders ERROR message data', () => {
        wrapper = shallowMount(MessageRenderer, {
            propsData: {
                data: [testMessages[0]]
            }
        });

        expect(wrapper.find(ErrorIcon).exists()).toBe(true);
        expect(wrapper.find('.error').text()).toContain(`Error`);
        expect(wrapper.find('.content').text()).toContain(`An error occurred`);
    });

    it('renders WARN message data', () => {
        wrapper = shallowMount(MessageRenderer, {
            propsData: {
                data: [testMessages[1]]
            }
        });

        expect(wrapper.find(WarnIcon).exists()).toBe(true);
        expect(wrapper.find('.warning').text()).toContain(`Warning`);
        expect(wrapper.find('.content').text()).toContain(`Some warning`);
    });

    it('reacts to page events by updating the content of the page', () => {
        wrapper = shallowMount(MessageRenderer, {
            propsData: {
                data: testMessages
            }
        });

        expect(wrapper.find(MessageRenderer).exists()).toBe(true);
        expect(wrapper.find(PopoverPageControls).exists()).toBe(true);
        expect(wrapper.find('.content').text()).toContain(`An error occurred`);
        expect(wrapper.find('.content').text()).not.toContain(`Some warning`);
        wrapper.find(PopoverPageControls).vm.$emit('nextPage');
        expect(wrapper.find('.content').text()).not.toContain(`An error occurred`);
        expect(wrapper.find('.content').text()).toContain(`Some warning`);
        wrapper.find(PopoverPageControls).vm.$emit('prevPage');
        expect(wrapper.find('.content').text()).toContain(`An error occurred`);
        expect(wrapper.find('.content').text()).not.toContain(`Some warning`);
    });

    it('does not render if no messages', () => {
        wrapper = shallowMount(MessageRenderer, {
            propsData: {
                data: []
            }
        });

        expect(wrapper.find(MessageRenderer).exists()).toBe(true);
        expect(wrapper.find('div').exists()).toBe(false);
    });

    it('does not render if data is missing', () => {
        wrapper = shallowMount(MessageRenderer);

        expect(wrapper.find(MessageRenderer).exists()).toBe(true);
        expect(wrapper.find('div').exists()).toBe(false);
    });
});
