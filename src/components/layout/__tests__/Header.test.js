import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";

import Header from "../Header.vue";
import { Checkbox, FunctionButton, SubMenu } from "@knime/components";
import ArrowIcon from "@knime/styles/img/icons/arrow-down.svg";
import FilterIcon from "@knime/styles/img/icons/filter.svg";

const columnSubMenuItems = [
  { text: "Data renderer", separator: true, sectionHeadline: true },
  {
    text: "renderer1",
    id: "rend1",
    section: "dataRendering",
    selected: false,
    showTooltip: true,
  },
  {
    text: "renderer2",
    id: "rend2",
    section: "dataRendering",
    selected: true,
    showTooltip: true,
  },
];

describe("Header.vue", () => {
  let wrapper, props;

  beforeEach(() => {
    props = {
      tableConfig: {
        sortConfig: {
          sortColumn: "",
          sortDirection: "",
        },
        showCollapser: false,
        showSelection: true,
        showColumnFilters: true,
        enableCellSelection: false,
      },
      columnHeaders: [
        "Column 1",
        "Column 2",
        "Column 3",
        "Column 4",
        "Column 5",
      ],
      columnSubHeaders: [],
      columnSizes: [75, 75, 75, 75, 75],
      columnSubMenuItems: [],
      columnSortConfigs: [true, true, true, true, true],
      columnHeaderColors: [null, "#ff0000", "#00ff00", "#0000ff", null],
      isSelected: false,
      filtersActive: false,
    };
  });

  it("renders default table header", () => {
    wrapper = shallowMount(Header, { props });
    expect(wrapper.findComponent(Header).exists()).toBe(true);
    expect(wrapper.findComponent(Checkbox).exists()).toBe(true);
    expect(wrapper.findComponent(FunctionButton).exists()).toBe(true);
    expect(wrapper.findComponent(FilterIcon).exists()).toBe(true);
    expect(wrapper.findComponent(ArrowIcon).exists()).toBe(true);
    expect(wrapper.find(".collapser-cell-spacer").exists()).toBe(false);
    let columns = wrapper.findAll("th.column-header");
    expect(columns.length).toBe(5);
    expect(columns.at(0).text()).toContain(props.columnHeaders[0]);
    expect(columns.at(1).text()).toContain(props.columnHeaders[1]);
    expect(columns.at(2).text()).toContain(props.columnHeaders[2]);
    expect(columns.at(3).text()).toContain(props.columnHeaders[3]);
    expect(columns.at(4).text()).toContain(props.columnHeaders[4]);
    expect(wrapper.find(".sub-header-text-container").exists()).toBe(false);
  });

  it("renders sub headers", () => {
    props.columnSubHeaders = [
      "SubHeader 1",
      "SubHeader 2",
      "SubHeader 3",
      "SubHeader 4",
      "SubHeader 5",
    ];
    wrapper = shallowMount(Header, { props });
    let columns = wrapper.findAll(".sub-header-text-container");
    expect(columns.length).toBe(5);
    expect(columns.at(0).text()).toContain(props.columnSubHeaders[0]);
    expect(columns.at(1).text()).toContain(props.columnSubHeaders[1]);
    expect(columns.at(2).text()).toContain(props.columnSubHeaders[2]);
    expect(columns.at(3).text()).toContain(props.columnSubHeaders[3]);
    expect(columns.at(4).text()).toContain(props.columnSubHeaders[4]);
  });

  it("renders drag handles", () => {
    wrapper = shallowMount(Header, { props });
    let handles = wrapper.findAll(".drag-handle");
    expect(handles.length).toBe(5);
  });

  it('hides "tr" element if no headers provided', () => {
    wrapper = shallowMount(Header);

    expect(wrapper.findComponent(Header).exists()).toBe(true);
    expect(wrapper.findComponent(Checkbox).exists()).toBe(false);
    expect(wrapper.findComponent(FunctionButton).exists()).toBe(false);
    expect(wrapper.findComponent(ArrowIcon).exists()).toBe(false);
    expect(wrapper.find(".collapser-cell-spacer").exists()).toBe(false);
    expect(wrapper.find("th.column-header").exists()).toBe(false);
  });

  it("hides the checkbox via config", () => {
    props.tableConfig.showSelection = false;
    wrapper = shallowMount(Header, {
      props,
    });

    expect(wrapper.findComponent(Header).exists()).toBe(true);
    expect(wrapper.findComponent(Checkbox).exists()).toBe(false);
  });

  it("disables the checkbox via prop", () => {
    props.tableConfig.disableSelection = true;
    wrapper = shallowMount(Header, {
      props,
    });

    expect(wrapper.findComponent(Checkbox).attributes().disabled).toBeTruthy();
  });

  it("hides the column filter toggle viaconfig", () => {
    props.tableConfig.showColumnFilters = false;
    wrapper = shallowMount(Header, {
      props,
    });

    expect(wrapper.findComponent(Header).exists()).toBe(true);
    expect(wrapper.findComponent(FunctionButton).exists()).toBe(false);
  });

  it("adds a collapser control spacer via config", () => {
    props.tableConfig.showCollapser = true;
    wrapper = shallowMount(Header, {
      props,
    });

    expect(wrapper.findComponent(Header).exists()).toBe(true);
    expect(wrapper.find(".collapser-cell-spacer").exists()).toBe(true);
  });

  it("emits a rowSelect event when the header checkbox is selected", () => {
    wrapper = shallowMount(Header, { props });

    expect(wrapper.findComponent(Header).emitted().headerSelect).toBeFalsy();
    wrapper.findComponent(Checkbox).vm.$emit("update:modelValue");
    expect(wrapper.findComponent(Header).emitted().headerSelect).toBeTruthy();
    expect(
      wrapper.findComponent(Header).emitted().headerSelect[0],
    ).toStrictEqual([true]);
  });

  it("emits a headerSort event when a column is clicked", () => {
    wrapper = shallowMount(Header, { props });

    expect(wrapper.findComponent(Header).emitted().columnSort).toBeFalsy();
    wrapper
      .findAll("th.column-header .column-header-content")
      .at(0)
      .trigger("click", 0);
    expect(wrapper.findComponent(Header).emitted().columnSort).toBeTruthy();
    expect(wrapper.findComponent(Header).emitted().columnSort[0]).toStrictEqual(
      [0, "Column 1"],
    );
  });

  it("emits a toggleFilter event when the filter toggle is clicked", () => {
    wrapper = shallowMount(Header, { props });

    expect(wrapper.findComponent(Header).emitted().toggleFilter).toBeFalsy();
    wrapper.findComponent(FunctionButton).vm.$emit("click");
    expect(wrapper.findComponent(Header).emitted().toggleFilter).toBeTruthy();
  });

  it("sets dragIndex on drag handle pointerdown", () => {
    wrapper = shallowMount(Header, { props });
    const dragHandle = wrapper.findAll(".drag-handle").at(0);
    dragHandle.element.setPointerCapture = (_pointerId) => null;

    expect(wrapper.vm.dragIndex).toBeNull();
    dragHandle.trigger("pointerdown", 0);
    expect(wrapper.vm.dragIndex).toBe(0);
  });

  it("emits columnResizeStart on pointerdown", () => {
    wrapper = shallowMount(Header, { props });
    const dragHandle = wrapper.findAll(".drag-handle").at(0);
    dragHandle.element.setPointerCapture = (_pointerId) => null;
    dragHandle.trigger("pointerdown", 0);
    expect(wrapper.emitted("columnResizeStart")).toBeDefined();
  });

  it("emits columnResizeEnd on pointerup", () => {
    wrapper = shallowMount(Header, { props });
    const dragHandle = wrapper.findAll(".drag-handle").at(0);
    dragHandle.element.setPointerCapture = (_pointerId) => null;
    dragHandle.trigger("pointerup", 0);
    expect(wrapper.emitted("columnResizeEnd")).toBeDefined();
    expect(wrapper.emitted("allColumnsResize")).toBeUndefined();
  });

  it("emits allColumnsResize on pointerup when shift is pressed", () => {
    wrapper = shallowMount(Header, { props });
    const dragHandle = wrapper.findAll(".drag-handle").at(0);
    dragHandle.element.setPointerCapture = (_pointerId) => null;
    wrapper.setData({
      pageXOnDragStart: 80,
      columnSizeOnDragStart: 40,
    });
    dragHandle.trigger("pointerup", { shiftKey: true, pageX: 100 });
    expect(wrapper.emitted("columnResizeEnd")).toBeDefined();
    expect(wrapper.emitted("allColumnsResize")[0][0]).toBe(60);
    dragHandle.trigger("pointerup", { shiftKey: true, pageX: 10 });
    expect(wrapper.emitted("allColumnsResize")[1][0]).toBe(50);
  });

  it("calls getDragHandleHeight on pointerdown", async () => {
    const dragHandlerHeightMock = 100;
    props.getDragHandleHeight = vi.fn(() => dragHandlerHeightMock);
    wrapper = shallowMount(Header, { props });
    const dragHandle = wrapper.findAll(".drag-handle").at(0);
    dragHandle.element.setPointerCapture = (_pointerId) => null;
    dragHandle.trigger("pointerdown", 0);
    await wrapper.vm.$nextTick();
    expect(dragHandle.element.style.height).toBe(
      `${dragHandlerHeightMock - 1}px`,
    );
  });

  it("emits a columnResize event on pointermove during drag", () => {
    wrapper = shallowMount(Header, { props });
    const header = wrapper.findComponent(Header);
    const dragHandle = wrapper.findAll(".drag-handle").at(0);
    dragHandle.element.setPointerCapture = (_pointerId) => null;

    dragHandle.trigger("pointermove");
    expect(header.emitted().columnResize).toBeFalsy();
    dragHandle.trigger("pointerdown", 0);
    dragHandle.trigger("pointermove");
    expect(header.emitted().columnResize).toBeTruthy();
  });

  it("unsets dragIndex on drag handle lostpointercapture", () => {
    wrapper = shallowMount(Header, { props });
    const dragHandle = wrapper.findAll(".drag-handle").at(0);
    dragHandle.element.setPointerCapture = (_pointerId) => null;

    dragHandle.trigger("pointerdown", 0);
    dragHandle.trigger("lostpointercapture");
    expect(wrapper.vm.dragIndex).toBeNull();
  });

  it("emits a subMenuItemSelection event when another subMenuItem is selected", () => {
    const subMenuClickedItem = {
      text: "renderer1",
      id: "rend1",
      section: "dataRendering",
    };
    props.columnSubMenuItems = new Array(5).fill(columnSubMenuItems);
    wrapper = mount(Header, {
      props,
    });
    wrapper
      .findAllComponents(SubMenu)
      .at(1)
      .vm.$emit("item-click", {}, subMenuClickedItem);
    expect(
      wrapper.findComponent(Header).emitted().subMenuItemSelection,
    ).toBeTruthy();
    expect(
      wrapper.findComponent(Header).emitted().subMenuItemSelection,
    ).toStrictEqual([[subMenuClickedItem, 1]]);
  });

  it("does not display the drag handler if column resizing is disabled", () => {
    props.tableConfig.enableColumnResizing = false;
    wrapper = shallowMount(Header, { props });

    expect(wrapper.find(".drag-handle").exists()).toBeFalsy();
  });

  it("sets hover index on drag handle pointerover", () => {
    wrapper = shallowMount(Header, { props });

    expect(wrapper.vm.hoverIndex).toBeNull();
    wrapper.findAll(".drag-handle")[0].trigger("pointerover", 0);
    expect(wrapper.vm.hoverIndex).toBe(0);
  });

  it("does not set hover index on drag handle pointerover during drag", () => {
    wrapper = shallowMount(Header, { props });
    const dragHandle = wrapper.findAll(".drag-handle")[0];
    dragHandle.element.setPointerCapture = (_pointerId) => null;

    dragHandle.trigger("pointerdown", 1);
    dragHandle.trigger("pointerover", 0);
    expect(wrapper.vm.hoverIndex).toBeNull();
  });

  it("unsets hover index on on drag handle pointerleave after pointerover", () => {
    wrapper = shallowMount(Header, { props });
    const dragHandle = wrapper.findAll(".drag-handle")[0];

    dragHandle.trigger("pointerover", 0);
    dragHandle.trigger("pointerleave");
    expect(wrapper.vm.hoverIndex).toBeNull();
  });

  it("does not unset hover index on drag handle pointerleave after pointerover during drag", () => {
    wrapper = shallowMount(Header, { props });
    const dragHandle = wrapper.findAll(".drag-handle")[0];
    dragHandle.element.setPointerCapture = (_pointerId) => null;

    dragHandle.trigger("pointerover", 0);
    dragHandle.trigger("pointerdown", 0);
    dragHandle.trigger("pointerleave");
    expect(wrapper.vm.hoverIndex).toBe(0);
  });

  it("disables sorting via config", () => {
    props.tableConfig.sortConfig = null;
    wrapper = shallowMount(Header, {
      props,
    });

    expect(wrapper.findComponent(Header).emitted().columnSort).toBeFalsy();
    wrapper.findAll("th > .column-header-content").forEach((thWrapper) => {
      expect(thWrapper.classes()).not.toContain("sortable");
    });
    wrapper.findAllComponents(ArrowIcon).forEach((iconWrapper) => {
      expect(iconWrapper.classes()).not.toContain("active");
    });
    wrapper.findAll("th > .column-header-content")[0].trigger("click", 0);
    expect(wrapper.findComponent(Header).emitted().columnSort).toBeFalsy();
  });

  it("disables sorting for specific columns via the columnSortConfig", () => {
    props.columnSortConfigs = [true, true, false, false, true];
    wrapper = shallowMount(Header, {
      props,
    });

    const wrappers = wrapper.findAll("th > .column-header-content");
    expect(wrappers[2].classes()).not.toContain("sortable");
    expect(wrappers[3].classes()).not.toContain("sortable");

    wrapper.findAll("th > .column-header-content")[2].trigger("click", 2);
    expect(wrapper.findComponent(Header).emitted().columnSort).toBeFalsy();
  });

  it("enables sorting for specific columns via the columnSortConfig", () => {
    props.columnSortConfig = [true, true, false, false, true];

    wrapper = shallowMount(Header, {
      props,
    });

    const wrappers = wrapper.findAll("th > .column-header-content");
    expect(wrappers[0].classes()).toContain("sortable");
    expect(wrappers[1].classes()).toContain("sortable");
    expect(wrappers[4].classes()).toContain("sortable");

    wrapper.findAll("th > .column-header-content")[0].trigger("click", 0);
    expect(wrapper.findComponent(Header).emitted().columnSort).toBeTruthy();
  });

  it("general sortConfig overrides columns specific columnSortConfig", () => {
    props.tableConfig.sortConfig = null;
    props.columnSortConfig = [true, true, false, false, true];

    wrapper = shallowMount(Header, {
      props,
    });

    wrapper.findAll("th > .column-header-content").forEach((thWrapper) => {
      expect(thWrapper.classes()).not.toContain("sortable");
    });
    wrapper.findAll("th > .column-header-content")[0].trigger("click", 0);
    expect(wrapper.findComponent(Header).emitted().columnSort).toBeFalsy();
  });

  it("computes the correct sizes such that the header size fits its content", () => {
    wrapper = shallowMount(Header, { props });
    expect(wrapper.vm.$refs).toHaveProperty("columnHeader-0");
    expect(wrapper.vm.$refs).toHaveProperty("headerTextContainer-0");
    expect(wrapper.vm.$refs).toHaveProperty("headerText-0");
    expect(wrapper.vm.$refs).toHaveProperty("columnHeader-4");
    expect(wrapper.vm.$refs).toHaveProperty("headerTextContainer-4");
    expect(wrapper.vm.$refs).toHaveProperty("headerText-4");
    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValueOnce({ width: 50 })
      .mockReturnValueOnce({ width: 30 })
      .mockReturnValue({ width: 40 });

    expect(wrapper.vm.getHeaderCellWidths()).toEqual([65, 45, 45, 45, 45]);
  });

  it("computes the correct sizes such that the header size fits its content with activated dragHandle", () => {
    props.tableConfig.enableColumnResizing = false;
    wrapper = shallowMount(Header, { props });
    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValueOnce({ width: 50 })
      .mockReturnValueOnce({ width: 30 })
      .mockReturnValue({ width: 40 });

    expect(wrapper.vm.getHeaderCellWidths()).toEqual([60, 40, 40, 40, 40]);
  });

  it("computes the correct cell paddings", () => {
    wrapper = shallowMount(Header, { props });
    expect(wrapper.vm.columnPaddingsLeft).toStrictEqual([10, 20, 20, 20, 10]);
  });

  it("renders with the correct styles for columns with and without colors", () => {
    wrapper = shallowMount(Header, { props });

    let columns = wrapper.findAll("th.column-header");
    expect(columns.at(0).attributes("style")).toContain("padding-left: 10px;");
    expect(columns.at(0).attributes("style")).not.toContain(
      "--data-cell-color",
    );
    expect(columns.at(0).classes()).not.toContain("colored-header");

    expect(columns.at(1).attributes("style")).toContain("padding-left: 20px;");
    expect(columns.at(1).attributes("style")).toContain(
      "--data-cell-color: #ff0000;",
    );
    expect(columns.at(1).classes()).toContain("colored-header");
  });

  it("emits selectColumnCellInFirstRow on keydown ArrowDown on the column header content with enabled selection", async () => {
    const columnIndexToTest = 2;
    wrapper = shallowMount(Header, {
      props: {
        ...props,
        tableConfig: { ...props.tableConfig, enableCellSelection: true },
      },
    });
    const header = wrapper.findComponent(Header);
    const columnHeaderContent = wrapper
      .findAll(".column-header-content")
      .at(columnIndexToTest);

    expect(header.emitted().selectColumnCellInFirstRow).toBeFalsy();
    await columnHeaderContent.trigger("keydown.down");
    expect(header.emitted().selectColumnCellInFirstRow).toBeTruthy();
    expect(wrapper.emitted().selectColumnCellInFirstRow[0][0]).toBe(
      columnIndexToTest,
    );
  });

  it("does not emit selectColumnCellInFirstRow on keydown ArrowDown with disabled selection", async () => {
    wrapper = shallowMount(Header, { props });
    const header = wrapper.findComponent(Header);
    const columnHeaderContent = wrapper.findAll(".column-header-content").at(2);

    expect(header.emitted().selectColumnCellInFirstRow).toBeFalsy();
    await columnHeaderContent.trigger("keydown.down");
    expect(header.emitted().selectColumnCellInFirstRow).toBeFalsy();
  });

  it("focusses a header cell with the given index", () => {
    const columnIndexToTest = 2;
    wrapper = shallowMount(Header, { props, attachTo: document.body });
    const elementToFocus = wrapper
      .findAll(".column-header-content")
      .at(columnIndexToTest).element;
    expect(document.activeElement).not.toBe(elementToFocus);
    wrapper.vm.focusHeaderCell(columnIndexToTest);
    expect(document.activeElement).toBe(elementToFocus);
  });
});
