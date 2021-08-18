<script>
import InputField from '~/webapps-common/ui/components/forms/InputField';
import Label from 'webapps-common/ui/components/forms/Label';

export default {
    components: {
        Label,
        InputField
    },
    props: {
        node: {
            required: true,
            type: Object
        }
    },
    data() {
        return {
            value: 'Hello'
        };
    },
    computed: {
        label() {
            return `Lazy loaded external UI Component for node id: ${this.node.id}`;
        }
    },
    methods: {
    }
};
</script>

<template>
  <Label
    class="label"
    :text="label"
  >
    <InputField
      ref="form"
      v-model="value"
    />
  </Label>
</template>

<style lang="postcss" scoped>
.label {
  max-width: 100%;

  & >>> textarea,
  & >>> label {
    cursor: pointer;
    max-width: 100%;
  }
}
</style>
