import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AvailableWidthTestComponent from './AvailableWidthTestComponent.vue';


describe('useAvailableWidth', () => {
    type ResizeCallback = (entries: {
        borderBoxSize?: { inlineSize: number }[],
        contentRect: { width: number }
    }[]) => void

    let unobserve: () => void,
        rootCallback: (width: number) => void,
        scrolledElementCallback: (scrollbarWidth: number) => void;

    beforeEach(() => {
        unobserve = vi.fn();
        Object.defineProperty(window, 'ResizeObserver', {
            writable: true,
            value: vi.fn().mockImplementation((callback: ResizeCallback) => ({
                observe: vi.fn((el: HTMLElement) => {
                    if (el.id === 'root') {
                        rootCallback = (width) => callback([{
                            contentRect: { width }
                        }]);
                    } else if (el.id === 'scrolledElement') {
                        scrolledElementCallback = (scrollbarWidth) => callback(
                            [{
                                borderBoxSize: [{ inlineSize: 50 }],
                                contentRect: { width: 50 - scrollbarWidth }
                            }]
                        );
                    }
                }),
                unobserve,
                disconnect: vi.fn()
            }))
        });
    });

    it('emits available width', async () => {
        const availableWidth = 200;

        const wrapper = mount(AvailableWidthTestComponent as any, { props: { specialColumnsSizeTotal: 0 } });
        await flushPromises();
        rootCallback(availableWidth);
        await flushPromises();

        expect(wrapper.emitted().availableWidthChanged[0]).toStrictEqual([availableWidth]);
    });

    it('substracts specialColumnsSizeTotal from the available width', async () => {
        const specialColumnsSizeTotal = 123;
        const availableWidth = 200;

        const wrapper = mount(AvailableWidthTestComponent as any, { props: { specialColumnsSizeTotal } });
        await flushPromises();
        rootCallback(availableWidth);
        await flushPromises();

        expect(wrapper.emitted().availableWidthChanged[0]).toStrictEqual([availableWidth - specialColumnsSizeTotal]);
    });

    it('substracts the scrollbar width from the available width', async () => {
        const scrollbarWidth = 17;
        const availableWidth = 200;

        const wrapper = mount(AvailableWidthTestComponent as any, { props: { specialColumnsSizeTotal: 0 } });
        await flushPromises();
        rootCallback(availableWidth);
        scrolledElementCallback(scrollbarWidth);
        await flushPromises();

        expect(wrapper.emitted().availableWidthChanged[0]).toStrictEqual([availableWidth - scrollbarWidth]);
    });

    it('unobserves both elements on unmount', async () => {
        const wrapper = mount(AvailableWidthTestComponent as any, { props: { specialColumnsSizeTotal: 0 } });
        await flushPromises();
        wrapper.unmount();
        expect(unobserve).toHaveBeenCalledTimes(2);
    });

    it('transforms inner width to body width', async () => {
        const scrollbarWidth = 17;
        const availableWidth = 200;
        const specialColumnsSizeTotal = 123;
        const wrapper = mount(AvailableWidthTestComponent as any, { props: { specialColumnsSizeTotal } });
        await flushPromises();
        rootCallback(availableWidth);
        scrolledElementCallback(scrollbarWidth);
        await flushPromises();

        const innerWidth = 123;
        expect(wrapper.vm.innerWidthToBodyWidth(innerWidth, false)).toBe(
            innerWidth + specialColumnsSizeTotal
        );
        expect(wrapper.vm.innerWidthToBodyWidth(innerWidth, true)).toBe(
            innerWidth + specialColumnsSizeTotal + scrollbarWidth
        );
    });
});

