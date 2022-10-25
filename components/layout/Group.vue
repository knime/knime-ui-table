<script>
import OptionsIcon from 'webapps-common/ui/assets/img/icons/menu-options.svg';
import SubMenu from 'webapps-common/ui/components/SubMenu.vue';

/**
 * This component is a wrapper for groups of table rows. It can display a "group" row
 * conditionally if there are multiple groups in the table. This "group" row is styled
 * to provide clear separation between groups in the table and provides a SubMenu for
 * group-level actions.
 *
 * @emits groupSubMenuClick when the "group" SubMenu has an item clicked.
 */
export default {
    components: {
        OptionsIcon,
        SubMenu
    },
    props: {
        title: {
            type: String,
            default: () => 'Group'
        },
        show: {
            type: Boolean,
            default: false
        },
        groupSubMenuItems: {
            type: Array,
            default: () => []
        }
    },
    emits: ['groupSubMenuClick'],
    methods: {
        onSubMenuItemClick(event, clickedItem) {
            this.$emit('groupSubMenuClick', clickedItem);
            event.preventDefault();
            return false;
        }
    }
};
</script>

<template>
  <tbody>
    <tr
      v-if="show"
      class="table-group"
    >
      <td>
        {{ title }}
      </td>
      <td
        v-if="groupSubMenuItems.length"
        button-title="actions"
        class="action"
      >
        <SubMenu
          :items="groupSubMenuItems"
          button-title="actions"
          @item-click="onSubMenuItemClick"
        >
          <OptionsIcon />
        </SubMenu>
      </td>
    </tr>
    <slot />
  </tbody>
</template>

<style lang="postcss" scoped>
tr.table-group {
  font-weight: 500;
  font-size: 13px;
  align-items: center;
  height: 40px;
  padding-left: 35px;
  background-color: var(--knime-gray-ultra-light);
  margin: 0;
  margin-top: -3px;

  & .action {
    align-items: center;
    display: flex;
    overflow: visible;
    margin-left: auto;

    & svg {
      margin: 0 auto;
      width: 25px;
      height: 25px;
      stroke-width: calc(32px / 25);
      stroke: var(--knime-dove-gray);
    }

    & >>> ul {
      margin-top: -10px;
      right: 10px;
    }

    & >>> .submenu-toggle {
      display: flex;
      align-self: stretch;
      align-items: center;
      height: 40px;
      width: 30px;
      border-radius: 0;
      transition: background-color 0.15s;
    }
  }
}
</style>
