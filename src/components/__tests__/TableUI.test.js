/* eslint-disable vitest/max-nested-describe */
/* eslint-disable max-lines */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, unref } from "vue";
import { flushPromises, mount } from "@vue/test-utils";

import { SubMenu } from "@knime/components";

import BottomControls from "@/components/control/BottomControls.vue";
import PageControls from "@/components/control/PageControls.vue";
import TopControls from "@/components/control/TopControls.vue";
import ColumnFilters from "@/components/filter/ColumnFilters.vue";
import Group from "@/components/layout/Group.vue";
import Header from "@/components/layout/Header.vue";
import Row from "@/components/layout/Row.vue";
import TablePopover from "@/components/popover/TablePopover.vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import SelectedCellsOverlay from "@/components/ui/CellSelectionOverlay.vue";
import { columnTypes } from "@/config/table.config";
import { SPECIAL_COLUMNS_SIZE } from "@/util/constants";
import TableBodyNavigatable from "../TableBodyNavigatable.vue";
import TableCore from "../TableCore.vue";
import TableCoreGroups from "../TableCoreGroups.vue";
import TableCoreVirtual from "../TableCoreVirtual.vue";
import TableUI from "../TableUI.vue";
import {
  useAvailableWidth,
  useTotalWidth,
} from "../composables/useAvailableWidth";
import CellRenderer from "../layout/CellRenderer.vue";
import ExpandIcon from "../layout/expand.svg";

const bodyWidthResult = 123;
const fitsInsideTotalWidthResult = true;
const availableWidthMock = {
  innerWidthToBodyWidth: vi.fn(() => bodyWidthResult),
  fitsInsideTotalWidth: vi.fn(() => fitsInsideTotalWidthResult),
};
const totalWidthMock = 150;
vi.mock("../composables/useAvailableWidth", () => ({
  useAvailableWidth: vi.fn(() => availableWidthMock),
  useTotalWidth: vi.fn(() => totalWidthMock),
}));

let getMetaOrCtrlKeyMockReturnValue = "";
vi.mock("@knime/utils", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getMetaOrCtrlKey: vi.fn(() => getMetaOrCtrlKeyMockReturnValue),
  };
});

const groupedData = {
  data: [
    [
      { a: "aGroup1Row1", b: "bGroup1Row1" },
      { a: "aGroup1Row2", b: "bGroup1Row2" },
    ],
    [
      { a: "aGroup2Row1", b: "bGroup2Row1" },
      { a: "aGroup2Row2", b: "bGroup2Row2" },
    ],
  ],
  currentSelection: [
    [false, false],
    [false, false],
  ],
};

const topAndBottomData = {
  enableVirtualScrolling: true,
  currentSelection: [[true, false, true]],
  currentBottomSelection: [true, true],
  data: [
    [
      { a: "aGroup1Row1", b: "bGroup1Row1" },
      { a: "aGroup1Row2", b: "bGroup1Row2" },
      { a: "aGroup1Row3", b: "bGroup1Row3" },
    ],
  ],
  bottomData: [
    { a: "aBottomRow1", b: "bBottomRow1" },
    { a: "aBottomRow2", b: "bBottomRow2" },
  ],
};

const getProps = ({
  includeSubHeaders = true,
  enableRowResize = true,
  compactMode = false,
  showSelection = true,
  showCollapser = false,
  reserveSpaceForSubMenu = "auto",
  showSubMenuItems = false,
  showColumnFilters = true,
  showBottomControls = true,
  showPopovers = false,
  enableVirtualScrolling = false,
  enableCellSelection = false,
  rowHeight = null,
  actionButtonConfig = null,
  columnFilterInitiallyActive = null,
  enableIsSortable = false,
  enableDataValueViews = false,
  dataValueViewIsShown = false,
  data = [[{ a: "cellA", b: "cellB" }]],
  currentSelection = [[false]],
  currentBottomSelection = [],
  pageConfig = {
    currentSize: 1,
    tableSize: 1,
    pageSize: 5,
    visibleSize: 5,
    possiblePageSizes: [5, 10, 25],
    currentPage: 1,
    fixHeader: false,
    showTableSize: true,
  },
  searchConfig = { searchQuery: "" },
  numRowsAbove = 0,
  numRowsBelow = 0,
  bottomData = [],
  headerColors = { a: "#ff0000" },
  dynamicRowHeight = false,
}) => ({
  data,
  bottomData,
  numRowsAbove,
  numRowsBelow,
  currentSelection,
  currentBottomSelection,
  dataConfig: {
    columnConfigs: [
      {
        key: "a",
        header: "a",
        ...(includeSubHeaders && { subHeader: "a" }),
        type: columnTypes.Number,
        size: 50,
        hasDataValueView: true,
        filterConfig: {
          value: "",
          is: "FilterInputField",
        },
        formatter: (x) => x,
        classGenerator: [],
        popoverRenderer: {
          type: "MessageRenderer",
          process: (data) => data,
        },
        hasSlotContent: false,
        ...(enableIsSortable && { isSortable: false }),
        ...(headerColors.a && { headerColor: headerColors.a }),
      },
      {
        key: "b",
        header: "b",
        ...(includeSubHeaders && { subHeader: "b" }),
        type: columnTypes.Number,
        size: 50,
        hasDataValueView: false,
        filterConfig: {
          value: "",
          is: "FilterInputField",
        },
        formatter: (x) => x,
        classGenerator: [],
        hasSlotContent: false,
        ...(enableIsSortable && { isSortable: true }),
        ...(headerColors.b && { headerColor: headerColors.b }),
      },
    ],
    rowConfig: {
      compactMode,
      ...(rowHeight ? { rowHeight } : {}),
      ...(dynamicRowHeight ? { rowHeight: "dynamic" } : {}),
      enableResizing: enableRowResize,
    },
  },
  tableConfig: {
    pageConfig,
    showColumnFilters,
    showSelection,
    showCollapser,
    showBottomControls,
    showPopovers,
    searchConfig,
    timeFilterConfig: {
      currentTimeFilter: "",
    },
    enableVirtualScrolling,
    enableDataValueViews,
    dataValueViewIsShown,
    enableCellSelection,
    subMenuItems: [],
    columnSelectionConfig: {
      possibleColumns: ["a", "b"],
      currentColumns: ["a", "b"],
    },
    groupByConfig: {
      currentGroup: null,
    },
    ...(columnFilterInitiallyActive === null
      ? {}
      : { columnFilterInitiallyActive }),
    ...(actionButtonConfig ? { actionButtonConfig } : {}),
    reserveSpaceForSubMenu,
    ...(showSubMenuItems ? { subMenuItems: [{ text: "test" }] } : {}),
  },
});

describe("TableUI.vue", () => {
  let bodySizeEvent;

  const fillVirtualScroller = async (wrapper) => {
    const scroller = wrapper.findComponent(TableCore).find("div");
    Object.defineProperty(scroller.element, "clientHeight", {
      value: 1000,
    });
    wrapper.vm.tableCore.virtualScrollToPosition({ top: 1 });
    wrapper.vm.tableCore.virtualScrollToPosition({ top: 0 });
    await wrapper.vm.$nextTick();
  };

  const doMount = (
    {
      includeSubHeaders = true,
      enableRowResize = true,
      compactMode = false,
      showSelection = true,
      showCollapser = false,
      showSubMenuItems = false,
      reserveSpaceForSubMenu = "auto",
      showColumnFilters = true,
      showBottomControls = true,
      enableVirtualScrolling = false,
      enableCellSelection = false,
      rowHeight = null,
      actionButtonConfig = {},
      columnFilterInitiallyActive = false,
      enableIsSortable = false,
      enableDataValueViews = false,
      dataValueViewIsShown = false,
      data = [[{ a: "cellA", b: "cellB" }]],
      currentSelection = [[false]],
      currentBottomSelection = [],
      pageConfig = {
        currentSize: 1,
        tableSize: 1,
        pageSize: 5,
        visibleSize: 5,
        possiblePageSizes: [5, 10, 25],
        currentPage: 1,
        fixHeader: false,
        showTableSize: true,
      },
      searchConfig = { searchQuery: "" },
      numRowsAbove = 0,
      numRowsBelow = 0,
      shallow = true,
      wrapperHeight = 1000,
      bottomData = [],
      dynamicRowHeight = false,
    } = {},
    stubs = {},
  ) => {
    const props = getProps({
      enableRowResize,
      includeSubHeaders,
      compactMode,
      showSelection,
      showCollapser,
      showSubMenuItems,
      reserveSpaceForSubMenu,
      showColumnFilters,
      showBottomControls,
      enableVirtualScrolling,
      enableCellSelection,
      rowHeight,
      actionButtonConfig,
      columnFilterInitiallyActive,
      enableIsSortable,
      enableDataValueViews,
      dataValueViewIsShown,
      data,
      currentSelection,
      currentBottomSelection,
      pageConfig,
      searchConfig,
      numRowsAbove,
      numRowsBelow,
      bottomData,
      dynamicRowHeight,
    });

    bodySizeEvent.push({ contentRect: { height: wrapperHeight } });

    const wrapper = mount(TableUI, {
      props,
      shallow,
      global: {
        stubs: {
          TableCore,
          TableCoreGroups,
          TableCoreVirtual,
          TableBodyNavigatable,
          ...stubs,
        },
      },
    });

    return { wrapper, props };
  };

  beforeEach(() => {
    bodySizeEvent = [];
    Object.defineProperty(window, "ResizeObserver", {
      writable: true,
      value: vi.fn().mockImplementation((callback) => ({
        observe: vi.fn(() => {
          callback(bodySizeEvent);
        }),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("configuration", () => {
    it("renders", () => {
      const { wrapper } = doMount();
      expect(wrapper.findComponent(TableUI).exists()).toBe(true);
      expect(wrapper.findComponent(TopControls).exists()).toBe(true);
      expect(wrapper.findComponent(BottomControls).exists()).toBe(true);
      expect(wrapper.findComponent(ColumnFilters).exists()).toBe(false);
      expect(wrapper.findComponent(Header).exists()).toBe(true);
      expect(wrapper.findComponent(Group).exists()).toBe(true);
      expect(wrapper.findComponent(Row).exists()).toBe(true);
    });

    it("renders with column filters initially active", () => {
      const { wrapper } = doMount({ columnFilterInitiallyActive: true });

      expect(wrapper.findComponent(ColumnFilters).exists()).toBe(true);
    });

    it("renders with column filters inactive if columnFilterInitiallyActive not provided", () => {
      const { wrapper } = doMount({ columnFilterInitiallyActive: null });

      expect(wrapper.findComponent(ColumnFilters).exists()).toBe(false);
    });

    it("shows column filters via data", async () => {
      const { wrapper } = doMount();

      expect(wrapper.findComponent(TableUI).exists()).toBe(true);
      expect(wrapper.findComponent(Header).exists()).toBe(true);
      expect(wrapper.findComponent(ColumnFilters).exists()).toBe(false);
      await wrapper.setData({ filterActive: true });
      expect(wrapper.findComponent(ColumnFilters).exists()).toBe(true);
    });

    it("shows action button via config", () => {
      const { wrapper } = doMount({
        actionButtonConfig: { text: "Test Button", callback: () => {} },
        showBottomControls: false,
      });

      expect(wrapper.findComponent(TableUI).exists()).toBe(true);
      expect(wrapper.findComponent(BottomControls).exists()).toBe(false);
      expect(wrapper.findComponent(ActionButton).exists()).toBe(true);
    });
  });

  describe("events", () => {
    const getClearSpy = (wrapper) => {
      return vi.spyOn(wrapper.vm, "clearCellSelection");
    };

    describe("top controls", () => {
      it("does not show top controls text if there showTableSize is false", () => {
        const { wrapper } = doMount({
          shallow: false,
          pageConfig: {
            showTableSize: false,
            pageSize: 1,
            possiblePageSizes: [],
          },
        });
        expect(wrapper.findComponent(PageControls).text()).toBe("");
      });

      it("handles next page events", () => {
        const { wrapper } = doMount();

        expect(wrapper.emitted().pageChange).toBeFalsy();
        wrapper.findComponent(TopControls).vm.$emit("nextPage");
        expect(wrapper.emitted().pageChange).toStrictEqual([[1]]);
      });

      it("handles prev page events", () => {
        const { wrapper } = doMount();

        expect(wrapper.emitted().pageChange).toBeFalsy();
        wrapper.findComponent(TopControls).vm.$emit("prevPage");
        expect(wrapper.emitted().pageChange).toStrictEqual([[-1]]);
      });

      it("handles column update events", () => {
        const { wrapper } = doMount();
        const clearCellSelectionSpy = getClearSpy(wrapper);

        expect(wrapper.emitted().columnUpdate).toBeFalsy();
        wrapper.findComponent(TopControls).vm.$emit("columnUpdate", ["A"]);
        expect(wrapper.emitted().columnUpdate).toStrictEqual([[["A"]]]);
        expect(clearCellSelectionSpy).toHaveBeenCalled();
      });

      it("handles column reorder events", () => {
        const { wrapper } = doMount();
        const clearCellSelectionSpy = getClearSpy(wrapper);

        expect(wrapper.emitted().columnReorder).toBeFalsy();
        wrapper.findComponent(TopControls).vm.$emit("columnReorder", 1, 0);
        expect(wrapper.emitted().columnReorder).toStrictEqual([[1, 0]]);
        expect(clearCellSelectionSpy).toHaveBeenCalled();
      });

      it("handles group update events", () => {
        const { wrapper } = doMount();
        const clearCellSelectionSpy = getClearSpy(wrapper);

        expect(wrapper.emitted().groupUpdate).toBeFalsy();
        wrapper.findComponent(TopControls).vm.$emit("groupUpdate", "New Group");
        expect(wrapper.emitted().groupUpdate).toStrictEqual([["New Group"]]);
        expect(clearCellSelectionSpy).toHaveBeenCalled();
      });

      it("handles search events", () => {
        const { wrapper } = doMount();
        const clearCellSelectionSpy = getClearSpy(wrapper);

        expect(wrapper.emitted().search).toBeFalsy();
        wrapper.findComponent(TopControls).vm.$emit("searchUpdate", "Query");
        expect(wrapper.emitted().search).toStrictEqual([["Query"]]);
        expect(clearCellSelectionSpy).toHaveBeenCalled();
      });

      it("handles time filter update events", () => {
        const { wrapper } = doMount();
        const clearCellSelectionSpy = getClearSpy(wrapper);

        expect(wrapper.emitted().timeFilterUpdate).toBeFalsy();
        wrapper
          .findComponent(TopControls)
          .vm.$emit("timeFilterUpdate", "Last year");
        expect(clearCellSelectionSpy).toHaveBeenCalled();
        expect(wrapper.emitted().timeFilterUpdate).toStrictEqual([
          ["Last year"],
        ]);
      });
    });

    describe("header", () => {
      it("handles time header selection events", () => {
        const { wrapper } = doMount();

        expect(wrapper.emitted().selectAll).toBeFalsy();
        wrapper.findComponent(Header).vm.$emit("headerSelect", true);
        expect(wrapper.emitted().selectAll).toStrictEqual([[true]]);
      });

      it("handles column sort events", () => {
        const { wrapper } = doMount();
        const clearCellSelectionSpy = getClearSpy(wrapper);

        expect(wrapper.emitted().columnSort).toBeFalsy();
        wrapper.findComponent(Header).vm.$emit("columnSort", 0);
        expect(wrapper.emitted().columnSort).toStrictEqual([[0]]);
        expect(clearCellSelectionSpy).toHaveBeenCalled();
      });

      it("handles toggle filter events", () => {
        const { wrapper } = doMount();
        const clearCellSelectionSpy = getClearSpy(wrapper);

        expect(wrapper.emitted().toggleFilter).toBeFalsy();
        wrapper.findComponent(Header).vm.$emit("toggleFilter", true);
        expect(wrapper.emitted().toggleFilter).toStrictEqual([[true]]);
        expect(clearCellSelectionSpy).toHaveBeenCalled();
      });

      it("handles header submenu events", () => {
        const subMenuItem = {
          text: "renderer1",
          id: "rend1",
          section: "dataRendering",
          selected: true,
        };
        const { wrapper } = doMount();
        expect(wrapper.emitted().headerSubMenuItemSelection).toBeFalsy();
        wrapper
          .findComponent(Header)
          .vm.$emit("subMenuItemSelection", subMenuItem, 1);
        expect(wrapper.emitted().headerSubMenuItemSelection).toStrictEqual([
          [subMenuItem, 1],
        ]);
      });
    });

    describe("column filter", () => {
      it("handles column filter events", async () => {
        const { wrapper } = doMount();
        const clearCellSelectionSpy = getClearSpy(wrapper);

        wrapper.findComponent(Header).vm.$emit("toggleFilter", true);
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().columnFilter).toBeFalsy();
        wrapper.findComponent(ColumnFilters).vm.$emit("columnFilter", 0, "0");
        expect(wrapper.emitted().columnFilter).toStrictEqual([[0, "0"]]);
        expect(clearCellSelectionSpy).toHaveBeenCalled();
      });

      it("handles clear filter events", async () => {
        const { wrapper } = doMount();
        const clearCellSelectionSpy = getClearSpy(wrapper);

        wrapper.findComponent(Header).vm.$emit("toggleFilter", true);
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().clearFilter).toBeFalsy();
        wrapper.findComponent(ColumnFilters).vm.$emit("clearFilter");
        expect(wrapper.emitted().clearFilter).toBeTruthy();
        expect(clearCellSelectionSpy).toHaveBeenCalled();
      });
    });

    describe("row and group submenus", () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      it("handles row sub menu clicks", () => {
        const { wrapper, props } = doMount();

        let callbackMock = vi.fn();
        wrapper
          .findComponent(Row)
          .vm.$emit("rowSubMenuClick", { callback: callbackMock });
        expect(callbackMock).toHaveBeenCalledWith(
          props.data[0][0],
          expect.anything(),
        );
      });

      it("handles group sub menu clicks", () => {
        const { wrapper } = doMount();

        let callbackMock = vi.fn();
        wrapper
          .findComponent(Group)
          .vm.$emit("groupSubMenuClick", { callback: callbackMock });
        expect(callbackMock).toHaveBeenCalledWith(
          [{ data: { a: "cellA", b: "cellB" } }],
          expect.anything(),
        );
      });

      it("collapses expanded submenu on scroll", async () => {
        const { wrapper } = doMount({ showSubMenuItems: true, shallow: false });
        const callbackMockRow = vi.fn();
        wrapper
          .findComponent(Row)
          .findComponent(SubMenu)
          .vm.$emit("toggle", {}, callbackMockRow);
        vi.advanceTimersToNextTimer();
        expect(callbackMockRow).toHaveBeenCalledTimes(0);
        wrapper.findComponent(TableCoreGroups).trigger("scroll");
        await wrapper.vm.$nextTick();
        expect(callbackMockRow).toHaveBeenCalledTimes(1);

        const callbackMockGroup = vi.fn();
        wrapper
          .findComponent(Group)
          .findComponent(SubMenu)
          .vm.$emit("toggle", {}, callbackMockGroup);
        vi.advanceTimersToNextTimer();
        expect(callbackMockGroup).toHaveBeenCalledTimes(0);
        wrapper.findComponent(TableCoreGroups).trigger("scroll");
        expect(callbackMockRow).toHaveBeenCalledTimes(1);
        expect(callbackMockGroup).toHaveBeenCalledTimes(1);
      });
    });

    describe("rows", () => {
      it("handles select events", () => {
        const { wrapper } = doMount();

        expect(wrapper.emitted().rowSelect).toBeFalsy();
        wrapper.findComponent(Row).vm.$emit("rowSelect", true);
        expect(wrapper.emitted().rowSelect).toStrictEqual([[true, 0, 0, true]]);
      });

      it("handles input events", () => {
        const id = "uuid";
        const { wrapper } = doMount({ data: [[{ id }]] });

        expect(wrapper.emitted().tableInput).toBeFalsy();
        wrapper.findComponent(Row).vm.$emit("rowInput", { cell: true });
        expect(wrapper.emitted().tableInput).toStrictEqual([
          [{ cell: true, rowInd: 0, groupInd: 0, id, isTop: true }],
        ]);
      });

      it("disables row resizing via row config", () => {
        const { wrapper } = doMount({ enableRowResize: false });
        expect(wrapper.findComponent(Row).props().showDragHandle).toBe(false);
      });

      describe("watches row config", () => {
        it("updates row height if row height was changed in parent", async () => {
          const { wrapper } = doMount();
          const resetRowHeightSpy = vi.spyOn(wrapper.vm, "resetRowHeight");
          const props = wrapper.vm.$props;
          wrapper.setProps({
            dataConfig: {
              ...props.dataConfig,
              rowConfig: {
                ...props.dataConfig.rowConfig,
                rowHeight: 999,
              },
            },
          });
          await wrapper.vm.$nextTick();
          expect(resetRowHeightSpy).toHaveBeenCalled();
        });

        it("updates row height if compact mode was changed in parent", async () => {
          const { wrapper } = doMount();
          const resetRowHeightSpy = vi.spyOn(wrapper.vm, "resetRowHeight");
          const props = wrapper.vm.$props;
          wrapper.setProps({
            dataConfig: {
              ...props.dataConfig,
              rowConfig: {
                ...props.dataConfig.rowConfig,
                compactMode: !props.dataConfig.rowConfig.compactMode,
              },
            },
          });
          await wrapper.vm.$nextTick();
          expect(resetRowHeightSpy).toHaveBeenCalled();
        });
      });

      it("handles resize all rows event", async () => {
        const { wrapper } = doMount();
        const row = wrapper.findComponent(Row);
        const scrollIntoViewSpy = vi.fn();
        row.vm.$el.scrollIntoView = scrollIntoViewSpy;
        row.vm.$emit("resizeAllRows", 123, row.vm.$el);
        expect(wrapper.vm.currentRowSizeDelta).toBe(0);
        expect(wrapper.vm.currentRowHeight).toBe(123);
        expect(scrollIntoViewSpy).toHaveBeenCalled();
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted()).toHaveProperty("rowHeightUpdate");
        expect(wrapper.emitted().rowHeightUpdate).toHaveLength(1);
        expect(wrapper.emitted().rowHeightUpdate[0]).toStrictEqual([123]);
      });

      describe("row resize with virtual scrolling enabled", () => {
        it("handles rowResize event for single row", async () => {
          const { wrapper } = doMount({
            enableVirtualScrolling: true,
            shallow: false,
          });
          const resizeRowSpy = vi.spyOn(wrapper.vm, "onResizeRow");
          await fillVirtualScroller(wrapper);
          const row = wrapper.findComponent(Row);
          expect(row.exists()).toBeTruthy();
          row.vm.$emit("resizeRow", 123);
          expect(resizeRowSpy).toHaveBeenCalledWith(123, 0);
        });

        describe("resize all rows", () => {
          it("handles resizeAllRows event", async () => {
            const { wrapper } = doMount({
              enableVirtualScrolling: true,
              shallow: false,
            });
            const resizeRowSpy = vi.spyOn(wrapper.vm, "onResizeAllRows");
            await fillVirtualScroller(wrapper);
            const row = wrapper.findComponent(Row);
            row.vm.$emit("resizeAllRows", 123, row);
            expect(resizeRowSpy).toHaveBeenCalled();
          });

          it("onResizeAllRows updates all row sizes", () => {
            vi.useFakeTimers();
            const virtualScrollToPosition = vi.fn();
            const start = 100;
            const stubs = {
              TableCore: {
                template: "<span/>",
                methods: {
                  getVirtualScrollStart: () => start,
                  virtualScrollToPosition,
                  getVirtualBody: () => ({}),
                },
              },
            };
            let resizeObserverCallback = () => {};
            window.ResizeObserver = vi.fn((callback) => {
              resizeObserverCallback = callback;
              return {
                observe: () => null,
                unobserve: () => null,
                disconnect: () => null,
              };
            });
            const { wrapper } = doMount(
              {
                enableVirtualScrolling: true,
                shallow: false,
              },
              stubs,
            );

            const oldSize = 99;
            const newSize = 123;
            const scrollIndex = 5;

            wrapper.vm.resizedRowHeight = oldSize;
            wrapper.vm.currentResizedScrollIndex = 5;

            wrapper.vm.onResizeAllRows(newSize, null, scrollIndex);
            expect(wrapper.vm.currentRowHeight).toBe(newSize);
            resizeObserverCallback();
            vi.runAllTimers();
            expect(wrapper.vm.currentResizedScrollIndex).toBeNull();
            const offset = scrollIndex * oldSize - start;
            expect(virtualScrollToPosition).toHaveBeenCalledWith({
              top: scrollIndex * newSize - offset,
            });
            vi.useRealTimers();
          });
        });
      });
    });

    describe("bottom controls", () => {
      it("handles next page events", () => {
        const { wrapper } = doMount();
        const clearCellSelectionSpy = getClearSpy(wrapper);

        expect(wrapper.emitted().pageChange).toBeFalsy();
        wrapper.findComponent(BottomControls).vm.$emit("nextPage");
        expect(wrapper.emitted().pageChange).toStrictEqual([[1]]);
        expect(clearCellSelectionSpy).toHaveBeenCalled();
      });

      it("handles prev page events", () => {
        const { wrapper } = doMount();
        const clearCellSelectionSpy = getClearSpy(wrapper);

        expect(wrapper.emitted().pageChange).toBeFalsy();
        wrapper.findComponent(BottomControls).vm.$emit("prevPage");
        expect(wrapper.emitted().pageChange).toStrictEqual([[-1]]);
        expect(clearCellSelectionSpy).toHaveBeenCalled();
      });

      it("registers pageSizeUpdate events", () => {
        const { wrapper } = doMount();
        const clearCellSelectionSpy = getClearSpy(wrapper);

        expect(wrapper.emitted().pageSizeUpdate).toBeFalsy();
        wrapper.findComponent(BottomControls).vm.$emit("pageSizeUpdate", 25);
        expect(wrapper.emitted().pageSizeUpdate).toStrictEqual([[25]]);
        expect(clearCellSelectionSpy).toHaveBeenCalled();
      });
    });

    describe("table popover", () => {
      it("opens and closes default Popover", async () => {
        const { wrapper } = doMount();

        expect(wrapper.findComponent(TablePopover).exists()).toBeFalsy();
        expect(wrapper.vm.popoverColumn).toBeFalsy();
        expect(wrapper.vm.popoverData).toBeFalsy();
        expect(wrapper.vm.popoverRenderer).toBeFalsy();
        expect(wrapper.vm.popoverTarget).toBeFalsy();
        wrapper.findAllComponents(Row).at(0).vm.$emit("rowInput", {
          colInd: 1,
          cell: "<td>1</td>",
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(TablePopover).exists()).toBeTruthy();
        expect(wrapper.vm.popoverColumn).toBe("b");
        expect(wrapper.vm.popoverData).toBe("cellB");
        expect(wrapper.vm.popoverRenderer).toStrictEqual(columnTypes.Number);
        expect(wrapper.vm.popoverTarget).toBe("<td>1</td>");
        wrapper.findComponent(TablePopover).vm.$emit("close");
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(TablePopover).exists()).toBeFalsy();
        expect(wrapper.vm.popoverColumn).toBeFalsy();
        expect(wrapper.vm.popoverData).toBeFalsy();
        expect(wrapper.vm.popoverRenderer).toBeFalsy();
        expect(wrapper.vm.popoverTarget).toBeFalsy();
      });

      it("uses configured popover renderer", () => {
        const { wrapper } = doMount();

        wrapper.findAllComponents(Row).at(0).vm.$emit("rowInput", {
          colInd: 0,
          cell: "<td>cellA</td>",
        });
        expect(wrapper.vm.popoverRenderer).toStrictEqual({
          process: expect.any(Function),
          type: "MessageRenderer",
        });
      });
    });

    describe("column resize", () => {
      it("emits a columnResize event on columnResize", () => {
        const { wrapper } = doMount();

        expect(wrapper.emitted().columnResize).toBeFalsy();
        wrapper.findComponent(Header).vm.$emit("columnResize", 0, 30);
        expect(wrapper.emitted().columnResize).toBeTruthy();
      });
    });
  });

  describe("the width of the table, its header and its body", () => {
    it("uses available width composables", async () => {
      useTotalWidth.mockClear();
      useAvailableWidth.mockClear();
      const { wrapper } = doMount({
        shallow: false,
        enableVirtualScrolling: false,
      });
      const [providedWrapper] = useTotalWidth.mock.calls[0];
      const [
        {
          emitAvailableWidth,
          refs: { scrolledElement },
          totalWidth,
        },
      ] = useAvailableWidth.mock.calls[0];
      await wrapper.vm.$nextTick();
      expect(unref(providedWrapper)).toBe(wrapper.find("table").wrapperElement);
      expect(unref(scrolledElement)).toStrictEqual(
        wrapper.findComponent(TableCoreGroups).element,
      );
      expect(unref(totalWidth)).toBe(totalWidthMock);
      emitAvailableWidth(123);
      expect(wrapper.emitted()["update:available-width"]).toStrictEqual([
        [123],
      ]);
    });

    describe("specialColumnsTotalWidth", () => {
      const getSpecialColumnsSizeTotal = (settings) => {
        useAvailableWidth.mockClear();
        doMount(settings);
        const [{ specialColumnsSizeTotal }] = useAvailableWidth.mock.calls[0];
        return specialColumnsSizeTotal;
      };

      let specialColumnsSettings;

      beforeEach(() => {
        specialColumnsSettings = {
          showColumnFilters: false,
          showCollapser: false,
          showSelection: false,
          showSubMenuItems: false,
        };
      });

      it("is 0 for no special columns", () => {
        expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(
          0,
        );
      });

      it("respects collapsers", () => {
        specialColumnsSettings.showCollapser = true;
        expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(
          SPECIAL_COLUMNS_SIZE,
        );
      });

      it("respects selection", () => {
        specialColumnsSettings.showSelection = true;
        expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(
          SPECIAL_COLUMNS_SIZE,
        );
      });

      it("respects column filters", () => {
        specialColumnsSettings.showColumnFilters = true;
        expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(
          SPECIAL_COLUMNS_SIZE,
        );
      });

      it("respects automatic sub menus", () => {
        specialColumnsSettings.showSubMenuItems = true;
        expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(
          SPECIAL_COLUMNS_SIZE,
        );
      });

      it("respects custom submenus", () => {
        specialColumnsSettings.reserveSpaceForSubMenu = "always";
        expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(
          SPECIAL_COLUMNS_SIZE,
        );
      });

      it("respects multiple special columns", () => {
        specialColumnsSettings.showColumnFilters = true;
        specialColumnsSettings.showSelection = true;
        specialColumnsSettings.showCollapser = true;
        expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(
          SPECIAL_COLUMNS_SIZE * 3,
        );
      });

      it("uses the same space for menu items and column filters", () => {
        specialColumnsSettings.showColumnFilters = true;
        specialColumnsSettings.showSubMenuItems = true;
        expect(unref(getSpecialColumnsSizeTotal(specialColumnsSettings))).toBe(
          SPECIAL_COLUMNS_SIZE,
        );
      });
    });

    it("sets current body width", async () => {
      const { wrapper } = doMount();
      expect(availableWidthMock.innerWidthToBodyWidth).toHaveBeenCalledWith(
        100,
      );
      expect(wrapper.findComponent(Group).element.style.width).toBe(
        `${bodyWidthResult}px`,
      );
      expect(wrapper.findComponent(Header).element.style.width).toBe(
        `${bodyWidthResult}px`,
      );

      await wrapper.setData({
        filterActive: true,
      });
      expect(wrapper.findComponent(ColumnFilters).element.style.width).toBe(
        `${bodyWidthResult}px`,
      );
    });

    it("hides horizontal scrollbar when the body fits without it", () => {
      const { wrapper } = doMount();
      expect(availableWidthMock.fitsInsideTotalWidth).toHaveBeenCalledWith(
        bodyWidthResult,
      );
      expect(wrapper.findComponent(TableCore).classes()).not.toContain(
        "horizontal-scroll",
      );
    });

    it("uses different scrolled element in case of virtual scrolling", () => {
      useAvailableWidth.mockClear();
      const { wrapper } = doMount({
        enableVirtualScrolling: true,
        shallow: false,
      });
      const [
        {
          refs: { scrolledElement },
        },
      ] = useAvailableWidth.mock.calls[0];

      expect(unref(scrolledElement)).toBe(
        wrapper.findComponent(TableCore).find("div").element,
      );
    });
  });

  describe("column specific sort config", () => {
    it("adds true to the columnSortConfigs for column configs that do not have the isSortable key", () => {
      const { wrapper } = doMount({ enableIsSortable: false });

      expect(wrapper.vm.columnSortConfigs).toEqual([true, true]);
    });

    it("adds the corresponding isSortable value to the columnSortConfigs if specified", () => {
      const { wrapper } = doMount({ enableIsSortable: true });

      expect(wrapper.vm.columnSortConfigs).toEqual([false, true]);
    });
  });

  describe("the height of the rows", () => {
    it("sets default height of rows if no height is given", () => {
      const { wrapper } = doMount();

      expect(wrapper.vm.currentRowHeight).toBe(40);
    });

    it("sets given rowHeight", () => {
      const rowHeight = 35;
      const { wrapper } = doMount({ rowHeight });

      expect(wrapper.vm.currentRowHeight).toEqual(rowHeight);
    });

    it("sets small height of rows on compact mode", () => {
      const { wrapper } = doMount({ compactMode: true });

      expect(wrapper.vm.currentRowHeight).toBe(24);
    });
  });

  describe("virtual scrolling", () => {
    beforeEach(() => {
      window.IntersectionObserver = vi.fn(() => ({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null,
      }));
    });

    it("renders virtual scroller when enabled", () => {
      const { wrapper } = doMount({
        enableVirtualScrolling: true,
        shallow: false,
      });

      expect(wrapper.findComponent(TableCoreVirtual).exists()).toBeTruthy();
    });

    it("exposes method to scroll to the top of the recycle scroller", () => {
      const { wrapper } = doMount({
        enableVirtualScrolling: true,
        shallow: false,
      });
      wrapper.vm.tableCore.virtualScrollToPosition({ top: 1 });
      expect(wrapper.vm.tableCore.getVirtualScrollStart()).toBe(1);

      wrapper.vm.refreshScroller();
      expect(wrapper.vm.tableCore.getVirtualScrollStart()).toBe(0);
    });

    it("emits lazyloading event onScroll", async () => {
      const { wrapper } = doMount({
        enableVirtualScrolling: true,
        shallow: false,
        data: [
          Array.from({ length: 1000 }, (_v, i) => ({
            a: `a_${i}`,
            b: `b_${i}`,
          })),
        ],
      });
      expect(wrapper.emitted().lazyload[0][0]).toStrictEqual({
        direction: 1,
        startIndex: 0,
        endIndex: 13,
      });
      wrapper.vm.tableCore.virtualScrollToPosition({ top: 1000 });
      await flushPromises();
      await flushPromises();
      expect(wrapper.emitted().lazyload[1][0]).toStrictEqual({
        direction: 1,
        startIndex: 12,
        endIndex: 37,
      });
    });

    it("supplies scroll data", () => {
      const { wrapper } = doMount({
        enableVirtualScrolling: true,
        shallow: false,
      });
      expect(wrapper.vm.scrollData).toStrictEqual([
        [
          {
            data: { a: "cellA", b: "cellB" },
          },
        ],
      ]);
    });

    it("adds bottom data to the scroll data", () => {
      const { wrapper } = doMount({
        enableVirtualScrolling: true,
        bottomData: [["foo"], ["bar"]],
        shallow: false,
      });
      expect(wrapper.vm.scrollData).toStrictEqual([
        [
          {
            data: { a: "cellA", b: "cellB" },
          },
          { dots: true },
          {
            data: ["foo"],
          },
          {
            data: ["bar"],
          },
        ],
      ]);
    });

    it("adds bottom data to the scroll data without top data", () => {
      const { wrapper } = doMount({
        enableVirtualScrolling: true,
        numRowsAbove: 2,
        data: [[]],
        bottomData: [["foo"], ["bar"]],
        shallow: false,
      });
      expect(wrapper.vm.scrollData).toStrictEqual([
        [
          {
            data: ["foo"],
          },
          {
            data: ["bar"],
          },
        ],
      ]);
    });

    it("computes selection for top and bottom rows", async () => {
      const numRowsAbove = 3;
      const numRowsBelow = 3;

      const { wrapper } = doMount({
        shallow: false,
        numRowsAbove,
        numRowsBelow,
        ...topAndBottomData,
      });

      await fillVirtualScroller(wrapper);

      const rows = wrapper.findAllComponents(Row);
      // Top rows
      expect(rows[0].props().isSelected).toBe(true);
      expect(rows[1].props().isSelected).toBe(false);
      expect(rows[2].props().isSelected).toBe(true);
      // Bottom rows
      expect(rows[3].props().isSelected).toBe(true);
      expect(rows[4].props().isSelected).toBe(true);
    });

    it("selects nothing when selection is not shown", () => {
      const { wrapper } = doMount({
        showSelection: false,
      });
      const selectionMap = wrapper.vm.currentSelectionMap;

      expect(selectionMap(0, true)).toBe(false);
      expect(selectionMap(1, true)).toBe(false);
      expect(selectionMap(2, true)).toBe(false);
    });
  });

  describe("cell selection", () => {
    let wrapper, selectCellSpy, expandCellSelectionSpy, clearCellSelectionSpy;

    beforeEach(() => {
      const comp = doMount({
        enableCellSelection: true,
      });
      wrapper = comp.wrapper;
      expandCellSelectionSpy = vi.spyOn(wrapper.vm, "expandCellSelection");
      selectCellSpy = vi.spyOn(wrapper.vm, "selectCell");
      clearCellSelectionSpy = vi.spyOn(wrapper.vm, "clearCellSelection");
    });

    it("selects cell on row event", () => {
      const row = wrapper.findComponent(Row);
      const colInd = 3;

      row.vm.$emit("cell-select", colInd);

      expect(selectCellSpy).toHaveBeenCalledWith(
        {
          x: colInd,
          y: 0,
        },
        0,
        false,
      );
    });

    it("expands cell selection on row event", () => {
      const row = wrapper.findComponent(Row);
      const colInd = 3;

      row.vm.$emit("expand-cell-select", colInd);

      expect(expandCellSelectionSpy).toHaveBeenCalledWith(
        {
          x: colInd,
          y: 0,
        },
        0,
      );
    });

    describe("overlay", () => {
      it("displays no overlay if nothing is selected", () => {
        expect(
          wrapper.findComponent(SelectedCellsOverlay).exists(),
        ).toBeFalsy();
      });

      it.each([true, false])(
        "displays overlay once something is selected and enableVirtualScrolling is %s",
        async (enableVirtualScrolling) => {
          const { wrapper } = doMount({
            enableVirtualScrolling,
            enableCellSelection: true,
            shallow: false,
          });

          const rectMinMax = { x: { min: 1, max: 1 }, y: { min: 2, max: 2 } };
          const selectedCell = { x: 1, y: 2 };
          wrapper.vm.selectCell(selectedCell, 0, false);
          await nextTick();

          const overlay = wrapper.findComponent(SelectedCellsOverlay);
          expect(overlay.exists()).toBeTruthy();
          expect(overlay.props()).toStrictEqual({
            columnSizes: [50, 50],
            rect: rectMinMax,
            rowHeight: 41,
            rowResizeDelta: null,
            rowResizeIndex: null,
            tableConfig: wrapper.vm.tableConfig,
            cellSelectionRectFocusCorner: selectedCell,
          });
        },
      );

      it("displays overlay for the correct group", async () => {
        const { wrapper } = doMount({
          ...groupedData,
          enableCellSelection: true,
        });

        wrapper.vm.selectCell({ x: 1, y: 2 }, 1, false);
        await nextTick();
        let groups = wrapper.findAllComponents(Group);
        expect(groups).toHaveLength(2);
        expect(
          groups.at(0).findComponent(SelectedCellsOverlay).exists(),
        ).toBeFalsy();
        expect(
          groups.at(1).findComponent(SelectedCellsOverlay).exists(),
        ).toBeTruthy();

        wrapper.vm.selectCell({ x: 1, y: 2 }, 0, false);
        await nextTick();

        expect(
          groups.at(0).findComponent(SelectedCellsOverlay).exists(),
        ).toBeTruthy();
        expect(
          groups.at(1).findComponent(SelectedCellsOverlay).exists(),
        ).toBeFalsy();
      });
    });

    it("activates selecting cells by mouse move on pointerdown", async () => {
      wrapper.find("table").trigger("pointerdown", { button: 0 });
      await wrapper.vm.$nextTick();
      const row = wrapper.findComponent(Row);
      expect(row.props().selectCellsOnMove).toBeTruthy();
    });

    it("does not activates selecting cells by mouse move on non-left pointerdown", async () => {
      wrapper.find("table").trigger("pointerdown", { button: 1 });
      await wrapper.vm.$nextTick();
      const row = wrapper.findComponent(Row);
      expect(row.props().selectCellsOnMove).toBeFalsy();
    });

    it("deactivates selecting cells by mouse move on pointerup", async () => {
      wrapper.find("table").trigger("pointerdown", { button: 0 });
      await wrapper.vm.$nextTick();

      wrapper.find("table").trigger("pointerup", { button: 0 });
      await wrapper.vm.$nextTick();

      const row = wrapper.findComponent(Row);
      expect(row.props().selectCellsOnMove).toBeFalsy();
    });

    it("deactivates selecting cells by mouse move on pointerleave", async () => {
      wrapper.find("table").trigger("pointerdown");
      await wrapper.vm.$nextTick();

      wrapper.find("table").trigger("pointerleave");
      await wrapper.vm.$nextTick();

      const row = wrapper.findComponent(Row);
      expect(row.props().selectCellsOnMove).toBeFalsy();
    });

    describe("emits copySelection event", () => {
      let triggerCopied, stubs;

      beforeEach(() => {
        triggerCopied = vi.fn();
        stubs = {
          CellSelectionOverlay: {
            template: "<div/>",
            methods: {
              triggerCopied,
            },
          },
        };
      });

      const initializeSelection = async (wrapper) => {
        const id = 0;
        wrapper.vm.selectCell({ x: 1, y: 2 }, id, false);
        wrapper.vm.expandCellSelection({ x: 2, y: 2 }, id);
        const rect = { x: { min: 1, max: 2 }, y: { min: 2, max: 2 } };
        await nextTick();
        return { id, rect };
      };

      it.each([false, true])(
        "when copy event is received and focus is within table with virtualScrolling = %s",
        async (enableVirtualScrolling) => {
          const { wrapper } = doMount(
            {
              enableVirtualScrolling,
              enableCellSelection: true,
              shallow: false,
            },
            stubs,
          );

          const { rect, id } = await initializeSelection(wrapper);

          wrapper.find("table").trigger("focusin");
          window.dispatchEvent(new Event("copy"));

          expect(wrapper.emitted("copySelection")[0]).toStrictEqual([
            { id, rect, withHeaders: false },
          ]);
          expect(triggerCopied).toHaveBeenCalled();
        },
      );

      it.each([
        ["meta.shift.c", "mac", "metaKey"],
        ["ctrl.shift.c", "different os than mac", "ctrlKey"],
      ])("when pressing %s on %s", async (copyKeys, _, metaOrCtrlKey) => {
        getMetaOrCtrlKeyMockReturnValue = metaOrCtrlKey;
        const { wrapper } = doMount(
          { shallow: false, enableCellSelection: true },
          stubs,
        );
        const { rect, id } = await initializeSelection(wrapper);
        await wrapper.find("table").trigger("focusin");
        await wrapper.find("table").trigger(`keydown.${copyKeys}.exact`);
        expect(wrapper.emitted("copySelection")[0]).toStrictEqual([
          { id, rect, withHeaders: true },
        ]);
      });

      describe("keyboard navigation", () => {
        it("positions the overlay in the first row on triggering keydown down on a header", async () => {
          const { wrapper } = doMount(
            {
              enableVirtualScrolling: true,
              shallow: false,
              enableCellSelection: true,
            },
            stubs,
          );
          const selectCellSpy = vi.spyOn(wrapper.vm, "selectCell");
          await wrapper
            .findComponent(Header)
            .findAll(".column-header-content")
            .at(1)
            .trigger("keydown", { key: "ArrowDown" });

          expect(selectCellSpy).toHaveBeenCalledWith(
            { x: 1, y: 0 },
            true,
            false,
          );
        });

        it.each([[true, false]])(
          "clears the selection on tabbing on the body if enableVirtualScrolling is %s",
          async (enableVirtualScrolling) => {
            const { wrapper } = doMount(
              {
                enableVirtualScrolling,
                enableCellSelection: true,
                shallow: false,
              },
              stubs,
            );
            wrapper.vm.selectCell({ x: 1, y: 2 }, 0, false);

            wrapper.find("tbody").trigger("keydown", { key: "Tab" });
            await nextTick();

            expect(wrapper.vm.selectedCell).toBeFalsy();
          },
        );

        it.each([
          ["the first group", 0, false],
          ["virtual scrolling", 0, true],
        ])(
          "focusses the header of the column on ArrowUp in the first row of %s",
          (_desc, rectId, enableVirtualScrolling) => {
            const selectedCell = { x: 1, y: 0 };

            const { wrapper } = doMount(
              {
                enableVirtualScrolling,
                enableCellSelection: true,
                shallow: false,
              },
              stubs,
            );
            clearCellSelectionSpy = vi.spyOn(wrapper.vm, "clearCellSelection");
            wrapper.vm.selectCell(selectedCell, rectId, false);
            const focusHeaderCellSpy = vi.spyOn(wrapper.vm, "focusHeaderCell");
            wrapper.vm.onKeyboardMoveSelection(0, -1, true);
            expect(clearCellSelectionSpy).toHaveBeenCalled();
            expect(focusHeaderCellSpy).toHaveBeenCalledWith(1);
          },
        );

        it.each([
          ["left", -1, 0],
          ["right", 1, 1],
        ])(
          "does not navigate horizontally out of bounds to the %s",
          async (_, direction, currentFocusX) => {
            const selectedCell = {
              x: currentFocusX,
              y: 2,
            };
            const { wrapper } = doMount({ shallow: false }, stubs);
            wrapper.vm.selectCell(selectedCell, 0, false);
            await nextTick();
            wrapper.vm.onKeyboardMoveSelectionGroups = vi.fn();
            wrapper.vm.onKeyboardMoveSelectionVirtual = vi.fn();

            wrapper.vm.onKeyboardMoveSelection(direction, 0, true);
            expect(clearCellSelectionSpy).not.toHaveBeenCalled();
            expect(
              wrapper.vm.onKeyboardMoveSelectionGroups,
            ).not.toHaveBeenCalled();
            expect(
              wrapper.vm.onKeyboardMoveSelectionVirtual,
            ).not.toHaveBeenCalled();
          },
        );

        const prepareOnKeyboardMoveSelectionForGroupsAndVirtual = async (
          useGroupedData,
          focusCorner,
          rectId,
          anchor = null,
        ) => {
          const { wrapper } = doMount(
            {
              shallow: false,
              enableCellSelection: true,
              ...(useGroupedData ? groupedData : topAndBottomData),
            },
            stubs,
          );

          if (anchor === null) {
            wrapper.vm.selectCell(focusCorner, rectId, false);
          } else {
            wrapper.vm.selectCell(anchor, rectId, false);
            wrapper.vm.expandCellSelection(focusCorner, rectId);
          }
          await nextTick();

          wrapper.vm.getSelectionOverlayComponent = vi
            .fn()
            .mockReturnValue({ scrollFocusOverlayIntoView: vi.fn() });

          wrapper.vm.onExpandCellSelect = vi.fn();
          return wrapper;
        };

        describe("onKeyboardMoveSelectionGroups", () => {
          it.each([
            [1, 1, 0, [1, 0, 1]],
            [-1, 0, 1, [1, 1, 0]],
          ])(
            "switches between groups in vertical direction (%s)",
            async (direction, focusY, rectId, result) => {
              wrapper = await prepareOnKeyboardMoveSelectionForGroupsAndVirtual(
                true,
                { x: 1, y: focusY },
                rectId,
                {
                  x: focusY,
                  y: 1,
                },
              );

              wrapper.vm.onKeyboardMoveSelection(0, direction, true);
              expect(wrapper.vm.onExpandCellSelect).toHaveBeenCalledWith(
                ...result,
              );
            },
          );

          it("does not navigate vertically downwards out of bounds for the last group", async () => {
            wrapper = await prepareOnKeyboardMoveSelectionForGroupsAndVirtual(
              true,
              { x: 1, y: 1 },
              1,
            );

            wrapper.vm.onKeyboardMoveSelection(0, 1, true);
            expect(wrapper.vm.onExpandCellSelect).not.toHaveBeenCalled();
          });

          it("allows navigating horizontally", async () => {
            wrapper = await prepareOnKeyboardMoveSelectionForGroupsAndVirtual(
              true,
              { x: 1, y: 1 },
              1,
            );

            wrapper.vm.onKeyboardMoveSelection(-1, 0, true);
            expect(wrapper.vm.onExpandCellSelect).toHaveBeenCalledWith(0, 1, 1);
          });
        });

        describe("onKeyboardMoveSelectionVirtual", () => {
          it("does not navigate vertically downwards out of bounds", async () => {
            wrapper = await prepareOnKeyboardMoveSelectionForGroupsAndVirtual(
              false,
              { x: 1, y: 5 },
              false,
            );

            expect(wrapper.vm.onExpandCellSelect).not.toHaveBeenCalled();
          });

          it.each([
            [1, 2, true, [1, 4, null]],
            [-1, 3, false, [1, 2, null]],
          ])(
            "can navigate between top and bottom data in vertical direction (%s)",
            async (direction, focusY, rectId, result) => {
              wrapper = await prepareOnKeyboardMoveSelectionForGroupsAndVirtual(
                false,
                { x: 1, y: focusY },
                rectId,
                { x: focusY, y: 1 },
              );

              wrapper.vm.onKeyboardMoveSelection(0, direction, true);
              expect(wrapper.vm.onExpandCellSelect).toHaveBeenCalledWith(
                ...result,
              );
            },
          );

          it("allows navigating horizontally", async () => {
            wrapper = await prepareOnKeyboardMoveSelectionForGroupsAndVirtual(
              false,
              { x: 1, y: 1 },
              true,
            );

            wrapper.vm.onKeyboardMoveSelection(-1, 0, true);
            expect(wrapper.vm.onExpandCellSelect).toHaveBeenCalledWith(
              0,
              1,
              null,
            );
          });
        });
      });
    });

    it("does not emit copySelection event when copy event is received and focus is outside of table", async () => {
      wrapper.vm.selectCell({ x: 1, y: 2 }, 0, false);
      await nextTick();

      wrapper.find("table").trigger("focusout");
      window.dispatchEvent(new Event("copy"));

      expect(wrapper.emitted("copySelection")).toBeUndefined();
    });

    it.each([
      ["meta.shift.c", "different os than mac", "metaKey"],
      ["ctrl.shift.c", "mac", "ctrlKey"],
    ])(
      "does not emit copySelection event when pressing %s on %s",
      async (copyKeys, _, metaOrCtrlKey) => {
        getMetaOrCtrlKeyMockReturnValue = metaOrCtrlKey;
        await nextTick();
        await wrapper.find("table").trigger("focusin");

        wrapper.find("table").trigger(`keydown.${copyKeys}.exact`);
        expect(wrapper.emitted("copySelection")).toBeUndefined();
      },
    );
  });

  describe("drag handle height", () => {
    const setHeight = (element, value) => {
      Object.defineProperty(element, "offsetHeight", { value });
    };

    it("computes drag handle height", () => {
      const { wrapper } = doMount();
      setHeight(wrapper.findComponent(TableCoreGroups).element, 100);
      expect(wrapper.findComponent(Header).props().getDragHandleHeight()).toBe(
        100,
      );
    });

    describe("virtual scrolling", () => {
      let wrapper;

      beforeEach(() => {
        wrapper = doMount({
          enableVirtualScrolling: true,
          shallow: false,
        }).wrapper;
      });

      const setHeaderHeight = (value) => {
        setHeight(wrapper.find(".header-container").element, value);
      };

      const setBodyHeight = (value) => {
        setHeight(wrapper.find("tbody").element, value);
      };

      const setTotalScrollerHeight = (value) => {
        setHeight(wrapper.findComponent(TableCore).find("div").element, value);
      };

      it("computes drag handle height from header and body for non-scrollable RecycleScroller", () => {
        setHeaderHeight(100);
        setBodyHeight(100);
        setTotalScrollerHeight(1000); // > 100 + 100

        expect(
          wrapper.findComponent(Header).props().getDragHandleHeight(),
        ).toBe(200);
      });

      it("computes drag handle height from root scroller element for scrollable RecycleScroller", () => {
        setHeaderHeight(100);
        setBodyHeight(100);
        setTotalScrollerHeight(50); // < 100 + 100

        expect(
          wrapper.findComponent(Header).props().getDragHandleHeight(),
        ).toBe(50);
      });
    });
  });

  describe("data value views", () => {
    let wrapper;

    const selectedCell = { x: 0, y: 0 };

    beforeEach(() => {
      wrapper = doMount({
        shallow: false,
        enableDataValueViews: true,
        enableCellSelection: true,
      }).wrapper;
    });

    it("emits data value view event", async () => {
      await wrapper.findComponent(CellRenderer).vm.$emit("expand");
      expect(wrapper.emitted("dataValueView")).toStrictEqual([
        [
          {
            indexInInput: 0,
            isTop: true,
          },
          0,
          {
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            width: 0,
            x: 0,
            y: 0,
          },
        ],
      ]);
      expect(wrapper.vm.toBeShownCell).toBeNull();
    });

    const selectCell = async (wrapper) => {
      wrapper.vm.selectCell(selectedCell, 0, false);
      await nextTick();
    };

    it("shows expand icon when cell is selected", async () => {
      await selectCell(wrapper);

      const row = wrapper.findComponent(Row);
      const cellRenderer = row.findComponent(CellRenderer);
      expect(cellRenderer.findComponent(ExpandIcon).classes()).toContain(
        "cell-selected",
      );
    });

    it.each([[" "], ["Enter"]])(
      "opens data value view for selected cell on '%s'",
      async (key) => {
        await selectCell(wrapper);
        await wrapper.find("tbody").trigger("keydown", { key });
        await flushPromises();
        expect(wrapper.emitted("dataValueView")[0]).toStrictEqual([
          {
            indexInInput: 0,
            isTop: true,
          },
          0,
          {
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            width: 0,
            x: 0,
            y: 0,
          },
        ]);
      },
    );

    it("closes the current data value view on 'Escape'", async () => {
      wrapper = doMount({
        shallow: false,
        enableDataValueViews: true,
        dataValueViewIsShown: true,
      }).wrapper;
      await wrapper.find("tbody").trigger("keydown", { key: "Escape" });
      expect(wrapper.emitted("closeDataValueView")).toBeDefined();
    });

    it("does not close the current data value view on 'Escape' if none is shown", async () => {
      await wrapper.find("tbody").trigger("keydown", { key: "Escape" });
      expect(wrapper.emitted("closeDataValueView")).toBeUndefined();
      expect(wrapper.vm.toBeShownCell).toBeNull();
    });

    describe("opening and closing data value views on arrow keys", () => {
      beforeEach(async () => {
        wrapper = doMount({
          shallow: false,
          enableDataValueViews: true,
          enableCellSelection: true,
          dataValueViewIsShown: true,
          data: [
            [
              { a: "cellA_1", b: "cellB_1" },
              { a: "cellA_2", b: "cellB_2" },
            ],
          ],
        }).wrapper;

        await selectCell(wrapper); // x: 0, y: 0
        expect(wrapper.emitted("dataValueView")).toBeUndefined();
        expect(wrapper.emitted("closeDataValueView")).toBeUndefined();
      });

      it("opens the next data value view when navigating to another expandable cell", async () => {
        // ArrowDown leads to an expandable cell, since column a has data value views
        await wrapper.find("tbody").trigger("keydown", { key: "ArrowDown" });
        await flushPromises();
        expect(wrapper.emitted("dataValueView")[0]).toStrictEqual([
          {
            indexInInput: 1,
            isTop: true,
          },
          0,
          expect.objectContaining({}),
        ]);
      });

      it("closes the current data value view when navigating to a non-expandable cell", async () => {
        // ArrowRight leads to a non-expandable cell, since column b has no data value views
        await wrapper.find("tbody").trigger("keydown", { key: "ArrowRight" });
        await flushPromises();
        expect(wrapper.emitted("closeDataValueView")).toBeDefined();
      });

      it("closes the data value view when selection is cleared", async () => {
        wrapper.vm.clearCellSelection();
        await flushPromises();
        expect(wrapper.emitted("closeDataValueView")).toBeDefined();
      });

      it("closes the data value view when navigating to a header", () => {
        wrapper.find("tbody").trigger("keydown", { key: "ArrowUp" });
        expect(wrapper.emitted("closeDataValueView")).toBeDefined();
      });
    });
  });
});
