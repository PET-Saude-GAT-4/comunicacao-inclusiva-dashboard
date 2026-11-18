# UI

The design tokens, the shared components and when to reach for each, and the rules that keep screens consistent. The interface is in Portuguese; code, comments and these docs are in English.

## Design tokens

Tailwind 4 reads its theme from CSS, not from a JS config: the tokens are declared in the `@theme` block of `src/app/globals.css`, and `tailwind.config.js` is empty. Each token becomes a utility class (`--color-primary` → `bg-primary`, `text-primary`, `border-primary`; `--spacing-md` → `p-md`, `gap-md`…).

**Use the tokens rather than raw values or Tailwind's default palette**, so a change to the theme reaches every screen. A one-off hex or `px` value is a sign that a token is missing.

| Kind | Tokens | Notes |
|---|---|---|
| Colour | `primary`, `primary-dark`, `secondary`, `background`, `surface-primary`, `surface-secondary`, `surface-secondary-dark`, `outline-common` | `primary` (teal) is the brand colour: buttons, the auth background, the active state. `background` is the page; `surface-*` are cards and panels on it. |
| Text colour | `text-on-primary`, `text-on-primary-variant`, `text-on-primary-dark`, `text-on-primary-dark-variant`, `text-on-secondary` | The name says what the text sits on: `text-text-on-primary` is body text on a light surface, `-variant` its muted form. |
| Status | `error-primary`, `error-secondary`, `success`, `success-secondary` | `*-secondary` is the translucent background behind the solid colour (badges, alerts). |
| Spacing | `xs` 4, `sm` 10, `md` 16, `lg` 24, `xl` 32, `xxl` 48 (px) | For padding, margin and gap. |
| Size | `xs` 16 … `xxl` 148 (px) | Icons and fixed boxes. |
| Radius | `xs` 4, `sm` 8, `md` 16, `lg` 24, `xl` 32, `full` | |
| Text size | `small` 9, `body` 14, `body-emph` 16, `heading` 24, `title` 28, `extravagant-title` 36 (px) | `text-body` for most text, `text-title` for page titles. |
| Font | `font-title` (Roboto), `font-body` (Inter) | Loaded with `next/font` in the root layout and wired in through `@theme inline`. |
| Shadow | `small`, `medium`, `large` | |

## Components

Everything under `src/components` is shared across the app. Components used only inside the logged-in area are in `src/app/(authenticated)/components`. Before writing a new piece of UI, check whether one of these already does it: most of them exist because a screen once did it differently and drifted.

### Layout and navigation

| Component | Use it for |
|---|---|
| `Sidebar` | The side panel of the logged-in layout. It is driven by `src/config/navigation.tsx`; add a page there, not here. |
| `Header` | The page title and, for pages in a group, the group's pages as tabs. It is also driven by the navigation map. |
| `PillTabs` | Switching between sections that are parts of one thing (Gerenciamento's sections, a term's pictogram and SignWriting). It takes its pages from the navigation map. |
| `TabButton` | An icon-only toggle in a small set of options. |
| `Modal` | Any dialog. It closes on Escape and on a click outside. |

### Lists

| Component | Use it for |
|---|---|
| `ListToolbar` | The bar above every list page: tabs or an action on the left, the search in the middle, add and remove on the right. It keeps the search centred whatever sits beside it. |
| `SearchBar` | The search field. In one mode it filters a list already loaded; in the other it hands the text to the caller, which searches on the server (the usual case with `usePaginatedList`). |
| `Table` | Tabular lists. Pass `page`/`pageCount`/`onPageChange` when the data is one page from the server; leave out `onSelectionChange` on lists nobody acts on in bulk, and the checkboxes go away. |
| `ListStatus` | What a **card grid** shows instead of its cards: the load error, or the empty state. `Table` shows the same messages itself. |
| `Pagination` | The page bar under a list. It collapses long ranges with an ellipsis. |
| `InfiniteList` | The scrolling list inside a picker, fed by `useRemoteSearch`. It loads the next page as the end comes into view. |
| `Spinner` | Loading. Screen readers announce it once. |

### Pickers

All of them search the server a page at a time (`useRemoteSearch`) and call `onSelect` with the chosen item.

| Component | Picks |
|---|---|
| `AssetPicker` | A pictogram or a SignWriting (both are stored files with a description, so one picker serves both). |
| `TermPicker` | A term. |
| `BoardPicker` | A board. A board that cannot be picked stays listed, greyed out with the reason, instead of being filtered out. |
| `PhrasePicker` | A phrase, with its visibility badge. |

### Content

| Component | Use it for |
|---|---|
| `Thumbnail` | **Every pictogram or SignWriting image.** See the rule below. |
| `AssetCard` (in `(authenticated)/components`) | A card for a pictogram, a SignWriting or a term (a term shows both images side by side). |
| `UserCard` (in `(authenticated)/components`) | A user in the management screens. |
| `PhraseSequenceEditor` | A phrase's terms in order, reorderable by dragging. Without an `onChange` it only displays them, as the library does. |
| `PhraseTermsPreview` | A phrase's first pictograms in a table cell, capped so a long phrase cannot stretch the row. |
| `PhraseVisibilityBadge` | A phrase's visibility (draft, hidden, listed). The wording lives in `src/utils/phrase-visibility.ts`. |
| `Badge` | A short status label (`success`, `secondary`, `neutral`, `warning`). Give it a `title` when the text is cut short. |
| `CopyableUuid` | A shortened uuid that copies the full one on click. |
| `AuthorLabel`, `AuthorEmail` (in `(authenticated)/components`) | An author's email; `AuthorEmail` looks it up by uuid, for boards that come without it. |
| `CreateInteractionChainModal` (in `(authenticated)/components`) | Creating the interaction chains of a board or a phrase. |

### Form controls

| Component | Use it for |
|---|---|
| `Input` | Every text input. It takes an optional `label` and shows `error` under the field, as forms render `state.errors.<field>[0]`. |
| `Dropdown` | Choosing one value from a list. It is styled like `Input` so the two sit together in a form. |
| `Button` | Every text button. `variant` is `primary` (the default), `danger` for destructive actions, or `neutral`. |
| `AddButton`, `RemoveButton` | The icon-only add and remove actions. The `label` is the whole accessible name, so in a list it names the item too. |
| `KebabButton` | A card's or row's menu of actions. |
| `DropdownMenu` | The menu behind `KebabButton` and `Dropdown`. Use it directly only for a new kind of trigger. |

## Rules

### Images go through `Thumbnail`

Pictograms and SignWritings are always rendered with `src/components/Thumbnail/Thumbnail.tsx`, never with `next/image` or `<img>` directly (#59).

Uploaded images come in any proportion. Tailwind's preflight sets `img { height: auto }`, which overrides the height `next/image` writes, so a tall image grows downward and stretches whatever card, row or preview holds it. `Thumbnail` takes the image out of flow inside a fixed white square: only the box decides the size, and `object-contain` fits the whole image inside it. Use `size` for a fixed box, or `fluid` for a square that takes its container's width.

### Text

The interface speaks Portuguese, with the same names as the sidebar (Pranchas, Frases, Pictogramas, SignWriting, Termos, Gerenciamento). User-facing messages, including zod messages, are written in Portuguese where they are defined.

### Accessibility

Icon-only buttons need a label that names their action and, in a list, the item. Text cut short with `truncate` keeps the full text in `title`, and in an `sr-only` span when screen readers would otherwise read the short form (see `AssetCard`'s badge).
