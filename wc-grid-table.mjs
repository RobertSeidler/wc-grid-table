export function regexFilter(filterInput, testValue){
  let negate = filterInput.substring(0, 3) === '!!!';
  filterInput = negate ? filterInput.substring(3) : filterInput;
  let matches = testValue.toString().match(new RegExp(filterInput, 'i'));
  let result = Boolean(matches) && matches.length > 0;
  return negate ? !result : result;
}

export function textFilter(filterInput, testValue){
  let negate = filterInput.substring(0, 3) === '!!!';
  filterInput = negate ? filterInput.substring(3) : filterInput;
  let match = testValue.toString().toUpperCase().includes(filterInput.toUpperCase());
  return negate ? !match : match;
}

export function compareNumbers(a, b){
  if (a == undefined) return 1;
  if (b == undefined) return -1;
  return a - b;
}

export function compareText(a, b){
  let result = 0;
  if (a == undefined) return 1;
  if (b == undefined) return -1;
  if (a > b) result = -1;
  if (a < b) result = 1;
  return result;
}

export function chooseSortsCompareFn(data, column){
  if(!Number.isNaN(data.reduce((col, cur) => (col += cur[column] != undefined ? Number.parseFloat(cur[column]) : 0), 0))){
    return compareNumbers
  } else {
    return compareText
  }
}

export function defineCustomElement(TableComponent){
  customElements.define('wc-grid-table', TableComponent);
}

export const TableComponent = (function(){
  function setUpSorting(element, column, table){
    element.addEventListener('click', (event) => {
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
        return table.sortOptions.chooseCompareFn(table.sortedData, column)(a[column], b[column])
      })
      table.redrawData()
    })
  }

  function createHeader(table){
    table.header.forEach( (column, columnIndex) => {
      let col_header = document.createElement('div');
      col_header.classList.add('header')
      col_header.classList.add(`column_${column}`)
      col_header.classList.add('cell')
      setUpSorting(col_header, column, table)
      col_header.innerHTML = column;
      table.append(col_header)
    });
  }

  function createFilter(table, header, filter){
    header.forEach(column => {
      let filter_container = document.createElement('div');
      let filter_input = document.createElement('input');
      filter_input.type = 'text';
      filter_input.classList.add('filter_input');
      filter_input.value = filter[column] ? filter[column] : '';
      filter_input.addEventListener('input', event => table.filterChanged.bind(table, column)(event))
      filter_container.classList.add('filter_cell', `filter_cell_${column}`);
      filter_container.append(filter_input);

      table.append(filter_container);
    })
  }

  function createFooter(table, data){
    let footer = document.createElement('div');
    footer.classList.add('footer')
    footer.style.gridColumn = `1 / ${table.header.length + 1}`

    let total_rows = document.createElement('div');
    total_rows.innerHTML = `Total: ${data.length}`;
    total_rows.classList.add('footer_cell', 'cell')
    footer.append(total_rows)

    table.append(footer)
  }

  function fillData(table, data){
    data.forEach((row, rowIndex) => {
      table.header.forEach( (column, columnIndex) => {
        let cell = document.createElement('div');
        cell.classList.add('cell', 'data_cell', `column_${column}`, `row_${rowIndex}`, `zebra_${rowIndex % 2}`)
        // cell.classList.add()
        // cell.classList.add()
        cell.innerHTML = row[column] != undefined ? row[column] : '';
        table.append(cell)
      })
    })
  }

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
    let styleElement = document.createElement('style');
    styleElement.type = "text/css";

    header.forEach(column => {
      conditionalColumnStyle.forEach((conditionalStyle) => {
        if(conditionalStyle.condition(data, column)){
          styleElement.innerHTML += `
            div.column_${column}.data_cell {
              ${conditionalStyle.styles.join('\n')}
            }
          `
        }
      })
    })

    table.root_document.querySelector('head').append(styleElement);
  }

  function applyFilter(data, header, filter, options){
    return data.filter(row => 
      header.map(column => {
        if(filter[column]){
          return options.filterType(filter[column], row[column]);
        }
        else return true;
      }).reduce((col, cur) => (col && cur), true)
    )
  }

  function applyFormatter(data, header, formatter, options){
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
  }

  class TableComponent extends HTMLElement{
    constructor(){
      super();

      this.useDefaultOptions();
    }

    useDefaultOptions(){
      this.root_document = document;

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
        
      }

      this.filter = {}
      this.filterOptions = {
        "filterType": regexFilter 
        // "filterType": textFilter
      }

      this.sortedBy = [];
      this.sortOptions = {
        "chooseCompareFn": chooseSortsCompareFn
      }
      
      this.drawOptionals = {}
    }

    connectedCallback(){
      // this.data = this.getAttribute('data')
      this.classList.add('grid-container')
      if(!this.sortedData && this.data) this.sortedData = this.data;
      this.drawTable()
    }

    setData(data){
      this.data = data;
      this.sortedData = data;
      this.drawTable();
    }

    getData(){
      return this.data
    }

    filterChanged(column, event){
      this.filter[column] = event.srcElement.value;
      // this.drawTable()
      this.redrawData();
      // document.querySelector(`.filter_cell_${column} > input`).focus()
    }

    drawTable(){
      this.drawOptionals = {
        header: !this.hasAttribute('noheader'),
        filter: !this.hasAttribute('nofilter'),
        footer: !this.hasAttribute('nofooter')
      }
      
      this.innerHTML = "";      
      if(!this.sortedData) this.sortedData = this.data;

      if(!this.header && this.data){
        this.header = generateHeader(this.data);
      }

      if(this.drawOptionals.header && this.header){
        this.style.gridTemplateColumns = `repeat(${this.header.length}, max-content)`;
        createHeader(this);
      }
      
      if(this.drawOptionals.filter && this.header){
        createFilter(this, this.header, this.filter);
      }

      if (this.data){
        this.displayedData = this.drawData();
        if (this.drawOptionals.footer) createFooter(this, this.displayedData);
      }
    }

    drawData(){
      applyConditionalColumnStyling(this, this.sortedData, this.header, this.conditionalColumnStyle, this.conditionalColumnOptions);
      let formattedData = applyFormatter(this.sortedData, this.header, this.formatter, this.formatterOptions);
      let filteredData = applyFilter(formattedData, this.header, this.filter, this.filterOptions);
      this.style.gridTemplateRows = `${
        this.drawOptionals.header ? 'max-content' : ''} ${
          this.drawOptionals.filter ? 'max-content' : ''} repeat(${filteredData.length}, max-content) ${
            this.drawOptionals.footer ? 'max-content' : ''}`; 
      fillData(this, filteredData);
      return filteredData;
    }

    redrawData(){
      let dataElements = this.root_document.querySelectorAll('div.data_cell, div.footer');
      dataElements.forEach(element => this.removeChild(element), this);
      if (this.data){
        this.displayedData = this.drawData();
        if (this.drawOptionals.footer) createFooter(this, this.displayedData);
      }
    }
  }

  return TableComponent;
})()



