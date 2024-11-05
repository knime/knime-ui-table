import { VueWrapper, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import TableBodyNavigatable from "../TableBodyNavigatable.vue";

describe("TableBodyNavigatable", () => {
  describe("keyboard events", () => {
    let wrapper: VueWrapper;

    beforeEach(() => {
      wrapper = mount(TableBodyNavigatable, { attachTo: document.body });
    });

    it.each([
      ["ArrowDown", false, [0, 1, false]],
      ["ArrowUp", false, [0, -1, false]],
      ["ArrowLeft", false, [-1, 0, false]],
      ["ArrowRight", false, [1, 0, false]],
      ["ArrowDown", true, [0, 1, true]],
      ["ArrowUp", true, [0, -1, true]],
      ["ArrowLeft", true, [-1, 0, true]],
      ["ArrowRight", true, [1, 0, true]],
    ])(
      "emits moveSelection on %s without meta/ctrl key and respects use of shift key (here: %s)",
      async (key, shiftKey, result) => {
        await wrapper.find("tbody").trigger("keydown", { key, shiftKey });
        expect(wrapper.emitted().moveSelection).toBeTruthy();
        expect(wrapper.emitted().moveSelection[0]).toStrictEqual(result);
      },
    );

    it.each([["ArrowDown"], ["ArrowUp"], ["ArrowLeft"], ["ArrowRight"]])(
      "does not emit moveSelection on %s when meta/ctrl key being pressed",
      async (key) => {
        await wrapper.find("tbody").trigger("keydown", { key, ctrlKey: true });
        expect(wrapper.emitted().moveSelection).toBeFalsy();
      },
    );

    it.each([["Enter"], [" "]])(
      "emits expandSelectedCell on '%s'",
      async (key) => {
        await wrapper.find("tbody").trigger("keydown", { key });
        expect(wrapper.emitted().expandSelectedCell).toBeTruthy();
      },
    );

    it("emits clearSelection when the Tab key is pressed", async () => {
      await wrapper.find("tbody").trigger("keydown", { key: "Tab" });
      expect(wrapper.emitted().clearSelection).toBeTruthy();
    });
  });
});
