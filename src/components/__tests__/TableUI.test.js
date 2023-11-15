/* eslint-disable vitest/max-nested-describe */
/* eslint-disable max-lines */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";

import TableUI from "../TableUI.vue";
import TableCore from "../TableCore.vue";
import TopControls from "@/components/control/TopControls.vue";
import PageControls from "@/components/control/PageControls.vue";
import BottomControls from "@/components/control/BottomControls.vue";
import ColumnFilters from "@/components/filter/ColumnFilters.vue";
import Header from "@/components/layout/Header.vue";
import Group from "@/components/layout/Group.vue";
import SelectedCellsOverlay from "@/components/ui/CellSelectionOverlay.vue";
import Row from "@/components/layout/Row.vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import TablePopover from "@/components/popover/TablePopover.vue";
import { RecycleScroller } from "vue-virtual-scroller";
import { columnTypes } from "@/config/table.config";
import useAvailableWidth, {
  useTotalWidth,
} from "../composables/useAvailableWidth";
import { ref, unref } from "vue";
import { SPECIAL_COLUMNS_SIZE } from "@/util/constants";
import useCellSelection from "../composables/useCellSelection";

const expectedNormalRowHeight = 41;

const bodyWidthResult = 123;
const fitsInsideTotalWidthResult = true;
const availableWidthMock = {
  innerWidthToBodyWidth: vi.fn(() => bodyWidthResult),
  fitsInsideTotalWidth: vi.fn(() => fitsInsideTotalWidthResult),
};
const totalWidthMock = 150;
vi.mock("../composables/useAvailableWidth", () => ({
  default: vi.fn(() => availableWidthMock),
  useTotalWidth: vi.fn(() => totalWidthMock),
}));

const cellSelectionMock = {
  selectCell: vi.fn(),
  expandCellSelection: vi.fn(),
  clearCellSelection: vi.fn(),
  rectMinMax: ref(null),
  currentRectId: ref(null),
};

vi.mock("../composables/useCellSelection", () => ({
  default: vi.fn(() => cellSelectionMock),
}));

let getMetaOrCtrlKeyMockReturnValue = "";
vi.mock("webapps-common/util/navigator", () => ({
  getMetaOrCtrlKey: vi.fn(() => getMetaOrCtrlKeyMockReturnValue),
}));

const getProps = ({
  includeSubHeaders = true,
  enableRowResize = true,
  compactMode = false,
  showSelection = true,
  showCollapser = false,
  showSubMenu = "auto",
  showSubMenuItems = false,
  showColumnFilters = true,
  showBottomControls = true,
  showPopovers = false,
  enableVirtualScrolling = false,
  rowHeight = null,
  actionButtonConfig = null,
  columnFilterInitiallyActive = null,
  enableIsSortable = false,
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
    showSubMenu,
    ...(showSubMenuItems ? { subMenuItems: [{ text: "test" }] } : {}),
  },
});

describe("TableUI.vue", () => {
  let bodySizeEvent;

  const fillRecycleScroller = async (wrapper) => {
    const scroller = wrapper.findComponent(RecycleScroller);
    Object.defineProperty(scroller.vm.$el, "clientHeight", {
      value: 1000,
    });
    scroller.vm.updateVisibleItems();
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
      showSubMenu = "auto",
      showColumnFilters = true,
      showBottomControls = true,
      enableVirtualScrolling = false,
      rowHeight = null,
      actionButtonConfig = {},
      columnFilterInitiallyActive = false,
      enableIsSortable = false,
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
      showSubMenu,
      showColumnFilters,
      showBottomControls,
      enableVirtualScrolling,
      rowHeight,
      actionButtonConfig,
      columnFilterInitiallyActive,
      enableIsSortable,
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
      global: { stubs: { TableCore, ...stubs } },
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

        expect(wrapper.emitted().columnUpdate).toBeFalsy();
        wrapper.findComponent(TopControls).vm.$emit("columnUpdate", ["A"]);
        expect(wrapper.emitted().columnUpdate).toStrictEqual([[["A"]]]);
        expect(cellSelectionMock.clearCellSelection).toHaveBeenCalled();
      });

      it("handles column reorder events", () => {
        const { wrapper } = doMount();

        expect(wrapper.emitted().columnReorder).toBeFalsy();
        wrapper.findComponent(TopControls).vm.$emit("columnReorder", 1, 0);
        expect(wrapper.emitted().columnReorder).toStrictEqual([[1, 0]]);
        expect(cellSelectionMock.clearCellSelection).toHaveBeenCalled();
      });

      it("handles group update events", () => {
        const { wrapper } = doMount();

        expect(wrapper.emitted().groupUpdate).toBeFalsy();
        wrapper.findComponent(TopControls).vm.$emit("groupUpdate", "New Group");
        expect(wrapper.emitted().groupUpdate).toStrictEqual([["New Group"]]);
        expect(cellSelectionMock.clearCellSelection).toHaveBeenCalled();
      });

      it("handles search events", () => {
        const { wrapper } = doMount();

        expect(wrapper.emitted().search).toBeFalsy();
        wrapper.findComponent(TopControls).vm.$emit("searchUpdate", "Query");
        expect(wrapper.emitted().search).toStrictEqual([["Query"]]);
        expect(cellSelectionMock.clearCellSelection).toHaveBeenCalled();
      });

      it("handles time filter update events", () => {
        const { wrapper } = doMount();

        expect(wrapper.emitted().timeFilterUpdate).toBeFalsy();
        wrapper
          .findComponent(TopControls)
          .vm.$emit("timeFilterUpdate", "Last year");
        expect(cellSelectionMock.clearCellSelection).toHaveBeenCalled();
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

        expect(wrapper.emitted().columnSort).toBeFalsy();
        wrapper.findComponent(Header).vm.$emit("columnSort", 0);
        expect(wrapper.emitted().columnSort).toStrictEqual([[0]]);
        expect(cellSelectionMock.clearCellSelection).toHaveBeenCalled();
      });

      it("handles toggle filter events", () => {
        const { wrapper } = doMount();

        expect(wrapper.emitted().toggleFilter).toBeFalsy();
        wrapper.findComponent(Header).vm.$emit("toggleFilter", true);
        expect(wrapper.emitted().toggleFilter).toStrictEqual([[true]]);
        expect(cellSelectionMock.clearCellSelection).toHaveBeenCalled();
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

        wrapper.findComponent(Header).vm.$emit("toggleFilter", true);
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().columnFilter).toBeFalsy();
        wrapper.findComponent(ColumnFilters).vm.$emit("columnFilter", 0, "0");
        expect(wrapper.emitted().columnFilter).toStrictEqual([[0, "0"]]);
        expect(cellSelectionMock.clearCellSelection).toHaveBeenCalled();
      });

      it("handles clear filter events", async () => {
        const { wrapper } = doMount();

        wrapper.findComponent(Header).vm.$emit("toggleFilter", true);
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().clearFilter).toBeFalsy();
        wrapper.findComponent(ColumnFilters).vm.$emit("clearFilter");
        expect(wrapper.emitted().clearFilter).toBeTruthy();
        expect(cellSelectionMock.clearCellSelection).toHaveBeenCalled();
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
          [
            {
              data: { a: "cellA", b: "cellB" },
              id: "0",
              index: 0,
              size: expectedNormalRowHeight,
              scrollIndex: 0,
              isTop: true,
            },
          ],
          expect.anything(),
        );
      });

      it("collapses expanded submenu on scroll", async () => {
        const { wrapper } = doMount();

        const callbackMockRow = vi.fn();
        wrapper
          .findComponent(Row)
          .vm.$emit("rowSubMenuExpand", callbackMockRow);
        vi.advanceTimersToNextTimer();
        expect(callbackMockRow).toHaveBeenCalledTimes(0);
        wrapper
          .find(".vertical-scroll")
          .element.dispatchEvent(new Event("scroll"));
        await wrapper.vm.$nextTick();
        expect(callbackMockRow).toHaveBeenCalledTimes(1);

        const callbackMockGroup = vi.fn();
        wrapper
          .findComponent(Group)
          .vm.$emit("groupSubMenuExpand", callbackMockGroup);
        vi.advanceTimersToNextTimer();
        expect(callbackMockGroup).toHaveBeenCalledTimes(0);
        wrapper
          .find(".vertical-scroll")
          .element.dispatchEvent(new Event("scroll"));
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
        describe("single row resize", () => {
          it("handles rowResize event for single row", async () => {
            const { wrapper } = doMount({
              enableVirtualScrolling: true,
              shallow: false,
            });
            const resizeRowSpy = vi.spyOn(wrapper.vm, "onResizeRow");
            await fillRecycleScroller(wrapper);
            const row = wrapper.findComponent(Row);
            expect(row.exists()).toBeTruthy();
            row.vm.$emit("resizeRow", 123);
            expect(resizeRowSpy).toHaveBeenCalledWith(123, 0);
          });

          it("applies a transform for below rows if virtual scrolling is enabled", async () => {
            const { wrapper } = doMount({
              enableVirtualScrolling: true,
              shallow: false,
              data: [
                [
                  { a: "g1r1a", b: "g1r1b" },
                  { a: "g1r2a", b: "g1r2b" },
                ],
              ],
              bottomRows: [{ a: "br1a", b: "br1b" }],
            });
            await fillRecycleScroller(wrapper);
            const rows = wrapper.findAllComponents(Row);
            rows[0].vm.$emit("resizeRow", 123);
            await wrapper.vm.$nextTick();
            expect(rows[1].attributes().style).toContain(
              "transform: translateY(123px);",
            );
          });

          it("does not apply a transform for below rows if virtual scrolling is disabled", async () => {
            const { wrapper } = doMount({
              data: [
                [
                  { a: "g1r1a", b: "g1r1b" },
                  { a: "g1r2a", b: "g1r2b" },
                ],
              ],
            });
            const rows = wrapper.findAllComponents(Row);
            rows[0].vm.$emit("resizeRow", 123);
            await wrapper.vm.$nextTick();
            expect(rows[1].attributes().style).toBeUndefined();
          });
        });

        describe("resize all rows", () => {
          it("handles resizeAllRows event", async () => {
            const { wrapper } = doMount({
              enableVirtualScrolling: true,
              shallow: false,
            });
            const resizeRowSpy = vi.spyOn(wrapper.vm, "onResizeAllRows");
            await fillRecycleScroller(wrapper);
            const row = wrapper.findComponent(Row);
            row.vm.$emit("resizeAllRows", 123, row);
            expect(resizeRowSpy).toHaveBeenCalled();
          });

          it("onResizeAllRows updates all row sizes", () => {
            vi.useFakeTimers();
            const scrollToPosition = vi.fn();
            const start = 100;
            const stubs = {
              RecycleScroller: {
                template: "<span/>",
                methods: {
                  getScroll: () => ({
                    start,
                  }),
                  scrollToPosition,
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
            expect(scrollToPosition).toHaveBeenCalledWith(
              scrollIndex * newSize - offset,
            );
            vi.useRealTimers();
          });
        });
      });
    });

    describe("bottom controls", () => {
      it("handles next page events", () => {
        const { wrapper } = doMount();

        expect(wrapper.emitted().pageChange).toBeFalsy();
        wrapper.findComponent(BottomControls).vm.$emit("nextPage");
        expect(wrapper.emitted().pageChange).toStrictEqual([[1]]);
        expect(cellSelectionMock.clearCellSelection).toHaveBeenCalled();
      });

      it("handles prev page events", () => {
        const { wrapper } = doMount();

        expect(wrapper.emitted().pageChange).toBeFalsy();
        wrapper.findComponent(BottomControls).vm.$emit("prevPage");
        expect(wrapper.emitted().pageChange).toStrictEqual([[-1]]);
        expect(cellSelectionMock.clearCellSelection).toHaveBeenCalled();
      });

      it("registers pageSizeUpdate events", () => {
        const { wrapper } = doMount();

        expect(wrapper.emitted().pageSizeUpdate).toBeFalsy();
        wrapper.findComponent(BottomControls).vm.$emit("pageSizeUpdate", 25);
        expect(wrapper.emitted().pageSizeUpdate).toStrictEqual([[25]]);
        expect(cellSelectionMock.clearCellSelection).toHaveBeenCalled();
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
      useTotalWidth.reset();
      useAvailableWidth.reset();
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
        wrapper.find(".vertical-scroll").element,
      );
      expect(unref(totalWidth)).toBe(totalWidthMock);
      emitAvailableWidth(123);
      expect(wrapper.emitted()["update:available-width"]).toStrictEqual([
        [123],
      ]);
    });

    describe("specialColumnsTotalWidth", () => {
      const getSpecialColumnsSizeTotal = (settings) => {
        useAvailableWidth.reset();
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
          showSubMenu: "auto",
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
        specialColumnsSettings.showSubMenu = "always";
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
      useAvailableWidth.reset();
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
        wrapper.findComponent(RecycleScroller).element,
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

    it("renders dynamic scroller when virtual scrolling is enabled", () => {
      const { wrapper } = doMount({
        enableVirtualScrolling: true,
        shallow: false,
      });

      expect(wrapper.findComponent(RecycleScroller).exists()).toBeTruthy();
    });

    it("exposes method to scroll to the top of the recycle scroller", () => {
      const { wrapper } = doMount({
        enableVirtualScrolling: true,
        shallow: false,
      });

      const scrollToPositionSpy = vi.spyOn(
        wrapper.findComponent(RecycleScroller).vm,
        "scrollToPosition",
      );

      wrapper.vm.refreshScroller();

      expect(scrollToPositionSpy).toHaveBeenCalledWith(0);
    });

    it("emits lazyloading event onScroll", () => {
      const { wrapper } = doMount({
        enableVirtualScrolling: true,
        shallow: false,
      });

      wrapper.findComponent(RecycleScroller).vm.$emit("update", 0, 0);
      expect(wrapper.emitted().lazyload).toBeFalsy();
      wrapper.findComponent(RecycleScroller).vm.$emit("update", 0, 10);
      expect(wrapper.emitted().lazyload).toBeTruthy();
    });

    it("supplies data with ids and sizes", () => {
      const { wrapper } = doMount({
        enableVirtualScrolling: true,
        shallow: false,
      });
      expect(wrapper.vm.scrollData).toStrictEqual([
        [
          {
            data: { a: "cellA", b: "cellB" },
            id: "0",
            index: 0,
            size: expectedNormalRowHeight,
            scrollIndex: 0,
            isTop: true,
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
            id: "0",
            index: 0,
            size: expectedNormalRowHeight,
            scrollIndex: 0,
            isTop: true,
          },
          { dots: true, id: "dots", scrollIndex: 1, size: 41 },
          {
            data: ["foo"],
            id: "2",
            index: 0,
            size: expectedNormalRowHeight,
            scrollIndex: 2,
            isTop: false,
          },
          {
            data: ["bar"],
            id: "3",
            index: 1,
            size: expectedNormalRowHeight,
            scrollIndex: 3,
            isTop: false,
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
            id: "2",
            index: 0,
            size: expectedNormalRowHeight,
            scrollIndex: 2,
            isTop: false,
          },
          {
            data: ["bar"],
            id: "3",
            index: 1,
            size: expectedNormalRowHeight,
            scrollIndex: 3,
            isTop: false,
          },
        ],
      ]);
    });

    it("shifts data by number of rows above", () => {
      const numRowsAbove = 3;
      const { wrapper } = doMount({
        enableVirtualScrolling: true,
        numRowsAbove,
        shallow: false,
      });
      expect(wrapper.vm.scrollData).toStrictEqual([
        [
          {
            data: { a: "cellA", b: "cellB" },
            id: `${numRowsAbove}`,
            index: 0,
            scrollIndex: numRowsAbove,
            size: expectedNormalRowHeight,
            isTop: true,
          },
        ],
      ]);
    });

    it("computes selection for top and bottom rows", async () => {
      const numRowsAbove = 3;
      const numRowsBelow = 3;
      const { wrapper } = doMount({
        enableVirtualScrolling: true,
        shallow: false,
        numRowsAbove,
        numRowsBelow,
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
      });

      await fillRecycleScroller(wrapper);

      const rows = wrapper.findAllComponents(Row);
      // Above rows
      expect(rows[0].props().isSelected).toBe(false);
      expect(rows[1].props().isSelected).toBe(false);
      expect(rows[2].props().isSelected).toBe(false);
      // Top rows
      expect(rows[3].props().isSelected).toBe(true);
      expect(rows[4].props().isSelected).toBe(false);
      expect(rows[5].props().isSelected).toBe(true);
      // Bottom rows
      expect(rows[6].props().isSelected).toBe(true);
      expect(rows[7].props().isSelected).toBe(true);
      // Below rows
      expect(rows[8].props().isSelected).toBe(false);
      expect(rows[9].props().isSelected).toBe(false);
      expect(rows[10].props().isSelected).toBe(false);
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

    describe("supports expanding and collapsing rows", () => {
      const rowWithoutSize = {
        data: { a: "cellA", b: "cellB" },
        id: "0",
        index: 0,
        scrollIndex: 0,
        isTop: true,
      };

      it("changes the size of the rows if they are expanded", async () => {
        const { wrapper } = doMount({
          enableVirtualScrolling: true,
          shallow: false,
          attachTo: document.body,
        });
        // simulate the expanded content
        const expandedContentHeight = 20;
        const scroller = wrapper.findComponent(RecycleScroller);
        Object.defineProperty(scroller.vm.$el, "clientHeight", { value: 1000 });
        scroller.vm.updateVisibleItems();
        await wrapper.vm.$nextTick();
        const firstRow = wrapper.vm.$refs["row-0"];
        firstRow.onRowExpand();
        await wrapper.vm.$nextTick();
        Object.defineProperty(firstRow.$el.children[1], "clientHeight", {
          value: expandedContentHeight,
        });

        expect(wrapper.vm.currentExpanded).toContain(0);

        expect(wrapper.vm.scrollData).toStrictEqual([
          [
            {
              ...rowWithoutSize,
              size: expectedNormalRowHeight + expandedContentHeight,
            },
          ],
        ]);
        firstRow.onRowExpand();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.currentExpanded).not.toContain(0);
        expect(wrapper.vm.scrollData).toStrictEqual([
          [{ ...rowWithoutSize, size: expectedNormalRowHeight }],
        ]);
      });

      it("calculates the height with virtual elements", () => {
        const { wrapper } = doMount({
          enableVirtualScrolling: true,
          shallow: false,
        });
        const currentExpanded = wrapper.vm.currentExpanded;
        wrapper.vm.onRowExpand(false, 0);
        expect(wrapper.vm.currentExpanded).toBe(currentExpanded);
      });

      it("collapses unused rows on scroll", () => {
        const { wrapper } = doMount({
          enableVirtualScrolling: true,
          shallow: false,
        });
        wrapper.vm.onRowExpand(true, 0);
        expect(wrapper.vm.currentExpanded).toContain(0);
        wrapper.vm.onScroll(1, 2);
        expect(wrapper.vm.currentExpanded).not.toContain(0);
      });
    });
  });

  describe("cell selection", () => {
    let wrapper;

    beforeEach(() => {
      useCellSelection.reset();
      cellSelectionMock.selectCell = vi.fn();
      cellSelectionMock.expandCellSelection = vi.fn();
      cellSelectionMock.rectMinMax = ref(null);
      cellSelectionMock.currentRectId = ref(null);
      const comp = doMount();
      wrapper = comp.wrapper;
    });

    it("used cell selection composable", () => {
      expect(useCellSelection).toHaveBeenCalled();
    });

    it("selects cell on row event", () => {
      const row = wrapper.findComponent(Row);
      const colInd = 3;

      row.vm.$emit("cell-select", colInd);

      expect(cellSelectionMock.selectCell).toHaveBeenCalledWith(
        {
          x: colInd,
          y: 0,
        },
        0,
      );
    });

    it("expands cell selection on row event", () => {
      const row = wrapper.findComponent(Row);
      const colInd = 3;

      row.vm.$emit("expand-cell-select", colInd);

      expect(cellSelectionMock.expandCellSelection).toHaveBeenCalledWith(
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

      it("displays overlay once something is selected", async () => {
        const rectMinMax = { x: { min: 1, max: 2 }, y: { min: 2, max: 2 } };
        cellSelectionMock.rectMinMax.value = rectMinMax;
        cellSelectionMock.currentRectId.value = 0;
        await wrapper.vm.$nextTick();

        const overlay = wrapper.findComponent(SelectedCellsOverlay);
        expect(overlay.exists()).toBeTruthy();
        expect(overlay.props()).toStrictEqual({
          columnSizes: [50, 50],
          rect: rectMinMax,
          rowHeight: 41,
          rowResizeDelta: null,
          rowResizeIndex: null,
          tableConfig: wrapper.vm.tableConfig,
        });
      });

      it("displays overlay inside virtual scroller", () => {
        const rectMinMax = { x: { min: 1, max: 2 }, y: { min: 2, max: 2 } };
        cellSelectionMock.rectMinMax.value = rectMinMax;
        cellSelectionMock.currentRectId.value = 0;
        const { wrapper } = doMount({
          enableVirtualScrolling: true,
          shallow: false,
        });

        const overlay = wrapper.findComponent(SelectedCellsOverlay);
        expect(overlay.exists()).toBeTruthy();
        expect(overlay.props()).toStrictEqual({
          columnSizes: [50, 50],
          rect: rectMinMax,
          rowHeight: 41,
          rowResizeDelta: null,
          rowResizeIndex: null,
          tableConfig: wrapper.vm.tableConfig,
        });
      });

      it("displays overlay for the correct group", async () => {
        const rectMinMax = { x: { min: 1, max: 2 }, y: { min: 2, max: 2 } };
        cellSelectionMock.rectMinMax.value = rectMinMax;
        cellSelectionMock.currentRectId.value = 1;
        const { wrapper } = doMount({
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
        });

        let groups = wrapper.findAllComponents(Group);
        expect(groups).toHaveLength(2);
        expect(
          groups.at(0).findComponent(SelectedCellsOverlay).exists(),
        ).toBeFalsy();
        expect(
          groups.at(1).findComponent(SelectedCellsOverlay).exists(),
        ).toBeTruthy();

        cellSelectionMock.currentRectId.value = 0;
        await wrapper.vm.$nextTick();

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

    describe("emit copySelection event", () => {
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

      it.each([false, true])(
        "when copy event is received and focus is within table with virtualScrolling = %s",
        async (enableVirtualScrolling) => {
          const comp = doMount(
            { enableVirtualScrolling, shallow: false },
            stubs,
          );
          wrapper = comp.wrapper;
          const rect = { x: { min: 1, max: 2 }, y: { min: 2, max: 2 } };
          cellSelectionMock.rectMinMax.value = rect;
          const id = 0;
          cellSelectionMock.currentRectId.value = id;
          await wrapper.vm.$nextTick();

          const overlay = wrapper.findComponent(SelectedCellsOverlay);
          expect(overlay.exists()).toBeTruthy();

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
        const { wrapper } = doMount({ shallow: false }, stubs);
        const rect = { x: { min: 1, max: 2 }, y: { min: 2, max: 2 } };
        cellSelectionMock.rectMinMax.value = rect;
        const id = 0;
        cellSelectionMock.currentRectId.value = id;
        await wrapper.vm.$nextTick();
        await wrapper.find("table").trigger("focusin");
        await wrapper.find("table").trigger(`keydown.${copyKeys}.exact`);
        expect(wrapper.emitted("copySelection")[0]).toStrictEqual([
          { id, rect, withHeaders: true },
        ]);
      });
    });

    it("does not emit copySelection event when copy event is received and focus is outside of table", async () => {
      const rect = { x: { min: 1, max: 2 }, y: { min: 2, max: 2 } };
      cellSelectionMock.rectMinMax.value = rect;
      const id = 0;
      cellSelectionMock.currentRectId.value = id;
      await wrapper.vm.$nextTick();

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
        await wrapper.vm.$nextTick();
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
      setHeight(wrapper.find(".vertical-scroll").element, 100);
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
        setHeight(
          wrapper.find(".vue-recycle-scroller__slot").element.children[0],
          value,
        );
      };

      const setBodyHeight = (value) => {
        setHeight(
          wrapper.findComponent(RecycleScroller).find("tbody").element,
          value,
        );
      };

      const setTotalScrollerHeight = (value) => {
        setHeight(wrapper.findComponent(RecycleScroller).element, value);
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
});
