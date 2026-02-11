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

/**
 * Click on a single cell to enter editable state.
 * This triggers pointerdown (which selects) and then the cell-select event
 * flow that leads to editing for editable columns.
 */
const clickCell = async (wrapper: VueWrapper, row: number, col: number) => {
  const tableUIVm = wrapper.vm as any;
  // Simulate what happens on cell click:
  // 1. Select the cell (with ignoreIfSelected=true for editable columns)
  // 2. Start editing
  tableUIVm.onCellSelectRowEvent(col, row, 0, false);
  await nextTick();
};

/**
 * Drag across cells to select a range (without editing).
 * Simulates: pointerdown on fromCell, pointermove to toCell, pointerup.
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

/**
 * Get the currently editable cell position, or null if none.
 */
const getEditableCell = (
  wrapper: VueWrapper,
): { x: number; y: number } | null => {
  return (wrapper.vm as any).editingCell ?? null;
};

/**
 * Get the selected cell rect (min/max bounds), or null if nothing selected.
 */
const getSelectedCells = (
  wrapper: VueWrapper,
): {
  x: { min: number; max: number };
  y: { min: number; max: number };
} | null => {
  return (wrapper.vm as any).rectMinMax ?? null;
};

/**
 * Get the single focused/selected cell position, or null.
 */
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
    it("click on a cell enters editable state", async () => {
      const wrapper = mountEditableTable();
      await clickCell(wrapper, 1, 1);
      expect(getEditableCell(wrapper)).toStrictEqual({ x: 1, y: 1 });
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
      // Click cell (1,1) to enter editable state
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
      // Select cell (1, 1) without editing
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
      expect(wrapper.emitted("copySelection")).toBeDefined();
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

    it("backspace clears cell content and enters editable state", async () => {
      expect(getEditableCell(wrapper)).toBeNull();
      await pressKeyOnBody(wrapper, "Backspace");
      expect(getEditableCell(wrapper)).toStrictEqual({ x: 1, y: 1 });
      expect((wrapper.vm as any).editingCellInitialValue).toBe("");
    });
  });
});
