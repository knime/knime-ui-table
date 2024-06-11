/* eslint-disable max-lines */
import { describe, it, expect, beforeEach } from "vitest";
import { shallowMount, mount } from "@vue/test-utils";

import Row from "../Row.vue";
import Cell from "../Cell.vue";
import CollapserToggle from "@/components/ui/CollapserToggle.vue";
import SubMenu from "webapps-common/ui/components/SubMenu.vue";
import Checkbox from "webapps-common/ui/components/forms/Checkbox.vue";
import FunctionButton from "webapps-common/ui/components/FunctionButton.vue";
import OptionsIcon from "webapps-common/ui/assets/img/icons/menu-options.svg";
import CloseIcon from "webapps-common/ui/assets/img/icons/close.svg";

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
      global: { stubs: { Cell: { template: stubbedCell } } },
      ...params,
    });

  describe("rendering", () => {
    it('displays empty "tr" element if no data provided', () => {
      wrapper = shallowMount(Row, {
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
      expect(wrapper.vm.paddingTopBottom).toBe(11);
    });

    it("renders table row in compact mode", () => {
      wrapper = shallowMount(Row, {
        props: {
          tableConfig: {},
          columnConfigs: [],
          rowConfig: { compactMode: true },
        },
      });
      expect(wrapper.vm.paddingTopBottom).toBe(5);
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
      wrapper = mount(Row, {
        props: {
          ...props,
          row: ["data1"],
          rowData: { subMenuItemsForRow: customSubMenuItemsForRow },
        },
        global: { stubs: { Cell: { template: stubbedCell } } },
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
      wrapper = mount(Row, {
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
      wrapper = mount(Row, { props });
      expect(wrapper.find(rowDragHandleClass).exists()).toBeFalsy();
    });

    it("displays drag handle for row resizing if enabled", () => {
      wrapper = mount(Row, { props: { ...props, showDragHandle: true } });
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
        wrapper = mount(Row, {
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
        wrapper = mount(Row, {
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
      const wrapper = mount(Row, { props: propsWithColoredRows });
      const firstCell = wrapper.findComponent(Cell);
      expect(firstCell.text()).toBe("Text");
      expect(firstCell.attributes("style")).toContain(
        "--data-cell-color: #123456",
      );
    });

    it("conditionally renders expandable row content", async () => {
      wrapper = mount(Row, {
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
      wrapper = mount(Row, {
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
      wrapper = mount(Row, {
        props,
      });
      let event = new MouseEvent("click");
      let clickEvent = { event, colInd: 1, data: props.row[1] };
      expect(wrapper.findComponent(Row).emitted().rowInput).toBeFalsy();
      wrapper.findAll("td.data-cell").at(1).trigger("click", clickEvent);
      expect(wrapper.findComponent(Row).emitted().rowInput).toBeFalsy();
    });

    it("emits a rowInput event when a there is input in a cell", () => {
      wrapper = mount(Row, {
        props,
      });
      expect(wrapper.findComponent(Row).emitted().rowInput).toBeFalsy();
      wrapper.findAll("td.data-cell").at(0).trigger("input", 0);
      expect(wrapper.findComponent(Row).emitted().rowInput).toBeTruthy();
    });

    it("toggles the expandable content when the collapser toggle is clicked and emits rowExpand", async () => {
      props.tableConfig.showCollapser = true;
      wrapper = shallowMountRow();
      expect(wrapper.vm.showContent).toBeFalsy();
      wrapper.findComponent(CollapserToggle).vm.$emit("collapserExpand");
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.showContent).toBe(true);
      expect(wrapper.findComponent(CloseIcon).exists()).toBeFalsy();
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted().rowExpand).toBeTruthy();
      expect(wrapper.emitted().rowExpand[0][0]).toBe(false);
      expect(wrapper.emitted().rowExpand[1][0]).toBe(true);
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
        const wrapper = mount(Row, {
          props,
        });
        const colInd = 2;
        wrapper
          .findAll("td.data-cell")
          .at(colInd)
          .trigger("pointerdown", { button: 0 });
        expect(
          wrapper.findComponent(Row).emitted().cellSelect[0],
        ).toStrictEqual([colInd]);
      });

      it("does not emits a cellSelect event when a cell is clicked with a non-left button", () => {
        const wrapper = mount(Row, {
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
        const wrapper = mount(Row, {
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
        const wrapper = mount(Row, {
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
        expect(wrapper.find(".row").attributes("style")).contains(
          "height: 999px",
        );
      });
    });
  });
});
