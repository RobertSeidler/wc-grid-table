(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
// For more information about browser field, check out the browser field at https://github.com/substack/browserify-handbook#browser-field.

var styleElementsInsertedAtTop = [];

var insertStyleElement = function(styleElement, options) {
    var head = document.head || document.getElementsByTagName('head')[0];
    var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];

    options = options || {};
    options.insertAt = options.insertAt || 'bottom';

    if (options.insertAt === 'top') {
        if (!lastStyleElementInsertedAtTop) {
            head.insertBefore(styleElement, head.firstChild);
        } else if (lastStyleElementInsertedAtTop.nextSibling) {
            head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
        } else {
            head.appendChild(styleElement);
        }
        styleElementsInsertedAtTop.push(styleElement);
    } else if (options.insertAt === 'bottom') {
        head.appendChild(styleElement);
    } else {
        throw new Error('Invalid value for parameter \'insertAt\'. Must be \'top\' or \'bottom\'.');
    }
};

module.exports = {
    // Create a <link> tag with optional data attributes
    createLink: function(href, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var link = document.createElement('link');

        link.href = href;
        link.rel = 'stylesheet';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            link.setAttribute('data-' + key, value);
        }

        head.appendChild(link);
    },
    // Create a <style> tag with optional data attributes
    createStyle: function(cssText, attributes, extraOptions) {
        extraOptions = extraOptions || {};

        var style = document.createElement('style');
        style.type = 'text/css';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            style.setAttribute('data-' + key, value);
        }

        if (style.sheet) { // for jsdom and IE9+
            style.innerHTML = cssText;
            style.sheet.cssText = cssText;
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
        } else if (style.styleSheet) { // for IE8 and below
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
            style.styleSheet.cssText = cssText;
        } else { // for Chrome, Firefox, and Safari
            style.appendChild(document.createTextNode(cssText));
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
        }
    }
};

},{}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
const {defineCustomElement} = require('../wc-grid-table.js');

defineCustomElement()

let table = document.createElement('wc-grid-table') 

// table.header = ["Artikelnummer", "Unternehmen", "Einzelpreis", "Rabattsatz"]
let currencyFormatter = (value, rowIndex, orgData) => (value != undefined && value != '' ? `${Number.parseFloat(value).toFixed(2)} €` : '');
let percentFormatter = (value, rowIndex, orgData) => (value != undefined ? `${Number.parseFloat(value).toFixed(2)} %` : '');
// let undefinedFormatter = (value, rowIndex, orgData) => (value == undefined || value == '') ? 0.00 : value;
table.formatter.Einzelpreis = [currencyFormatter];
table.formatter.Rabattsatz = [percentFormatter];

try{
  const debounce = require('lodash.debounce');
  table.setDebounceFn(debounce, [500, {leading: true, trailing: false, maxWait: 1000}], [500, {leading: false, trailing: true, maxWait: 1000}]);
  console.info('Optional Dependency lodash.debounce was loaded successfully.')
} catch(err){
  console.error(err)
  console.warn('Optional Dependency lodash.debounce doesn\'t seem to be installed, so event functions are not going to be debounced.');
}


fetch('../data.json')
  .then(response => response.json())
  .then(data => (console.log(data), data))
  .then(data => setTimeout(() => table.setData(data.map(row => row)), 0));

// table.toggleAttribute('nofooter')
document.addEventListener("DOMContentLoaded", function(event) {
  document.querySelector("#con").append(table);
})

},{"../wc-grid-table.js":5,"lodash.debounce":2}],4:[function(require,module,exports){
var css = "/* body {\r\n  font: arial, sans-serif;\r\n} */\n.wgt-grid-container {\n  display: grid;\n  position: absolute;\n  max-height: 500px;\n  overflow-y: scroll;\n  background: lightgray;\n  /* grid-gap: 1px; */\n  /* grid-row-gap: 2px; */\n  grid-column-gap: 2px;\n  border: 1px solid lightgray;\n}\n.wgt-header {\n  font-weight: bold;\n  position: sticky;\n  top: 0px;\n  border-bottom: 1px solid lightgray;\n}\n.wgt-filter_cell {\n  position: sticky;\n  top: 40px;\n}\n.wgt-filter_input {\n  box-sizing: border-box;\n  width: 100%;\n  height: 100%;\n  text-align: center;\n  padding-left: 5px;\n  padding-right: 5px;\n  font-size: 1rem;\n}\n.wgt-cell {\n  box-sizing: border-box;\n  font-size: 1rem;\n  padding-left: 20px;\n  padding-right: 20px;\n  padding-top: 10px;\n  padding-bottom: 10px;\n  background: white;\n  /* border: 2px solid lightgray; */\n}\n.wgt-zebra_1 {\n  background: white;\n}\n.wgt-zebra_0 {\n  background: rgb(230, 230, 230);\n}\n.wgt-footer {\n  display: grid;\n  position: sticky;\n  bottom: 0px;\n  background: white;\n  border-top: 1px solid lightgray;\n  grid-template-rows: 1fr;\n  grid-template-columns: 1fr 1fr 1fr;\n}\n.wgt-footer_cell {\n  border-right: 1px solid lightgray;\n}\n"; (require("browserify-css").createStyle(css, { "href": "src\\wc-grid-table.css" }, { "insertAt": "bottom" })); module.exports = css;
},{"browserify-css":1}],5:[function(require,module,exports){
/**
 * Project: wc-grid-table
 * Repository: https://github.com/RobertSeidler/wc-grid-table
 * Auther: Robert Seidler
 * Email: Robert.Seidler1@googlemail.com 
 * License: ISC
 */

try{
  var css = require('./wc-grid-table.css');
} catch(err){
  console.warn('browserify-css require failed. You might need to link wc-grid-table.css.')
}


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
    table.header.forEach( (column, columnIndex) => {
      let col_header = document.createElement('div');
      col_header.classList.add('wgt-header')
      col_header.classList.add(`wgt-column_${column}`)
      col_header.classList.add('wgt-cell')
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


},{"./wc-grid-table.css":4}]},{},[3]);
