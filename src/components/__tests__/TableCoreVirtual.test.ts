import { VueWrapper, flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TableCoreVirtual, {
  Props as TableCoreVirutalProps,
} from "../TableCoreVirtual.vue";
import {
  ArraySizeManager,
  IndexStartEnd,
  SameSizeManager,
  WithSpaceAfter,
  WithSpaceBefore,
  useVirtualGrid,
} from "@knime/vue-headless-virtual-scroller";
import { h, ref } from "vue";
import { injectionKey as useCloseSubMenusOnScrollInjectionKey } from "../composables/useCloseSubMenusOnScroll";
import { injectionKey as useCommonScrollContainerPropsInjectionKey } from "../composables/useCommonScrollContainerProps";
import { injectionKey as useOverflowStylesInjectionKey } from "../composables/useOverflowStyles";
import TestRow from "./testComponents/TestRow.vue";
import VirtualRow from "../VirtualRow.vue";

let virtualGridResult: ReturnType<typeof useVirtualGrid>;

const constructorMocks = {
  ArraySizeManager: vi.fn(),
  WithSpaceAfter: vi.fn(),
  WithSpaceBefore: vi.fn(),
  SameSizeManager: vi.fn(),
};

vi.mock("@knime/vue-headless-virtual-scroller", () => {
  const createSizeManagerMock = (className: keyof typeof constructorMocks) =>
    class SizeManagerMock {
      public static constructorMock = vi.fn();
      constructor(...args: any[]) {
        constructorMocks[className](...args);
      }
    };
  return {
    useVirtualGrid: vi.fn(() => virtualGridResult),
    SameSizeManager: createSizeManagerMock("SameSizeManager"),
    ArraySizeManager: createSizeManagerMock("ArraySizeManager"),
    WithSpaceAfter: createSizeManagerMock("WithSpaceAfter"),
    WithSpaceBefore: createSizeManagerMock("WithSpaceBefore"),
  };
});

const getCellContent = (i: number, j: number) => `Row ${i} Cell ${j}`;
const generateScrollData = ({
  height,
  width,
}: {
  height: number;
  width: number;
}) =>
  Array.from({ length: height }, (_v, i) => ({
    data: Array.from({ length: width }, (_w, j) => getCellContent(i, j)),
  }));

describe("TableCoreVirtual", () => {
  let props: TableCoreVirutalProps;
  const scrollDataLength = 3;

  beforeEach(() => {
    virtualGridResult = {
      containerProps: {
        onScroll: vi.fn(),
        ref: ref<HTMLElement | null>(null),
      },
      indices: {
        horizontal: ref<IndexStartEnd>({
          endIndex: 1,
          startIndex: 0,
          toArray: vi.fn(() => [0]),
        }),
        vertical: ref<IndexStartEnd>({
          endIndex: 1,
          startIndex: 0,
          toArray: vi.fn(() => [0]),
        }),
      },
      scrolledAreaStyles: {
        horizontal: ref({ width: "100px" }),
        vertical: ref({ height: "100px" }),
      },
    };
    props = {
      currentBodyWidth: 100,
      specialColumnSizes: {
        collapserSize: 1,
        selectionSize: 10,
        rightSideSize: 100,
      },
      columnSizes: [1, 10, 100],
      tableConfig: {
        showSelection: true,
      },
      scrollConfig: {
        itemSize: 7,
        numRowsAbove: 0,
        numRowsBelow: 0,
        compact: false,
      },
      scrollData: generateScrollData({ height: scrollDataLength, width: 3 }),
    };
  });

  const headerSlotId = "myHeaderId";
  const cellSelectionOverlayId = "myCellSelectionOverlay";

  const closeExpandedSubMenu = vi.fn();
  const overflowStyles = {
    overflow: "hidden",
  };
  const providedScrollContainerRef = ref(null);

  const mountTableCoreVirtual = () =>
    mount(TableCoreVirtual, {
      props,
      global: {
        provide: {
          [useCloseSubMenusOnScrollInjectionKey as symbol]: {
            closeExpandedSubMenu,
          },
          [useOverflowStylesInjectionKey as symbol]: ref(overflowStyles),
          [useCommonScrollContainerPropsInjectionKey as symbol]:
            providedScrollContainerRef,
        },
      },
      slots: {
        header: `<div id="${headerSlotId}" />`,
        "cell-selection-overlay": `<div id="${cellSelectionOverlayId}" />`,
        row: (props) => h(TestRow, { data: props.row }),
      },
    });

  let wrapper: VueWrapper<InstanceType<typeof TableCoreVirtual>>;

  const getContainerElement = () => wrapper.find(".container");

  beforeEach(() => {
    wrapper = mountTableCoreVirtual();
  });

  describe("size managers", () => {
    it("uses useVirtualGrid with the correct size managers", () => {
      expect(useVirtualGrid).toHaveBeenCalledWith({
        rows: { sizeManager: expect.any(SameSizeManager) },
        columns: { sizeManager: expect.any(WithSpaceBefore) },
      });
      expect(constructorMocks.WithSpaceBefore).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(WithSpaceAfter),
      );
      expect(constructorMocks.WithSpaceAfter).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(ArraySizeManager),
      );
    });

    describe("rows", () => {
      const getFirstConstructorParams = () =>
        constructorMocks.SameSizeManager.mock.calls[0];
      const getNumRowsParam = (): number =>
        getFirstConstructorParams()[0].value;
      const getRowHeightParam = (): number =>
        getFirstConstructorParams()[1].value;

      it("sets row height", () => {
        expect(getRowHeightParam()).toBe(props.scrollConfig.itemSize);
      });

      it("sets num rows from scrollData length", () => {
        expect(getNumRowsParam()).toBe(scrollDataLength);
      });

      it("adds numRowsAbove and numRowsBelow", () => {
        vi.clearAllMocks();
        props.scrollConfig.numRowsAbove = 10;
        props.scrollConfig.numRowsBelow = 20;
        mountTableCoreVirtual();

        expect(getNumRowsParam()).toBe(scrollDataLength + 30);
      });
    });

    describe("columns", () => {
      it("provides column sizes to array size manager", () => {
        expect(
          constructorMocks.ArraySizeManager.mock.calls[0][0].value,
        ).toStrictEqual(props.columnSizes);
      });

      it("provides collapser and selection size as space before", () => {
        const param = constructorMocks.WithSpaceBefore.mock.calls[0][0];
        expect(param.spaceBefore.value).toBe(
          props.specialColumnSizes.collapserSize +
            props.specialColumnSizes.selectionSize,
        );
        expect(param.spaceBeforeIsOffset).toBeFalsy();
      });

      it("provides rightSideSize as space after", () => {
        expect(constructorMocks.WithSpaceAfter.mock.calls[0][0].value).toBe(
          props.specialColumnSizes.rightSideSize,
        );
      });
    });
  });

  describe("scroll container props", () => {
    it("uses ref provided by useVirtualGrid", () => {
      expect(virtualGridResult.containerProps.ref.value).toBe(
        getContainerElement().element,
      );
    });

    it("uses injected container ref", () => {
      expect(providedScrollContainerRef.value).toBe(
        getContainerElement().element,
      );
    });

    it("calls onScroll provided by useVirtualGrid", () => {
      getContainerElement().trigger("scroll");
      expect(virtualGridResult.containerProps.onScroll).toHaveBeenCalledTimes(
        1,
      );
    });

    it("closes expanded submenus on scroll", () => {
      getContainerElement().trigger("scroll");
      expect(closeExpandedSubMenu).toHaveBeenCalled();
    });
  });

  describe("styles and indices for virtual scrolling", () => {
    const getCellsFromTestRow = (row: VueWrapper) =>
      row.findAll("span").map((span) => JSON.parse(span.attributes().id));
    const getTestRowCells = (wrapper: VueWrapper) =>
      wrapper.findAllComponents(TestRow).map(getCellsFromTestRow);

    const getCell = (i: number, j: number) => ({
      item: getCellContent(i, j),
      index: j,
    });

    it("renders correct rows", async () => {
      virtualGridResult.indices.vertical.value = {
        toArray: () => [1, 2],
        startIndex: 1,
        endIndex: 3,
      };
      await flushPromises();
      expect(getTestRowCells(wrapper)).toStrictEqual([
        [getCell(1, 0)],
        [getCell(2, 0)],
      ]);
    });

    it("uses vertical styles", () => {
      const parentElement =
        wrapper.findComponent(TestRow).element.parentElement;
      expect(parentElement?.style).toMatchObject(
        virtualGridResult.scrolledAreaStyles.vertical.value,
      );
    });

    it("renders rows with undefined data (i.e. empty rows)", async () => {
      await wrapper.setProps({
        scrollConfig: {
          ...props.scrollConfig,
          numRowsAbove: 1,
        },
      });
      virtualGridResult.indices.vertical.value = {
        toArray: () => [1, 2],
        startIndex: 1,
        endIndex: 3,
      };
      await flushPromises();
      expect(getTestRowCells(wrapper)).toStrictEqual([
        [getCell(0, 0)],
        [getCell(1, 0)],
      ]);
      virtualGridResult.indices.vertical.value = {
        toArray: () => [0, 1],
        startIndex: 0,
        endIndex: 2,
      };
      await flushPromises();
      expect(
        wrapper
          .findAllComponents(VirtualRow)
          .map((virtualRow) => virtualRow.props("dataItem")),
      ).toStrictEqual([undefined, expect.objectContaining({})]);
      expect(getTestRowCells(wrapper)).toStrictEqual([[getCell(0, 0)]]);
      virtualGridResult.indices.vertical.value = {
        toArray: () => [3, 4],
        startIndex: 3,
        endIndex: 5,
      };
      await flushPromises();
      expect(
        wrapper
          .findAllComponents(VirtualRow)
          .map((virtualRow) => virtualRow.props("dataItem")),
      ).toStrictEqual([expect.objectContaining({}), undefined]);
      expect(getTestRowCells(wrapper)).toStrictEqual([[getCell(2, 0)]]);
    });

    it("uses horizontal styles", () => {
      const row = wrapper.findComponent(TestRow).find("div").element;
      expect(row.style).toMatchObject(
        virtualGridResult.scrolledAreaStyles.horizontal.value,
      );
    });

    it("renders correct cells", async () => {
      virtualGridResult.indices.horizontal.value = {
        toArray: () => [1, 2],
        startIndex: 1,
        endIndex: 3,
      };
      await flushPromises();
      expect(getTestRowCells(wrapper)).toStrictEqual([
        [getCell(0, 1), getCell(0, 2)],
      ]);
    });
  });

  describe("update event", () => {
    it("emits event when scrolling vertically", async () => {
      expect(wrapper.emitted("scrollerUpdate")).toStrictEqual([[0, 1]]);
      virtualGridResult.indices.vertical.value = {
        toArray: () => [1, 2],
        startIndex: 1,
        endIndex: 3,
      };
      await flushPromises();
      expect(wrapper.emitted("scrollerUpdate")).toStrictEqual([
        [0, 1],
        [1, 3],
      ]);
    });

    it("does not emit an event when scrolling vertically on NaN indices", async () => {
      expect(wrapper.emitted("scrollerUpdate")).toStrictEqual([[0, 1]]);
      virtualGridResult.indices.vertical.value = {
        toArray: () => [1, 2],
        startIndex: NaN,
        endIndex: 3,
      };
      await flushPromises();
      expect(wrapper.emitted("scrollerUpdate")).toStrictEqual([[0, 1]]);
    });
  });

  it("adjusts the scroll properties of the container", () => {
    const scrollTo = 42;
    expect(wrapper.vm.getContainer()?.scrollTop).toBe(0);
    expect(wrapper.vm.getContainer()?.scrollLeft).toBe(0);

    wrapper.vm.scrollToPosition({ top: scrollTo });
    expect(wrapper.vm.getContainer()?.scrollTop).toBe(42);

    wrapper.vm.scrollToPosition({ left: scrollTo });
    expect(wrapper.vm.getContainer()?.scrollLeft).toBe(42);
  });
});
