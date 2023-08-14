import { it, describe, expect } from "vitest";
import useTableReady from "../useTableReady";

describe("useTableReady", () => {
  it("sets tableIsInitiallyReady to true when it is not visible yet", () => {
    const {
      initialSizeUpdatesFinished: ready,
      setAutoSizesInitialized,
      setAvailableWidthInitialized,
    } = useTableReady();

    expect(ready.value).toBeFalsy();

    setAutoSizesInitialized();
    expect(ready.value).toBeFalsy();

    setAvailableWidthInitialized();
    expect(ready.value).toBeTruthy();
  });
});
