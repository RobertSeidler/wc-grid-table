(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = debounce;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
// import {TableComponent, defineCustomElement} from './wc-grid-table.mjs';
const {defineCustomElement, TableComponent} = require('./wc-grid-table.js');
// const  = wc_grid_table.TableComponent;
// const defineCustomElement = wc_grid_table.defineCustomElement;

// console.log(defineCustomElement)
const debounce = require('lodash.debounce');

// console.log(debounce)
defineCustomElement(TableComponent)
// customElements.define('wc-grid-table', TableComponent);

let table = document.createElement('wc-grid-table') 

// table.header = ["Artikelnummer", "Name1", "Einzelpreis", "Rabattsatz"]
let currencyFormatter = (value, rowIndex, orgData) => `${Number.parseFloat(value).toFixed(2)} €`;
let percentFormatter = (value, rowIndex, orgData) => (value != undefined ? `${Number.parseFloat(value).toFixed(2)} %` : '');
// let undefinedFormatter = (value, rowIndex, orgData) => (value == undefined || value == '') ? 0.00 : value;
table.formatter.Einzelpreis = [currencyFormatter]
table.formatter.Rabattsatz = [percentFormatter]

fetch('./data.json')
  .then(response => response.json())
  .then(data => data.map(row => ({
    Artikelnummer: row["Artikelnummer"], 
    Name1: row["Name1"], 
    Einzelpreis: Number.parseFloat(row["Einzelpreis"]), 
    Rabattsatz: row["Rabattsatz"] ? Number.parseFloat(row["Rabattsatz"]) : undefined
  })))
  .then(data => (console.log(data), data))
  .then(data => setTimeout(() => table.setData(data.map(row => row)), 0));

// table.toggleAttribute('nofooter')
document.addEventListener("DOMContentLoaded", function(event) {
  document.querySelector("#con").append(table);
})

},{"./wc-grid-table.js":3,"lodash.debounce":1}],3:[function(require,module,exports){
module.exports = (function(){
  function regexFilter(filterInput, testValue){
    let negate = filterInput.substring(0, 3) === '!!!';
    filterInput = negate ? filterInput.substring(3) : filterInput;
    let matches = testValue.toString().match(new RegExp(filterInput, 'i'));
    let result = Boolean(matches) && matches.length > 0;
    return negate ? !result : result;
  }
   
  
  function textFilter(filterInput, testValue){
    let negate = filterInput.substring(0, 3) === '!!!';
    filterInput = negate ? filterInput.substring(3) : filterInput;
    let match = testValue.toString().toUpperCase().includes(filterInput.toUpperCase());
    return negate ? !match : match;
  }
  
  function compareNumbers(a, b){
    if (a == undefined) return 1;
    if (b == undefined) return -1;
    return a - b;
  }
  
  function compareText(a, b){
    let result = 0;
    if (a == undefined) return 1;
    if (b == undefined) return -1;
    if (a > b) result = -1;
    if (a < b) result = 1;
    return result;
  }
  
  function chooseSortsCompareFn(data, column){
    if(!Number.isNaN(data.reduce((col, cur) => (col += cur[column] != undefined ? Number.parseFloat(cur[column]) : 0), 0))){
      return compareNumbers
    } else {
      return compareText
    }
  }
  
  function defineCustomElement(TableComponent){
    customElements.define('wc-grid-table', TableComponent);
  }

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

  return {regexFilter, textFilter, compareNumbers, compareText, chooseSortsCompareFn, defineCustomElement, TableComponent};
})()


},{}]},{},[2]);
