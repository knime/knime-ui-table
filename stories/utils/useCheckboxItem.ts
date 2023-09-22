import { ref } from "vue";

export default (text: string) => {
  const value = ref(false);
  return {
    text,
    checkbox: {
      checked: value,
      setBoolean: (checked) => {
        value.value = checked;
      },
    },
  };
};
