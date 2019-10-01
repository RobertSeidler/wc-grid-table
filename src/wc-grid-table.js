/**
 * Project: wc-grid-table
 * Repository: https://github.com/RobertSeidler/wc-grid-table
 * Auther: Robert Seidler
 * Email: Robert.Seidler1@googlemail.com 
 * License: ISC
 */

require('./wc-grid-table.css');

const {regexFilter, textFilter, compareFilter} = require('./filter_utils.js');

module.exports = (function(){
  // Closure, so that only functions I want to expose are getting exposed.

  /**
   * Compare function for comparing numbers for sorting. Additionally undefined values are 
   * always the 'smaller' value, so that they get sorted to the bottom.
   * Can be replaced by supplying a custom compare function to TableComponent.customCompareNumbers.
   * 
   * @param {number} a number to compare. 
   * @param {number} b number to compare.
   */
  function compareNumbers(a, b){
    if (a == undefined) return 1;
    if (b == undefined) return -1;
    return a - b;
  }
  
  /**
   * Compare function for comparing strings for sorting. Additionally undefined values are
   * always the 'smaller' value, so that they get sorted to the bottom. 
   * Can be replaced by supplying a custom compare function to TableComponent.customCompareText.
   * 
   * @param {string} a text to compare.
   * @param {string} b text to compare.
   */
  function compareText(a, b){
    let result = 0;
    if (a == undefined) return 1;
    if (b == undefined) return -1;
    if (a.toString() > b.toString()) result = -1;
    if (a.toString() < b.toString()) result = 1;
    return result;
  }
  
  /**
   * Map different compare functions, depending on the content of this column. Default is a distinction between numbers and text.
   * The chooseSortCompareFn as well as the compareNumbers and compareText functions can be replaced by custom ones.
   * chooseSortCompareFn -> TableComponent.customChooseSortsCompareFn
   * 
   * @param {TableComponent} table the active instance of TableComponent.
   * @param {Array<Object>} data 
   * @param {string} column the column name (header) for which a compare function is to choose. 
   */
  function chooseSortsCompareFn(table, data, column){
    if(!Number.isNaN(data.reduce((col, cur) => (col += cur[column] != undefined ? Number.parseFloat(cur[column]) : 0), 0))){
      return table.customCompareNumbers
    } else {
      return table.customCompareText
    }
  }
  
  /**
   * Register the TableComponent to the customElementRegistry, so that it can be used as a WebComponent.
   * 
   * @param {class} TableComponent 
   */
  function defineCustomElement(){
    customElements.define('wc-grid-table', TableComponent);
  }

  function onSortClick(table, column, event){
    if(table.sortedBy.length > 0){
      if(table.sortedBy[0].col === column){
        table.sortedBy[0].dir = table.sortedBy[0].dir === "asc" ? "desc" : "asc";
        table.sortArrowElements[column].innerHTML = table.sortedBy[0].dir === "asc" ? "&uarr;" : "&darr;";
        // table.sortedData = [].concat(table.sortedData.filter(entry => entry[column] != undefined).reverse(), table.sortedData.filter(entry => entry[column] == undefined));
        // table.redrawData();
        // return;
      } else {
        table.header.filter(header_key => header_key !== column).forEach(header_key => {
          if(table.sortArrowElements[header_key].innerHTML !== '&#8693;') {
            table.sortArrowElements[header_key].arrowAlphaColor = table.sortArrowElements[header_key].arrowAlphaColor * 0.5;
            table.sortArrowElements[header_key].style.color = `rgb(0, 0, 0, ${table.sortArrowElements[header_key].arrowAlphaColor})`;
          }
        })
        table.sortedBy.unshift({
          col: column,
          dir: "asc"
        })
      }
      table.sortArrowElements[column].innerHTML = table.sortedBy[0].dir === "asc" ? "&uarr;" : "&darr;";
      table.sortArrowElements[column].arrowAlphaColor = 1;
      table.sortArrowElements[column].style.color = `rgb(0, 0, 0, ${table.sortArrowElements[column].arrowAlphaColor})`;
    } else {
      table.sortedBy.push({
        col: column,
        dir: "asc"
      });
      table.sortArrowElements[column].innerHTML = "&uarr;";
      table.sortArrowElements[column].arrowAlphaColor = 1;
      table.sortArrowElements[column].style.color = `rgb(0, 0, 0, ${table.sortArrowElements[column].arrowAlphaColor})`;
    }
    table.redrawData()
  }

  function filterChanged(table, column, event){
    table.filter[column] = event.srcElement.textContent;
    table.redrawData();
  }

  /**
   * table.filterNegate[column] === undefined shall be equal to 'contains'.
   * @param {*} table 
   * @param {*} column 
   * @param {*} filter_negate_element 
   * @param {*} event 
   */
  function toggleFilterNegator(table, column, filter_negate_element, event){
    let newOperation = table.activeFilterOperations[column];
    if(newOperation === undefined) newOperation = table.filterOperations[0];
    newOperation = table.filterOperations[(table.filterOperations.findIndex(element => element.name === newOperation.name) + 1) % table.filterOperations.length]
    filter_negate_element.innerHTML = newOperation.char;
    table.activeFilterOperations[column] = newOperation;
    table.redrawData();
  }

  function setUpSorting(element, column, table){
    element.addEventListener('click', (event) => onSortClick(table, column, event))
  }

  function createHeader(table){
    let col_height = 0;
    table.header.forEach( (column, columnIndex) => {
      let col_header = document.createElement('div');
      col_header.classList.add('wgt-header')
      col_header.classList.add(`wgt-column_${column}`)
      col_header.classList.add('wgt-cell')
      // setUpSorting(col_header, column, table)
      col_header.innerHTML = column;
      table.append(col_header)
      col_height = col_header.clientHeight;

      let sort_arrow = document.createElement('div');
      sort_arrow.classList.add('arrow');
      sort_arrow.innerHTML = '&#8693;';
      table.sortArrowElements[column] = sort_arrow;
      setUpSorting(sort_arrow, column, table)
      col_header.append(sort_arrow)

    });
    createStickyFilterStyle(table, col_height);
  }

  function createStickyFilterStyle(table, col_height){
    let tmp_style = table.root_document.querySelector('style.sticky_filter_offset')
    if(!tmp_style){
      tmp_style = document.createElement('style');
      tmp_style.type = "text/css";
      tmp_style.classList.add('sticky_filter_offset');
    }
    tmp_style.innerHTML = `
      .wgt-filter_cell {
        top: ${col_height + 1}px;
      }
    `;    
    table.root_document.querySelector('head').append(tmp_style);
  }

  function createFilter(table, header, filter){
    header.forEach(column => {
      let filter_container = document.createElement('div');
      // let filter_input = document.createElement('input');
      // filter_input.type = 'text';
      // filter_input.classList.add('wgt-filter_input');
      // filter_input.value = filter[column] ? filter[column] : '';
      // filter_container.addEventListener('input', event => filterChanged.bind(null, table, column)(event))
      filter_container.classList.add('wgt-filter_cell', `wgt-filter_cell_${column}`, 'wgt-filter_input');
      // filter_container.contentEditable = 'true';

      let filter_input = document.createElement('div')
      filter_input.addEventListener('input', event => filterChanged.bind(null, table, column)(event));
      filter_input.classList.add('filter_input');
      filter_input.contentEditable = 'true';

      let filter_negate = document.createElement('div');
      filter_negate.innerHTML = '&sube;';
      filter_negate.classList.add('filter_negator');
      filter_negate.addEventListener('click', event => toggleFilterNegator.bind(null, table, column, filter_negate)(event))
      // filter_negate.style.position = 'absolute';
      // filter_negate.style.
      // filter_container.append(filter_input);
      filter_container.append(filter_input);
      filter_container.append(filter_negate);
      table.append(filter_container);
    })
  }

  function createFooter(table, data){
    let footer = document.createElement('div');
    footer.classList.add('wgt-footer')
    footer.style.gridColumn = `1 / ${table.header.length + 1}`

    let total_rows = document.createElement('div');
    total_rows.innerHTML = `Total: ${table.data.length}`;
    total_rows.classList.add('wgt-footer_cell', 'wgt-cell')
    footer.append(total_rows)

    if(table.data.length !== data.length){
      let filtered_row_count = document.createElement('div');
      filtered_row_count.innerHTML = `Filtered: ${data.length}`;
      filtered_row_count.classList.add('wgt-footer_cell', 'wgt-cell')
      footer.append(filtered_row_count)
    }

    table.append(footer)
  }

  function fillData(table, data){
    data.forEach((row, rowIndex) => {
      table.header.forEach( (column, columnIndex) => {
        let cell = document.createElement('div');
        cell.classList.add('wgt-cell', 'wgt-data_cell', `wgt-column_${column}`, `wgt-row_${rowIndex}`, `wgt-zebra_${rowIndex % 2}`)
        // cell.classList.add()
        // cell.classList.add()
        cell.innerHTML = row[column] != undefined ? row[column] : '';
        table.append(cell)
      })
    })
  }

  /**
   * Read the column names (header) from the data, if they are not supplyed. 
   * 
   * @param {Array<Object>} data 
   * @returns {Array<string>} the list of column names.
   */
  function generateHeader(data){
    return data.map(Object.keys).reduce((col, cur) => {
      let result = col;
      cur.forEach(value => {
        if(!col.includes(value)) result.push(value)
      })
      return result;
    }, [])
  }

  function applyConditionalColumnStyling(table, data, header, conditionalColumnStyle, options){
    if(options.active){
      let column_style_element = table.root_document.querySelector('style.column_styles');
      if(!column_style_element){
        column_style_element = document.createElement('style');
        column_style_element.type = "text/css";
        column_style_element.classList.add('column_styles');
        table.root_document.querySelector('head').append(column_style_element);
      }
      column_style_element.innerHTML = '';
      header.forEach(column => {
        conditionalColumnStyle.forEach((conditionalStyle) => {
          if(conditionalStyle.condition(data, column)){
            column_style_element.innerHTML += `
              div.wgt-column_${column}.wgt-data_cell {
                ${conditionalStyle.styles.join('\n')}
              }
            `
          }
        })
      })
    }
  }

  function applyConditionalRowStyling(table, data, header, conditionalRowStyle, options){
    if(options.active){
      let row_style_element = table.root_document.querySelector('style.row_styles');
      if(!row_style_element){
        row_style_element = document.createElement('style');
        row_style_element.type = "text/css";
        row_style_element.classList.add('row_styles');
        table.root_document.querySelector('head').append(row_style_element);
      }
      row_style_element.innerHTML = '';
      Object.keys(conditionalRowStyle).forEach(column => {
        data.forEach((row, row_index) => {
          conditionalRowStyle[column].forEach(conditionalStyle => {
            if(conditionalStyle.condition(row[column], row_index)){
              row_style_element.innerHTML += `div${conditionalStyle.fullrow ? '' : `.wgt-column_${column}`}.wgt-row_${row_index} {\n`
              row_style_element.innerHTML += conditionalStyle.styles.join('\n')
              row_style_element.innerHTML += '\n}'
            }
          })
        }) 
      })
      // table.root_document.querySelector('head').append(row_style_element)
    }
  }

  function applySorting(table, column){
    // if(column) {
    //   return table.sortedData.sort((a, b) => {
    //     return table.customChooseSortsCompareFn(table, table.sortedData, column)(a[column], b[column])
    //   })
    // } else 
    if(table.sortedBy && table.sortedBy.length > 0) {
      column = table.sortedBy[0].col;
      let sorted = table.data.sort((a, b) => {
        return table.customChooseSortsCompareFn(table, table.data, column)(a[column], b[column])
      })
      if(table.sortedBy[0].dir === 'desc')
        sorted = [].concat(sorted.filter(entry => entry[column] != undefined).reverse(), sorted.filter(entry => entry[column] == undefined));
      return sorted;
    } else {
      return table.data;
    }
  }

  function applyFilter(table, data, header, filter, options){
    if(options.active){
      return data.filter(row => 
        header.map(column => {
          if(filter[column]){
            if (!table.activeFilterOperations[column]) table.activeFilterOperations[column] = table.filterOperations[0];
            return table.activeFilterOperations[column].fn(filter[column], row[column]);
          }
          else return true;
        }).reduce((col, cur) => (col && cur), true)
      )
    } else {
      return data;
    }
  }

  function applyFormatter(data, header, formatter, options){
    if(options.active){
      return data.map((row, rowNr, dataReadOnly) => {
        let formattedRow = {}; 
        header.forEach(column => {
          if(formatter[column]){
            formattedRow[column] = formatter[column].reduce((col, cur) => cur(col, rowNr, dataReadOnly), row[column])//.toString();
          } else {
            formattedRow[column] = row[column]
          }
        })
        return formattedRow;
      }) 
    } else {
      return data;
    }
  }

  function drawTable(table){
    table.drawOptionals = {
      header: !table.hasAttribute('noheader'),
      filter: !table.hasAttribute('nofilter'),
      footer: !table.hasAttribute('nofooter')
    }
    
    table.innerHTML = "";      
    if(!table.sortedData) table.sortedData = table.data;

    if(!table.header && table.data){
      table.header = generateHeader(table.data);
    }

    if(table.header){
      table.style.gridTemplateColumns = `repeat(${table.header.length}, max-content)`;
    }

    if(table.drawOptionals.header && table.header){
      createHeader(table);
    }
    
    if(table.drawOptionals.filter && table.header){
      createFilter(table, table.header, table.filter);
    }

    if (table.data){
      table.displayedData = drawData(table);
      if (table.drawOptionals.footer) createFooter(table, table.displayedData);
    }
  }

  function drawData(table){
    table.sortedData = applySorting(table);
    applyConditionalColumnStyling(table, table.sortedData, table.header, table.conditionalColumnStyle, table.conditionalStyleOptions);
    let formattedData = applyFormatter(table.sortedData, table.header, table.formatter, table.formatterOptions);
    let filteredData = applyFilter(table, formattedData, table.header, table.filter, table.filterOptions);
    table.style.gridTemplateRows = `${
      table.drawOptionals.header ? 'max-content' : ''} ${
        table.drawOptionals.filter ? 'max-content' : ''} repeat(${filteredData.length}, max-content) ${
          table.drawOptionals.footer ? 'max-content' : ''}`; 
    fillData(table, filteredData);
    applyConditionalRowStyling(table, filteredData, table.header, table.conditionalRowStyle, table.conditionalStyleOptions);
    return filteredData;
  }

  function defineHiddenProperties(table, props){
    props.forEach(prop => Object.defineProperty(table, prop, {
      enumerable: false,
      writable: true    
    }))
  }

  function defineOptionProperties(table, props){
    props.forEach(prop => 
      Object.defineProperty(table, prop, {
        set(newValue){
          table.options[prop] = newValue;
          if(table.header) table.redrawData();
        },
        get(){
          return table.options[prop];
        },
        enumerable: true
      })
    );
  }

  const funRegex = /^(?<function>(?:function\s*.*){0,1}\((?<args>[^\(\{\[\=\>]*)\)\s*(?:=>|\{)\s*[\{\(]{0,1}.*[\}\)]{0,1})$/gys;

  function deserializeFunction(funStr){
    let match = funRegex.exec(funStr);
    let args = match.groups.args.split(',').map(str => str.trim())
    return new Function(...args, `return (${funStr.toString()})(${args.join(', ')})`)
  }

  function serializeFunction(fun){
    return fun.toString();
  }

  /**
   * TableComponent is the implementation of wc-grid-table (short: wgt).
   * 
   * The following functions are exposed when creating a wgt HTML element (documented in there respective docstring):
   *  - useDefaultOptions()
   *  - connectedCallback()
   *  - setDebounceFn(debounceFn, sortDebounceOptions, filterDebouncedOptions)
   *  - setData(data)
   *  - getDisplayedData()
   *  - getOriginalData()
   *  - redrawData()
   * 
   * The following properties can be accessed directly:
   *  - root_document - either document or the connected shadowRoot
   *  - conditionalColumnStyle - an object with keys ["condition", "styles"] where condition is a function "(data : Array<Object> , column : string) => Boolean" and styles is
   *    an Array of strings with styles, that should apply when "condition" returns true for a column.
   *    Can be used to style a column in dependency of their data. 
   *  - conditionalStyleOptions - an object with options concerning conditionalColumnStyle and conditionalRowStyle. Available Options:
   *      - active: Boolean
   *  - formatter - an Object with column names as keys, containing lists of formatter functions, that should be applied before displaing a table value. Formatter functions
   *    have this signature: "(value, rowIndex, completeData) => any". Formatter get applied in the sequence they are in the list (leftmost function (2nd from left (3rd ...))).
   *  - formatterOptions - an object with options concerning formatter. Available Options:
   *      - active: Boolean
   *  - filter - an Object with column names as keys, containing strings which correspond to the filter input values in the ui. 
   *    Those get validated by filterOperations.fn.
   *  - filterOptions - an object with options concerning filter. Available Options:
   *      - active: Boolean
   *  - filterOperations - an object with operations, filters and chars for different filter options toggleable. `{Column1: {name: 'modFilter', char: '%', fn: function(filterInput, testValue)}}`
   *  - sortedBy - an Array of Objects describing sorting. Keys are col - column name sorted - and dir - the sort direction (one of ["asc", "desc"]). Sorting is kept after each
   *    sorting operation, so that primary, secondary, tertiary, ... sorting is possible.
   *  - sortOptions - an object with options concerning sorting. Available Options:
   *      - active: Boolean
   *  - customChooseSortsCompareFn - a function maps columns to sorting behavior. Expected return for given (table: TableComponent instance, data: Array<Object>, column: string)
   *    is a function to compare the values of this column.
   *  - customCompareNumbers / customCompareText - functions to replace default sort behavior corresponing to sorting numbers / text. Like default js CompareFn used in Array.prototype.sort
   */
  class TableComponent extends HTMLElement{
    constructor(){
      super();

      defineHiddenProperties(this, [
        'options',
        'root_document',
        'optionalDebounceFn',
        'sortedData',
        'data',
        'header',
        'displayedData',
        'drawOptionals',
        'sortArrowElements',
      ]);

      this.options = {}

      defineOptionProperties(this, [
        'conditionalColumnStyle',
        'conditionalRowStyle',
        'conditionalStyleOptions',
        'formatter',
        'formatterOptions',
        'filter',
        'filterOptions',
        'filterOperations',
        'activeFilterOperations',
        'sortedBy',
        'sortOptions',
        'customCompareNumbers',
        'customCompareText',
        'customChooseSortsCompareFn',
      ])

      this.useDefaultOptions();
    }

    /**
     * Reset Options to the default configuration.
     */
    useDefaultOptions(){
      this.root_document = document;

      this.sortArrowElements = {};
      this.optionalDebounceFn = undefined;
      this.activeFilterOperations = {};

      this.filterOperations = [
        {name: 'containsEx', char: '&sube;', fn: regexFilter.bind(null, false)}, 
        {name: 'notContainsEx', char: '&#8840;', fn: regexFilter.bind(null, true)}, 
        {name: 'equals', char: '=', fn: compareFilter.bind(null, (a, b) => a == b)}, 
        {name: 'greater', char: '>', fn: compareFilter.bind(null, (a, b) => a < b)}, 
        {name: 'greaterEquals', char: '&ge;', fn: compareFilter.bind(null, (a, b) => a <= b)}, 
        {name: 'lesser', char: '<', fn: compareFilter.bind(null, (a, b) => a > b)}, 
        {name: 'lesserEquals', char: '&le;', fn: compareFilter.bind(null, (a, b) => a >= b)}, 
        {name: 'unEquals', char: '&ne;', fn: compareFilter.bind(null, (a, b) => a != b)}, 
      ]

      this.conditionalColumnStyle = [
        {
          condition: (data, column) => (!Number.isNaN(data.reduce((col, cur) => (col += typeof cur[column] === "string" ? NaN : (cur[column] != undefined ? cur[column] : 0)), 0))),
          styles: ["text-align: right;"]
        },
      ]

      this.conditionalRowStyle = {
        Rabattsatz: [
          {
            condition: function(value, index){
              return value == 0 && index % 2 != 0;
            },
            styles: ["background-color: lightcoral;", "color: black;"],
            fullrow: true
          }, {
            condition: function(value, index){
              return value == 0 && index % 2 == 0;
            },
            styles: ["background-color: darksalmon;", "color: black;"],
            fullrow: true
          }, {
            condition: function(value, index){
              return value > 0 && index % 2 != 0;
            },
            styles: ["background-color: lightgreen;", "color: black;"],
            fullrow: true
          }, {
            condition: function(value, index){
              return value > 0 && index % 2 == 0;
            },
            styles: ["background-color: darkseagreen;", "color: black;"],
            fullrow: true
          }
        ]
      }

      this.conditionalStyleOptions = {
        "active": true,
      }

      this.formatter = {}
      this.formatterOptions = {
        "active": true,
      }

      this.filter = {}
      this.filterOptions = {
        "active": true,
      }

      this.sortedBy = [];
      this.sortOptions = {
        "active": true,
      }
      this.customCompareNumbers = compareNumbers;
      this.customCompareText = compareText;
      this.customChooseSortsCompareFn = chooseSortsCompareFn;
      
      this.drawOptionals = {}
    }

    serializeOptions(){
      return JSON.stringify(this.options, (key, value) => value instanceof Function ? serializeFunction(value) : value)
    }

    loadSerializedOptions(serializedOptions){
      this.options = JSON.parse(serializedOptions, (key, value) => {
        if (!(value instanceof Array)  && value.toString().match(funRegex)) {
          return deserializeFunction(value)
        } else {
          return value
        }
      });
      // this.sortedData = applySorting(this);
      this.redrawData();
    }

    /**
     * Called when table is added to DOM. Doesn't need to be called manually.
     */
    connectedCallback(){
      this.classList.add('wgt-grid-container')
      if(!this.sortedData && this.data) this.sortedData = this.data;
      drawTable(this)
    }

    /**
     * Configure a debounce function for event based table changes like sortClick and filterChange.
     * 
     * @param {Function} debounceFn a debounce function; has to return the debounced function; the debounced function should implement a cancel function. (tested with lodash.debounce)
     * @param {Array<any>} sortDebounceOptions the arguments list for the sort click event required by the debounce function.
     * @param {Array<any>} filterDebouncedOptions the arguments list for the filter change event required by the debounce  by the debounce function.
     */
    setDebounceFn(debounceFn, sortDebounceOptions, filterDebouncedOptions){
      if(this.optionalDebounceFn) {
        onSortClick.cancel()
        filterChanged.cancel()
      }
      this.optionalDebounceFn = debounceFn;
      onSortClick = this.optionalDebounceFn(onSortClick, ...sortDebounceOptions);
      filterChanged = this.optionalDebounceFn(filterChanged, ...filterDebouncedOptions);
    }

    /**
     * Set the data to be displayed by table as a list of row objects.
     * 
     * @param {Array<Object>} data 
     */
    setData(data){
      this.data = data;
      this.sortedData = data;
      drawTable(this);
    }

    /**
     * Get the data that is sorted, formatted and filtered.
     */
    getDisplayedData(){
      return this.displayedData;
    }

    /**
     * Get the original Data that was supplied to the table.
     */
    getOriginalData(){
      return this.data;
    }

    /**
     * Force a refresh, in case the data has changed. Alternatively you can call TableComponent.setData(newData).
     */
    redrawData(){
      let dataElements = this.root_document.querySelectorAll('div.wgt-data_cell, div.wgt-footer');
      dataElements.forEach(element => this.removeChild(element), this);
      this.header.forEach(filterKey => {
        this.root_document.querySelector(`.wgt-filter_cell_${filterKey}>div.filter_input`).textContent = this.filter[filterKey] ? this.filter[filterKey] : '';
      })
      if (this.data){
        this.displayedData = drawData(this);
        if (this.drawOptionals.footer) createFooter(this, this.displayedData);
      }
    }
  }

  return {regexFilter, textFilter, compareNumbers, compareText, chooseSortsCompareFn, defineCustomElement, TableComponent};
})()

