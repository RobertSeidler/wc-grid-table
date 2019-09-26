/**
 * Project: wc-grid-table
 * Repository: https://github.com/RobertSeidler/wc-grid-table
 * Auther: Robert Seidler
 * Email: Robert.Seidler1@googlemail.com 
 * License: ISC
 */


require('./wc-grid-table.css');

module.exports = (function(){
  // Closure, so that only functions I want to expose are getting exposed.

  /**
   * Transform the filter input into a RegExp, to let the user have a powerfull way to filter in the table.
   * Only rows where the tested value matches the RegExp, get displayed. 
   * Additionally you can prepend three exclamation marks ('!!!') to negate the RegExp, so that only rows that
   * don't match the RegExp are displayed. This is the default filter function.
   * This function can be replaced by supplying your own function to TableComponent.customFilterFunction.
   * 
   * @param {string} filterInput the value of the filter text input field.
   * @param {string} testValue the table value to validate against.
   */
  function regexFilter(filterInput, testValue){
    let negate = filterInput.substring(0, 3) === '!!!';
    filterInput = negate ? filterInput.substring(3) : filterInput;
    let matches = testValue.toString().match(new RegExp(filterInput, 'i'));
    let result = Boolean(matches) && matches.length > 0;
    return negate ? !result : result;
  }
   
  /**
   * Test the filter input string with includes (case is ignored) against the table value.
   * Only rows where the filter input is a substring of the tested value.
   * Additionally you can prepend three exclamation marks ('!!!') to negate the outcome, 
   * so that only rows that are not included in the table value are displayed.
   * This function can replace by supplying it to TableComponent.customFilterFunction.
   * 
   * @param {string} filterInput the value of the filter text input field.
   * @param {string} testValue the table value to validate against.
   */
  function textFilter(filterInput, testValue){
    let negate = filterInput.substring(0, 3) === '!!!';
    filterInput = negate ? filterInput.substring(3) : filterInput;
    let match = testValue.toString().toUpperCase().includes(filterInput.toUpperCase());
    return negate ? !match : match;
  }
  
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
    if (a > b) result = -1;
    if (a < b) result = 1;
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
        table.sortedData = [].concat(table.sortedData.filter(entry => entry[column] != undefined).reverse(), table.sortedData.filter(entry => entry[column] == undefined));
        table.redrawData();
        return;
      } else {
        table.sortedBy.unshift({
          col: column,
          dir: "asc"
        })
      }
    } else {
      table.sortedBy.push({
        col: column,
        dir: "asc"
      })
    }
    table.sortedData = table.sortedData.sort((a, b) => {
      return table.customChooseSortsCompareFn(table, table.sortedData, column)(a[column], b[column])
    })
    table.redrawData()
  }

  function filterChanged(table, column, event){
    table.filter[column] = event.srcElement.value;
    table.redrawData();
  }

  function setUpSorting(element, column, table){
    element.addEventListener('click', (event) => onSortClick(table, column, event))
  }

  function createHeader(table){
    let col_height = 40;
    table.header.forEach( (column, columnIndex) => {
      let col_header = document.createElement('div');
      col_header.classList.add('wgt-header')
      col_header.classList.add(`wgt-column_${column}`)
      col_header.classList.add('wgt-cell')
      setUpSorting(col_header, column, table)
      col_header.innerHTML = column;
      table.append(col_header)
      col_height = col_header.clientHeight;
    });
    tmp_style = document.createElement('style');
    tmp_style.innerHTML = `
      .wgt-filter_cell {
        top: ${col_height}px;
      }`;
    table.root_document.querySelector('head').append(tmp_style);
  }

  function createFilter(table, header, filter){
    header.forEach(column => {
      let filter_container = document.createElement('div');
      let filter_input = document.createElement('input');
      filter_input.type = 'text';
      filter_input.classList.add('wgt-filter_input');
      filter_input.value = filter[column] ? filter[column] : '';
      filter_input.addEventListener('input', event => filterChanged.bind(null, table, column)(event))
      filter_container.classList.add('wgt-filter_cell', `wgt-filter_cell_${column}`);
      filter_container.append(filter_input);

      table.append(filter_container);
    })
  }

  function createFooter(table, data){
    let footer = document.createElement('div');
    footer.classList.add('wgt-footer')
    footer.style.gridColumn = `1 / ${table.header.length + 1}`

    let total_rows = document.createElement('div');
    total_rows.innerHTML = `Total: ${data.length}`;
    total_rows.classList.add('wgt-footer_cell', 'wgt-cell')
    footer.append(total_rows)

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
      let styleElement = document.createElement('style');
      styleElement.type = "text/css";

      header.forEach(column => {
        conditionalColumnStyle.forEach((conditionalStyle) => {
          if(conditionalStyle.condition(data, column)){
            styleElement.innerHTML += `
              div.wgt-column_${column}.wgt-data_cell {
                ${conditionalStyle.styles.join('\n')}
              }
            `
          }
        })
      })

      table.root_document.querySelector('head').append(styleElement);
    }
  }

  function applyFilter(table, data, header, filter, options){
    if(options.active){
      return data.filter(row => 
        header.map(column => {
          if(filter[column]){
            return table.customFilterFunction(filter[column], row[column]);
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

    if(table.drawOptionals.header && table.header){
      table.style.gridTemplateColumns = `repeat(${table.header.length}, max-content)`;
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
    applyConditionalColumnStyling(table, table.sortedData, table.header, table.conditionalColumnStyle, table.conditionalColumnOptions);
    let formattedData = applyFormatter(table.sortedData, table.header, table.formatter, table.formatterOptions);
    let filteredData = applyFilter(table, formattedData, table.header, table.filter, table.filterOptions);
    table.style.gridTemplateRows = `${
      table.drawOptionals.header ? 'max-content' : ''} ${
        table.drawOptionals.filter ? 'max-content' : ''} repeat(${filteredData.length}, max-content) ${
          table.drawOptionals.footer ? 'max-content' : ''}`; 
    fillData(table, filteredData);
    return filteredData;
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
   *  - conditionalColumnOptions - an object with options concerning conditionalColumnStyle. Available Options:
   *      - active: Boolean
   *  - formatter - an Object with column names as keys, containing lists of formatter functions, that should be applied before displaing a table value. Formatter functions
   *    have this signature: "(value, rowIndex, completeData) => any". Formatter get applied in the sequence they are in the list (leftmost function (2nd from left (3rd ...))).
   *  - formatterOptions - an object with options concerning formatter. Available Options:
   *      - active: Boolean
   *  - filter - an Object with column names as keys, containing strings which correspond to the filter input values in the ui. 
   *    Those get validated by customFilterFunction / regexFilter.
   *  - filterOptions - an object with options concerning filter. Available Options:
   *      - active: Boolean
   *  - customFilterFunction - a function that can override default filter behaviour (regexFilter). Arguments are filter input values and value to test against as strings.
   *    The expected return is a filtered data Array.
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
      this.useDefaultOptions();
    }

    /**
     * Reset Options to the default configuration.
     */
    useDefaultOptions(){
      this.root_document = document;

      this.optionalDebounceFn = undefined;

      this.conditionalColumnStyle = [
        {
          "condition": (data, column) => (!Number.isNaN(data.reduce((col, cur) => (col += typeof cur[column] === "string" ? NaN : (cur[column] != undefined ? cur[column] : 0)), 0))),
          "styles": ["text-align: right;"]
        },
      ]
      this.conditionalColumnOptions = {
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
      this.customFilterFunction = regexFilter;

      this.sortedBy = [];
      this.sortOptions = {
        "active": true,
      }
      this.customCompareNumbers = compareNumbers;
      this.customCompareText = compareText;
      this.customChooseSortsCompareFn = chooseSortsCompareFn;
      
      this.drawOptionals = {}
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
      if (this.data){
        this.displayedData = drawData(this);
        if (this.drawOptionals.footer) createFooter(this, this.displayedData);
      }
    }
  }

  return {regexFilter, textFilter, compareNumbers, compareText, chooseSortsCompareFn, defineCustomElement, TableComponent};
})()

