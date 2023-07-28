import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { shallowMount } from "@vue/test-utils";

import TableUIWithAutoSizeCalculation from "../TableUIWithAutoSizeCalculation.vue";
import TableUI from "../TableUI.vue";
import { ref } from "vue";

const useTableReadyMock = {
  tableIsInitiallyReady: ref(false),
  tableIsVisible: ref(false),
  setTableIsVisibleToTrue: vi.fn(),
  setAutoSizesWereInitiallyUpdatedToTrue: vi.fn(),
  setAvailableWidthWasInitiallyUpdatedToTrue: vi.fn(),
};
vi.mock("../composables/useTableReady", () => ({
  default: vi.fn(() => useTableReadyMock),
}));

describe("TableUIWithAutoSizeCalculation.vue", () => {
  let props, tableUIStub, context, refreshScrollerMock;

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
    };

    refreshScrollerMock = vi.fn();

    tableUIStub = {
      template: "<table />",
      methods: {
        getRowComponents: vi.fn().mockReturnValue([
          {
            getCellComponents: vi
              .fn()
              .mockReturnValue([
                { getCellContentWidth: vi.fn().mockReturnValue(60) },
                { getCellContentWidth: vi.fn().mockReturnValue(60) },
              ]),
          },
        ]),
        getHeaderComponent: vi.fn().mockReturnValue({
          getHeaderCellWidths: vi.fn().mockReturnValue([60, 60]),
        }),
        refreshScroller: refreshScrollerMock,
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
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    expect(
      wrapper.findComponent(TableUIWithAutoSizeCalculation).exists(),
    ).toBeTruthy();
    expect(wrapper.findComponent(TableUI).exists()).toBeTruthy();
    expect(wrapper.findComponent({ ref: "tableUI" }).attributes().style).toBe(
      "visibility: hidden;",
    );
    expect(wrapper.emitted()).toHaveProperty("autoColumnSizesUpdate");
    expect(wrapper.emitted("autoColumnSizesUpdate")).toStrictEqual([[{}]]);
    expect(wrapper.vm.mountTableUIForAutoSizeCalculation).toBeFalsy();
    expect(wrapper.vm.$refs).toStrictEqual({ tableUI: expect.any(Object) });
    expect(
      useTableReadyMock.setAutoSizesWereInitiallyUpdatedToTrue,
    ).toHaveBeenCalled();
  });

  it("mounts the TableUI when calculateForBody/calculateForHeader are true and creates correct configs", async () => {
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    expect(wrapper.vm.mountTableUIForAutoSizeCalculation).toBeTruthy();

    await loadFonts(wrapper);
    expect(wrapper.vm.tableConfigForAutoColumnSizesCalculation).toStrictEqual(
      expect.objectContaining({ enableVirtualScrolling: false }),
    );
    expect(
      wrapper.vm.dataConfigForAutoColumnSizesCalculation.columnConfigs,
    ).toStrictEqual([
      expect.objectContaining({ size: 0 }),
      expect.objectContaining({ size: 0 }),
    ]);
    expect(wrapper.vm.paginatedDataForAutoColumnSizesCalculation).toStrictEqual(
      [
        [
          { a: "group0row0cellA", b: "group0row0cellB" },
          { a: "group0row1cellA", b: "group0row1cellB" },
          { a: "group1row0cellA", b: "group1row0cellB" },
        ],
      ],
    );
    expect(wrapper.emitted()).toHaveProperty("autoColumnSizesUpdate");
    expect(wrapper.emitted().autoColumnSizesUpdate).toHaveLength(1);
  });

  it("is visible when the sizes were initially calculated and the available width was received", () => {
    props.autoColumnSizesOptions.calculateForBody = false;
    props.autoColumnSizesOptions.calculateForHeader = false;
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);

    const newAvailableWidth = 200;
    wrapper
      .findComponent(TableUI)
      .vm.$emit("update:available-width", newAvailableWidth);

    expect(wrapper.emitted()).toHaveProperty("update:available-width");
    expect(wrapper.emitted("update:available-width")).toStrictEqual([[200]]);
  });

  it("emits ready only on the first update when the sizes were calculated and the table is not visible yet", async () => {
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    await loadFonts(wrapper);
    expect(wrapper.emitted()).not.toHaveProperty("ready");

    useTableReadyMock.tableIsInitiallyReady.value = true;
    expect(wrapper.vm.tableIsInitiallyReady).toBeTruthy();
    expect(wrapper.emitted()).not.toHaveProperty("ready");

    wrapper.vm.$forceUpdate();
    await wrapper.vm.$nextTick();
    expect(useTableReadyMock.setTableIsVisibleToTrue).toHaveBeenCalled();
    expect(wrapper.emitted()).not.toHaveProperty("ready");

    useTableReadyMock.tableIsVisible.value = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted()).toHaveProperty("ready");
    expect(wrapper.findComponent({ ref: "tableUI" }).attributes().style).toBe(
      "visibility: visible;",
    );

    wrapper.vm.$forceUpdate();
    expect(wrapper.emitted("ready").length).toBe(1);
  });

  it("does not mount the TableUI for calculation when columns were only removed", async () => {
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    await loadFonts(wrapper);
    expect(wrapper.vm.currentSizes).toStrictEqual({ [column1.id]: 60, b: 60 });
    const calcAutoColSizesSpy = vi.spyOn(
      wrapper.vm,
      "calculateAutoColumnSizes",
    );

    await wrapper.setProps({
      dataConfig: { ...props.dataConfig, columnConfigs: [column1] },
    });
    expect(wrapper.vm.calculateSizes).toBeFalsy();

    await loadFonts(wrapper);
    expect(wrapper.vm.currentSizes).toStrictEqual({ [column1.id]: 60 });
    expect(wrapper.emitted()).toHaveProperty("autoColumnSizesUpdate");
    expect(wrapper.emitted().autoColumnSizesUpdate).toHaveLength(2);
    expect(calcAutoColSizesSpy).not.toHaveBeenCalled();
  });

  it("mounts the TableUI for calculation when columns were added", async () => {
    props.dataConfig.columnConfigs = [column1];
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    await loadFonts(wrapper);
    expect(wrapper.vm.currentSizes).toStrictEqual({ [column1.id]: 60 });

    await wrapper.setProps({
      dataConfig: { ...props.dataConfig, columnConfigs: [column1, column2] },
    });
    await loadFonts(wrapper);
    expect(wrapper.vm.currentSizes).toStrictEqual({ [column1.id]: 60, b: 60 });
    expect(wrapper.emitted()).toHaveProperty("autoColumnSizesUpdate");
    expect(wrapper.emitted().autoColumnSizesUpdate).toHaveLength(2);
    expect(
      useTableReadyMock.setAutoSizesWereInitiallyUpdatedToTrue,
    ).toHaveBeenCalled();
  });

  it("adds the fixed sizes to the column sizes object when the column still exists", async () => {
    props.autoColumnSizesOptions.fixedSizes = { [column1.id]: 80, c: 90 };
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    await loadFonts(wrapper);
    expect(wrapper.vm.currentSizes).toStrictEqual({ [column1.id]: 80, b: 60 });
    expect(wrapper.emitted()).toHaveProperty("autoColumnSizesUpdate");
    expect(wrapper.emitted().autoColumnSizesUpdate).toHaveLength(1);
  });

  it("enforces a maximum column size", async () => {
    tableUIStub.methods.getRowComponents = vi.fn().mockReturnValue([
      {
        getCellComponents: vi
          .fn()
          .mockReturnValue([
            { getCellContentWidth: vi.fn().mockReturnValue(60) },
            { getCellContentWidth: vi.fn().mockReturnValue(1200) },
          ]),
      },
    ]);

    tableUIStub.methods.getHeaderComponent = vi.fn().mockReturnValue({
      getHeaderCellWidths: vi.fn().mockReturnValue([1200, 60]),
    });
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    await loadFonts(wrapper);
    expect(wrapper.vm.currentSizes).toStrictEqual({
      [column1.id]: 960,
      b: 960,
    });
    expect(wrapper.emitted()).toHaveProperty("autoColumnSizesUpdate");
    expect(wrapper.emitted().autoColumnSizesUpdate).toHaveLength(1);
  });

  it("triggers the calculation when a property of the auto size options is changed", async () => {
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    await loadFonts(wrapper);
    const triggerCalculationSpy = vi.spyOn(
      wrapper.vm,
      "triggerCalculationOfAutoColumnSizes",
    );
    expect(triggerCalculationSpy).toHaveBeenCalledTimes(0);

    await wrapper.setProps({
      autoColumnSizesOptions: {
        ...props.autoColumnSizesOptions,
        calculateForBody: false,
      },
    });
    expect(triggerCalculationSpy).toHaveBeenCalledTimes(1);

    await wrapper.setProps({
      autoColumnSizesOptions: {
        ...props.autoColumnSizesOptions,
        calculateForHeader: false,
      },
    });
    expect(triggerCalculationSpy).toHaveBeenCalledTimes(2);

    await wrapper.setProps({
      autoColumnSizesOptions: {
        ...props.autoColumnSizesOptions,
        fixedSizes: { a: 40, b: 60 },
      },
    });
    expect(triggerCalculationSpy).toHaveBeenCalledTimes(3);
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
    expect(
      useTableReadyMock.setAvailableWidthWasInitiallyUpdatedToTrue,
    ).toHaveBeenCalled();
  });

  it("forwards the method to refresh the scroller", () => {
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    wrapper.vm.refreshScroller();
    expect(refreshScrollerMock).toHaveBeenCalled();
  });

  it("returns the table ui as element on getTableUIElement", () => {
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    const tableUIElement = wrapper.vm.getTableUIElement();
    expect(tableUIElement instanceof HTMLElement).toBeTruthy();
    expect(tableUIElement.nodeName).toBe("TABLE");
  });
});
