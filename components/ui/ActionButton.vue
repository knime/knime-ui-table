<script>
import Button from 'webapps-common/ui/components/Button.vue';

/**
 * Button displayed at the bottom of the table instead of page size controls.
 * Can trigger an action which should be relevant on a table-wide level (such
 * as redirecting to a details page).
 *
 * @callback actionCallback triggers the global action on click.
 */
export default {
    components: {
        Button
    },
    props: {
        config: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            height: 40
        };
    },
    methods: {
        onClick(e) {
            consola.debug('Table action triggered.');
            this.config.callback();
        }
    }
};
</script>

<template>
  <tr>
    <td class="action-">
      <Button
        with-border
        @click="onClick"
      >
        {{ config.text }}
      </Button>
    </td>
  </tr>
</template>

<style lang="postcss" scoped>

tr {
  display: flex;
  flex-direction: row-reverse;
  padding-top: 10px;

  & td {
    margin-top: 10px;

    & >>> button.button.with-border {
      height: 20px;
      font-size: 13px;
      line-height: 0;
    }
  }
}
</style>
