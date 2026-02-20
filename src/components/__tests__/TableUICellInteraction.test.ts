/* eslint-disable vitest/max-nested-describe */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { type VueWrapper, mount } from "@vue/test-utils";

import { columnTypes } from "@/config/table.config";
import TableBodyNavigatable from "../TableBodyNavigatable.vue";
import TableCore from "../TableCore.vue";
import TableCoreGroups from "../TableCoreGroups.vue";
import TableUI from "../TableUI.vue";

vi.mock("../composables/useAvailableWidth", () => ({
  useAvailableWidth: vi.fn(() => ({
    innerWidthToBodyWidth: vi.fn((w: number) => w),
    fitsInsideTotalWidth: vi.fn(() => true),
  })),
  useTotalWidth: vi.fn(() => 300),
}));

// --- Helper methods ---

const defaultData = [
  [
    { a: "A0", b: "B0", c: "C0" },
    { a: "A1", b: "B1", c: "C1" },
    { a: "A2", b: "B2", c: "C2" },
  ],
];

/**
 * Mount TableUI with minimal props for an editable table.
 * All columns are editable and cell selection is enabled.
 */
const mountEditableTable = ({
  data = defaultData,
  showNewColumnAndRowButton = false,
}: {
  data?: any[][];
  showNewColumnAndRowButton?: boolean;
} = {}) => {
  let bodySizeEvent: any[] = [];
  window.ResizeObserver = vi.fn().mockImplementation((callback: any) => ({
    observe: vi.fn(() => callback(bodySizeEvent)),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any;
  bodySizeEvent = [{ contentRect: { height: 1000 } }];

  const wrapper = mount(TableUI, {
    props: {
      data,
      currentSelection: data.map((group) => group.map(() => false)),
      dataConfig: {
        columnConfigs: [
          {
            key: "a",
            id: "a",
            header: "Col A",
            type: columnTypes.Number,
            size: 100,
            editable: true,
            filterConfig: { is: "FilterInputField" },
            formatter: (x: any) => x,
            classGenerator: [],
            hasSlotContent: false,
          },
          {
            key: "b",
            id: "b",
            header: "Col B",
            type: columnTypes.Number,
            size: 100,
            editable: true,
            filterConfig: { is: "FilterInputField" },
            formatter: (x: any) => x,
            classGenerator: [],
            hasSlotContent: false,
          },
          {
            key: "c",
            id: "c",
            header: "Col C",
            type: columnTypes.Number,
            size: 100,
            editable: true,
            filterConfig: { is: "FilterInputField" },
            formatter: (x: any) => x,
            classGenerator: [],
            hasSlotContent: false,
          },
        ],
        rowConfig: {
          compactMode: false,
          enableResizing: false,
        },
      },
      tableConfig: {
        showSelection: false,
        showCollapser: false,
        showPopovers: false,
        showColumnFilters: false,
        showBottomControls: false,
        enableCellSelection: true,
        enableDataValueViews: false,
        enableVirtualScrolling: false,
        subMenuItems: [],
        searchConfig: { searchQuery: "" },
        timeFilterConfig: { currentTimeFilter: "" },
        pageConfig: {
          currentSize: 3,
          tableSize: 3,
          pageSize: 10,
          columnCount: 3,
          possiblePageSizes: [10],
          currentPage: 1,
          showTableSize: true,
        },
        ...(showNewColumnAndRowButton
          ? { showNewColumnAndRowButton: true }
          : {}),
      },
    },
    shallow: false,
    global: {
      stubs: {
        TableCore,
        TableCoreGroups,
        TableBodyNavigatable,
      },
    },
  });

  return wrapper;
};

const clickCell = async (wrapper: VueWrapper, row: number, col: number) => {
  const tableUIVm = wrapper.vm as any;
  tableUIVm.onCellSelectRowEvent(col, row, 0, false);
  await nextTick();
  tableUIVm.onCellSelectRowEvent(col, row, 0, false);
  await nextTick();
};

/**
 * Drag across cells to select a range (without editing).
 */
const dragCells = async (
  wrapper: VueWrapper,
  from: { row: number; col: number },
  to: { row: number; col: number },
) => {
  const tableUIVm = wrapper.vm as any;
  tableUIVm.onCellSelect(from.col, from.row, 0);
  await nextTick();
  tableUIVm.onExpandCellSelect(to.col, to.row, 0);
  await nextTick();
};

const getEditableCell = (
  wrapper: VueWrapper,
): { x: number; y: number } | null => {
  return (wrapper.vm as any).editingCell ?? null;
};

const getSelectedCells = (
  wrapper: VueWrapper,
): {
  x: { min: number; max: number };
  y: { min: number; max: number };
} | null => {
  return (wrapper.vm as any).rectMinMax ?? null;
};

const getSelectedCell = (
  wrapper: VueWrapper,
): { x: number; y: number } | null => {
  return (wrapper.vm as any).selectedCell ?? null;
};

/**
 * Press a key on the table body (selection state) or trigger a keydown.
 * In selection state, keys are handled by TableBodyNavigatable's tbody.
 */
const pressKeyOnBody = async (
  wrapper: VueWrapper,
  key: string,
  modifiers: { shift?: boolean; ctrl?: boolean; meta?: boolean } = {},
) => {
  // Focus the body first
  const tbody = wrapper.find("tbody");
  await tbody.trigger("focusin");
  await tbody.trigger("keydown", {
    key,
    shiftKey: modifiers.shift ?? false,
    ctrlKey: modifiers.ctrl ?? false,
    metaKey: modifiers.meta ?? false,
  });
  await nextTick();
};

/**
 * Press a key while in editing state.
 * The editing keydown handler is provided via the editable-cell slot.
 */
const pressKeyOnEditingCell = async (
  wrapper: VueWrapper,
  key: string,
  modifiers: { shift?: boolean } = {},
) => {
  const tableUIVm = wrapper.vm as any;
  const handler = tableUIVm.createEditingCellKeydownHandler({
    moveSelection: tableUIVm.onKeyboardMoveSelectionFromEditingCell,
  });
  const event = new KeyboardEvent("keydown", {
    key,
    shiftKey: modifiers.shift ?? false,
    bubbles: true,
    cancelable: true,
  });
  handler(event);
  await nextTick();
};

/**
 * Select a cell (without editing) by directly calling the selection API.
 */
const selectCell = async (wrapper: VueWrapper, row: number, col: number) => {
  const tableUIVm = wrapper.vm as any;
  tableUIVm.onCellSelect(col, row, 0);
  await nextTick();
};

/**
 * Focus the table body (needed for copy/paste/key events in selection state).
 */
const focusBody = async (wrapper: VueWrapper) => {
  const tbody = wrapper.find("tbody");
  await tbody.trigger("focusin");
  await nextTick();
};

// --- Tests ---

describe("TableUI Cell Interaction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("entering states", () => {
    it("first click on a cell selects it without entering editable state", async () => {
      const wrapper = mountEditableTable();
      const tableUIVm = wrapper.vm as any;
      tableUIVm.onCellSelectRowEvent(1, 1, 0, false);
      await nextTick();
      expect(getEditableCell(wrapper)).toBeNull();
      expect(getSelectedCell(wrapper)).toStrictEqual({ x: 1, y: 1 });
      wrapper.unmount();
    });

    it("second click on already-selected cell enters editable state", async () => {
      const wrapper = mountEditableTable();
      await clickCell(wrapper, 1, 1);
      expect(getEditableCell(wrapper)).toStrictEqual({ x: 1, y: 1 });
      wrapper.unmount();
    });

    it("clicking a cell that is part of a multi-cell selection does not start editing", async () => {
      const wrapper = mountEditableTable();
      const tableUIVm = wrapper.vm as any;
      await dragCells(wrapper, { row: 0, col: 0 }, { row: 1, col: 2 });
      tableUIVm.onCellSelectRowEvent(0, 0, 0, false);
      await nextTick();
      expect(getEditableCell(wrapper)).toBeNull();
      wrapper.unmount();
    });

    it("drag across multiple cells enters selection state", async () => {
      const wrapper = mountEditableTable();
      await dragCells(wrapper, { row: 0, col: 0 }, { row: 1, col: 2 });
      expect(getEditableCell(wrapper)).toBeNull();
      expect(getSelectedCells(wrapper)).toStrictEqual({
        x: { min: 0, max: 2 },
        y: { min: 0, max: 1 },
      });
      wrapper.unmount();
    });
  });

  describe("editable state", () => {
    let wrapper: VueWrapper;

    beforeEach(async () => {
      wrapper = mountEditableTable();
      await clickCell(wrapper, 1, 1);
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it("escape transitions to selection", async () => {
      expect(getEditableCell(wrapper)).toStrictEqual({ x: 1, y: 1 });
      await pressKeyOnEditingCell(wrapper, "Escape");
      expect(getEditableCell(wrapper)).toBeNull();
      expect(getSelectedCell(wrapper)).toStrictEqual({ x: 1, y: 1 });
    });

    it("enter selects the cell below", async () => {
      await pressKeyOnEditingCell(wrapper, "Enter");
      expect(getEditableCell(wrapper)).toBeNull();
      expect(getSelectedCell(wrapper)).toStrictEqual({ x: 1, y: 2 });
    });

    it("shift+Enter is not intercepted (normal text input)", () => {
      const handler = (wrapper.vm as any).createEditingCellKeydownHandler({
        moveSelection: vi.fn(),
      });
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      handler(event);
      // Handler does not call preventDefault — the event passes through
      expect(event.defaultPrevented).toBe(false);
    });

    it("tab selects the cell to the right", async () => {
      await pressKeyOnEditingCell(wrapper, "Tab");
      expect(getEditableCell(wrapper)).toBeNull();
      expect(getSelectedCell(wrapper)).toStrictEqual({ x: 2, y: 1 });
    });

    it("shift+Tab selects the cell to the left", async () => {
      await pressKeyOnEditingCell(wrapper, "Tab", { shift: true });
      expect(getEditableCell(wrapper)).toBeNull();
      expect(getSelectedCell(wrapper)).toStrictEqual({ x: 0, y: 1 });
    });

    it("arrow keys are not intercepted (normal text input)", () => {
      const moveSelection = vi.fn();
      const handler = (wrapper.vm as any).createEditingCellKeydownHandler({
        moveSelection,
      });
      for (const key of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]) {
        handler(new KeyboardEvent("keydown", { key }));
      }
      expect(moveSelection).not.toHaveBeenCalled();
    });

    it("delete and backspace are not intercepted (normal text input)", () => {
      const moveSelection = vi.fn();
      const handler = (wrapper.vm as any).createEditingCellKeydownHandler({
        moveSelection,
      });
      const deleteEvent = new KeyboardEvent("keydown", {
        key: "Delete",
        bubbles: true,
        cancelable: true,
      });
      const backspaceEvent = new KeyboardEvent("keydown", {
        key: "Backspace",
        bubbles: true,
        cancelable: true,
      });
      handler(deleteEvent);
      handler(backspaceEvent);
      // moveSelection is not called — keys are consumed via stopPropagation
      expect(moveSelection).not.toHaveBeenCalled();
    });

    it("character input is not intercepted (normal text input)", () => {
      const moveSelection = vi.fn();
      const handler = (wrapper.vm as any).createEditingCellKeydownHandler({
        moveSelection,
      });
      handler(new KeyboardEvent("keydown", { key: "a" }));
      expect(moveSelection).not.toHaveBeenCalled();
    });
  });

  describe("selection state", () => {
    let wrapper: VueWrapper;

    beforeEach(async () => {
      wrapper = mountEditableTable();
      await selectCell(wrapper, 1, 1);
      await focusBody(wrapper);
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it("arrow keys navigate to the next cell", async () => {
      await pressKeyOnBody(wrapper, "ArrowRight");
      expect(getSelectedCell(wrapper)).toStrictEqual({ x: 2, y: 1 });

      await pressKeyOnBody(wrapper, "ArrowDown");
      expect(getSelectedCell(wrapper)).toStrictEqual({ x: 2, y: 2 });

      await pressKeyOnBody(wrapper, "ArrowLeft");
      expect(getSelectedCell(wrapper)).toStrictEqual({ x: 1, y: 2 });

      await pressKeyOnBody(wrapper, "ArrowUp");
      expect(getSelectedCell(wrapper)).toStrictEqual({ x: 1, y: 1 });
    });

    it("tab moves one cell to the right", async () => {
      await pressKeyOnBody(wrapper, "Tab");
      expect(getSelectedCell(wrapper)).toStrictEqual({ x: 2, y: 1 });
    });

    it("shift+Tab moves one cell to the left", async () => {
      await pressKeyOnBody(wrapper, "Tab", { shift: true });
      expect(getSelectedCell(wrapper)).toStrictEqual({ x: 0, y: 1 });
    });

    it("enter enters editable state and clears selection", async () => {
      expect(getEditableCell(wrapper)).toBeNull();
      await pressKeyOnBody(wrapper, "Enter");
      expect(getEditableCell(wrapper)).toStrictEqual({ x: 1, y: 1 });
    });

    it("shift+Enter does nothing", async () => {
      const cellBefore = getSelectedCell(wrapper);
      await pressKeyOnBody(wrapper, "Enter", { shift: true });
      expect(getSelectedCell(wrapper)).toStrictEqual(cellBefore);
      expect(getEditableCell(wrapper)).toBeNull();
    });

    it("copy copies the selected cells", async () => {
      window.dispatchEvent(new Event("copy"));
      await nextTick();
      expect(wrapper.emitted("copySelection")).toBeDefined();
      expect(wrapper.emitted("copySelection")![0]).toStrictEqual([
        {
          id: 0,
          rect: { x: { min: 1, max: 1 }, y: { min: 1, max: 1 } },
          withHeaders: false,
        },
      ]);
    });

    it("cut cuts the selected cells", async () => {
      window.dispatchEvent(new Event("cut"));
      await nextTick();
      expect(wrapper.emitted("cutSelection")).toBeDefined();
    });

    it("paste pastes into the selected cells", async () => {
      window.dispatchEvent(new Event("paste"));
      await nextTick();
      expect(wrapper.emitted("pasteSelection")).toBeDefined();
      expect(wrapper.emitted("pasteSelection")![0]).toStrictEqual([
        {
          id: 0,
          rect: { x: { min: 1, max: 1 }, y: { min: 1, max: 1 } },
          updateSelection: expect.any(Function),
        },
      ]);
    });

    it("character input makes cell editable and replaces value", async () => {
      expect(getEditableCell(wrapper)).toBeNull();
      await pressKeyOnBody(wrapper, "x");
      expect(getEditableCell(wrapper)).toStrictEqual({ x: 1, y: 1 });
      expect((wrapper.vm as any).editingCellInitialValue).toBe("x");
    });

    it("delete clears cell content, cell remains selected", async () => {
      // Delete is handled on the <table> element via @keydown.delete.exact
      await wrapper.find("table").trigger("keydown.delete.exact", {
        key: "Delete",
      });
      await nextTick();
      expect(wrapper.emitted("deleteSelection")).toBeDefined();
      // Cell should remain selected, not editing
      expect(getSelectedCell(wrapper)).toStrictEqual({ x: 1, y: 1 });
      expect(getEditableCell(wrapper)).toBeNull();
    });

    it("backspace enters editable state with empty initial value", async () => {
      expect(getEditableCell(wrapper)).toBeNull();
      await pressKeyOnBody(wrapper, "Backspace");
      expect(getEditableCell(wrapper)).toStrictEqual({ x: 1, y: 1 });
      expect((wrapper.vm as any).editingCellInitialValue).toBe("");
    });

    describe("edge navigation", () => {
      let wrapper: VueWrapper;

      beforeEach(() => {
        wrapper = mountEditableTable({ showNewColumnAndRowButton: true });
      });

      afterEach(() => {
        wrapper.unmount();
      });

      it("tab beyond right edge clears selection and stores position", async () => {
        // Select last column cell (col 2, row 1)
        await selectCell(wrapper, 1, 2);
        await focusBody(wrapper);
        await pressKeyOnBody(wrapper, "Tab");
        // Selection should be cleared
        expect(getSelectedCells(wrapper)).toBeNull();
        // Position should be stored for the add column button
        expect(
          (wrapper.vm as any).lastRowAndRectIdBeforeMovingToNewColumnButton,
        ).toStrictEqual({ rowInd: 1, rectId: 0 });
      });

      it("arrow right beyond right edge clears selection and stores position", async () => {
        await selectCell(wrapper, 1, 2);
        await focusBody(wrapper);
        await pressKeyOnBody(wrapper, "ArrowRight");
        expect(getSelectedCells(wrapper)).toBeNull();
        expect(
          (wrapper.vm as any).lastRowAndRectIdBeforeMovingToNewColumnButton,
        ).toStrictEqual({ rowInd: 1, rectId: 0 });
      });

      it("arrow down beyond bottom edge clears selection and stores position", async () => {
        // Select last row cell (col 1, row 2)
        await selectCell(wrapper, 2, 1);
        await focusBody(wrapper);
        await pressKeyOnBody(wrapper, "ArrowDown");
        expect(getSelectedCells(wrapper)).toBeNull();
        expect(
          (wrapper.vm as any).lastColumnAndRectIdBeforeMovingToNewRowButton,
        ).toStrictEqual({ columnInd: 1, rectId: 0 });
      });

      it("clicking add row button emits with stored position", async () => {
        await selectCell(wrapper, 2, 1);
        await focusBody(wrapper);
        await pressKeyOnBody(wrapper, "ArrowDown");
        // Simulate clicking the new row button
        (wrapper.vm as any).onNewRowButtonClick(new MouseEvent("click"));
        await nextTick();
        expect(wrapper.emitted("newRowButtonClick")).toBeDefined();
        expect(wrapper.emitted("newRowButtonClick")![0]).toStrictEqual([
          { columnInd: 1, rectId: 0 },
        ]);
      });

      it("moving back from add column button restores selection", async () => {
        await selectCell(wrapper, 1, 2);
        await focusBody(wrapper);
        // Move out to the right
        await pressKeyOnBody(wrapper, "Tab");
        expect(getSelectedCells(wrapper)).toBeNull();
        // Move back into body
        (wrapper.vm as any).onMoveIntoBodyFromRight();
        await nextTick();
        // Should select the last column in the same row
        expect(getSelectedCell(wrapper)).toStrictEqual({ x: 2, y: 1 });
      });

      it("moving back from add row button restores selection", async () => {
        await selectCell(wrapper, 2, 1);
        await focusBody(wrapper);
        // Move out downward
        await pressKeyOnBody(wrapper, "ArrowDown");
        expect(getSelectedCells(wrapper)).toBeNull();
        // Move back into body
        (wrapper.vm as any).onMoveIntoBodyFromBottom();
        await nextTick();
        // Should select the last row in the same column
        expect(getSelectedCell(wrapper)).toStrictEqual({ x: 1, y: 2 });
      });

      it("moving back from add row button to virtual selection column", async () => {
        const vm = wrapper.vm as any;
        const spy = vi
          .spyOn(vm, "focusRowVirtualColumn")
          .mockImplementation(() => {});
        vm.lastColumnAndRectIdBeforeMovingToNewRowButton = {
          virtualColumn: "selection",
          rectId: 0,
        };
        vm.onMoveIntoBodyFromBottom();
        await nextTick();
        expect(spy).toHaveBeenCalledWith("selection", 2, 0);
        expect(vm.lastColumnAndRectIdBeforeMovingToNewRowButton).toBeNull();
      });

      it("moving back from add row button to virtual delete column", async () => {
        const vm = wrapper.vm as any;
        const spy = vi
          .spyOn(vm, "focusRowVirtualColumn")
          .mockImplementation(() => {});
        vm.lastColumnAndRectIdBeforeMovingToNewRowButton = {
          virtualColumn: "delete",
          rectId: null,
        };
        vm.onMoveIntoBodyFromBottom();
        await nextTick();
        expect(spy).toHaveBeenCalledWith("delete", 2, null);
        expect(vm.lastColumnAndRectIdBeforeMovingToNewRowButton).toBeNull();
      });
    });
  });
});
