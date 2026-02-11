# Cell Interaction

There are two mutually exclusive states: **selection** (one or more cells) or an **editable cell**.

## Entering States

- **Click** on a cell -> directly enters editable state
- **Drag** across multiple cells -> enters selection state

## Editable State

| Input                                                            | Behavior                                             |
| ---------------------------------------------------------------- | ---------------------------------------------------- |
| Escape                                                           | Transitions to selection (the cell becomes selected) |
| Enter                                                            | The cell below becomes selected                      |
| Shift+Enter                                                      | Line break within the text                           |
| Tab                                                              | The cell to the right becomes selected               |
| Shift+Tab                                                        | The cell to the left becomes selected                |
| Arrow keys / Copy / Cut / Paste / Character / Delete / Backspace | No special handling. Normal text input interaction.  |

## Selection State

Applies regardless of whether additional cells are also selected.

| Input              | Behavior                                                                        |
| ------------------ | ------------------------------------------------------------------------------- |
| Arrow keys         | Navigate to the next cell in that direction                                     |
| Tab                | Move one cell to the right                                                      |
| Shift+Tab          | Move one cell to the left                                                       |
| Enter              | Enters editable state                                                           |
| Shift+Enter        | No action (MVP)                                                                 |
| Copy / Cut / Paste | Copies/cuts/pastes the selected cells                                           |
| Character          | Cell becomes editable and the existing value is replaced with the new character |
| Delete             | Cell content is deleted. Cell remains selected.                                 |
| Backspace          | Cell content is cleared to empty string and cell becomes editable.              |
