/* eslint-disable max-lines */
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";

import { columnTypes } from "@/config/table.config";
import { MIN_COLUMN_SIZE } from "@/util/constants";
import Table from "../Table.vue";
import TableUI from "../TableUI.vue";
import TableUIWithAutoSizeCalculation from "../TableUIWithAutoSizeCalculation.vue";

const headerSubMenuItems = [
  [
    {
      text: "Column 1: Item 1",
      id: "c1s1i1",
      selected: true,
      section: "section1",
    },
  ],
  [
    {
      text: "Column 2: Item 1",
      id: "c1s1i1",
      selected: true,
      section: "section1",
    },
  ],
];

describe("Table.vue", () => {
  const defaultProps = {
    allColumnHeaders: ["A", "B"],
    allColumnKeys: ["a", "b"],
    allColumnTypes: { a: columnTypes.Number, b: columnTypes.Number },
    allFormatters: { a: (x) => x, b: (x) => x },
    allClassGenerators: {},
    allColumnHeaderColors: { a: "#ff0000" },
    defaultColumns: ["a", "b"],
    showSorting: true,
    showColumnSelection: true,
    showGroupBy: true,
    showSearch: true,
    showColumnFilters: true,
    showBottomControls: true,
    showSelection: true,
    showPopovers: true,
    enableVirtualScrolling: false,
    parentSelected: [0],
    autoSizeColumnsToContent: false,
    autoSizeColumnsToContentInclHeaders: false,
    autoSizeRowToContent: false,
  };

  beforeEach(() => {
    window.IntersectionObserver = vi.fn(() => ({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    }));
  });

  const doMount = ({
    customProps = {},
    dataCount = 1,
    shallow = true,
  } = {}) => {
    const props = {
      allData: [],
      ...defaultProps,
      ...customProps,
    };
    if (props.allData.length === 0) {
      for (let i = 0; i < dataCount; i++) {
        props.allData.push({ a: i, b: i + 1 });
      }
    }

    const wrapper = shallow
      ? shallowMount(Table, {
          props,
          global: {
            stubs: { TableUI: true, TableUIWithAutoSizeCalculation: false },
          },
        })
      : mount(Table, { props });

    return { wrapper };
  };

  describe("configurations", () => {
    beforeEach(() => {
      Object.defineProperty(window, "ResizeObserver", {
        writable: true,
        value: vi.fn().mockImplementation(() => ({
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        })),
      });
    });

    it("creates UI configurations", () => {
      const { wrapper } = doMount({ shallow: false });

      expect(wrapper.vm.dataConfig).toStrictEqual({
        columnConfigs: [
          {
            classGenerator: [],
            filterConfig: { is: "FilterInputField", modelValue: "" },
            formatter: expect.any(Function),
            hasSlotContent: false,
            header: "A",
            id: "a",
            key: "a",
            popoverRenderer: expect.undefined,
            size: 50,
            type: columnTypes.Number,
            headerColor: "#ff0000",
          },
          {
            classGenerator: [],
            filterConfig: { is: "FilterInputField", modelValue: "" },
            formatter: expect.any(Function),
            hasSlotContent: false,
            header: "B",
            id: "b",
            key: "b",
            popoverRenderer: expect.undefined,
            size: 50,
            type: columnTypes.Number,
            headerColor: null,
          },
        ],
        rowConfig: { compactMode: false },
      });
      expect(wrapper.vm.tableConfig).toStrictEqual({
        showBottomControls: true,
        showCollapser: false,
        showColumnFilters: true,
        showPopovers: true,
        showSelection: true,
        enableVirtualScrolling: false,
        enableColumnResizing: false,
        pageConfig: {
          tableSize: 1,
          currentSize: 1,
          currentPage: 1,
          pageSize: 10,
          possiblePageSizes: [5, 10, 25, 50, 100],
          fixHeader: false,
        },
        columnSelectionConfig: {
          currentColumns: ["A", "B"],
          possibleColumns: ["A", "B"],
        },
        groupByConfig: {
          currentGroup: null,
          possibleGroups: [],
          currentGroupValues: ["None"],
        },
        searchConfig: { searchQuery: "" },
        sortConfig: { sortColumn: 0, sortDirection: -1 },
        reserveSpaceForSubMenu: "auto",
        subMenuItems: [],
        groupSubMenuItems: [],
        columnFilterInitiallyActive: false,
      });
    });

    it("supports default sorting when showSort is true", () => {
      const { wrapper } = doMount({
        shallow: false,
        customProps: {
          showSorting: true,
          defaultSortColumn: 1,
          defaultSortColumnDirection: 1,
        },
      });

      expect(wrapper.vm.tableConfig).toEqual(
        expect.objectContaining({
          sortConfig: { sortColumn: 1, sortDirection: 1 },
        }),
      );
      expect(wrapper.vm.columnSort).toBe(1);
      expect(wrapper.vm.columnSortDirection).toBe(1);
    });

    it("supports default sorting when showSort is false", () => {
      const { wrapper } = doMount({
        shallow: false,
        customProps: {
          showSorting: false,
          defaultSortColumn: 1,
          defaultSortColumnDirection: 1,
        },
      });

      expect(wrapper.vm.tableConfig).not.toHaveProperty("sortConfig");
      expect(wrapper.vm.columnSort).toBe(1);
      expect(wrapper.vm.columnSortDirection).toBe(1);
    });

    it("supports initial filtering", () => {
      const { wrapper } = doMount({
        shallow: false,
        customProps: {
          showColumnFilters: true,
          initialFilterValues: { a: "4", b: "10" },
        },
      });

      expect(wrapper.vm.tableConfig.columnFilterInitiallyActive).toBe(true);
      expect(wrapper.vm.dataConfig.columnConfigs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: "a",
            filterConfig: { is: "FilterInputField", modelValue: "4" },
          }),
          expect.objectContaining({
            key: "b",
            filterConfig: { is: "FilterInputField", modelValue: "10" },
          }),
        ]),
      );
    });

    it("ignores initial filtering if show coulmn filters is set to false", () => {
      const { wrapper } = doMount({
        shallow: false,
        customProps: {
          showColumnFilters: false,
          initialFilterValues: { a: "4", b: "10" },
        },
      });

      expect(wrapper.vm.tableConfig.columnFilterInitiallyActive).toBe(false);
      expect(wrapper.vm.dataConfig.columnConfigs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: "a",
            filterConfig: { is: "FilterInputField", modelValue: "" },
          }),
          expect.objectContaining({
            key: "b",
            filterConfig: { is: "FilterInputField", modelValue: "" },
          }),
        ]),
      );
    });

    it("sets reserveSpaceForSubMenu to 'auto' if the table subMenuItems is not provided, and none of the rows has a sub menu", () => {
      let allData = [];
      for (let i = 0; i < 100; i++) {
        allData.push({ a: i, b: i + 1 });
      }
      allData[20].subMenuItemsForRow = [
        {
          text: "Apples",
          title: "Tastier Apples",
        },
      ];
      const { wrapper } = doMount({
        shallow: false,
        customProps: {
          subMenuItems: [],
          allData,
          dataCount: 10,
        },
      });

      expect(wrapper.vm.tableConfig.reserveSpaceForSubMenu).toBe("auto");
    });

    it("sets reserveSpaceForSubMenu to 'always' if the table subMenuItems is not provided, and at least one row has a sub menu", () => {
      let allData = [];
      for (let i = 0; i < 10; i++) {
        allData.push({ a: i, b: i + 1 });
      }
      allData[0].subMenuItemsForRow = [
        {
          text: "Apples",
          title: "Tastier Apples",
        },
      ];
      const { wrapper } = doMount({
        shallow: false,
        customProps: {
          subMenuItems: [],
          allData,
          dataCount: 10,
        },
      });

      expect(wrapper.vm.tableConfig.reserveSpaceForSubMenu).toBe("always");
    });
  });

  it("generates the correct data config with isSortable key if there are column specific sort configs", () => {
    const { wrapper } = doMount({
      customProps: { allColumnSpecificSortConfigs: [true, false] },
    });

    expect(wrapper.vm.dataConfig).toMatchObject({
      columnConfigs: [{ isSortable: true }, { isSortable: false }],
    });
  });

  it("generates the correct data config with headerSubMenuItems key if there are sub menu items for the header", () => {
    const { wrapper } = doMount({
      customProps: { headerSubMenuItems: [headerSubMenuItems, null] },
    });
    expect(wrapper.vm.dataConfig).toMatchObject({
      columnConfigs: [{ headerSubMenuItems }, { headerSubMenuItems: null }],
    });
  });

  it("generates the correct data config with fixed column sizes", () => {
    const { wrapper } = doMount({
      customProps: { columnsWithFixedSizes: { a: 100 } },
    });

    expect(wrapper.vm.getCurrentAllColumnSizes()).toEqual([100, -1]);
  });

  describe("component lifecycle", () => {
    it("creates internally required index reference lists on creation", () => {
      const { wrapper } = doMount();

      expect(wrapper.vm.masterSelected).toStrictEqual([1]);
      expect(wrapper.vm.processedIndicies).toStrictEqual([[0]]);
    });

    it("updates internal reference lists when data changes", async () => {
      const { wrapper } = doMount();
      const expectedMasterSelection = [1];
      const expectedProcessedIndicies = [[0]];

      expect(wrapper.vm.masterSelected).toStrictEqual(expectedMasterSelection);
      expect(wrapper.vm.processedIndicies).toStrictEqual(
        expectedProcessedIndicies,
      );

      let newAllData = [];
      for (let i = 0; i < 10; i++) {
        newAllData.push({ a: i, b: i + 1 });
      }
      await wrapper.setProps({ allData: newAllData });

      for (let i = 1; i < 10; i++) {
        expectedMasterSelection.push(0);
        expectedProcessedIndicies[0].unshift(i);
      }
      expect(wrapper.vm.masterSelected).toStrictEqual(expectedMasterSelection);
      expect(wrapper.vm.processedIndicies).toStrictEqual(
        expectedProcessedIndicies,
      );
    });
  });

  describe("events", () => {
    it("updates column sizes from availableWidth", () => {
      const { wrapper } = doMount();

      let availableWidth = 100;
      wrapper.vm.updateAvailableWidth(availableWidth);
      expect(wrapper.vm.currentAvailableWidth).toBe(availableWidth);
      expect(wrapper.vm.currentColumnSizes).toStrictEqual([50, 50]);

      const allColumnsResizeSize = 123;
      wrapper.vm.onAllColumnsResize(allColumnsResizeSize);
      const firstColumnsResizeSize = 600;
      wrapper.vm.onColumnResize(0, firstColumnsResizeSize);
      expect(wrapper.vm.currentColumnSizes).toStrictEqual([
        firstColumnsResizeSize,
        allColumnsResizeSize,
      ]);

      availableWidth = 200;
      wrapper.vm.updateAvailableWidth(availableWidth);
      expect(wrapper.vm.currentAvailableWidth).toBe(availableWidth);
      expect(wrapper.vm.currentColumnSizes).toStrictEqual([
        firstColumnsResizeSize * 2,
        allColumnsResizeSize * 2,
      ]);
    });

    describe("page control", () => {
      it("registers pageChange events", () => {
        const { wrapper } = doMount({ dataCount: 100 });
        expect(wrapper.vm.currentPage).toBe(1);
        wrapper.findComponent(TableUI).vm.$emit("pageChange", 1);
        expect(wrapper.vm.currentPage).toBe(2);
        wrapper.findComponent(TableUI).vm.$emit("pageChange", -1);
        expect(wrapper.vm.currentPage).toBe(1);
      });

      it("registers search events and updates query", () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.searchQuery).toBe("");
        wrapper.findComponent(TableUI).vm.$emit("search", "Find me");
        expect(wrapper.vm.searchQuery).toBe("Find me");
      });

      it("empties search query if search event value is empty", () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.searchQuery).toBe("");
        wrapper.findComponent(TableUI).vm.$emit("search", "");
        expect(wrapper.vm.searchQuery).toBeNull();
      });

      it("empties search query if search event value is missing", () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.searchQuery).toBe("");
        wrapper.findComponent(TableUI).vm.$emit("search");
        expect(wrapper.vm.searchQuery).toBeNull();
      });

      it("registers groupUpdate events and updates the current group", () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.currentGroup).toBeNull();
        wrapper.findComponent(TableUI).vm.$emit("groupUpdate", "a");
        expect(wrapper.vm.currentGroup).toBe("a");
      });

      it("registers columnReorder events and updates the column order", () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.currentAllColumnOrder).toStrictEqual([0, 1]);
        wrapper.findComponent(TableUI).vm.$emit("columnReorder", 1, 0);
        expect(wrapper.vm.currentAllColumnOrder).toStrictEqual([1, 0]);
      });

      it("registers columnUpdate events and updates the currentColumns", () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.currentColumns).toStrictEqual([0, 1]);
        wrapper.findComponent(TableUI).vm.$emit("columnUpdate", ["A"]);
        expect(wrapper.vm.currentColumns).toStrictEqual([0]);
      });

      it("registers timeFilterUpdate events and updates the time filter", () => {
        const { wrapper } = doMount({ customProps: { timeFilterKey: "a" } });
        expect(wrapper.vm.currentTimeFilter).toBe("All time");
        wrapper
          .findComponent(TableUI)
          .vm.$emit("timeFilterUpdate", "Last year");
        expect(wrapper.vm.currentTimeFilter).toBe("Last year");
      });

      it("toggles the column filters", () => {
        const { wrapper } = doMount();

        expect(wrapper.vm.showFilter).toBe(false);
        wrapper.findComponent(TableUI).vm.$emit("toggleFilter", true);
        expect(wrapper.vm.showFilter).toBe(true);
      });
    });

    describe("columnar", () => {
      it("registers column sort events", () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.columnSort).toBe(0);
        expect(wrapper.vm.columnSortDirection).toBe(-1);
        wrapper.findComponent(TableUI).vm.$emit("columnSort", 0);
        expect(wrapper.vm.columnSort).toBe(0);
        expect(wrapper.vm.columnSortDirection).toBe(1);
      });

      it("sorts columns in ascending order when the sort column changes", () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.columnSort).toBe(0);
        expect(wrapper.vm.columnSortDirection).toBe(-1);
        wrapper.findComponent(TableUI).vm.$emit("columnSort", 1);
        expect(wrapper.vm.columnSort).toBe(1);
        expect(wrapper.vm.columnSortDirection).toBe(-1);
      });

      it("registers column filter events", () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.filterValues).toStrictEqual({ a: "", b: "" });
        wrapper.vm.onToggleFilter();
        wrapper.findComponent(TableUI).vm.$emit("columnFilter", 0, "10");
        expect(wrapper.vm.filterValues).toStrictEqual({ a: "10", b: "" });
      });

      it("adjusts data on filter event if filters are active", async () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.filterValues).toStrictEqual({ a: "", b: "" });
        wrapper.vm.onToggleFilter();
        expect(wrapper.vm.paginatedData[0].length).toBe(1);
        wrapper.findComponent(TableUI).vm.$emit("toggleFilter", true);
        wrapper.findComponent(TableUI).vm.$emit("columnFilter", 0, "10");
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.paginatedData[0].length).toBe(0);
      });

      it("resets filter to default if value is empty", () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.filterValues).toStrictEqual({ a: "", b: "" });
        wrapper.vm.onToggleFilter();
        wrapper.findComponent(TableUI).vm.$emit("clearFilter", 0, null);
        expect(wrapper.vm.filterValues).toStrictEqual({ a: "", b: "" });
      });

      it("resets filter to default if value is missing", () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.filterValues).toStrictEqual({ a: "", b: "" });
        wrapper.vm.onToggleFilter();
        wrapper.findComponent(TableUI).vm.$emit("clearFilter", 0);
        expect(wrapper.vm.filterValues).toStrictEqual({ a: "", b: "" });
      });

      it("registers clear filter events", () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.filterValues).toStrictEqual({ a: "", b: "" });
        wrapper.vm.onToggleFilter();
        wrapper.findComponent(TableUI).vm.$emit("columnFilter", 0, "10");
        expect(wrapper.vm.filterValues).toStrictEqual({ a: "10", b: "" });
        wrapper.findComponent(TableUI).vm.$emit("clearFilter");
        expect(wrapper.vm.filterValues).toStrictEqual({ a: "", b: "" });
      });
    });

    describe("selection", () => {
      it("registers select all events", () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.masterSelected).toStrictEqual([1]);
        expect(wrapper.emitted().tableSelect).toBeFalsy();
        wrapper.findComponent(TableUI).vm.$emit("selectAll", false);
        expect(wrapper.vm.masterSelected).toStrictEqual([0]);
        expect(wrapper.emitted().tableSelect).toBeTruthy();
        expect(wrapper.emitted().tableSelect[0]).toStrictEqual([0]);
      });

      it("registers single row selection", () => {
        const { wrapper } = doMount();
        expect(wrapper.vm.masterSelected).toStrictEqual([1]);
        expect(wrapper.emitted().tableSelect).toBeFalsy();
        wrapper.findComponent(TableUI).vm.$emit("rowSelect", false, 0, 0);
        expect(wrapper.vm.masterSelected).toStrictEqual([0]);
        expect(wrapper.emitted().tableSelect).toBeTruthy();
        expect(wrapper.emitted().tableSelect[0]).toStrictEqual([0]);
      });

      it("registers and emits table input events", () => {
        let testEvent = { value: "test" };
        const { wrapper } = doMount();
        expect(wrapper.emitted().tableInput).toBeFalsy();
        wrapper.findComponent(TableUI).vm.$emit("tableInput", testEvent);
        expect(wrapper.emitted().tableInput).toBeTruthy();
        expect(wrapper.emitted().tableInput[0][0]).toStrictEqual(testEvent);
      });
    });
  });

  describe("utilities", () => {
    it("provides method to get current selection to parent component", () => {
      const { wrapper } = doMount();
      expect(wrapper.vm.masterSelected).toStrictEqual([1]);
      expect(wrapper.vm.getSelected()).toStrictEqual([0]);
    });

    it("provides method to programmatically clear selection", () => {
      const { wrapper } = doMount();
      expect(wrapper.vm.masterSelected).toStrictEqual([1]);
      wrapper.vm.clearSelection();
      expect(wrapper.vm.masterSelected).toStrictEqual([0]);
    });

    it("can filter an array based on the current columns", () => {
      const { wrapper } = doMount();
      expect(wrapper.vm.currentColumns).toStrictEqual([0, 1]);
      expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([5, 10]);
      wrapper.findComponent(TableUI).vm.$emit("columnUpdate", ["A"]);
      expect(wrapper.vm.currentColumns).toStrictEqual([0]);
      expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([5]);
      wrapper.findComponent(TableUI).vm.$emit("columnUpdate", ["B"]);
      expect(wrapper.vm.filterByColumn([5, 10])).toStrictEqual([10]);
    });

    it("computes currentColumnSizes correctly with min space", async () => {
      const availableWidth = 100;
      const { wrapper } = doMount();
      await wrapper.setData({ currentAvailableWidth: availableWidth });
      expect(wrapper.vm.currentColumnSizes).toStrictEqual([
        MIN_COLUMN_SIZE,
        MIN_COLUMN_SIZE,
      ]);
    });

    it("computes currentColumnSizes correctly with enouth space", async () => {
      const availableWidth = 500;
      const { wrapper } = doMount();
      await wrapper.setData({ currentAvailableWidth: availableWidth });
      expect(wrapper.vm.currentColumnSizes).toStrictEqual([
        availableWidth / 2,
        availableWidth / 2,
      ]);
    });

    it("computes currentColumnSizes with column size override", async () => {
      const availableWidth = 200;
      const columnSizeOverride = 100;
      const { wrapper } = doMount();
      await wrapper.setData({ currentAvailableWidth: availableWidth });
      wrapper.vm.onColumnResize(0, columnSizeOverride);
      expect(wrapper.vm.currentColumnSizes).toStrictEqual([
        columnSizeOverride,
        availableWidth - columnSizeOverride,
      ]);
    });

    it("computes currentColumnSizes correctly when resizing all columns", async () => {
      const { wrapper } = doMount();
      await wrapper.setData({ clientWidth: 200 });
      wrapper.vm.onColumnResize(0, 1111); // This will be overwritten
      const allColumnsSize = 123;
      wrapper.vm.onAllColumnsResize(allColumnsSize);
      const resizedCol = 1;
      const resizedColSize = 200;
      wrapper.vm.onColumnResize(resizedCol, resizedColSize); // This overwrites the allColumnsResize for this column

      const nColumns = wrapper.vm.currentColumns.length;
      expect(wrapper.vm.currentColumnSizes).toStrictEqual(
        // eslint-disable-next-line vitest/no-conditional-tests
        Array.from({ length: nColumns }, (_v, i) =>
          i === resizedCol ? resizedColSize : allColumnsSize,
        ),
      );
    });

    it("can deal with empty tables when computing currentColumnSizes", async () => {
      const { wrapper } = doMount();
      await wrapper.setData({ currentColumns: [] });
      expect(wrapper.vm.currentColumnSizes).toStrictEqual([]);
    });

    it("emits header sub menu selection events", () => {
      const { wrapper } = doMount({ customProps: { headerSubMenuItems } });
      expect(wrapper.emitted().headerSubMenuSelect).toBeFalsy();
      wrapper
        .findComponent(TableUI)
        .vm.$emit("headerSubMenuItemSelection", headerSubMenuItems, 1);
      expect(wrapper.emitted().headerSubMenuSelect).toStrictEqual([
        [headerSubMenuItems, 1],
      ]);
    });
  });

  describe("calculation of auto column sizes and row height", () => {
    const loadFonts = async (wrapper) => {
      await wrapper.vm.$nextTick(); // await font 400 1em Roboto to be loaded
      await wrapper.vm.$nextTick(); // await font 700 1em Roboto to be loaded
    };
    let triggerCalculationOfAutoSizesSpy;

    beforeAll(() => {
      Object.defineProperty(document, "fonts", {
        value: { load: vi.fn() },
      });
    });

    beforeEach(() => {
      triggerCalculationOfAutoSizesSpy = vi.spyOn(
        TableUIWithAutoSizeCalculation.methods,
        "triggerCalculationOfAutoSizes",
      );
    });

    describe("calculation of auto column sizes", () => {
      let onAutoColumnSizesUpdateSpy;

      beforeEach(() => {
        onAutoColumnSizesUpdateSpy = vi.spyOn(
          Table.methods,
          "onAutoColumnSizesUpdate",
        );
      });

      it("does not update column sizes from availableWidth when auto sizes active", () => {
        vi.spyOn(
          TableUIWithAutoSizeCalculation.methods,
          "calculateAutoSizes",
        ).mockImplementationOnce(() => ({}));
        const { wrapper } = doMount({
          customProps: { autoSizeColumnsToContent: true },
        });

        let availableWidth = 100;
        wrapper.vm.updateAvailableWidth(availableWidth);

        const allColumnsResizeSize = 123;
        wrapper.vm.onAllColumnsResize(allColumnsResizeSize);
        const firstColumnsResizeSize = 600;
        wrapper.vm.onColumnResize(0, firstColumnsResizeSize);

        availableWidth = 200;
        wrapper.vm.updateAvailableWidth(availableWidth);
        expect(wrapper.vm.currentAvailableWidth).toBe(availableWidth);
        expect(wrapper.vm.currentColumnSizes).toStrictEqual([
          firstColumnsResizeSize,
          allColumnsResizeSize,
        ]);
      });

      it('doesn"t calculate the column sizes on mounted when option autoSizeColumnsToContent is deactivated', async () => {
        const { wrapper } = doMount({ shallow: false });
        expect(triggerCalculationOfAutoSizesSpy).toHaveBeenCalled();
        await wrapper.vm.$nextTick();
        expect(onAutoColumnSizesUpdateSpy).toHaveBeenCalledWith({});
      });

      it("triggers and updates the column sizes on mounted when option autoSizeColumnsToContent is activated", async () => {
        const { wrapper } = doMount({
          customProps: { autoSizeColumnsToContent: true },
          shallow: false,
        });
        await loadFonts(wrapper);
        expect(triggerCalculationOfAutoSizesSpy).toHaveBeenCalled();
        expect(onAutoColumnSizesUpdateSpy).toHaveBeenCalledWith({
          a: 50,
          b: 50,
        });
      });

      it("triggers and updates column sizes when the option autoSizeColumnsToContent gets checked", async () => {
        const { wrapper } = doMount({ shallow: false });
        await wrapper.setProps({ autoSizeColumnsToContent: true });
        await wrapper.vm.$nextTick();
        await loadFonts(wrapper);
        expect(triggerCalculationOfAutoSizesSpy).toHaveBeenCalled();
        expect(onAutoColumnSizesUpdateSpy).toHaveBeenCalled();
      });

      it.each([
        [
          "page",
          (wrapper) => wrapper.findComponent(TableUI).vm.$emit("pageChange", 1),
        ],
        [
          "pageSize",
          (wrapper) =>
            wrapper.findComponent(TableUI).vm.$emit("pageSizeUpdate", 1),
        ],
        [
          "option inclHeaders",
          async (wrapper) => {
            await wrapper.setProps({
              autoSizeColumnsToContentInclHeaders: true,
            });
          },
        ],
      ])(
        "triggers and updates the column sizes when changing %s",
        async (settingsKey, changeCallback) => {
          const { wrapper } = doMount({
            customProps: { autoSizeColumnsToContent: true },
            shallow: false,
          });
          await loadFonts(wrapper);
          expect(triggerCalculationOfAutoSizesSpy).toHaveBeenCalledTimes(1);
          await changeCallback(wrapper);
          await loadFonts(wrapper);
          expect(triggerCalculationOfAutoSizesSpy).toHaveBeenCalledTimes(2);
          expect(onAutoColumnSizesUpdateSpy).toHaveBeenCalledTimes(2);
        },
      );

      it("triggers and updates the column sizes when adding new columns or removing columns", async () => {
        const { wrapper } = doMount({
          customProps: { autoSizeColumnsToContent: true },
          shallow: false,
        });
        await loadFonts(wrapper);
        wrapper.findComponent(TableUI).vm.$emit("columnUpdate", ["A"]);
        await loadFonts(wrapper);
        wrapper.findComponent(TableUI).vm.$emit("columnUpdate", ["A", "B"]);
        await loadFonts(wrapper);
        expect(triggerCalculationOfAutoSizesSpy).toHaveBeenCalledTimes(3);
        expect(onAutoColumnSizesUpdateSpy).toHaveBeenCalledTimes(3);
      });
    });

    describe("calculation of auto row height", () => {
      let onAutoRowHeightUpdateSpy;

      beforeEach(() => {
        onAutoRowHeightUpdateSpy = vi.spyOn(
          Table.methods,
          "onAutoRowHeightUpdate",
        );
      });

      it.each([[true], [false]])(
        "sets the autoRowHeightOptions when autoSizeRowsToContent: %s",
        (autoSizeRowsToContent) => {
          const { wrapper } = doMount({
            shallow: false,
            customProps: { autoSizeRowsToContent },
          });
          expect(wrapper.vm.autoRowHeightOptions).toStrictEqual({
            fixedHeights: {},
            calculate: autoSizeRowsToContent,
            maxHeight: 120,
          });
        },
      );

      it("sets the rowHeight in the data config when an auto row height was set", async () => {
        const { wrapper } = doMount({
          shallow: false,
          customProps: { autoSizeRowsToContent: true },
        });
        await loadFonts(wrapper);
        expect(onAutoRowHeightUpdateSpy).toHaveBeenCalled();
        expect(wrapper.vm.dataConfig.rowConfig.rowHeight).toBe(24);
      });
    });
  });
});
