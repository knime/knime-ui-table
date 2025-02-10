import { describe, expect, it } from "vitest";

import { valueTypeFormatters } from "../table.config";

describe("table value type formatters", () => {
  it("formats date time strings", () => {
    const formatter = valueTypeFormatters.DateTime;
    let testDate = "2023-12-24T18:23:50.000Z";
    expect(formatter(testDate)).toBe("Dec. 24, 2023, 18:23");
    testDate = "2023-12-24T18:05:23.000Z";
    expect(formatter(testDate)).toBe("Dec. 24, 2023, 18:05");
    testDate = "2023-12-24T02:05:23.000Z";
    expect(formatter(testDate)).toBe("Dec. 24, 2023, 02:05");
    testDate = "2023-12-24T00:00:23.000Z";
    expect(formatter(testDate)).toBe("Dec. 24, 2023, 00:00");
    testDate = "2023-05-09T18:05:23.000Z";
    expect(formatter(testDate)).toBe("May 09, 2023, 18:05");
    testDate = "2023-07-02T00:00:42.000Z";
    expect(formatter(testDate)).toBe("July 02, 2023, 00:00");

    const noDate = "some invalid date string";
    expect(formatter(noDate)).toBe("some invalid date string");
  });

  it("formats numbers", () => {
    const formatter = valueTypeFormatters.Number;
    let testNumber = 42;
    expect(formatter(testNumber)).toBe("42");
    testNumber = 1.3;
    expect(formatter(testNumber)).toBe("1.3");
    testNumber = 1e-3;
    expect(formatter(testNumber)).toBe("0.001");
    testNumber = 0b10;
    expect(formatter(testNumber)).toBe("2");
    testNumber = 0o555;
    expect(formatter(testNumber)).toBe("365");
    testNumber = 0xa;
    expect(formatter(testNumber)).toBe("10");
    testNumber = Number.NaN;
    expect(formatter(testNumber)).toBe("NaN");
    testNumber = Number.POSITIVE_INFINITY;
    expect(formatter(testNumber)).toBe("Infinity");
    testNumber = Number.NEGATIVE_INFINITY;
    expect(formatter(testNumber)).toBe("-Infinity");

    const noNumber = "Bond";
    expect(formatter(noNumber)).toBe("Bond");
  });

  it("formats booleans", () => {
    const formatter = valueTypeFormatters.Boolean;
    expect(formatter(true)).toBe("true");
    expect(formatter(Boolean(0))).toBe("false");
  });

  it("formats arrays", () => {
    const formatter = valueTypeFormatters.Array;
    const testArray1 = ["one element"];
    expect(formatter(testArray1)).toBe("1 items");
    const testArray2 = [1, 2, 3, 4];
    expect(formatter(testArray2)).toBe("4 items");
    const emptyArray = [] as String[];
    expect(formatter(emptyArray)).toBe("-");

    const noArray = 42;
    expect(formatter(noArray)).toBe("-");
  });

  it("formats objects", () => {
    const formatter = valueTypeFormatters.Object;
    let testObject = {};
    expect(formatter(testObject)).toBe("0 items");
    testObject = { bond: "james" };
    expect(formatter(testObject)).toBe("1 items");
    testObject = {
      bond: "james",
      nested: { villains: ["Goldfinger, Blofeld"] },
    };
    expect(formatter(testObject)).toBe("2 items");

    const noObject = 42;
    expect(formatter(noObject)).toBe("0 items");
  });
});
