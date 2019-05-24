export const changeUseImages = useImages => ({
  type: 'CHANGE_USE_IMAGES',
  useImages
});

export const changeCompactMode = compactMode => ({
  type: 'CHANGE_COMPACT_MODE',
  compactMode
});

export const changeColumnVisibility = (index, show) => ({
  type: 'CHANGE_COLUMN_VISIBILITY',
  index,
  show
});

export const changeColumnWidth = (index, width) => ({
  type: 'CHANGE_COLUMN_WIDTH',
  index,
  width
});

export const changeTableRowHeight = height => ({
  type: 'CHANGE_TABLE_ROW_HEIGHT',
  height
});

export const changeTableHeaderHeight = height => ({
  type: 'CHANGE_TABLE_HEADER_HEIGHT',
  height
});

export const resetToDefault = () => ({
  type: 'RESET_TO_DEFAULT'
});

export const changeRowFontSize = size => ({
  type: 'CHANGE_ROW_FONT_SIZE',
  size
});

export const changeHotkey = (action, key) => ({
  type: 'CHANGE_HOTKEY',
  action,
  key
})

export const changeCompactModeEnemyButtonsHotkey = (index, key) => ({
  type: 'CHANGE_COMPACT_MODE_ENEMY_BUTTONS_HOTKEY',
  index,
  key
});
