import { describe, expect, it } from "vitest";
import { getColor, isMissingValue, unpackObjectRepresentation } from "..";

describe("index", () => {
  it.each([
    [true, null],
    [true, { metadata: "Message" }],
    [false, undefined],
    [false, true],
    [false, false],
    [false, 0],
    [false, ""],
    [false, "Message"],
    [false, []],
    [false, {}],
    [false, { data: "Message" }],
  ])("isMissingValue returns %s for '%s'", (isMissing, value) => {
    expect(isMissingValue(value)).toBe(isMissing);
  });

  it.each([
    [null, null],
    [undefined, undefined],
    ["foo", "foo"],
    [null, { metadata: "Message" }],
    ["foo", { metadata: "Message", value: "foo" }],
    ["bar", { value: "bar", color: "#abcdef" }],
    [
      { value: "bar", foo: "baz" },
      { value: "bar", foo: "baz" },
    ],
    [undefined, { color: "#abcdef" }],
  ])("unpackObjectRepresentation returns %s for '%s'", (expected, value) => {
    expect(unpackObjectRepresentation(value)).toStrictEqual(expected);
  });

  it.each([
    [null, "foo"],
    [null, { metadata: "Message" }],
    [null, { value: "foo" }],
    ["#abcdef", { value: "bar", color: "#abcdef" }],
    ["#abcdef", { color: "#abcdef" }],
    [null, { color: "#abcdef", foo: "baz" }],
  ])("getColor returns %s for '%s'", (expected, value) => {
    expect(getColor(value)).toStrictEqual(expected);
  });
});
