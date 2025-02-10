import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { useScrollToElement } from "../useScrollToElement";

describe("useScrollToElement", () => {
  let toggleButton: HTMLElement,
    listContainer: HTMLElement,
    listItem: HTMLElement;

  const simulateElementPlacement = ({
    button,
    item,
    container,
  }: {
    button?: {
      offsetTop?: number;
      scrollHeight?: number;
    };
    item?: {
      offsetTop?: number;
      offsetHeight?: number;
      scrollHeight?: number;
    };
    container?: {
      scrollTop?: number;
      clientHeight?: number;
      scrollHeight?: number;
    };
  }) => {
    Object.entries(button || {}).forEach(([key, value]) => {
      Object.defineProperty(toggleButton, key, { value });
    });
    Object.entries(item || {}).forEach(([key, value]) => {
      Object.defineProperty(listItem, key, { value });
    });
    Object.entries(container || {}).forEach(([key, value]) => {
      Object.defineProperty(listContainer, key, { value });
    });
  };

  beforeEach(() => {
    toggleButton = {
      id: "toggleButton",
      scrollHeight: 0,
    } as any;
    listContainer = {
      scrollHeight: 0,
      clientHeight: 0,
      scrollTop: 0,
      offsetTop: 0,
      id: "listContainer",
    } as any;
    listItem = {
      offsetParent: listContainer,
      offsetTop: 0,
      scrollHeight: 0,
      id: "listItem",
    } as any;

    window.scrollTo = vi.fn() as any;
  });

  it("does not fail with a null reference for the toggle button", () => {
    const { scrollTo } = useScrollToElement({ toggleButton: ref(null) });
    expect(() => scrollTo(listItem)).not.toThrow();
  });

  describe("scrollTo in popover", () => {
    it("should scroll popover such that element appears at the bottom", () => {
      simulateElementPlacement({
        item: {
          offsetTop: 210,
          offsetHeight: 50,
        },
        container: {
          clientHeight: 200,
          scrollHeight: 300,
        },
      });
      const { scrollTo } = useScrollToElement({
        toggleButton: ref(toggleButton),
      });
      scrollTo(listItem);
      expect(listContainer.scrollTop).toBe(60);
    });

    it("should scroll popover such that element appears at the top", () => {
      simulateElementPlacement({
        item: {
          offsetTop: 30,
          offsetHeight: 50,
        },
        container: {
          clientHeight: 200,
          scrollHeight: 300,
          scrollTop: 100,
        },
      });
      const { scrollTo } = useScrollToElement({
        toggleButton: ref(toggleButton),
      });
      scrollTo(listItem);
      expect(listContainer.scrollTop).toBe(30);
    });

    it("does not scroll inside popover if not necessary", () => {
      simulateElementPlacement({
        item: {
          offsetTop: 30,
          offsetHeight: 50,
        },
        container: {
          clientHeight: 200,
          scrollHeight: 300,
          scrollTop: 10,
        },
      });
      const { scrollTo } = useScrollToElement({
        toggleButton: ref(toggleButton),
      });
      scrollTo(listItem);
      expect(listContainer.scrollTop).toBe(10);
    });
  });

  describe("scrollTo in window", () => {
    const windowScrollX = 30;

    beforeEach(() => {
      /**
       * Simultate the following:
       *  - the bottom edge of the button is 100px from the top.
       *  - the top edge of the item is 150px from the bottom of the button.
       *  - the bottom edge of the item is 50px from its top.
       */
      simulateElementPlacement({
        item: {
          offsetTop: 200,
          offsetHeight: 50,
          scrollHeight: 50,
        },
        container: {
          clientHeight: 200,
          scrollHeight: 300,
          scrollTop: 50,
        },
        button: {
          offsetTop: 80,
          scrollHeight: 20,
        },
      });
      window.scrollX = windowScrollX;
    });

    /**
     *  I.e. the window should contain a fixed amount (20px) above 250px (=100 + 150)
     *  and below 300px (= 100 + 150 + 50).
     */
    const windowBottomEdgeMax = 100 + 150 + 50 + 20;
    const windowTopEdgeMin = 100 + 150 - 20;

    it("should scroll window such that element appears at the bottom", () => {
      window.innerHeight = 200;
      window.scrollY = 10; // window not scrolled down enough to show element
      const { scrollTo } = useScrollToElement({
        toggleButton: ref(toggleButton),
      });
      scrollTo(listItem);
      expect(window.scrollTo).toHaveBeenCalledWith(
        windowScrollX,
        windowBottomEdgeMax - window.innerHeight,
      );
    });

    it("should scroll window such that element appears at the top", () => {
      window.innerHeight = 200;
      window.scrollY = 400; // scroll window down, such that it is necessary to scroll up again
      const { scrollTo } = useScrollToElement({
        toggleButton: ref(toggleButton),
      });
      scrollTo(listItem);
      expect(window.scrollTo).toHaveBeenCalledWith(
        windowScrollX,
        windowTopEdgeMin,
      );
    });

    it("should not scroll window if not necessary", () => {
      window.innerHeight = 200;
      window.scrollY = windowTopEdgeMin;
      const { scrollTo } = useScrollToElement({
        toggleButton: ref(toggleButton),
      });
      scrollTo(listItem);
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it("positions the window after the positioning of the element within the popover is completed", () => {
      window.innerHeight = 200;
      window.scrollY = 10;
      simulateElementPlacement({
        container: {
          scrollTop: 0, // scroll container up, such that the popover scrollTo scrolls it down again.
        },
      });

      const { scrollTo } = useScrollToElement({
        toggleButton: ref(toggleButton),
      });
      scrollTo(listItem);
      expect(window.scrollTo).toHaveBeenCalledWith(
        windowScrollX,
        windowBottomEdgeMax - window.innerHeight,
      );
    });
  });
});
