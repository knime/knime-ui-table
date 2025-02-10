import { describe, expect, it } from "vitest";
import { shallowMount } from "@vue/test-utils";

import { SubMenu } from "@knime/components";
import OptionsIcon from "@knime/styles/img/icons/menu-options.svg";

import { injectionKey as useCloseSubMenusOnScrollInjectionKey } from "../../composables/useCloseSubMenusOnScroll";
import Group from "../Group.vue";

describe("Group.vue", () => {
  let wrapper;

  const shallowMountGroup = ({ props, slots }) =>
    shallowMount(Group, {
      props,
      slots,
      global: {
        provide: {
          [useCloseSubMenusOnScrollInjectionKey]: {
            registerExpandedSubMenu: () => {},
          },
        },
      },
    });

  it("renders a table group", () => {
    wrapper = shallowMountGroup({
      props: {
        title: "Group 1",
        show: true,
        groupSubMenuItems: [
          {
            text: "test",
          },
        ],
      },
    });

    expect(wrapper.findComponent(Group).exists()).toBe(true);
    expect(wrapper.find(".table-group").exists()).toBe(true);
    expect(wrapper.findComponent(SubMenu).exists()).toBe(true);
    expect(wrapper.findComponent(OptionsIcon).exists()).toBe(true);
    expect(wrapper.find("td").text()).toContain("Group 1");
  });

  it("shows slotted content", () => {
    wrapper = shallowMountGroup({
      props: {
        title: "Group 1",
        show: true,
        groupSubMenuItems: [
          {
            text: "test",
          },
        ],
      },
      slots: {
        default: '<tr class="data">Some Data</tr>',
      },
    });

    expect(wrapper.findComponent(Group).exists()).toBe(true);
    expect(wrapper.find(".table-group").exists()).toBe(true);
    expect(wrapper.findComponent(SubMenu).exists()).toBe(true);
    expect(wrapper.findComponent(OptionsIcon).exists()).toBe(true);
    expect(wrapper.find("td").text()).toContain("Group 1");
    expect(wrapper.find(".data").text()).toContain("Some Data");
  });

  it("hides group but shows slotted content", () => {
    wrapper = shallowMountGroup({
      props: {
        title: "Group 1",
        show: false,
        groupSubMenuItems: [
          {
            text: "test",
          },
        ],
      },
      slots: {
        default: '<tr class="data">Some Data</tr>',
      },
    });

    expect(wrapper.findComponent(Group).exists()).toBe(true);
    expect(wrapper.find(".table-group").exists()).toBe(false);
    expect(wrapper.findComponent(SubMenu).exists()).toBe(false);
    expect(wrapper.findComponent(OptionsIcon).exists()).toBe(false);
    expect(wrapper.find(".data").text()).toContain("Some Data");
  });

  it("hides group submenu if no items", () => {
    wrapper = shallowMountGroup({
      props: {
        title: "Group 1",
        show: true,
        groupSubMenuItems: [],
      },
      slots: {
        default: '<tr class="data">Some Data</tr>',
      },
    });

    expect(wrapper.findComponent(Group).exists()).toBe(true);
    expect(wrapper.find(".table-group").exists()).toBe(true);
    expect(wrapper.findComponent(SubMenu).exists()).toBe(false);
    expect(wrapper.findComponent(OptionsIcon).exists()).toBe(false);
    expect(wrapper.find("td").text()).toContain("Group 1");
    expect(wrapper.find(".data").text()).toContain("Some Data");
  });

  it("emits a groupSubMenuClick event when the submenu is clicked", () => {
    let groupSubMenuItems = [
      {
        text: "test",
      },
    ];
    wrapper = shallowMountGroup({
      props: {
        title: "Group 1",
        show: true,
        groupSubMenuItems,
      },
      slots: {
        default: '<tr class="data">Some Data</tr>',
      },
    });
    expect(wrapper.findComponent(Group).exists()).toBe(true);
    expect(wrapper.find(".table-group").exists()).toBe(true);
    expect(wrapper.findComponent(SubMenu).exists()).toBe(true);
    expect(wrapper.emitted().groupSubMenuClick).toBeFalsy();
    wrapper
      .findComponent(SubMenu)
      .vm.$emit("item-click", new MouseEvent("click"), groupSubMenuItems[0]);
    expect(wrapper.emitted().groupSubMenuClick).toBeTruthy();
    expect(wrapper.emitted().groupSubMenuClick[0][0]).toBe(
      groupSubMenuItems[0],
    );
  });
});
