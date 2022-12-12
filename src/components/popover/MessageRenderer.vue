<script>
import PopoverPageControls from './PopoverPageControls.vue';
import ErrorIcon from 'webapps-common/ui/assets/img/icons/sign-warning.svg';
import WarnIcon from 'webapps-common/ui/assets/img/icons/circle-info.svg';

import { capitalize } from 'webapps-common/util/capitalize';

/**
 * This popover rendering component is used to display message content when provided
 * with the correctly formatted data. The component uses page controls to allow users
 * to switch between messages in a collection and provides a nicely formatted title
 * and message section with icons and styles for both "warning" and "error" messages.
 */
export default {
    components: {
        PopoverPageControls,
        ErrorIcon,
        WarnIcon
    },
    props: {
        data: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            currentItemNumber: 0
        };
    },
    computed: {
        itemTitle() {
            return this.data[this.currentItemNumber]?.itemTitle || 'Item';
        },
        messageTitle() {
            return this.data[this.currentItemNumber]?.messageTitle || 'Message';
        },
        messageType() {
            return capitalize((this.data[this.currentItemNumber]?.type || 'ERROR').toLowerCase());
        },
        item() {
            return this.data[this.currentItemNumber]?.item || 'Missing item.';
        },
        message() {
            return this.data[this.currentItemNumber]?.message || 'No message found.';
        },
        formattedData() {
            return this.data.filter(item => typeof item !== 'undefined' && item !== null);
        },
        numberItems() {
            return this.formattedData?.length;
        },
        currentItem() {
            return this.formattedData[this.currentItemNumber];
        }
    },
    methods: {
        onPageChange(change) {
            let nextItem = this.currentItemNumber + change;
            if (nextItem >= this.numberItems) {
                nextItem = 0;
            } else if (nextItem < 0) {
                nextItem = this.numberItems - 1;
            }
            this.currentItemNumber = nextItem;
        }
    }
};
</script>

<template>
  <div
    v-if="formattedData.length"
    class="wrapper"
  >
    <div class="content">
      <header :class="messageType.toLowerCase()">
        <WarnIcon v-if="messageType === 'Warning'" />
        <ErrorIcon v-else />
        {{ messageType }}
      </header>
      <label>{{ itemTitle }}</label>
      <br>
      {{ item }}
      <br>
      <label>{{ messageTitle }}</label>
      <br>
      {{ message }}
    </div>
    <PopoverPageControls
      :total-pages="numberItems"
      :current-page="currentItemNumber"
      class="controls"
      @next-page="onPageChange(1)"
      @prev-page="onPageChange(-1)"
    />
  </div>
</template>

<style lang="postcss" scoped>
.wrapper {
  position: relative;
  line-height: normal;
  max-height: 280px;

  & .content {
    max-height: 230px;
    overflow-y: auto;
    overflow-x: hidden;
    white-space: normal;
    text-overflow: ellipsis;
    line-height: 20px;

    & header {
      font-size: 16px;
      font-weight: 700;
      padding: 0;
      line-height: 16px;
      display: flex;
      margin-bottom: 10px;

      & svg {
        height: 14px;
        width: 14px;
        margin-right: 5px;
        stroke-width: calc(32px / 14);
      }

      &.error {
        color: var(--theme-color-error);

        & svg {
          stroke: var(--theme-color-error);
        }
      }
    }

    & label {
      padding: 10px 0;
      font-size: 13px;
      font-weight: 400;
      line-height: 26px;
    }
  }

  & .controls {
    margin-bottom: -15px;
    margin-top: 10px;
  }
}
</style>
