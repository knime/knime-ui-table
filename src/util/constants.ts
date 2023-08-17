/* eslint-disable no-unused-vars */

// the min-width of cells in the header and rows
export const MIN_COLUMN_SIZE = 50;

// the max-width of cells in the header and rows when using fit content column sizing
export const MAX_AUTO_COLUMN_SIZE = 960;

// the width of special (collapser, selection, filter) columns in the header and rows
export const SPECIAL_COLUMNS_SIZE = 30;

// the default height of a row
export const DEFAULT_ROW_HEIGHT = 40;

// the compact height of a row
export const COMPACT_ROW_HEIGHT = 24;

// the margin / border width of any given row
export const ROW_MARGIN_BOTTOM = 1;

// the height of the table header and group headers
export const HEADER_HEIGHT = DEFAULT_ROW_HEIGHT;

// the maximum width of the submenu in the header
export const MAX_SUB_MENU_WIDTH = 160;

// after resizing rows, scroll is temporarily disabled until the resize is complete to prevent jumps
export const ENABLE_SCROLL_AFTER_ROW_RESIZE_DELAY = 100;

// the width of the column resize drag handle
export const COLUMN_RESIZE_DRAG_HANDLE_WIDTH = 5;

export default { MIN_COLUMN_SIZE, SPECIAL_COLUMNS_SIZE };
