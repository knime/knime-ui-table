<script>
/**
 * An input field component specifically styled for use in the table. By emitting
 * a blur event, this component can be programmatically hidden when not in use.
 *
 * @emits input event when the input value changes.
 * @emits blur event when focus leaves the input field.
 */
export default {
  props: {
    modelValue: {
      default: "",
      type: [Number, String],
    },
    placeholder: {
      default: null,
      type: String,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
  },
  emits: ["update:modelValue", "blur"],
  methods: {
    getValue() {
      return this.$refs.input.value;
    },
    onInput() {
      this.$emit("update:modelValue", this.getValue());
    },
    onBlur(e) {
      this.$emit("blur", e);
    },
    focus() {
      this.$refs.input.focus();
    },
  },
};
</script>

<template>
  <div>
    <input
      ref="input"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      type="text"
      @input="onInput"
      @keydown.esc="onBlur"
    />
  </div>
</template>

<style lang="postcss" scoped>
div {
  /* icon and marker need pos 0,0 to be the wrapper */
  position: relative;
}

input {
  font-size: 13px;
  font-weight: 400;
  height: 27px;
  line-height: normal;
  padding: 0 10px;
  border-radius: 0;
  width: 100%;
  border: 1px solid var(--knime-stone-gray);
  outline: none;
  background-color: var(--knime-white);

  &::placeholder {
    color: var(--knime-stone-gray);
  }

  &:disabled {
    color: var(--knime-dove-gray);
    opacity: 0.5;
  }

  &:focus {
    border-color: var(--knime-masala);
  }

  &:hover:not(:focus, :disabled) {
    background-color: var(--knime-silver-sand-semi);
  }
}

svg {
  width: 12px;
  height: 12px;
  stroke-width: calc(32px / 12);
  stroke: var(--knime-masala);
  position: absolute;
  right: 7px;
  top: 9px;
  pointer-events: none; /* otherwise :hover of the field doesn't work when hovering the icon */
}
</style>
