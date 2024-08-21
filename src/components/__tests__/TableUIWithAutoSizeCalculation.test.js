import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { flushPromises, mount, shallowMount } from "@vue/test-utils";

import TableUIWithAutoSizeCalculation from "../TableUIWithAutoSizeCalculation.vue";
import AutoSizeTestWrapperComponent from "./AutoSizeTestWrapperComponent.vue";

import TableUI from "../TableUI.vue";
import {
  MAX_AUTO_COLUMN_SIZE,
  MAX_AUTO_ROW_HEIGHT,
  MIN_ROW_HEIGHT,
} from "@/util/constants";

describe("TableUIWithAutoSizeCalculation.vue", () => {
  let props, tableUIStub, context, refreshScrollerMock, clearCellSelectionMock;

  const column1 = { id: Symbol("a"), key: "a", header: "a", size: 50 };
  const column2 = { id: "b", key: "b", header: "b", size: 50 };

  const loadFonts = async (wrapper) => {
    await wrapper.vm.$nextTick(); // await font 400 1em Roboto to be loaded
    await wrapper.vm.$nextTick(); // await font 700 1em Roboto to be loaded
  };

  beforeAll(() => {
    Object.defineProperty(document, "fonts", {
      value: { load: vi.fn() },
    });
  });

  beforeEach(() => {
    props = {
      data: [
        [
          { a: "group0row0cellA", b: "group0row0cellB" },
          { a: "group0row1cellA", b: "group0row1cellB" },
        ],
        [{ a: "group1row0cellA", b: "group1row0cellB" }],
      ],
      currentSelection: [[false], [false]],
      dataConfig: {
        columnConfigs: [column1, column2],
        rowConfig: {
          compactMode: false,
        },
      },
      tableConfig: {
        pageConfig: {
          currentSize: 1,
          tableSize: 1,
          pageSize: 5,
          visibleSize: 5,
          possiblePageSizes: [5, 10, 25],
          currentPage: 1,
        },
        showPopovers: false,
        enableVirtualScrolling: false,
        columnSelectionConfig: {
          possibleColumns: ["a", "b"],
          currentColumns: ["a", "b"],
        },
      },
      autoColumnSizesOptions: {
        calculateForBody: true,
        calculateForHeader: true,
        fixedSizes: {},
      },
      autoRowHeightOptions: {
        calculate: true,
        fixedHeights: {},
      },
    };

    refreshScrollerMock = vi.fn();
    clearCellSelectionMock = vi.fn();

    tableUIStub = {
      template: "<table />",
      props: {
        dataConfig: {
          type: Object,
        },
      },
      methods: {
        getRowComponents: vi.fn().mockReturnValue([
          {
            getCellComponents: vi.fn().mockReturnValue([
              {
                getCellContentDimensions: vi
                  .fn()
                  .mockReturnValue({ width: 60, height: 44 }),
              },
              {
                getCellContentDimensions: vi
                  .fn()
                  .mockReturnValue({ width: 60, height: 44 }),
              },
            ]),
          },
        ]),
        getHeaderComponent: vi.fn().mockReturnValue({
          getHeaderCellWidths: vi.fn().mockReturnValue([60, 60]),
        }),
        refreshScroller: refreshScrollerMock,
        clearCellSelection: clearCellSelectionMock,
      },
    };

    context = {
      props,
      global: {
        stubs: {
          TableUI: tableUIStub,
        },
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders when auto sizing is deactivated", () => {
    props.autoColumnSizesOptions.calculateForBody = false;
    props.autoColumnSizesOptions.calculateForHeader = false;
    props.autoRowHeightOptions.calculate = false;
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    expect(
      wrapper.findComponent(TableUIWithAutoSizeCalculation).exists(),
    ).toBeTruthy();
    expect(wrapper.findComponent(TableUI).exists()).toBeTruthy();
    expect(wrapper.findComponent({ ref: "tableUI" }).attributes().style).toBe(
      "visibility: hidden;",
    );
    expect(wrapper.emitted()).toHaveProperty("autoColumnSizesUpdate");
    expect(wrapper.emitted("autoColumnSizesUpdate")[0][0]).toStrictEqual({});
    expect(wrapper.emitted()).toHaveProperty("autoRowHeightUpdate");
    expect(wrapper.emitted("autoRowHeightUpdate")[0][0]).toBeNull();
    expect(wrapper.vm.mountTableUIForAutoSizeCalculation).toBeFalsy();
    expect(wrapper.vm.$refs).toStrictEqual({ tableUI: expect.any(Object) });
  });

  it.each([
    [true, true, true, 960],
    [true, true, false, 960],
    [true, false, true, 960],
    [true, false, false, 960],
    [false, true, true, 960],
    [false, true, false, 960],
    [false, false, true, 50],
  ])(
    "mounts the TableUI with active autoSizing (colBody: %s, colHeader: %s, rowBody: %s) and creates correct configs",
    async (calculateForBody, calculateForHeader, calculate, columnSize) => {
      props.autoColumnSizesOptions.calculateForBody = calculateForBody;
      props.autoColumnSizesOptions.calculateForHeader = calculateForHeader;
      props.autoRowHeightOptions.calculate = calculate;
      const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
      expect(wrapper.vm.mountTableUIForAutoSizeCalculation).toBeTruthy();

      await loadFonts(wrapper);
      expect(wrapper.vm.tableConfigForAutoSizesCalculation).toStrictEqual(
        expect.objectContaining({ enableVirtualScrolling: false }),
      );
      expect(
        wrapper.vm.dataConfigForAutoSizesCalculation.columnConfigs,
      ).toStrictEqual([
        expect.objectContaining({ size: columnSize }),
        expect.objectContaining({ size: columnSize }),
      ]);
      expect(
        wrapper.vm.paginatedDataForAutoColumnSizesCalculation,
      ).toStrictEqual([
        [
          { a: "group0row0cellA", b: "group0row0cellB" },
          { a: "group0row1cellA", b: "group0row1cellB" },
          { a: "group1row0cellA", b: "group1row0cellB" },
        ],
      ]);
      expect(wrapper.emitted()).toHaveProperty("autoColumnSizesUpdate");
      expect(wrapper.emitted()).toHaveProperty("autoRowHeightUpdate");
      expect(wrapper.emitted().autoColumnSizesUpdate).toHaveLength(1);
    },
  );

  it("can handle empty data", async () => {
    props.data = [[]];
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    expect(wrapper.vm.mountTableUIForAutoSizeCalculation).toBeTruthy();
    await loadFonts(wrapper);
    expect(wrapper.vm.paginatedDataForAutoColumnSizesCalculation).toStrictEqual(
      [[]],
    );
    expect(wrapper.emitted()).toHaveProperty("autoColumnSizesUpdate");
    expect(wrapper.emitted()).toHaveProperty("autoRowHeightUpdate");
    expect(wrapper.emitted().autoColumnSizesUpdate).toHaveLength(1);
  });

  it("is visible when the sizes were initially calculated and the available width was received", () => {
    props.autoColumnSizesOptions.calculateForBody = false;
    props.autoColumnSizesOptions.calculateForHeader = false;
    props.autoRowHeightOptions.calculate = false;
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);

    const newAvailableWidth = 200;
    wrapper
      .findComponent(TableUI)
      .vm.$emit("update:available-width", newAvailableWidth);

    expect(wrapper.emitted()).toHaveProperty("update:available-width");
    expect(wrapper.emitted("update:available-width")).toStrictEqual([[200]]);
  });

  const getSizeOfFirstRow = (wrapper) => {
    return wrapper.findComponent(TableUI).props().dataConfig.columnConfigs[0]
      .size;
  };

  it("emits ready only on the first update when the sizes were calculated and the table is not visible yet", async () => {
    const wrapper = mount(AutoSizeTestWrapperComponent, context).findComponent(
      TableUIWithAutoSizeCalculation,
    );

    expect(getSizeOfFirstRow(wrapper)).toBe(100);
    expect(wrapper.emitted()).not.toHaveProperty("ready");

    await flushPromises(); // wait for autosizes
    expect(getSizeOfFirstRow(wrapper)).toBe(200);

    wrapper.findComponent(TableUI).vm.$emit("update:available-width", 1);
    expect(wrapper.vm.tableIsVisible).toBeTruthy();

    await wrapper.vm.$nextTick(); // wait for update due to available width change
    expect(getSizeOfFirstRow(wrapper)).toBe(300);
    expect(wrapper.findComponent({ ref: "tableUI" }).attributes().style).toBe(
      "visibility: visible;",
    );

    expect(wrapper.emitted.ready).toBeUndefined();
    await flushPromises();
    expect(wrapper.emitted()).toHaveProperty("ready");
  });

  describe("triggers to compute new auto sizes", () => {
    const createSpies = (wrapper) => ({
      triggerCalculationSpy: vi.spyOn(
        wrapper.vm,
        "triggerCalculationOfAutoSizes",
      ),
      calculateAutoSizesSpy: vi.spyOn(wrapper.vm, "calculateAutoSizes"),
      setAutoRowHeightsSpy: vi.spyOn(wrapper.vm, "setAutoRowHeights"),
      setAutoColumnSizesSpy: vi.spyOn(wrapper.vm, "setAutoColumnSizes"),
    });

    const expectUpdatedColumnSizesAndRowHeightsTwice = (wrapper) => {
      expect(wrapper.emitted()).toHaveProperty("autoColumnSizesUpdate");
      expect(wrapper.emitted().autoColumnSizesUpdate).toHaveLength(2);
      expect(wrapper.emitted()).toHaveProperty("autoRowHeightUpdate");
      expect(wrapper.emitted().autoRowHeightUpdate).toHaveLength(2);
    };

    it("does not mount the TableUI for calculation when columns were only removed and auto column sizing is active", async () => {
      const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
      const { calculateAutoSizesSpy } = createSpies(wrapper);
      await loadFonts(wrapper);
      expect(wrapper.vm.currentColumnSizes).toStrictEqual({
        [column1.id]: 60,
        b: 60,
      });
      expect(wrapper.vm.currentHeightsByColumn).toStrictEqual({
        [column1.id]: 44,
        b: 44,
      });

      await wrapper.setProps({
        dataConfig: { ...props.dataConfig, columnConfigs: [column1] },
      });
      expect(wrapper.vm.calculateSizes).toBeFalsy();

      await loadFonts(wrapper);
      expect(wrapper.vm.currentColumnSizes).toStrictEqual({ [column1.id]: 60 });
      expect(wrapper.vm.currentHeightsByColumn).toStrictEqual({
        [column1.id]: 44,
      });
      expectUpdatedColumnSizesAndRowHeightsTwice(wrapper);
      expect(calculateAutoSizesSpy).toHaveBeenCalledTimes(1);
    });

    it(`does mount the TableUI for calculation when columns were only removed, auto column sizing is inactive and auto
      row height sizing is active`, async () => {
      props.autoColumnSizesOptions.calculateForBody = false;
      props.autoColumnSizesOptions.calculateForHeader = false;
      const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
      const { calculateAutoSizesSpy } = createSpies(wrapper);
      await loadFonts(wrapper);
      expect(wrapper.vm.currentColumnSizes).toStrictEqual({});
      expect(wrapper.vm.currentHeightsByColumn).toStrictEqual({
        [column1.id]: 44,
        b: 44,
      });

      await wrapper.setProps({
        dataConfig: { ...props.dataConfig, columnConfigs: [column1] },
      });
      expect(wrapper.vm.calculateSizes).toBeTruthy();

      await loadFonts(wrapper);
      expect(wrapper.vm.currentColumnSizes).toStrictEqual({});
      expect(wrapper.vm.currentHeightsByColumn).toStrictEqual({
        [column1.id]: 44,
      });
      expectUpdatedColumnSizesAndRowHeightsTwice(wrapper);
      expect(calculateAutoSizesSpy).toHaveBeenCalledTimes(2);
    });

    it("mounts the TableUI for calculation when columns were added", async () => {
      props.dataConfig.columnConfigs = [column1];
      const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
      const { setAutoColumnSizesSpy, setAutoRowHeightsSpy } =
        createSpies(wrapper);
      await loadFonts(wrapper);
      expect(wrapper.vm.currentColumnSizes).toStrictEqual({ [column1.id]: 60 });
      expect(wrapper.vm.currentHeightsByColumn).toStrictEqual({
        [column1.id]: 44,
      });

      await wrapper.setProps({
        dataConfig: { ...props.dataConfig, columnConfigs: [column1, column2] },
      });
      await loadFonts(wrapper);
      expect(wrapper.vm.currentColumnSizes).toStrictEqual({
        [column1.id]: 60,
        b: 60,
      });
      expect(wrapper.vm.currentHeightsByColumn).toStrictEqual({
        [column1.id]: 44,
        b: 44,
      });
      expect(setAutoColumnSizesSpy).toHaveBeenCalledTimes(2);
      expect(setAutoRowHeightsSpy).toHaveBeenCalledTimes(2);
      expectUpdatedColumnSizesAndRowHeightsTwice(wrapper);
    });

    it(`triggers the calculation of row heights when the compactMode was changed and autoRowHeight is active without
      triggering the calculation of column sizes`, async () => {
      props.autoColumnSizesOptions.calculateForBody = false;
      props.autoColumnSizesOptions.calculateForHeader = false;
      const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
      const {
        triggerCalculationSpy,
        setAutoColumnSizesSpy,
        setAutoRowHeightsSpy,
      } = createSpies(wrapper);
      await loadFonts(wrapper);

      expect(triggerCalculationSpy).not.toHaveBeenCalled();

      await wrapper.setProps({
        dataConfig: {
          ...props.dataConfig,
          rowConfig: {
            ...props.dataConfig.rowConfig,
            compactMode: true,
          },
        },
      });
      expect(triggerCalculationSpy).toHaveBeenCalledTimes(1);
      expect(setAutoColumnSizesSpy).not.toHaveBeenCalled();
      expect(setAutoRowHeightsSpy).toHaveBeenCalledTimes(1);
    });

    it.each([
      { prop: "calculateForBody", newValue: false, setAutoColumnSizesCalls: 1 },
      {
        prop: "calculateForHeader",
        newValue: false,
        setAutoColumnSizesCalls: 2,
      },
      {
        prop: "fixedSizes",
        newValue: { a: 40, b: 60 },
        setAutoColumnSizesCalls: 2,
      },
    ])(
      "triggers the calculation when $prop in the auto column size options is changed",
      async ({ prop, newValue, setAutoColumnSizesCalls }) => {
        const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
        const {
          triggerCalculationSpy,
          setAutoColumnSizesSpy,
          setAutoRowHeightsSpy,
          calculateAutoSizesSpy,
        } = createSpies(wrapper);
        await loadFonts(wrapper);
        await wrapper.setProps({
          autoColumnSizesOptions: {
            ...props.autoColumnSizesOptions,
            [prop]: newValue,
          },
        });
        await loadFonts(wrapper);
        expect(triggerCalculationSpy).toHaveBeenCalledTimes(1);
        expect(calculateAutoSizesSpy).toHaveBeenCalledTimes(2);
        expect(setAutoColumnSizesSpy).toHaveBeenCalledTimes(
          setAutoColumnSizesCalls,
        );
        expect(setAutoRowHeightsSpy).toHaveBeenCalledTimes(2);
      },
    );

    it("triggers the calculation when auto column sizes get disabled", async () => {
      const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
      const {
        triggerCalculationSpy,
        setAutoColumnSizesSpy,
        setAutoRowHeightsSpy,
        calculateAutoSizesSpy,
      } = createSpies(wrapper);
      await loadFonts(wrapper);
      await wrapper.setProps({
        autoColumnSizesOptions: {
          ...props.autoColumnSizesOptions,
          calculateForBody: false,
          calculateForHeader: false,
        },
      });
      await loadFonts(wrapper);
      expect(triggerCalculationSpy).toHaveBeenCalledTimes(1);
      expect(calculateAutoSizesSpy).toHaveBeenCalledTimes(2);
      expect(setAutoColumnSizesSpy).toHaveBeenCalledTimes(1);
      expect(setAutoRowHeightsSpy).toHaveBeenCalledTimes(2);
    });

    it.each([
      {
        prop: "calculate",
        newValue: false,
        setAutoSizesCalls: 1,
        setAutoRowHeightCalls: 1,
      },
      {
        prop: "fixedHeights",
        newValue: { a: 40, b: 60 },
        setAutoSizesCalls: 2,
        setAutoRowHeightCalls: 2,
      },
    ])(
      "triggers the calculation when $prop in the auto row height options is changed and uses saved column sizes",
      async ({ prop, newValue, setAutoSizesCalls, setAutoRowHeightCalls }) => {
        const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
        const {
          triggerCalculationSpy,
          setAutoColumnSizesSpy,
          setAutoRowHeightsSpy,
          calculateAutoSizesSpy,
        } = createSpies(wrapper);
        await loadFonts(wrapper);
        await wrapper.setProps({
          autoRowHeightOptions: {
            ...props.autoRowHeightOptions,
            [prop]: newValue,
          },
        });
        await loadFonts(wrapper);
        expect(triggerCalculationSpy).toHaveBeenCalledTimes(1);
        expect(calculateAutoSizesSpy).toHaveBeenCalledTimes(setAutoSizesCalls);
        expect(setAutoColumnSizesSpy).toHaveBeenCalledTimes(1);
        expect(setAutoRowHeightsSpy).toHaveBeenCalledTimes(
          setAutoRowHeightCalls,
        );
      },
    );
  });

  describe("auto column sizes", () => {
    beforeAll(() => {
      props.autoRowHeightOptions.calculate = false;
    });

    it("adds the fixed sizes to the column sizes object when the column still exists", async () => {
      props.autoColumnSizesOptions.fixedSizes = { [column1.id]: 80, c: 90 };
      const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
      await loadFonts(wrapper);
      expect(wrapper.vm.currentColumnSizes).toStrictEqual({
        [column1.id]: 90,
        b: 60,
      });
      expect(wrapper.emitted()).toHaveProperty("autoColumnSizesUpdate");
      expect(wrapper.emitted().autoColumnSizesUpdate).toHaveLength(1);
    });

    it("adds the padding of the column value of the first row to the fixed sizes", async () => {
      props.data[0][0].a = { color: "red", value: "group0row0cellA" };
      props.data[0][1].a = { color: "red", value: "group0row0cellB" };
      props.autoColumnSizesOptions.fixedSizes = {
        [column1.id]: 80,
        [column2.id]: 80,
      };
      const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
      await loadFonts(wrapper);
      expect(wrapper.vm.currentColumnSizes).toStrictEqual({
        [column1.id]: 100,
        [column2.id]: 90,
      });
    });

    it("enforces a maximum column size", async () => {
      tableUIStub.methods.getRowComponents = vi.fn().mockReturnValue([
        {
          getCellComponents: vi.fn().mockReturnValue([
            {
              getCellContentDimensions: vi.fn().mockReturnValue({ width: 60 }),
            },
            {
              getCellContentDimensions: vi
                .fn()
                .mockReturnValue({ width: 1200 }),
            },
          ]),
        },
      ]);

      tableUIStub.methods.getHeaderComponent = vi.fn().mockReturnValue({
        getHeaderCellWidths: vi.fn().mockReturnValue([1200, 60]),
      });
      const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
      await loadFonts(wrapper);
      expect(wrapper.vm.currentColumnSizes).toStrictEqual({
        [column1.id]: MAX_AUTO_COLUMN_SIZE,
        b: MAX_AUTO_COLUMN_SIZE,
      });
      expect(wrapper.emitted()).toHaveProperty("autoColumnSizesUpdate");
      expect(wrapper.emitted().autoColumnSizesUpdate).toHaveLength(1);
    });
  });

  describe("auto row height", () => {
    beforeAll(() => {
      props.autoColumnSizesOptions.calculateForBody = false;
      props.autoColumnSizesOptions.calculateForHeader = false;
    });

    it("adds the fixed heights to the row heights by column object when the column still exists", async () => {
      props.autoRowHeightOptions.fixedHeights = { [column1.id]: 80, c: 90 };
      const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
      await loadFonts(wrapper);
      expect(wrapper.vm.currentHeightsByColumn).toStrictEqual({
        [column1.id]: 80,
        b: 44,
      });
      expect(wrapper.emitted()).toHaveProperty("autoRowHeightUpdate");
      expect(wrapper.emitted().autoRowHeightUpdate).toHaveLength(1);
    });

    it.each([
      {
        description: "minimum",
        heights: [10, 5, MIN_ROW_HEIGHT, MIN_ROW_HEIGHT, MIN_ROW_HEIGHT],
      },
      {
        description: "maximum",
        heights: [60, 600, 60, 600, MAX_AUTO_ROW_HEIGHT],
      },
    ])("enforces a $description row height", async ({ heights }) => {
      const [height1, height2, height1Result, height2Result, enforcedHeight] =
        heights;
      tableUIStub.methods.getRowComponents = vi.fn().mockReturnValue([
        {
          getCellComponents: vi.fn().mockReturnValue([
            {
              getCellContentDimensions: vi
                .fn()
                .mockReturnValue({ height: height1 }),
            },
            {
              getCellContentDimensions: vi
                .fn()
                .mockReturnValue({ height: height2 }),
            },
          ]),
        },
      ]);

      const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
      await loadFonts(wrapper);
      expect(wrapper.vm.currentHeightsByColumn).toStrictEqual({
        [column1.id]: height1Result,
        b: height2Result,
      });
      expect(wrapper.vm.currentRowHeight).toBe(enforcedHeight);
      expect(wrapper.emitted()).toHaveProperty("autoRowHeightUpdate");
      expect(wrapper.emitted().autoRowHeightUpdate[0][0]).toBe(enforcedHeight);
    });
  });

  it("emits update:available-width", () => {
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    const newAvailableWidth = 200;
    wrapper
      .findComponent(TableUI)
      .vm.$emit("update:available-width", newAvailableWidth);

    expect(wrapper.emitted()).toHaveProperty("update:available-width");
    expect(wrapper.emitted("update:available-width")).toStrictEqual([
      [newAvailableWidth],
    ]);
  });

  it("forwards the method to refresh the scroller", () => {
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    wrapper.vm.refreshScroller();
    expect(refreshScrollerMock).toHaveBeenCalled();
  });

  it("forwards the method to clear the cell selection", () => {
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    wrapper.vm.clearCellSelection();
    expect(clearCellSelectionMock).toHaveBeenCalled();
  });

  it("returns the table ui as element on getTableUIElement", () => {
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    const tableUIElement = wrapper.vm.getTableUIElement();
    expect(tableUIElement instanceof HTMLElement).toBeTruthy();
    expect(tableUIElement.nodeName).toBe("TABLE");
  });
});
