import { describe, expect, it } from "vitest";
import { shallowMount } from "@vue/test-utils";

import TextDimensionAndRange from "../TextDimensionAndRange.vue";

describe("TextDimensionAndRange.vue", () => {
  let wrapper;

  it("has no data and shows correct information", async () => {
    wrapper = shallowMount(TextDimensionAndRange, {
      props: {
        totalItems: 0,
        currentItems: 0,
        pageSize: 25,
        currentPage: 1,
        columnCount: 4,
        showTableSize: true,
        pageRangeStart: 1,
        pageRangeEnd: 25,
      },
    });
    expect(wrapper.text()).toContain("No data").toContain("Columns: 4");
    await wrapper.setProps({ columnCount: 0 });
    expect(wrapper.text()).toBe("No data");
    await wrapper.setProps({ showTableSize: false });
    expect(wrapper.text()).toBe("");
  });

  it("has multiple pages", async () => {
    wrapper = shallowMount(TextDimensionAndRange, {
      props: {
        totalItems: 100,
        currentItems: 100,
        pageSize: 25,
        currentPage: 1,
        columnCount: 4,
        showTableSize: true,
        pageRangeStart: 1,
        pageRangeEnd: 25,
      },
    });
    expect(wrapper.text())
      .toContain("Rows: 1-25 of 100")
      .toContain("Columns: 4");
    await wrapper.setProps({ currentItems: 0 });
    expect(wrapper.text())
      .toContain("No data (100 hidden)")
      .toContain("Columns: 4");
    await wrapper.setProps({ currentItems: 50 });
    expect(wrapper.text())
      .toContain("Rows: 1-25 of 50")
      .toContain("(100 total)")
      .toContain("Columns: 4");
    await wrapper.setProps({ showTableSize: false });
    expect(wrapper.text()).toBe("Rows: 1-25 of 50");
    await wrapper.setProps({
      currentPage: 2,
      pageRangeStart: 26,
      pageRangeEnd: 50,
    });
    expect(wrapper.text()).toBe("Rows: 26-50 of 50");
  });

  it("has single page", async () => {
    wrapper = shallowMount(TextDimensionAndRange, {
      props: {
        totalItems: 100,
        currentItems: 10,
        pageSize: 25,
        currentPage: 1,
        columnCount: 4,
        showTableSize: true,
        pageRangeStart: 1,
        pageRangeEnd: 25,
      },
    });
    expect(wrapper.text()).toContain("Rows: 10").toContain("Columns: 4");
    await wrapper.setProps({ currentItems: 0 });
    expect(wrapper.text())
      .toContain("No data (100 hidden)")
      .toContain("Columns: 4");
    await wrapper.setProps({ showTableSize: false });
    expect(wrapper.text()).toBe("");
  });

  it("only shows 'Count: ...'", async () => {
    wrapper = shallowMount(TextDimensionAndRange, {
      props: {
        totalItems: 16,
        currentItems: 16,
        pageSize: 25,
        currentPage: 1,
        columnCount: 4,
        showTableSize: true,
        pageRangeStart: 1,
        pageRangeEnd: 25,
        rowLabel: "Count",
      },
    });
    expect(wrapper.text()).toContain("Count: 16");
    await wrapper.setProps({ currentItems: 0 });
    expect(wrapper.text()).toContain("No data (16 hidden)");
    await wrapper.setProps({ showTableSize: false });
    expect(wrapper.text()).toBe("");
  });
});
