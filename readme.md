# wc-grid-table

## Description

wc-grid-table (short: wgt) is a Free and Open-Source, CSS-Grid, Table WebComponent. The goal of this WebComponent is high customizability and a low barrier to entry. 
It uses no dependencys (lodash.debounce as optional plugin) and is only around 7kB (unzipped, minified) in size.

## Installation

TODO: publish on npm

## Build from Source

First install all dev-dependecies:
```bash
npm install
```

wgt uses Browserify as bundler. In order to build the Component and all the examples you can run:

```bash
npm run build_all
```

## Usage

### Getting Started

Include it in your page:

```html
<body>
  ...
  <script src="dist/standalone/bundle.js"></script>
</body>
```

Afterwards the customElement should be registered. You can use the provided `defineCustomElement()` function, to register the component with the name `wc-grid-table` or call customElement yourself with a custom name:

```javascript
WcGridTable.defineCustomElement();

// or

customElements.define('your-fancy-name', TableComponent);
```

The name has to (or should?!) include atleast one hyphen.
After creating a wgt element the only thing needed is to add data:

```javascript
// any sort of data
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
table.setData(data)

document.querySelector('body').append(table);
```

### Customization

The following functions are exposed on the wgt element (documented in there respective docstring):
* useDefaultOptions()
* connectedCallback()
* setDebounceFn(debounceFn, sortDebounceOptions, filterDebouncedOptions)
* setData(data)
* getDisplayedData()
* getOriginalData()
* redrawData()

The following properties can be accessed / set directly on wgt element:
* root_document - either document or the connected shadowRoot
* conditionalColumnStyle - an object with keys [`condition`, `styles`] where condition is a function `(data : Array<Object> , column : string) => Boolean` and styles is
  an Array of strings with styles, that should apply when `condition` returns true for a column.
  Can be used to style a column in dependency of their data. 
* conditionalColumnOptions - an object with options concerning conditionalColumnStyle. Available Options:
  * active: Boolean
* formatter - an Object with column names as keys, containing lists of formatter functions, that should be applied before displaing a table value. Formatter functions
  have this signature: `(value, rowIndex, completeData) => any`. Formatter get applied in the sequence they are in the list (leftmost function (2nd from left (3rd ...))).
* formatterOptions - an object with options concerning formatter. Available Options:
  * active: Boolean
* filter - an Object with column names as keys, containing strings which correspond to the filter input values in the ui. 
  Those get validated by customFilterFunction / regexFilter.
* filterOptions - an object with options concerning filter. Available Options:
  * active: Boolean
* customFilterFunction - a function that can override default filter behaviour (regexFilter). Arguments are filter input values and value to test against as strings.
  The expected return is a filtered data Array.
* sortedBy - an Array of Objects describing sorting. Keys are col - column name sorted - and dir - the sort direction (one of [`asc`, `desc`]). Sorting is kept after each
  sorting operation, so that primary, secondary, tertiary, ... sorting is possible.
* sortOptions - an object with options concerning sorting. Available Options:
  * active: Boolean
* customChooseSortsCompareFn - a function maps columns to sorting behavior. Expected return for given (table: TableComponent instance, data: Array<Object>, column: string)
  is a function to compare the values of this column.
* customCompareNumbers / customCompareText - functions to replace default sort behavior corresponing to sorting numbers / text. Like default js CompareFn used in Array.prototype.sort

More to come.

## License

Copyright 2019 Robert Seidler

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
