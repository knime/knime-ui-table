import { beforeEach, describe, expect, it } from "vitest";
import type { Ref } from "vue";
import useCellSelection, {
  type CellPosition,
  type Rect,
  type MinMax,
} from "../useCellSelection";

describe("useCellSelection", () => {
  let selectCell: (cellPos: CellPosition) => void,
    expandCellSelection: (cellPos: CellPosition) => void,
    getSelectedIndicesForRow: Ref<(rowInd: number) => MinMax | null>;

  type ExpectedPairs = { rowIndex: number; result: MinMax | null }[];

  const getExpectedFromRect = (rect: Rect): ExpectedPairs => {
    const expectedPairs: ExpectedPairs = [];
    for (let y = rect.y.min; y <= rect.y.max; y++) {
      expectedPairs.push({ rowIndex: y, result: rect.x });
    }
    expectedPairs.push({ rowIndex: rect.y.min - 1, result: null });
    expectedPairs.push({ rowIndex: rect.y.max + 1, result: null });
    return expectedPairs;
  };

  const expectSelectedRect = (rect: Rect) => {
    getExpectedFromRect(rect).forEach((expected) =>
      expect(getSelectedIndicesForRow.value(expected.rowIndex)).toStrictEqual(
        expected.result,
      ),
    );
  };

  const expectSingleSelectedCell = (cellPos: CellPosition) => {
    expectSelectedRect({
      x: { min: cellPos.x, max: cellPos.x },
      y: { min: cellPos.y, max: cellPos.y },
    });
  };

  beforeEach(() => {
    const cellSelecton = useCellSelection();
    selectCell = cellSelecton.selectCell;
    expandCellSelection = cellSelecton.expandCellSelection;
    getSelectedIndicesForRow = cellSelecton.getSelectedIndicesForRow;
  });

  it("selects cell on selectCell", () => {
    const cellPos: CellPosition = { x: 3, y: 5 };
    expect(getSelectedIndicesForRow.value(cellPos.y)).toBeNull();

    selectCell(cellPos);

    expectSingleSelectedCell(cellPos);
  });

  it("deselects cell if it was already selected", () => {
    const cellPos: CellPosition = { x: 3, y: 5 };

    selectCell(cellPos);
    selectCell(cellPos);

    expect(getSelectedIndicesForRow.value(cellPos.y)).toBeNull();
  });

  describe("expandCellSelection", () => {
    const anchorPos: CellPosition = { x: 3, y: 5 };

    it.each([
      [
        { x: 5, y: 7 },
        { x: { min: 3, max: 5 }, y: { min: 5, max: 7 } },
      ],
      [
        { x: 5, y: 3 },
        { x: { min: 3, max: 5 }, y: { min: 3, max: 5 } },
      ],
      [
        { x: 1, y: 7 },
        { x: { min: 1, max: 3 }, y: { min: 5, max: 7 } },
      ],
      [
        { x: 1, y: 3 },
        { x: { min: 1, max: 3 }, y: { min: 3, max: 5 } },
      ],
    ])(
      "sets rectangle min and max when selecting opposite corner at %s",
      (corner: CellPosition, expected: Rect) => {
        selectCell(anchorPos);

        expandCellSelection(corner);

        expectSelectedRect(expected);
      },
    );

    it("does not select rectangle on selectCell", () => {
      selectCell(anchorPos);
      const otherPosition = { x: 5, y: 7 };

      selectCell(otherPosition);

      expectSingleSelectedCell(otherPosition);
    });

    it("does not deselect cell if it was already selected when more than one cell was selected", () => {
      const cellPos: CellPosition = { x: 3, y: 5 };
      const corner: CellPosition = { x: 5, y: 7 };
      selectCell(cellPos);
      expandCellSelection(corner);

      selectCell(corner);

      expectSingleSelectedCell(corner);
    });

    it("selects cell on expandCellSelection if no cell was selected previously", () => {
      const corner: CellPosition = { x: 5, y: 7 };

      expandCellSelection(corner);

      expectSingleSelectedCell(corner);
    });
  });
});
