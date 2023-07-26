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

describe("TableUIWithAutoSizeCalculation.vue", () => {
  let props, tableUIStub, context, refreshScrollerMock;

  const column1 = { id: Symbol("a"), key: "a", header: "a" };
  const column2 = { id: "b", key: "b", header: "b" };

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
    vi.resetAllMocks();
  });

  it("renders", () => {
    props.autoColumnSizesOptions.calculateForBody = false;
    props.autoColumnSizesOptions.calculateForHeader = true;
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    expect(
      wrapper.findComponent(TableUIWithAutoSizeCalculation).exists(),
    ).toBeTruthy();
    expect(wrapper.findComponent(TableUI).exists()).toBeTruthy();
    expect(wrapper.findComponent({ ref: "tableUI" }).attributes().style).toBe(
      "visibility: hidden;",
    );
  });

  it("renders and is visible when the calculation is not triggered from the outside", () => {
    delete props.autoColumnSizesOptions;
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    expect(
      wrapper.findComponent(TableUIWithAutoSizeCalculation).exists(),
    ).toBeTruthy();
    expect(wrapper.findComponent(TableUI).exists()).toBeTruthy();
    expect(wrapper.findComponent({ ref: "tableUI" }).attributes().style).toBe(
      "visibility: visible;",
    );
  });

  it("does not mount the TableUIForAutoSizeCalculation when calculateForBody and calculateForHeader are false", () => {
    props.autoColumnSizesOptions.calculateForBody = false;
    props.autoColumnSizesOptions.calculateForHeader = false;
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    expect(wrapper.vm.mountTableUIForAutoSizeCalculation).toBeFalsy();
    expect(wrapper.vm.$refs).toStrictEqual({ tableUI: expect.any(Object) });
    expect(wrapper.vm.autoColumnSizesCalculationFinished).toBeTruthy();
  });

  it("mounts the TableUI when calculateForBody/calculateForHeader are true and creates correct configs", async () => {
    const wrapper = shallowMount(TableUIWithAutoSizeCalculation, context);
    expect(wrapper.vm.autoColumnSizesCalculationFinished).toBeFalsy();
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
    expect(wrapper.vm.autoColumnSizesCalculationFinished).toBeTruthy();
    expect(wrapper.emitted()).toHaveProperty("autoColumnSizesUpdate");
    expect(wrapper.emitted().autoColumnSizesUpdate).toHaveLength(1);
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
