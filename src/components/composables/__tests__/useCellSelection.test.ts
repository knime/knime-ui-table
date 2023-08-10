import { beforeEach, describe, expect, it } from "vitest";
import useCellSelection, {
  type CellPosition,
  type Rect,
  type RectId,
} from "../useCellSelection";

import type { Ref } from "vue";

describe("useCellSelection", () => {
  const id = 1;
  let selectCell: (cellPos: CellPosition, rectId: RectId) => void,
    expandCellSelection: (cellPos: CellPosition, rectId: RectId) => void,
    rectMinMax: Ref<Rect | null>,
    clearCellSelection: () => void,
    currentRectId: Ref<RectId | null>;

  const expectSelectedRect = (rect: Rect, id: RectId) => {
    expect(rectMinMax.value).toStrictEqual(rect);
    expect(currentRectId.value).toBe(id);
  };

  const expectSingleSelectedCell = (cellPos: CellPosition, id: RectId) => {
    expectSelectedRect(
      {
        x: { min: cellPos.x, max: cellPos.x },
        y: { min: cellPos.y, max: cellPos.y },
      },
      id,
    );
  };

  const expectEmptySelection = () => {
    expect(rectMinMax.value).toBeNull();
  };

  beforeEach(() => {
    const cellSelecton = useCellSelection();
    selectCell = cellSelecton.selectCell;
    expandCellSelection = cellSelecton.expandCellSelection;
    clearCellSelection = cellSelecton.clearCellSelection;
    rectMinMax = cellSelecton.rectMinMax;
    currentRectId = cellSelecton.currentRectId;
  });

  it("selects cell on selectCell", () => {
    const cellPos: CellPosition = { x: 3, y: 5 };
    expectEmptySelection();

    selectCell(cellPos, id);

    expectSingleSelectedCell(cellPos, id);
  });

  it("deselects cell if it was already selected", () => {
    const cellPos: CellPosition = { x: 3, y: 5 };

    selectCell(cellPos, id);
    selectCell(cellPos, id);

    expectEmptySelection();
  });

  it("does not deselect cell if the position is the same but the id changes", () => {
    const cellPos: CellPosition = { x: 3, y: 5 };

    selectCell(cellPos, id - 1);
    selectCell(cellPos, id);

    expectSingleSelectedCell(cellPos, id);
  });

  it("deselects all cells on clearCellSelection", () => {
    const cellPos: CellPosition = { x: 3, y: 5 };
    selectCell(cellPos, id);

    clearCellSelection();

    expectEmptySelection();
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
        selectCell(anchorPos, id);

        expandCellSelection(corner, id);

        expectSelectedRect(expected, id);
      },
    );

    it("does not select rectangle on selectCell", () => {
      selectCell(anchorPos, id);
      const otherPosition = { x: 5, y: 7 };

      selectCell(otherPosition, id);

      expectSingleSelectedCell(otherPosition, id);
    });

    it("does not deselect cell if it was already selected when more than one cell was selected", () => {
      const cellPos: CellPosition = { x: 3, y: 5 };
      const corner: CellPosition = { x: 5, y: 7 };
      selectCell(cellPos, id);
      expandCellSelection(corner, id);

      selectCell(corner, id);

      expectSingleSelectedCell(corner, id);
    });

    it("selects cell on expandCellSelection if no cell was selected previously", () => {
      const corner: CellPosition = { x: 5, y: 7 };

      expandCellSelection(corner, id);

      expectSingleSelectedCell(corner, id);
    });

    it("does not expand the selection if the id changes", () => {
      const otherPosition: CellPosition = { x: 5, y: 7 };
      selectCell(anchorPos, id - 1);

      expandCellSelection(otherPosition, id);

      expectSingleSelectedCell(otherPosition, id);
    });
  });
});
