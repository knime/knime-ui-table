import { it, describe, expect } from "vitest";
import useTableReady from "../useTableReady";

describe("useTableReady", () => {
  it("sets tableIsInitiallyReady to true when it is not visible yet", () => {
    const {
      tableIsVisible,
      tableIsInitiallyReady,
      setTableIsVisibleToTrue,
      setAutoSizesWereInitiallyUpdatedToTrue,
      setAvailableWidthWasInitiallyUpdatedToTrue,
    } = useTableReady();

    expect(tableIsInitiallyReady.value).toBeFalsy();
    expect(tableIsVisible.value).toBeFalsy();

    setAutoSizesWereInitiallyUpdatedToTrue();
    expect(tableIsInitiallyReady.value).toBeFalsy();

    setAvailableWidthWasInitiallyUpdatedToTrue();
    expect(tableIsInitiallyReady.value).toBeTruthy();

    setTableIsVisibleToTrue();
    expect(tableIsInitiallyReady.value).toBeFalsy();
    expect(tableIsVisible.value).toBeTruthy();
  });
});
