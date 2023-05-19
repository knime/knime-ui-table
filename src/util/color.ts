/* eslint-disable no-magic-numbers */
const getBrightness = (hexColor: string) => {
    hexColor = hexColor.replace('#', '');

    // Parse the hexadecimal color value to RGB components
    const red = parseInt(hexColor.substring(0, 2), 16);
    const green = parseInt(hexColor.substring(2, 4), 16);
    const blue = parseInt(hexColor.substring(4, 6), 16);

    // see https://www.w3.org/TR/AERT/#color-contrast
    const redBrightness = 0.299;
    const greenBrightness = 0.587;
    const blueBrightness = 0.144;
    const maxBrightness = 255;
    return (redBrightness * red + greenBrightness * green + blueBrightness * blue) / maxBrightness;
};

export const isBright = (hexColor: string) => getBrightness(hexColor) > 0.5;
