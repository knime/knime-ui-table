import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import MessageRenderer from "../MessageRenderer.vue";
import PopoverPageControls from "../PopoverPageControls.vue";
import ErrorIcon from "@knime/styles/img/icons/sign-warning.svg";
import WarnIcon from "@knime/styles/img/icons/circle-info.svg";

const testMessages = [
  {
    itemTitle: "Node",
    messageTitle: "Node Message",
    item: "0:1:2:3",
    message: "An error occurred",
    type: "ERROR",
  },
  {
    itemTitle: "Node",
    messageTitle: "Node Message",
    item: "4:5:6:7",
    message: "Some warning",
    type: "WARNING",
  },
];

describe("MessageRenderer.vue", () => {
  let wrapper;

  it("renders message data", () => {
    wrapper = shallowMount(MessageRenderer, {
      props: {
        data: testMessages,
      },
    });

    expect(wrapper.findComponent(MessageRenderer).exists()).toBe(true);
    expect(wrapper.findComponent(PopoverPageControls).exists()).toBe(true);
    expect(wrapper.findComponent(ErrorIcon).exists()).toBe(true);
  });

  it("renders defaults for missing message data", () => {
    wrapper = shallowMount(MessageRenderer, {
      props: {
        data: [{}],
      },
    });
    let messageContent = wrapper.find(".content").text();
    expect(messageContent).toContain("Item");
    expect(messageContent).toContain("Missing item.");
    expect(messageContent).toContain("Message");
    expect(messageContent).toContain("No message found.");
    expect(wrapper.findComponent(ErrorIcon).exists()).toBe(true);
  });

  it("renders ERROR message data", () => {
    wrapper = shallowMount(MessageRenderer, {
      props: {
        data: [testMessages[0]],
      },
    });

    expect(wrapper.findComponent(ErrorIcon).exists()).toBe(true);
    expect(wrapper.find(".error").text()).toContain("Error");
    expect(wrapper.find(".content").text()).toContain("An error occurred");
  });

  it("renders WARN message data", () => {
    wrapper = shallowMount(MessageRenderer, {
      props: {
        data: [testMessages[1]],
      },
    });

    expect(wrapper.findComponent(WarnIcon).exists()).toBe(true);
    expect(wrapper.find(".warning").text()).toContain("Warning");
    expect(wrapper.find(".content").text()).toContain("Some warning");
  });

  it("reacts to page events by updating the content of the page", async () => {
    wrapper = shallowMount(MessageRenderer, {
      props: {
        data: testMessages,
      },
    });

    expect(wrapper.findComponent(MessageRenderer).exists()).toBe(true);
    expect(wrapper.findComponent(PopoverPageControls).exists()).toBe(true);
    expect(wrapper.find(".content").text()).toContain("An error occurred");
    expect(wrapper.find(".content").text()).not.toContain("Some warning");
    wrapper.findComponent(PopoverPageControls).vm.$emit("nextPage");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".content").text()).not.toContain("An error occurred");
    expect(wrapper.find(".content").text()).toContain("Some warning");
    wrapper.findComponent(PopoverPageControls).vm.$emit("prevPage");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".content").text()).toContain("An error occurred");
    expect(wrapper.find(".content").text()).not.toContain("Some warning");
  });

  it("does not render if no messages", () => {
    wrapper = shallowMount(MessageRenderer, {
      props: {
        data: [],
      },
    });

    expect(wrapper.findComponent(MessageRenderer).exists()).toBe(true);
    expect(wrapper.find("div").exists()).toBe(false);
  });

  it("does not render if data is missing", () => {
    wrapper = shallowMount(MessageRenderer);

    expect(wrapper.findComponent(MessageRenderer).exists()).toBe(true);
    expect(wrapper.find("div").exists()).toBe(false);
  });
});
