import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import AvailableWidthTestComponent from "./AvailableWidthTestComponent.vue";

describe("useAvailableWidth", () => {
  type ResizeCallback = (
    entries: {
      borderBoxSize?: { inlineSize: number; blockSize: number }[];
      contentRect: { width: number; height: number };
    }[],
  ) => void;

  let unobserve: () => void,
    rootCallback: ({
      width,
      height,
    }: {
      width: number;
      height?: number;
    }) => void,
    scrolledElementCallback: ({
      scrollbarWidth,
      scrollbarHeight,
    }: {
      scrollbarWidth: number;
      scrollbarHeight?: number;
    }) => void,
    isSecondScroller: boolean;

  beforeEach(() => {
    unobserve = vi.fn();
    isSecondScroller = false;
    Object.defineProperty(window, "ResizeObserver", {
      writable: true,
      value: vi.fn().mockImplementation((callback: ResizeCallback) => ({
        observe: vi.fn((el: HTMLElement) => {
          if (el.id === "root") {
            rootCallback = ({ width, height = 200 }) =>
              callback([
                {
                  contentRect: { width, height },
                },
              ]);
          } else if (el.id === "scrolledElement") {
            scrolledElementCallback = ({
              scrollbarWidth,
              scrollbarHeight = 0,
            }) =>
              callback([
                {
                  borderBoxSize: [{ inlineSize: 50, blockSize: 50 }],
                  contentRect: {
                    width: 50 - scrollbarWidth,
                    height: 50 - scrollbarHeight,
                  },
                },
              ]);
          } else if (el.id === "scrolledElement2") {
            isSecondScroller = true;
          }
        }),
        unobserve,
        disconnect: vi.fn(),
      })),
    });
  });

  it("emits available width", async () => {
    const availableWidth = 200;
    const scrollbarWidth = 0;

    const wrapper = mount(AvailableWidthTestComponent, {
      props: { specialColumnsSizeTotal: 0 },
    });
    await flushPromises();
    rootCallback({ width: availableWidth });
    scrolledElementCallback({ scrollbarWidth });
    await flushPromises();

    expect(wrapper.emitted().availableWidthChanged[0]).toStrictEqual([
      availableWidth,
    ]);
  });

  it("doesn't emit availableWidthChanged when the scrollbar width isn't computed yet", async () => {
    const availableWidth = 200;
    const scrollbarWidth = 10;

    const wrapper = mount(AvailableWidthTestComponent, {
      props: { specialColumnsSizeTotal: 0 },
    });
    await flushPromises();
    rootCallback({ width: availableWidth });
    await flushPromises();
    expect(wrapper.emitted()).not.toHaveProperty("availableWidthChanged");

    scrolledElementCallback({ scrollbarWidth });
    await flushPromises();
    expect(wrapper.emitted()).toHaveProperty("availableWidthChanged");
  });

  it("subtracts specialColumnsSizeTotal from the available width", async () => {
    const specialColumnsSizeTotal = 123;
    const availableWidth = 200;
    const scrollbarWidth = 0;

    const wrapper = mount(AvailableWidthTestComponent, {
      props: { specialColumnsSizeTotal },
    });
    await flushPromises();
    rootCallback({ width: availableWidth });
    scrolledElementCallback({ scrollbarWidth });
    await flushPromises();

    expect(wrapper.emitted().availableWidthChanged[0]).toStrictEqual([
      availableWidth - specialColumnsSizeTotal,
    ]);
  });

  it("subtracts the scrollbar width from the available width", async () => {
    const scrollbarWidth = 17;
    const availableWidth = 200;

    const wrapper = mount(AvailableWidthTestComponent, {
      props: { specialColumnsSizeTotal: 0 },
    });
    await flushPromises();
    rootCallback({ width: availableWidth });
    scrolledElementCallback({ scrollbarWidth });
    await flushPromises();

    expect(wrapper.emitted().availableWidthChanged[0]).toStrictEqual([
      availableWidth - scrollbarWidth,
    ]);
  });

  it("unobserves both elements on unmount", async () => {
    const wrapper = mount(AvailableWidthTestComponent, {
      props: { specialColumnsSizeTotal: 0 },
    });
    await flushPromises();
    wrapper.unmount();
    expect(unobserve).toHaveBeenCalledTimes(2);
  });

  it("reobserves scrolled element when it changes", async () => {
    const wrapper = mount(AvailableWidthTestComponent, {
      props: { specialColumnsSizeTotal: 0 },
    });
    await flushPromises();
    const firstScrolledElement = wrapper.find("#scrolledElement").element;
    wrapper.vm.refreshScroller();
    await flushPromises();
    expect(unobserve).toHaveBeenCalledWith(firstScrolledElement);
    expect(isSecondScroller).toBe(true);
  });

  it("transforms inner width to body width", async () => {
    const scrollbarWidth = 17;
    const availableWidth = 200;
    const specialColumnsSizeTotal = 123;
    const wrapper = mount(AvailableWidthTestComponent, {
      props: { specialColumnsSizeTotal },
    });
    await flushPromises();
    rootCallback({ width: availableWidth });
    scrolledElementCallback({ scrollbarWidth });
    await flushPromises();

    const innerWidth = 123;
    expect(wrapper.vm.innerWidthToBodyWidth(innerWidth)).toBe(
      innerWidth + specialColumnsSizeTotal,
    );
  });

  it("detects if a given body width fits inside the total width", async () => {
    const scrollbarWidth = 17;
    const availableWidth = 200;
    const specialColumnsSizeTotal = 123;
    const wrapper = mount(AvailableWidthTestComponent, {
      props: { specialColumnsSizeTotal },
    });
    await flushPromises();
    rootCallback({ width: availableWidth });
    scrolledElementCallback({ scrollbarWidth });
    await flushPromises();

    expect(
      wrapper.vm.fitsInsideTotalWidth(availableWidth - scrollbarWidth),
    ).toBeTruthy();
    expect(
      wrapper.vm.fitsInsideTotalWidth(availableWidth - scrollbarWidth + 0.01),
    ).toBeTruthy();
    expect(
      wrapper.vm.fitsInsideTotalWidth(availableWidth - scrollbarWidth + 1),
    ).toBeFalsy();
  });

  it("does not emit available width update by vertical scrollbar induced by horizontal scrollbar", async () => {
    const wrapper = mount(AvailableWidthTestComponent, {
      props: { specialColumnsSizeTotal: 0 },
    });
    await flushPromises();
    rootCallback({ width: 200, height: 200 });

    const setParams = ({
      scrollbarWidth,
      scrollbarHeight,
    }: {
      scrollbarWidth: number;
      scrollbarHeight: number;
    }) => {
      scrolledElementCallback({ scrollbarWidth, scrollbarHeight });
      return flushPromises();
    };

    await setParams({ scrollbarWidth: 0, scrollbarHeight: 0 });
    expect(wrapper.emitted("availableWidthChanged")).toHaveLength(1);

    await setParams({ scrollbarWidth: 17, scrollbarHeight: 17 });
    expect(wrapper.emitted("availableWidthChanged")).toHaveLength(1);
  });
});
