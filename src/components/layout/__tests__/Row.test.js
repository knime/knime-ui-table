/* eslint-disable max-lines */
import { beforeEach, describe, expect, it } from "vitest";
import { ref } from "vue";
import { mount, shallowMount } from "@vue/test-utils";

import { Checkbox, FunctionButton, SubMenu } from "@knime/components";
import CloseIcon from "@knime/styles/img/icons/close.svg";
import OptionsIcon from "@knime/styles/img/icons/menu-options.svg";

import { injectionKey as useDataValueViewsInjectionKey } from "@/components/composables/useDataValueViews";
import CollapserToggle from "@/components/ui/CollapserToggle.vue";
import { injectionKey as useCloseSubMenusOnScrollInjectionKey } from "../../composables/useCloseSubMenusOnScroll";
import Cell from "../Cell.vue";
import Row from "../Row.vue";
import ExpandIcon from "../expand.svg";

describe("Row.vue", () => {
  let wrapper;

  let f = (item) => item;
  let props;

  beforeEach(() => {
    props = {
      row: ["data1", "data2", "data3", "data4", "data5"],
      tableConfig: {
        showPopovers: true,
        showSelection: true,
        showCollapser: false,
        subMenuItems: [{ id: "action", text: "Action" }],
      },
      columnConfigs: [],
    };
    props.row.forEach((data, i) =>
      props.columnConfigs.push({
        key: `col${i.toString()}`,
        formatter: f,
        classGenerator: [],
        size: 20,
        hasSlotContent: false,
        popoverRenderer: false,
      }),
    );
  });

  let updateProps = (colProp, values) => {
    props.columnConfigs.forEach((colConfig, colInd) => {
      colConfig.formatter = f;
      colConfig[colProp] = values[colInd];
    });
  };
  const rowDragHandleClass = ".row-drag-handle";

  const stubbedCell = `<div :width="100">
        <slot 
            :width="100"
        />
    </div>`;

  const shallowMountRow = (params = {}) =>
    shallowMount(Row, {
      props,
      global: {
        stubs: { Cell: { template: stubbedCell } },
        provide: {
          [useCloseSubMenusOnScrollInjectionKey]: {
            registerExpandedSubMenu: () => {},
          },
        },
      },
      ...params,
    });

  const mountRow = (params = {}) =>
    mount(Row, {
      props,
      global: {
        provide: {
          [useCloseSubMenusOnScrollInjectionKey]: {
            registerExpandedSubMenu: () => {},
          },
          [useDataValueViewsInjectionKey]: {
            isShown: ref(false),
            close: () => {},
          },
        },
      },
      ...params,
    });

  describe("rendering", () => {
    it('displays empty "tr" element if no data provided', () => {
      wrapper = shallowMountRow({
        props: { tableConfig: {}, columnConfigs: [] },
      });

      expect(wrapper.findComponent(Row).exists()).toBeTruthy();
      expect(wrapper.findComponent(CollapserToggle).exists()).toBeFalsy();
      expect(wrapper.findComponent(SubMenu).exists()).toBeFalsy();
      expect(wrapper.findComponent(Checkbox).exists()).toBeFalsy();
      expect(wrapper.findComponent(FunctionButton).exists()).toBeFalsy();
      expect(wrapper.findComponent(OptionsIcon).exists()).toBeFalsy();
      expect(wrapper.find("td.data-cell").exists()).toBeFalsy();
      expect(wrapper.find("tr td").text()).toBe("-");
    });

    it("renders default table row", () => {
      wrapper = shallowMountRow();
      expect(wrapper.findComponent(Row).exists()).toBeTruthy();
      expect(wrapper.findComponent(CollapserToggle).exists()).toBeFalsy();
      expect(wrapper.findComponent(SubMenu).exists()).toBeTruthy();
      expect(wrapper.findComponent(Checkbox).exists()).toBeTruthy();
      expect(wrapper.findComponent(FunctionButton).exists()).toBeFalsy();
      expect(wrapper.findComponent(OptionsIcon).exists()).toBeTruthy();
      expect(wrapper.findComponent(Cell).exists()).toBeTruthy();
      expect(wrapper.vm.cells).toHaveProperty(0, expect.any(Object));
      expect(wrapper.vm.cells).toHaveProperty(4, expect.any(Object));
      expect(wrapper.vm.paddingTopBottom).toBe(12);
      expect(wrapper.vm.transition).toStrictEqual({
        transition: "height 0.3s, box-shadow 0.15s",
      });
    });

    it("renders table row in compact mode", () => {
      wrapper = shallowMountRow({
        props: {
          tableConfig: {},
          columnConfigs: [],
          rowConfig: { compactMode: true },
        },
      });
      expect(wrapper.vm.paddingTopBottom).toBe(4);
    });

    it("shows the collapser toggle via prop", () => {
      props.tableConfig.showCollapser = true;
      wrapper = shallowMountRow();

      expect(wrapper.findComponent(Row).exists()).toBeTruthy();
      expect(wrapper.findComponent(CollapserToggle).exists()).toBeTruthy();
    });

    it("hides the checkbox via prop", () => {
      props.tableConfig.showSelection = false;
      wrapper = shallowMountRow();

      expect(wrapper.findComponent(Row).exists()).toBeTruthy();
      expect(wrapper.findComponent(Checkbox).exists()).toBeFalsy();
    });

    it("disables the checkbox via prop", () => {
      props.tableConfig.disableSelection = true;
      wrapper = shallowMountRow();

      expect(wrapper.findComponent(Row).exists()).toBeTruthy();
      expect(
        wrapper.findComponent(Checkbox).attributes().disabled,
      ).toBeTruthy();
    });

    it("disables the height transition via prop", () => {
      props.disableRowHeightTransition = true;
      wrapper = shallowMountRow();

      expect(wrapper.findComponent(Row).exists()).toBeTruthy();
      expect(wrapper.vm.transition).toStrictEqual({
        transition: "box-shadow 0.15s",
      });
    });

    it("hides the submenu if no items are provided", () => {
      props.tableConfig.subMenuItems = [];

      wrapper = shallowMountRow();

      expect(wrapper.findComponent(Row).exists()).toBeTruthy();
      expect(wrapper.findComponent(SubMenu).exists()).toBeFalsy();
    });

    it("shows custom submenuitems for a row", () => {
      const customSubMenuItemsForRow = [
        {
          name: "custom menu item name",
          text: "bla",
        },
      ];
      wrapper = mountRow({
        props: {
          ...props,
          row: ["data1"],
          rowData: { subMenuItemsForRow: customSubMenuItemsForRow },
        },
      });

      expect(wrapper.findComponent(Row).exists()).toBeTruthy();
      expect(wrapper.findComponent(SubMenu).exists()).toBeTruthy();
      expect(wrapper.findComponent(SubMenu).props("items")).toEqual(
        customSubMenuItemsForRow,
      );
    });

    it("selectively generates slots for specific columns", () => {
      updateProps("hasSlotContent", [false, false, true, false, false]);
      wrapper = shallowMountRow({
        slots: {
          "cellContent-col2": "<iframe> Custom content </iframe>",
        },
      });

      expect(wrapper.findComponent(Row).exists()).toBeTruthy();
      expect(wrapper.findAllComponents(Cell)[2].element.innerHTML).toBe(
        "<iframe> Custom content </iframe>",
      );
    });

    it("provides column data to the slotted column", () => {
      updateProps("hasSlotContent", [false, false, true, false, false]);
      wrapper = mountRow({
        props,
        slots: {
          "cellContent-col2": (props) => `${JSON.stringify(props)}`,
        },
      });

      expect(wrapper.findComponent(Row).exists()).toBeTruthy();
      const text = wrapper.findAllComponents(Cell)[2].text();
      expect(text).toContain('"cell":"data3"');
      expect(text).toContain('"row":["data1","data2","data3","data4","data5"]');
      expect(text).toContain('"width":10');
      expect(text).toContain('"height":40');
    });

    it("does not display drag handle for row resizing per default", () => {
      wrapper = mountRow({ props });
      expect(wrapper.find(rowDragHandleClass).exists()).toBeFalsy();
    });

    it("displays drag handle for row resizing if enabled", () => {
      wrapper = mountRow({ props: { ...props, showDragHandle: true } });
      expect(wrapper.find(rowDragHandleClass).exists()).toBeTruthy();
    });

    describe("formatters", () => {
      it("uses formatters for rendering", () => {
        updateProps("formatter", [
          (val) => val.toUpperCase(),
          (val) => val.val,
          (val) => typeof val,
          (val) => val || "-",
          (val) => val % 33,
        ]);
        wrapper = mountRow({
          props: {
            ...props,
            row: ["val", { val: "val" }, [null], false, 100],
          },
        });
        let cells = wrapper.findAllComponents(Cell);
        expect(cells[0].text()).toBe("VAL");
        expect(cells[1].text()).toBe("val");
        expect(cells[2].text()).toBe("object");
        expect(cells[3].text()).toBe("-");
        expect(cells[4].text()).toBe("1");
      });

      it("unpacks and formats values with object representation", () => {
        updateProps("formatter", [
          (val) => val.toUpperCase(),
          (val) => val.val,
          (val) => typeof val,
          (val) => val || "-",
          (val) => val % 33,
        ]);
        wrapper = mountRow({
          props: {
            ...props,
            row: [
              { value: "val" },
              { value: { val: "val" } },
              { color: "#123456" },
              false,
              100,
            ],
          },
        });
        let cells = wrapper.findAllComponents(Cell);
        expect(cells[0].text()).toBe("VAL");
        expect(cells[1].text()).toBe("val");
        expect(cells[2].text()).toBe("undefined");
        expect(cells[3].text()).toBe("-");
        expect(cells[4].text()).toBe("1");
      });
    });

    it("provides color to the cells", () => {
      const propsWithColoredRows = {
        ...props,
        row: [{ value: "Text", color: "#123456" }, ...props.row.slice(1)],
      };
      const wrapper = mountRow({ props: propsWithColoredRows });
      const firstCell = wrapper.findComponent(Cell);
      expect(firstCell.text()).toBe("Text");
      expect(firstCell.attributes("style")).toContain(
        "--data-cell-color: #123456",
      );
    });

    it("conditionally renders expandable row content", async () => {
      wrapper = mountRow({
        props: {
          ...props,
          tableConfig: {
            ...props.tableConfig,
            showCollapser: true,
          },
        },
      });
      expect(wrapper.find(".expandable-content").exists()).toBeFalsy();
      wrapper.vm.showContent = true;
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".expandable-content").exists()).toBeTruthy();
    });
  });

  describe("events", () => {
    it("emits a rowSelect event when the checkbox is clicked", () => {
      wrapper = shallowMountRow();

      expect(wrapper.findComponent(Row).emitted().rowSelect).toBeFalsy();
      wrapper.findComponent(Checkbox).vm.$emit("update:modelValue", true);
      expect(wrapper.findComponent(Row).emitted().rowSelect).toBeTruthy();
      expect(wrapper.findComponent(Row).emitted().rowSelect[0][0]).toBeTruthy();
    });

    it("emits a rowInput event when a cell is clicked if popover column", () => {
      updateProps("popoverRenderer", [true, false, false, false, false]);
      wrapper = mountRow({
        props,
      });
      let event = new MouseEvent("click");
      let clickEvent = { event, colInd: 0, data: props.row[0] };
      expect(wrapper.findComponent(Row).emitted().rowInput).toBeFalsy();
      wrapper.findAll("td.data-cell").at(0).trigger("click", clickEvent);
      expect(wrapper.findComponent(Row).emitted().rowInput).toBeTruthy();
      expect(wrapper.findComponent(Row).emitted().rowInput[0][0]).toStrictEqual(
        {
          ...clickEvent,
          event: expect.anything(),
          cell: wrapper.findComponent(Cell).element,
          type: "click",
          value: null,
        },
      );
    });

    it("does not emit a rowInput event when a cell is clicked if not popover column", () => {
      wrapper = mountRow({
        props,
      });
      let event = new MouseEvent("click");
      let clickEvent = { event, colInd: 1, data: props.row[1] };
      expect(wrapper.findComponent(Row).emitted().rowInput).toBeFalsy();
      wrapper.findAll("td.data-cell").at(1).trigger("click", clickEvent);
      expect(wrapper.findComponent(Row).emitted().rowInput).toBeFalsy();
    });

    it("emits a rowInput event when a there is input in a cell", () => {
      wrapper = mountRow({
        props,
      });
      expect(wrapper.findComponent(Row).emitted().rowInput).toBeFalsy();
      wrapper.findAll("td.data-cell").at(0).trigger("input", 0);
      expect(wrapper.findComponent(Row).emitted().rowInput).toBeTruthy();
    });

    it("toggles the expandable content when the collapser toggle is clicked", async () => {
      props.tableConfig.showCollapser = true;
      wrapper = shallowMountRow();
      expect(wrapper.vm.showContent).toBeFalsy();
      wrapper.findComponent(CollapserToggle).vm.$emit("collapserExpand");
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.showContent).toBe(true);
      expect(wrapper.findComponent(CloseIcon).exists()).toBeFalsy();
    });

    it("emits a rowSubMenuClick event when the submenu is clicked", () => {
      wrapper = shallowMountRow();
      expect(wrapper.emitted().rowSubMenuClick).toBeFalsy();
      wrapper
        .findComponent(SubMenu)
        .vm.$emit(
          "item-click",
          new MouseEvent("click"),
          props.tableConfig.subMenuItems[0],
        );
      expect(wrapper.emitted().rowSubMenuClick).toBeTruthy();
      expect(wrapper.emitted().rowSubMenuClick[0][0]).toBe(
        props.tableConfig.subMenuItems[0],
      );
    });

    describe("cell selection", () => {
      it("emits a cellSelect event when a cell is clicked", () => {
        const wrapper = mountRow({
          props,
        });
        const colInd = 2;
        wrapper
          .findAll("td.data-cell")
          .at(colInd)
          .trigger("pointerdown", { button: 0 });
        expect(
          wrapper.findComponent(Row).emitted().cellSelect[0],
        ).toStrictEqual([colInd, false]);
      });

      it("does not emits a cellSelect event when a cell is clicked with a non-left button", () => {
        const wrapper = mountRow({
          props,
        });
        const colInd = 2;
        wrapper
          .findAll("td.data-cell")
          .at(colInd)
          .trigger("pointerdown", { button: 1 });
        expect(wrapper.findComponent(Row).emitted().cellSelect).toBeFalsy();
      });

      it("emits a expandCellSelect event when a cell is clicked with shift pressed", () => {
        const wrapper = mountRow({
          props,
        });
        const colInd = 2;
        wrapper
          .findAll("td.data-cell")
          .at(colInd)
          .trigger("pointerdown", { shiftKey: true, button: 0 });
        expect(
          wrapper.findComponent(Row).emitted().expandCellSelect[0],
        ).toStrictEqual([colInd]);
      });

      it("passes selectOnMove down to the Cell", async () => {
        const wrapper = mountRow({
          props,
        });

        await wrapper.setProps({ selectCellsOnMove: true });

        expect(wrapper.findComponent(Cell).props().selectOnMove).toBeTruthy();
      });
    });

    describe("row resize", () => {
      let wrapper;

      beforeEach(() => {
        props.showDragHandle = true;
        wrapper = shallowMountRow();
      });

      it("sets rowHeightOnDragStart and activeDrag on pointer down on drag handle", async () => {
        const rowDragHandle = wrapper.find(rowDragHandleClass);
        rowDragHandle.element.setPointerCapture = (_pointerId) => null;
        wrapper.find(rowDragHandleClass).trigger("pointerdown");
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.activeDrag).toBeTruthy();
        expect(wrapper.vm.rowHeightOnDragStart).toBeDefined();
      });

      it("emits resizeRow event on drag handle move", () => {
        const rowDragHandle = wrapper.find(rowDragHandleClass);
        rowDragHandle.element.setPointerCapture = (_pointerId) => null;

        rowDragHandle.trigger("pointermove");
        expect(wrapper.emitted().resizeRow).toBeFalsy();
        rowDragHandle.trigger("pointerdown");
        expect(wrapper.vm.activeDrag).toBeTruthy();
        rowDragHandle.trigger("pointermove");
        expect(wrapper.emitted().resizeRow).toBeTruthy();
      });

      it("emits resizeAllRows on pointer up on drag handle", () => {
        const rowDragHandle = wrapper.find(rowDragHandleClass);
        rowDragHandle.element.setPointerCapture = (_pointerId) => null;

        // no resize event if there was no active drag
        rowDragHandle.trigger("pointerup");
        expect(wrapper.emitted().resizeAllRows).toBeFalsy();

        // resize event if there was active drag
        rowDragHandle.trigger("pointerdown");
        rowDragHandle.trigger("pointerup");
        expect(wrapper.emitted().resizeAllRows).toBeTruthy();
      });

      it("stops resizing if pointer is lost during drag", () => {
        const rowDragHandle = wrapper.findAll(rowDragHandleClass).at(0);
        rowDragHandle.element.setPointerCapture = (_pointerId) => null;

        rowDragHandle.trigger("pointerdown", 0);
        expect(wrapper.vm.activeDrag).toBeTruthy();
        rowDragHandle.trigger("lostpointercapture");
        expect(wrapper.vm.activeDrag).toBeFalsy();
      });

      it("watches for row height changes from outside", async () => {
        wrapper.setProps({ rowHeight: 999 });
        await wrapper.vm.$nextTick();
        expect(wrapper.find("tr").attributes("style")).contains(
          "height: 999px",
        );
      });
    });
  });

  describe("data value views", () => {
    it("does not enable data value views when globally disabled", () => {
      props.tableConfig.enableDataValueViews = false;
      props.columnConfigs[0].hasDataValueView = true;
      wrapper = mountRow({ props });
      expect(
        wrapper.findComponent(Cell).props("enableDataValueView"),
      ).toBeFalsy();
    });

    it("enables data value views depending on the column", () => {
      props.tableConfig.enableDataValueViews = true;
      props.columnConfigs[0].hasDataValueView = true;
      props.columnConfigs[1].hasDataValueView = false;
      wrapper = mountRow({ props });
      expect(
        wrapper.findAllComponents(Cell)[0].props("hasDataValueView"),
      ).toBeTruthy();
      expect(
        wrapper.findAllComponents(Cell)[1].props("hasDataValueView"),
      ).toBeFalsy();
    });

    it("selects the cell on double click if data value views are enabled", () => {
      props.tableConfig.enableDataValueViews = true;
      const colInd = 2;
      props.columnConfigs[colInd].hasDataValueView = true;

      wrapper = mountRow({ props });

      wrapper.findAll("td.data-cell").at(colInd).trigger("dblclick");

      expect(wrapper.emitted().cellSelect[0]).toStrictEqual([colInd, true]);
    });

    it("selects the cell on expand button click if data value views are enabled", () => {
      props.tableConfig.enableDataValueViews = true;
      const colInd = 2;
      props.columnConfigs[colInd].hasDataValueView = true;

      wrapper = mountRow({ props });

      wrapper
        .findAll("td.data-cell")
        .at(colInd)
        .findComponent(ExpandIcon)
        .trigger("click");

      expect(wrapper.emitted().cellSelect[0]).toStrictEqual([colInd, true]);
    });
  });
});
