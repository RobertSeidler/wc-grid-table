# wc-grid-table

[codepen](https://codepen.io/ropp90/pen/zYOybYM)

## Description

wc-grid-table (short: wgt) is a Free and Open-Source, CSS-Grid, Table WebComponent. The goal of this WebComponent is high customizability and a low barrier to entry.
It uses no required dependencies (`lodash.debounce` as optional plugin) and is only around 30kB (unzipped, minified) in size.

Current version: **3.1.13**

## Features

* Sortable columns, including stable multi-column sort (later columns keep their order when an earlier column is reversed)
* Locale-aware number sorting and comparison filters (`0,16` and `0.16` are both treated as decimals)
* Per-column filters (contains / not-contains regex, equals, greater, less, …)
* Filters run on the **raw values**; formatters only change what is displayed
* Pagination, column chooser (modal) and a footer that stays put while cells scroll
* Optional URL rewrite so filter, sort, pagination and hidden columns survive a reload
* Optional `debug` logging

## Installation

Install via npm:

```bash
npm install wc-grid-table
```

Use via CDN:

```html
<script src="https://unpkg.com/wc-grid-table@3.1.13/dist/standalone/bundle.min.js"></script>
```

## Build from Source

First install all dev-dependencies:

```bash
npm install
```

wgt uses Browserify as bundler. To build the component and the examples:

```bash
npm run build:all
```

Useful scripts:

| Script | Purpose |
| --- | --- |
| `npm test` | Jest tests |
| `npm run serve` | Serve `dist/` and open the standalone example |
| `npm run build:all` | Create `dist/` folders if needed, then build all bundles |

## Usage

### Getting Started

Include it in your page:

```html
<body>
  ...
  <script src="https://unpkg.com/wc-grid-table@3.1.13/dist/standalone/bundle.min.js"></script>
</body>
```

Afterwards register the custom element. Use the provided `defineCustomElement()` function to register it as `wc-grid-table`, or call `customElements.define` with a custom name:

```javascript
WcGridTable.defineCustomElement();

// or

customElements.define('your-fancy-name', WcGridTable.TableComponent);
```

The name has to include at least one hyphen.
After creating a wgt element the only thing needed is to add data:

```javascript
let data = [
  {
    firstname: "Hans",
    lastname: "Dieter",
    age: 28,
    hobby: "running"
  },{
    firstname: "Karl",
    lastname: "Heinrich",
    age: 52
  },{
    firstname: "Manfred",
    lastname: "Steibl",
    age: 60
  }
]

let table = document.createElement('wc-grid-table');
table.setData(data);

document.querySelector('body').append(table);
```

Formatters can wrap values for display (for example as links) without changing filter or sort:

```javascript
table.formatter.Artikelnummer = [
  (value) => value != undefined
    ? `<a href="/article/${value}">${value}</a>`
    : ''
];
```

### Customization

#### Methods

The following functions are exposed on the wgt element (documented in their respective docstring):

* `useDefaultOptions()`
* `connectedCallback()`
* `setDebounceFn(debounceFn, sortDebounceOptions, filterDebouncedOptions)`
* `setData(data)`
* `getDisplayedData()`
* `getOriginalData()`
* `redrawData()`
* `redrawTable()`
* `registerPlugin(plugin)`

#### Properties

The following properties can be accessed / set directly on the wgt element:

* `root_document` — either `document` or the connected shadowRoot
* `conditionalColumnStyle` — an object with keys [`condition`, `styles`] where `condition` is a function `(data: Array<Object>, column: string) => Boolean` and `styles` is an Array of CSS strings applied when `condition` returns true for a column
* `conditionalRowStyle` — like column styles, but per row / cell
* `conditionalStyleOptions` — `{ active: Boolean }`
* `formatter` — an Object with column names as keys, containing lists of formatter functions applied before displaying a value. Signature: `(value, rowIndex, completeData) => any`. Formatters run left to right. They do **not** change the values used for filter and sort
* `formatterOptions` — `{ active: Boolean }`
* `filter` — an Object with column names as keys, containing the filter input strings
* `filterOptions` — `{ active: Boolean }`
* `filterOperations` — list of `{ name, char, fn(filterInput, testValue) }`. Default operations: contains / not-contains (regex), equals, greater, greater-or-equal, less, less-or-equal, not-equal. Cycle them with the symbol next to each filter input
* `sortedBy` — Array of `{ col, dir }` (`dir` is `"asc"` or `"desc"`). Sorting is stacked, so primary, secondary, tertiary, … sorting is possible
* `sortOptions` — `{ active: Boolean }`
* `customChooseSortsCompareFn` — maps a column to a compare function. Signature: `(table, data, column) => CompareFn`
* `customCompareNumbers` / `customCompareText` — replacements for the default number / text compare functions (`Array.prototype.sort` style)
* `pagination` — `{ active, currentPage, pageSize }` (default page size is 40)
* `hiddenColumns` / `visibleColumns` / `hiddenColumnsCondition` — control which columns are shown. The footer **columns** button opens a modal to toggle them

#### Attributes

* `noheader` — hide header row
* `nofilter` — hide filter row
* `nofooter` — hide footer
* `nopagekey` — do not bind left/right keys for pagination
* `norewriteurl` — do not write table state into the URL
* `debug` — verbose `console.log` output (sort, filter, format, plugins)
* `page-size` — initial page size, e.g. `page-size="25"`
* `height` — max-height of the table container, e.g. `height="80vh"`
* `options` — serialized initial options (same shape as the URL state)

```html
<wc-grid-table height="80vh" page-size="25" debug></wc-grid-table>
```

## License

ISC. See [LICENSE](LICENSE).
