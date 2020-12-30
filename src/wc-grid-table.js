//? FEATURE: maybe add possibility for horizontal header either
//? Top -> Down - css: { writing-mode: sideways-rl, text-orientation : sideways } or
//? Bottom -> Up - css: { writing-mode: sideways-lr, text-orientation : sideways }


/**
 * Project: wc-grid-table
 * Repository: https://github.com/RobertSeidler/wc-grid-table
 * Auther: Robert Seidler
 * Email: Robert.Seidler1@googlemail.com 
 * License: ISC
 */

require('./wc-grid-table.css');

// test exception tracker with an actual module.
//TODO: Comment out before packaging
let appname = 'wc-grid-table';
// let tracker = require('../../exception-tracker-server/test-client/tracker.js')
//   .Tracker
//   .injectConsole('http://localhost:52005/', 'wc-grid-table', true, true, true);


const { regexFilter, textFilter, compareFilter } = require('./filter-utils.js');
const { createPageChooser, addKeyHandlerToDocument } = require('./pagination-utils.js');

var tableCounter = 0;

module.exports = (function() {
            // Closure, so that only functions I want to expose are getting exposed.

            function defineSetPrototypeFunctions() {
                /**
                 * @param {Iterable} an iterable, that should be unioned with the starting Set
                 */
                Object.defineProperty(Set.prototype, 'union', {
                    value: function(anotherSet) {
                        for (let element of anotherSet) {
                            console.log(element)
                            this.add(element);
                        }
                        return this;
                    },
                    enumerable: false,
                    writable: true,
                });
            }

            const testNumberRegex = /^([0-9]{1,3}(?:[\.|,]{0,1}[0-9]{3})*[\.|\,]{0,1}[0-9]*)\s{0,1}\D*$/i;

            function fixColumnHeader(table, col_height) {
                table.header.forEach((column) => {
                    let col_header = table.elements.header[column];
                    col_height = col_header.offsetHeight;
                    if (col_header.offsetHeight > 0)
                        table.elements.stickyStyle.innerHTML = `
                          .table-id-${table.tableId} > .wgt-filter_cell {
                            top: ${col_header.offsetHeight}px;
                          }
                        `;
                });
            }

            function tryTransformToNumber(testStr) {
                let matches = testNumberRegex.exec(testStr.toString());
                let result;
                if (matches) {
                    result = Number.parseFloat(matches[1]);
                } else {
                    result = testStr;
                }
                return result;
            }

            /**
             * Compare function for comparing numbers for sorting. Additionally undefined values are 
             * always the 'smaller' value, so that they get sorted to the bottom.
             * Can be replaced by supplying a custom compare function to TableComponent.customCompareNumbers.
             * 
             * @param {number} a number to compare. 
             * @param {number} b number to compare.
             */
            function compareNumbers(a, b) {
                if (a == undefined || a === '') return 1;
                if (b == undefined || b === '') return -1;
                return tryTransformToNumber(b) - tryTransformToNumber(a);
            }

            /**
             * Compare function for comparing strings for sorting. Additionally undefined values are
             * always the 'smaller' value, so that they get sorted to the bottom. 
             * Can be replaced by supplying a custom compare function to TableComponent.customCompareText.
             * 
             * @param {string} a text to compare.
             * @param {string} b text to compare.
             */
            function compareText(a, b) {
                let result = 0;
                if (a == undefined || a === '') return 1;
                if (b == undefined || b === '') return -1;
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
            function chooseSortsCompareFn(table, data, column) {
                // if(!Number.isNaN(data.reduce((col, cur) => (col += cur[column] != undefined ? Number.parseFloat(cur[column]) : 0), 0))){
                if (data.every(row => (typeof(tryTransformToNumber(row[column])) == 'number'))) {
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
            function defineCustomElement() {
                customElements.define('wc-grid-table', TableComponent);
            }

            function onSortClick(table, column, event, doRedraw) {
                if (table.header.includes(column)) {
                    if (table.sortedBy.length > 0) {
                        if (table.sortedBy[0].col === column) {
                            table.sortedBy[0].dir = table.sortedBy[0].dir === "asc" ? "desc" : "asc";
                            table.elements.sortArrows[column].innerHTML = table.sortedBy[0].dir === "asc" ? "&uarr;" : "&darr;";
                            // table.sortedData = [].concat(table.sortedData.filter(entry => entry[column] != undefined).reverse(), table.sortedData.filter(entry => entry[column] == undefined));
                            // table.redrawData();
                            // return;
                        } else {
                            table.header.filter(header_key => header_key !== column).forEach(header_key => {
                                if (table.elements.sortArrows[header_key].innerHTML !== '&#8693;') {
                                    table.elements.sortArrows[header_key].arrowAlphaColor = table.elements.sortArrows[header_key].arrowAlphaColor * 0.5;
                                    table.elements.sortArrows[header_key].style.color = `rgb(0, 0, 0, ${table.elements.sortArrows[header_key].arrowAlphaColor})`;
                                }
                            });
                            table.sortedBy = [].concat([new Object({ col: column, dir: "asc" })], table.sortedBy);
                        }
                        table.elements.sortArrows[column].innerHTML = table.sortedBy[0].dir === "asc" ? "&uarr;" : "&darr;";
                        table.elements.sortArrows[column].arrowAlphaColor = 1;
                        table.elements.sortArrows[column].style.color = `rgb(0, 0, 0, ${table.elements.sortArrows[column].arrowAlphaColor})`;
                    } else {
                        table.sortedBy = [].concat(table.sortedBy, [new Object({ col: column, dir: "asc" })]);
                        table.elements.sortArrows[column].innerHTML = "&uarr;";
                        table.elements.sortArrows[column].arrowAlphaColor = 1;
                        table.elements.sortArrows[column].style.color = `rgb(0, 0, 0, ${table.elements.sortArrows[column].arrowAlphaColor})`;
                    }
                    table.serializeLinkOptions()
                    if (doRedraw) table.redrawData()
                }
            }


            function transformToGroupedData(initialData, groupColumns) {
                let groups = initialData.map(fullRow => {
                        let result = {};
                        groupColumns.forEach(groupColumn => {
                            result[groupColumn] = fullRow[groupColumn];
                        });
                        return result;
                    })
                    .reduce((col, cur) => (!col.includes(cur) ? [].concat(col, [cur]) : col), []);

                // console.log(groups);
            }

            function filterChanged(table, column, event) {
                table.pagination.currentPage = 1;
                table.filter[column] = event.srcElement.textContent;
                table.redrawData();
                table.serializeLinkOptions()
            }

            /**
             * table.filterNegate[column] === undefined shall be equal to 'contains'.
             * @param {*} table 
             * @param {*} column 
             * @param {*} event 
             */
            function toggleFilterNegator(table, column, event) {
                let newOperation = table.activeFilterOperations[column];
                if (newOperation === undefined || newOperation == '') newOperation = table.filterOperations[0].name;
                newOperation = table.filterOperations[(table.filterOperations.findIndex(element => (element.name == newOperation)) + 1) % table.filterOperations.length].name;
                if (table.elements.filterOperations[column]) table.elements.filterOperations[column].innerHTML = table.filterOperations.find(op => op.name == newOperation).char;
                table.activeFilterOperations[column] = newOperation;
                table.redrawData();
                table.serializeLinkOptions();
            }

            function setUpSorting(element, column, table) {
                element.addEventListener('click', (event) => onSortClick(table, column, event, true))
            }

            function createHeaderTooltip(table) {
                let tooltip = table.elements.tooltip = document.createElement('div');
                tooltip.state = {
                    offsetLeft: 0
                }
                tooltip.classList.add('header-col-tooltip');
                tooltip.classList.add('wgt-cell');
                table.append(tooltip)
            }

            function onHeaderMouseEnter(table, columnElement, columnName) {
                table.elements.tooltip.innerHTML = columnName;
                table.elements.tooltip.state.offsetLeft = columnElement.offsetLeft;
                table.elements.tooltip.style.left = `${(columnElement.offsetLeft) - table.scrollLeft}px`;
                table.elements.tooltip.classList.add('visible');
            }

            function onHeaderMouseLeave(table, columnElement, columnName) {
                table.elements.tooltip.classList.remove('visible');
            }

            function createHeader(table) {
                let col_height = 0;
                createHeaderTooltip(table);
                if (!table.elements.header) table.elements.header = {};
                table.header.forEach((column, columnIndex) => {
                    let col_header = document.createElement('div');
                    col_header.classList.add('wgt-header')
                    col_header.classList.add(`wgt-column_${column.split(' ').join('_')}`)
                    col_header.classList.add('wgt-cell');
                    let col_container = document.createElement('div');
                    col_container.classList.add('wgt-col-header-container');
                    col_container.innerHTML = column;
                    col_header.append(col_container);
                    col_header.addEventListener('mouseenter', onHeaderMouseEnter.bind(this, table, col_header, column));
                    col_header.addEventListener('mouseleave', onHeaderMouseLeave.bind(this, table, col_header, column));
                    table.append(col_header)
                    col_height = col_header.offsetHeight;
                    let sort_arrow = document.createElement('div');
                    sort_arrow.classList.add('arrow');
                    sort_arrow.innerHTML = '&#8693;';
                    sort_arrow.addEventListener('mouseenter', function(event) {
                        onHeaderMouseLeave(table, col_header, column);
                        event.stopPropagation();
                    });
                    sort_arrow.addEventListener('mouseleave', onHeaderMouseEnter.bind(this, table, col_header, column));
                    table.elements.header[column] = col_header;
                    table.elements.sortArrows[column] = sort_arrow;
                    setUpSorting(sort_arrow, column, table)
                    col_header.append(sort_arrow)

                });
                table.addEventListener('scroll', (event) => {
                    table.elements.tooltip.style.left = `${(table.elements.tooltip.state.offsetLeft) - table.scrollLeft}px`;
                });
                window.addEventListener('message', function(event) {
                    if (event.data) {
                        let dataObj = JSON.parse(event.data); // dataObj = {type: 'fix-columns', element: undefined, data: undefined}
                        if (dataObj.type === 'fix-columns') fixColumnHeader(table, col_height);
                    }
                });
                requestAnimationFrame(() => {
                    setTimeout(fixColumnHeader.bind(this, table, col_height), 1000);
                    createStickyFilterStyle(table, col_height);
                }); // createStickyFilterStyle(table, col_height);
            }

            function createStickyFilterStyle(table, col_height) {
                let tmp_style = table.elements.stickyStyle;
                if (!tmp_style) {
                    table.elements.stickyStyle = tmp_style = document.createElement('style');
                    tmp_style.type = "text/css";
                    tmp_style.classList.add('sticky_filter_offset');
                }
                tmp_style.innerHTML = `
      .table-id-${table.tableId} > .wgt-filter_cell {
        top: ${col_height}px;
      }
    `;
                table.root_document.head.append(tmp_style);
            }

            function createFilter(table, header, filter) {
                table.elements.filterCells = {};
                table.elements.filterOperations = {};
                header.forEach(column => {
                    let filter_container = document.createElement('div');
                    // let filter_input = document.createElement('input');
                    // filter_input.type = 'text';
                    // filter_input.classList.add('wgt-filter_input');
                    // filter_input.value = filter[column] ? filter[column] : '';
                    // filter_container.addEventListener('input', event => filterChanged.bind(null, table, column)(event))
                    filter_container.classList.add('wgt-filter_cell', `wgt-filter_cell_${column.split(' ').join('_')}`, 'wgt-filter_input');
                    // filter_container.contentEditable = 'true';

                    let filter_input = document.createElement('div')
                    filter_input.addEventListener('input', event => filterChanged.bind(null, table, column)(event));
                    filter_input.classList.add('filter_input');
                    filter_input.contentEditable = 'true';
                    let filter_negate = document.createElement('div');
                    table.elements.filterOperations[column] = filter_negate;
                    filter_negate.innerHTML = '&sube;';
                    filter_negate.classList.add('filter_negator');

                    filter_negate.addEventListener('click', event => toggleFilterNegator.bind(null, table, column)(event))
                        // filter_negate.style.position = 'absolute';
                        // filter_negate.style.
                        // filter_container.append(filter_input);
                    filter_container.append(filter_input);
                    filter_container.append(filter_negate);
                    table.elements.filterCells[column] = filter_container;
                    table.append(filter_container);
                })
            }

            function createResetLinkButton(table) {
                let btn = document.createElement('div');
                btn.classList.add('footer-button', 'wgt-footer-cell', 'wgt-cell');
                btn.innerHTML = 'reset';
                btn.addEventListener('click', function(event) {
                    if (confirm('Sicher, dass alle angewendeten Umformungen zurückgesetzt werden sollen')) {
                        let url = new URL(location.href);
                        url.search = '?' + url.search.slice(1).split('&').filter(entry => !entry.split('=')[0].startsWith('table')).join('&');
                        location.href = url.href;
                    }
                });
                return btn;
            }

            function createFooter(table, data, pageChooser) {
                bindColumnChooserHandler(table);
                let footer = document.createElement('div');
                footer.classList.add('wgt-footer')
                footer.style.gridColumn = `1 / ${table.header.length + 1}`

                if (!table.elements.columnChooserMenuContainer) {
                    table.elements.columnChooserMenuContainer = createColumnChooserMenuContainer(table, table.headerAll);
                    table.parentElement.insertBefore(table.elements.columnChooserMenuContainer, table.nextSibling);
                }

                let total_rows = document.createElement('div');
                total_rows.innerHTML = `Total: ${table.data.length}`;
                total_rows.classList.add('wgt-footer_cell', 'wgt-cell')
                footer.append(total_rows)
                table.elements.total_rows = total_rows;

                if (table.data.length !== data.length) {
                    let filtered_row_count = document.createElement('div');
                    filtered_row_count.innerHTML = `Filtered: ${data.length}${table.pagination.active ? ` / ${table.pagination.filteredDataCount}` : ''}`;
      filtered_row_count.classList.add('wgt-footer_cell', 'wgt-cell')
      footer.append(filtered_row_count)
      table.elements.filtered_row_count = filtered_row_count;
    }
    
    if(footer) footer.append(createColumnChooserButton(table));
    if(table.drawOptionals.rewriteurl) footer.append(createResetLinkButton(table));
    if(pageChooser) footer.append(pageChooser);
    if(table.elements.footer) table.elements.footer.remove();
    table.elements.footer = footer;
    table.append(footer);
  }

  let boundColumnChooserButtonHandler = undefined;
  let boundColumnChooserOutsideHandler = undefined;
  let boundColumnChooserChangeColumnHandler = undefined;

  function bindColumnChooserHandler(table){
    boundColumnChooserButtonHandler = onColumnChooserButtonHandler.bind(null, table);
    boundColumnChooserOutsideHandler = onColumnChooserOutsideHandler.bind(null, table);
  }

  function createColumnChooserButton(table){
    let but = document.createElement('div');
    but.classList.add('wgt-footer_cell', 'wgt-cell', 'footer-button-down', 'footer-button');
    but.innerHTML = 'columns';
    but.addEventListener('click', boundColumnChooserButtonHandler);
    return but;    
  }

  function createColumnChooserMenuItems(table, column){
    let colItem = document.createElement('li');
    colItem.classList.add('column-chooser-item', 'column-chooser');
    let label = document.createElement('label');
    label.innerHTML = column;
    label.setAttribute('name', column + '_checkbox');
    label.classList.add('column-chooser');
    let checkBox = document.createElement('input');
    checkBox.setAttribute('type', 'checkbox');
    checkBox.setAttribute('name', column + '_checkbox');
    if(!table.hiddenColumns.includes(column)){
      checkBox.toggleAttribute('checked');
    }
    checkBox.classList.add('column-chooser');
    boundColumnChooserChangeColumnHandler = onColumnChooserChangeColumnHandler.bind(null, table, column);
    checkBox.addEventListener('change', boundColumnChooserChangeColumnHandler);
    table.elements.columnChooserCheckbox[column] = checkBox;
    label.prepend(checkBox);
    // label.innerHTML += column; 
    colItem.append(label);
    return colItem;
  }

  function createColumnChooserMenuContainer(table, allHeader){
    if(!table.elements.columnChooserCheckbox) table.elements.columnChooserCheckbox = {};
    let menu = document.createElement('ul');
    menu.classList.add('column-chooser-menu', 'column-chooser');
    let menuContainer = document.createElement('div');
    menuContainer.classList.add('column-chooser-menu-container', 'hidden')
    console.log((new Set(allHeader)).union(table.hiddenColumns));
    ((new Set(allHeader)).union(table.hiddenColumns)).forEach(column => {
      menu.append(createColumnChooserMenuItems(table, column));
    })
    menuContainer.append(menu)
    // table.elements.columnChooserMenuContainer = menuContainer;
    return menuContainer;
  }

  function onColumnChooserButtonHandler(table, event){
    let offset = table.offsetLeft;

    if(table.elements.total_rows){
      offset += table.elements.total_rows.offsetWidth;
    }
    if(table.elements.filtered_row_count){
      offset += table.elements.filtered_row_count.offsetWidth;
    }

    table.elements.columnChooserMenuContainer.style.left = `${offset}px`;

    let classList = table.elements.columnChooserMenuContainer.classList;
    if(classList.contains('hidden')){
      classList.remove('hidden');
      table.root_document.addEventListener('click', boundColumnChooserOutsideHandler)
    } else {
      classList.add('hidden')
      table.root_document.removeEventListener('click', boundColumnChooserOutsideHandler)
    }

  }

  function onColumnChooserOutsideHandler(table, event){
    if(!event.srcElement.classList.contains('column-chooser')){
      if(!event.srcElement.classList.contains('footer-button')){
        let classList = table.elements.columnChooserMenuContainer.classList;
        classList.add('hidden');
        table.root_document.removeEventListener('click', boundColumnChooserOutsideHandler)
      }
    }
  }

  function onColumnChooserChangeColumnHandler(table, column, event){
    if(event.srcElement.checked){
      table.hiddenColumns = table.hiddenColumns.filter(entry => entry != column);
    } else {
      table.hiddenColumns.push(column);
    }
    table.serializeLinkOptions();
    table.redrawTable();
  }

  function fillData(table, data){
    table.elements.dataCells = {};
    data.forEach((row, rowIndex) => {
      table.header.forEach( (column, columnIndex) => {
        let cell = document.createElement('div');
        cell.classList.add('wgt-cell', 'wgt-data-cell', `wgt-column_${column.split(' ').join('_')}`, `wgt-row_${rowIndex}`, `wgt-zebra_${rowIndex % 2}`)
        // cell.classList.add()
        // cell.classList.add()
        cell.innerHTML = row[column] != undefined ? row[column] : '';
        if(column === '#include') {
          cell.setAttribute('contentEditable', 'true');
          let tempRowActive = row;
          delete tempRowActive['#include'];
          console.log(table.tickedRows);
          console.log(JSON.stringify(tempRowActive));
          console.log(table.tickedRows.includes(JSON.stringify(tempRowActive)));
          cell.innerText = table.tickedRows.includes(JSON.stringify(tempRowActive)) ? 'x' : '';
          cell.addEventListener('input', (event) => {       
            console.log('input changed in row ' + rowIndex);     
            console.log(event.target.innerText);
            let tempRow = row;
            delete tempRow['#include'];
            if(event.target.innerText){
              console.log('added row');
              table.tickedRows.push( JSON.stringify(tempRow));
            } else {
              console.log('removed row');
              table.tickedRows = table.tickedRows.filter(value => (value !== JSON.stringify(tempRow)));
            }
            table.serializeLinkOptions();
          });
        }
        if(!table.elements.dataCells[column]) table.elements.dataCells[column] = [];
        table.elements.dataCells[column].push(cell);
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
      let column_style_element = table.elements.columnStyle;
      if(!column_style_element){
        table.elements.columnStyle = column_style_element = document.createElement('style');
        column_style_element.type = "text/css";
        column_style_element.classList.add('column_styles');
        table.root_document.head.append(column_style_element);
      }
      column_style_element.innerHTML = '';
      header.forEach(column => {
        conditionalColumnStyle.forEach((conditionalStyle) => {
          if(conditionalStyle.condition(data, column)){
            column_style_element.innerHTML += `
              div.wgt-column_${column}.wgt-data-cell {
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
      let row_style_element = table.elements.columnStyle;
      if(!row_style_element){
        table.elements.columnStyle = row_style_element = document.createElement('style');
        row_style_element.type = "text/css";
        row_style_element.classList.add('row_styles');
        table.root_document.head.append(row_style_element);
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

  function resetSorting(table){
    table.sortedData = table.data ? table.data.map(value => value) : [];
    table.sortedBy = [];
    if(table.header) table.header.forEach(column => {
      table.elements.sortArrows[column].innerHTML = '&#8693;';
      table.elements.sortArrows[column].arrowAlphaColor = 1.0;
      table.elements.sortArrows[column].style.color = `lightgray`;
    });
  }

  function resetFilterOperations(table){
    table.header.forEach(column => {
      let operation = table.filterOperations.find(op => (op.name == table.activeFilterOperations[column]));
      if(operation) table.elements.filterOperations[column].innerHTML = operation.char;
    });    
  }

  function applySorting(table, column){
    // if(column) {
    //   return table.sortedData.sort((a, b) => {
    //     return table.customChooseSortsCompareFn(table, table.sortedData, column)(a[column], b[column])
    //   })
    // } else 
    if(table.sortedBy && table.sortedBy.length > 0) {
      column = table.sortedBy[0].col;
      let sorted = table.sortedData.sort((a, b) => {
        return table.customChooseSortsCompareFn(table, table.data, column)(a[column], b[column])
      })
      if(table.sortedBy[0].dir === 'desc')
        sorted = [].concat(sorted.filter(entry => entry[column] != undefined && entry[column] !== '').reverse(), sorted.filter(entry => entry[column] == undefined || entry[column] === ''));
      return sorted;
    } else {
      return table.sortedData;
    }
  }

  function applyFilter(table, data, header, filter, options){
    if(options.active){
      return data.filter(row => 
        header.map(column => {
          if(filter[column]){
            if (table.activeFilterOperations[column] == '' || table.activeFilterOperations[column] == undefined) table.activeFilterOperations[column] = table.filterOperations[0].name;
            return table.filterOperations.find(op => (op.name == table.activeFilterOperations[column])).fn(filter[column], row[column]);
          } else return true;
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

  function applyPagination(table, data){
    let result = data;
    table.pagination.active = table.paginationOptions.active;
    table.pagination.totalPages = table.pagination.active ? Math.ceil(data.length / table.pagination.pageSize) : 1;
    if(table.pagination.totalPages == 1){
      table.pagination.active = false;
    } else {
      result = data.filter((value, index) => 
        !table.pagination.active
        || ((index >= (table.pagination.currentPage - 1) * table.pagination.pageSize) 
        && (index < (table.pagination.currentPage) * table.pagination.pageSize))
      );
    }
    return result;
  }

  function drawTable(table){
    table.elements.sortArrows = {};

    // table.data = table.data.map(entry => {
    //   let tempRow = entry;
    //   delete tempRow['#include'];
    //   return {'#include': table.options.tickedRows.includes(JSON.stringify(tempRow)) ? 'x' : '', ...tempRow};
    // });
    

    table.drawOptionals = {
      header: !table.hasAttribute('noheader'),
      filter: !table.hasAttribute('nofilter'), //! TODO fix Broken nofilter
      footer: !table.hasAttribute('nofooter'),
      pagekey: !table.hasAttribute('nopagekey'),
      rewriteurl: !table.hasAttribute('norewriteurl'),
    }
    
    table.innerHTML = "";
    if(!table.data) table.data = [];      
    if(!table.sortedData) table.sortedData = table.data.map(value => value);

    if(!table.headerAll && table.data.length > 0){
      let genHeader = generateHeader(table.data);
      if(!genHeader.includes('#include')) table.headerAll = ['#include'].concat(genHeader);
      else table.headerAll = genHeader;

      
      table.hiddenColumns = table.hiddenColumns.concat(table.headerAll.filter(column =>
        table.hiddenColumnsCondition
          .map(condition => ({col: column, hidden: condition(column, table.data)}))
          .filter(columnCond => columnCond.hidden)
          .map(columnCond => columnCond.col)
          .includes(column)
      ));
    }

    if(table.headerAll && table.elements.columnChooserCheckbox) {
      for(let column of table.headerAll){
        if(table.hiddenColumns.includes(column)){
          table.elements.columnChooserCheckbox[column].checked = false;
        } else {
          table.elements.columnChooserCheckbox[column].checked = true;
        }
      }
    }

    if(table.headerAll){
      table.header = 
        table.headerAll.filter(column => 
          !table.hiddenColumns.includes(column)
        )
      table.style.gridTemplateColumns = `repeat(${table.header.length}, max-content)`;
    }

    if(table.drawOptionals.header && table.header){
      createHeader(table);
    }
    
    if(table.drawOptionals.filter && table.header){
      createFilter(table, table.header, table.filter);
    }

    if (table.data.length > 0){
      // table.data = table.data;
      table.displayedData = drawData(table);

      //? Log, that is send to Tracker Server:
      console.log('Finished transform of data.', table.displayedData, appname);

      table.elements.pageChooser = createPageChooser(table, table.displayedData);

      if (table.drawOptionals.footer) createFooter(table, table.displayedData, table.elements.pageChooser);
    }

    if (table.drawOptionals.pagekey){
      addKeyHandlerToDocument(table);
    }
  }

  function drawData(table){
    table.sortedData = applySorting(table);
    applyConditionalColumnStyling(table, table.sortedData, table.header, table.conditionalColumnStyle, table.conditionalStyleOptions);
    let formattedData = applyFormatter(table.sortedData, table.header, table.formatter, table.formatterOptions);
    let filteredData = applyFilter(table, formattedData, table.header, table.filter, table.filterOptions);
    table.pagination.filteredDataCount = filteredData.length;
    let pageinatedData = applyPagination(table, filteredData);
    // pageinatedData = pageinatedData.map(entry => ({'#include': table.tickedRows.includes(JSON.stringify(entry)) ? 'x' : '', ...entry}))
    table.style.gridTemplateRows = `${
      table.drawOptionals.header ? 'max-content' : ''} ${
        table.drawOptionals.filter ? 'max-content' : ''} repeat(${pageinatedData.length}, max-content) ${
          table.drawOptionals.footer ? 'max-content' : ''}`; 
    fillData(table, pageinatedData);
    applyConditionalRowStyling(table, pageinatedData, table.header, table.conditionalRowStyle, table.conditionalStyleOptions);
    return pageinatedData;
  }

  function defineHiddenProperties(table, props){
    props.forEach(prop => Object.defineProperty(table, prop, {
      enumerable: false,
      writable: true,
      // configurable: true,
    }))
  }

  function defineOptionProperties(table, props){
    props.forEach(prop => 
      Object.defineProperty(table, prop, {
        enumerable: true,
        writable: true
      })
    );
  }

  const funRegex = /^((?:function\s*.*){0,1}\(([^\(\{\[\=\>]*)\)\s*(?:=>|\{)\s*[\{\(]{0,1}.*[\}\)]{0,1})$/gy;

  function deserializeFunction(funStr){
    let match = funRegex.exec(funStr);
    let args = match.groups[2].split(',').map(str => str.trim())
    return new Function(...args, `return (${funStr.toString()})(${args.join(', ')})`)
  }

  function serializeFunction(fun){
    return fun.toString();
  }

  function replaceUrlSearchParameter(newParamKey, newParamValue){
    let result = '?';
    let replaced = false;
    let oldParams = location.search.slice(1).split('&')
    if(oldParams.length > 1){
      oldParams.forEach(oldParam => {
        let oldParamKey = oldParam.split('=')[0];
        if(oldParamKey == newParamKey) {
          replaced = true;
          result += `${oldParamKey}=${newParamValue}&`;
        }
        else result += `${oldParamKey}=${oldParam.split('=').slice(1).join('=')}&`;
      })
    } else if(oldParams.length == 1){
      if (oldParams[0] == ""){
        replaced = true;
        result += `${newParamKey}=${newParamValue}&`;
      } else {
        if (oldParams[0].split('=')[0] == newParamKey){
          replaced = true;
          result += `${newParamKey}=${newParamValue}&`;
        } else {
          result += `${oldParams[0].split('=')[0]}=${oldParams[0].split('=').slice(1).join('=')}&`;
        }
      }
    }
    if (!replaced) result += `${newParamKey}=${newParamValue}&`;
    return result.slice(0, -1) + location.hash;
  }

  function reapplySorting(table, partialOptions){
    console.log('reaply sorting')
    resetSorting(table);
    partialOptions['sortedBy'].reverse().slice(-4).forEach(sortStep => {
      if(sortStep.dir == 'desc'){
        onSortClick(table, sortStep.col)
      }
      onSortClick(table, sortStep.col)
    })
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

      defineSetPrototypeFunctions();

      this.linkOptions = [
        'pagination',
        'filter',
        'sortedBy',
        'activeFilterOperations',
        'hiddenColumns',
        'tickedRows',
      ]

      defineHiddenProperties(this, [
        'options',
        'root_document',
        'optionalDebounceFn',
        'sortedData',
        'data',
        'header',
        'displayedData',
        'drawOptionals',
        'elements',
        'tableId',
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
        'pagination',
        'customCompareNumbers',
        'customCompareText',
        'customChooseSortsCompareFn',
        'hiddenColumns',
        'hiddenColumnsCondition',
        'tickedRows',
      ]);

      this.useDefaultOptions();
    }

    /**
     * Reset Options to the default configuration.
     */
    useDefaultOptions(){
      this.root_document = document;

      this.elements = {};

      // this.tableId = 0;
      this.tableId = tableCounter++;

      this.data = [];
      
      this.hiddenColumns = []; // ['Einzelpreis'];
      this.hiddenColumnsCondition = [
        (column, data) => (column.startsWith('#')),
      ];

      this.elements.sortArrows = {};
      this.optionalDebounceFn = undefined;
      this.activeFilterOperations = {};

      this.paginationOptions = {
        active: true,
      }

      this.pagination = {
        active: true,
        currentPage: 1,
        pageSize: 40,
      }

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

      this.conditionalColumnStyle = []; /*[
        {
          condition: (data, column) => (!Number.isNaN(data.reduce((col, cur) => (col += typeof cur[column] === "string" ? NaN : (cur[column] != undefined ? cur[column] : 0)), 0))),
          styles: ["text-align: right;"]
        },
      ]*/

      this.conditionalRowStyle = {
       /* Rabattsatz: [
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
        ]*/
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
      
      this.drawOptionals = {};

      this.tickedRows = [];
    }

    loadPartialOptions(partialOptions){
      if (this.data.length > 0){
        console.log('partial', partialOptions)
        Object.keys(partialOptions).sort((a, b) => (a == 'hiddenColumns') ? 1 : -1).forEach(option => {
          if(option == 'sortedBy'){
            reapplySorting(this, partialOptions);
          } else if (option == 'hiddenColumns') {
            this[option] = partialOptions[option];
            this.redrawTable();
          } else {
            this[option] = partialOptions[option];
            console.log(option, this[option]);
          }
        });
        resetFilterOperations(this)
        this.redrawData()
      }
    }

    serializeLinkOptions(){
      let linkOptions = new Object();
      this.linkOptions.forEach(option => {
        linkOptions[option] = this[option];
      })
      let newSerializedValue = btoa(JSON.stringify(linkOptions, (key, value) => value instanceof Function ? serializeFunction(value) : value));
      let newUrlSearchParam = replaceUrlSearchParameter(`table${this.tableId}`, newSerializedValue);
      if(this.drawOptionals.rewriteurl) history.replaceState(history.state, '', newUrlSearchParam)
    }

    loadLinkOptions(){
      let serializedOptions = '{}';
      location.search.slice(1).split('&').forEach(searchOption => {
        let split = searchOption.split('=')
        if(split[0] == `table${this.tableId}`){
          serializedOptions = atob(split.slice(1).join('='));
        }
      })
      let partialOptions = JSON.parse(serializedOptions, (key, value) => {
        if (!(value instanceof Array)  && value.toString().match(funRegex)) {
          return deserializeFunction(value)
        } else {
          return value
        }
      });
      return partialOptions;
      // this.redrawData():
    }

    deserializeOptions(serializedOptions){
      if(serializedOptions){
        return JSON.parse(atob(serializedOptions, (key, value) => {
          if (!(value instanceof Array)  && value.toString().match(funRegex)) {
            return deserializeFunction(value);
          } else {
            return value;
          }
        }));
      } else {
        return {};
      }
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
      this.tickedRows = this.options.tickedRows;
      this.redrawData();
    }

    /**
     * Called when table is added to DOM. Doesn't need to be called manually.
     */
    connectedCallback(){
      if(!this.root_document.body) this.root_document.body = document.createElement('body');
      if(!this.root_document.head) this.root_document.head = document.createElement('head');

      // this.tableId = this.root_document.querySelectorAll('.wgt-grid-container').length; //// TODO: check if multiple tables have consistantly different ids.
      this.classList.add(`table-id-${this.tableId}`);      
      this.classList.add('wgt-grid-container')
      if(!this.sortedData && this.data) this.sortedData = this.data.map(value => value);
      let height = this.getAttribute('height');
      if(height) this.style.maxHeight = height;
      let pageSize = this.getAttribute('page-size');
      if(pageSize) {
        this.pagination.pageSize = pageSize;
      }

      this.loadInitialOptions();
      drawTable(this);
    }
 
    loadInitialOptions(){
      let attributeOptions = this.deserializeOptions(this.getAttribute('options'));
      let linkOptions = this.loadLinkOptions();

      ((new Set(Object.keys(attributeOptions))).union(Object.keys(linkOptions))).forEach(option => {
        if(attributeOptions[option]){
          this.options[option] = attributeOptions[option];
        }
        if(linkOptions[option] && Object.keys(linkOptions[option]).length != 0){
          this.options[option] = linkOptions[option];
        }
      });
      console.log(this.options)

      this.loadPartialOptions(this.options);
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
      
      this.data = data.map(entry => {
        let tempRow = entry;
        delete tempRow['#include'];
        let result = {'#include': this.tickedRows.includes(JSON.stringify(tempRow)) ? 'x' : '', ...tempRow};
        console.log('include', result);
        return result;
      });
      // console.log(transformToGroupedData(data, ["BelID", "Belegdatum", "Lieferant", "Nettobetrag"]))
      this.sortedData = this.data.map(value => value);
      drawTable(this);
      this.loadInitialOptions();
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
      this.header.forEach(column => {
        if (this.elements.dataCells[column]) [].forEach.call(this.elements.dataCells[column], element => element.remove());
        if (this.drawOptionals.filter && this.elements.filterCells[column].firstChild.textContent != this.filter[column]) this.elements.filterCells[column].firstChild.textContent = this.filter[column];
        // this.elements.filterCells[column].firstChild.textContent = this.filter[column] ? this.filter[column] : '';

      }); 
      if (this.data.length > 0){
        let wasSelected = this.elements.pageChooser ? this.elements.pageChooser.classList.contains('selected') : false;
        this.displayedData = drawData(this);
        this.elements.pageChooser = createPageChooser(this, this.displayedData);
        if (this.drawOptionals.footer) createFooter(this, this.displayedData, this.elements.pageChooser);
        if (wasSelected) this.elements.pageChooser.classList.add('selected');
      }
    }

    redrawTable(){
      //this.sortedData = this.data.map(value => value);
      let partialOptions = {};
      Object.keys(this.options).forEach(option => {
        if(this.linkOptions.includes(option)){
          partialOptions[option] = this[option];
        }
      });
      drawTable(this);
      reapplySorting(this, partialOptions);
    }
  }

  return {regexFilter, textFilter, compareNumbers, compareText, chooseSortsCompareFn, defineCustomElement, TableComponent};
})()