import { vi } from "vitest";
import { config } from "@vue/test-utils";
import consola from "consola";

window.consola = consola;

// see https://test-utils.vuejs.org/migration/#shallowmount-and-renderstubdefaultslot
config.global.renderStubDefaultSlot = true;

vi.mock("raf-throttle", () => ({
  default(func) {
    return function (...args) {
      // eslint-disable-next-line no-invalid-this
      return func.apply(this, args);
    };
  },
}));
