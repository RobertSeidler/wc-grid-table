// let { MarkInput, fetchSelectCheckedValues, fetchCreateTableIfNotExists } = require("../../../marker-input/MarkInput.js");
const { TableComponent, defineCustomElement } = require('../wc-grid-table.js');
const { MarkerInputPlugin } = require('../../../marker-input/index.js');
const { ExportPlugin } = require('../../../wc-grid-table-xlsx-export/index.js');
// const { MarkerInputPlugin } = require('https://www.unpkg.com/wc-grid-table-marker-input@1.0.8/index.js');


defineCustomElement();

// const MarkerInputPlugin = {
//     name: "MarkerInputPlugin",
//     exec: async function(data) {
//         // console.log(this);
//         return await this.setupMarkInputs(data);
//     },
//     type: "data",
//     tableExtensions: {

//         /**
//          * Sets up the marker column, but only when all of the required attributes exist.
//          * @param {object} data - table data
//          * @returns {object} - table data
//          */
//         async setupMarkInputs(data) {
//             const requiredAttributes = {
//                 identifierField: this.getAttribute('marker-identifierfield'),
//                 databaseTable: this.getAttribute('marker-databasetable'),
//             };

//             const optionalAttributes = {
//                 database: this.getAttribute('marker-database') ? this.getAttribute('marker-database') : "MarkerDB",
//                 databaseuser: this.getAttribute('marker-databaseuser') ? this.getAttribute('marker-databaseuser') : "wiki",
//                 markerText: this.getAttribute('marker-markertext'),
//             };

//             if (Reflect.ownKeys(requiredAttributes).map((key) => requiredAttributes[key]).every((value) => (value == undefined ? false : true))) {
//                 // console.log(data);
//                 await fetchCreateTableIfNotExists(optionalAttributes.database, optionalAttributes.databaseuser, requiredAttributes.databaseTable);
//                 let result = this.generateMarkInputData(data, requiredAttributes, optionalAttributes);
//                 // console.log(result);
//                 return result;
//             } else {
//                 return data;
//             }
//         },

//         /**
//          * Creates a MarkInput element.
//          * @param {string} identifierField
//          * @param {string} identifierValue
//          * @param {string} tablename
//          * @param {string} database
//          * @param {string} dbuser
//          * @param {string} marker
//          * @param {boolean} checked
//          * @returns {string} - MarkInput outer html
//          */
//         createMarkInput(identifierField, identifierValue, tablename, database, dbuser, marker, checked) {
//             let markInput = document.createElement('mark-input');
//             markInput.setAttribute('identifierfield', identifierField);
//             markInput.setAttribute('identifiervalue', identifierValue);
//             if (tablename) markInput.setAttribute('databasetable', tablename);
//             if (database) markInput.setAttribute('database', database);
//             if (dbuser) markInput.setAttribute('databaseuser', dbuser);
//             if (marker) markInput.setAttribute('markertext', marker);
//             if (checked) markInput.toggleAttribute('checked', checked);
//             return markInput.outerHTML;
//         },

//         /**
//          * Generates the data for the table, which includes a row with MarkerInputs.
//          * @param {object} data - table data
//          * @param {{identifierField: string, databaseTable: string}} reqAttr - required MarkInput attributes
//          * @param {{database?: string, databaseuser?: string, markerText?: string}} optAttr - optional MarkInput attributes
//          * @returns {object} - table data
//          */
//         async generateMarkInputData(data, reqAttr, optAttr) {
//             let { identifierField, databaseTable } = reqAttr;
//             let { database, databaseuser, markerText } = optAttr;

//             // databaseTable = databaseTable ? databaseTable : "DefaultTable";
//             // markerText = markerText ? markerText : "jjj|nnn";

//             return fetchSelectCheckedValues(database, databaseuser, databaseTable, identifierField)
//                 .then((checkedData) => {
//                     return data.map((entry) => {
//                         let checked = checkedData.map((value) => encodeURIComponent(value.identifierValue)).includes(encodeURIComponent(entry[identifierField]).toString());

//                         return {
//                             'marker': this.createMarkInput(identifierField, encodeURIComponent(entry[identifierField]).toString(), databaseTable, database, databaseuser, markerText, checked),
//                             '#markiert': checked ? 'ja' : 'nein',
//                             ...entry,
//                         };
//                     });
//                 });
//         }
//     }
// }

// customElements.define('mark-input', MarkInput);

let table = document.createElement('wc-grid-table');

table.setAttribute('marker-identifierfield', 'Unternehmen');
table.setAttribute('marker-databasetable', 'Example2Test');

table.registerPlugin(MarkerInputPlugin);
table.registerPlugin(ExportPlugin);

// table.header = ["Artikelnummer", "Unternehmen", "Einzelpreis", "Rabattsatz"]
let currencyFormatter = (value, rowIndex, orgData) => (value != undefined && value != '' ? `${Number.parseFloat(value).toFixed(2)} €` : '');
let percentFormatter = (value, rowIndex, orgData) => (value != undefined ? `${Number.parseFloat(value).toFixed(2)} %` : '');
// let undefinedFormatter = (value, rowIndex, orgData) => (value == undefined || value == '') ? 0.00 : value;
table.formatter.Einzelpreis = [currencyFormatter];
table.formatter.Rabattsatz = [percentFormatter];

try {
    const debounce = require('lodash.debounce');
    table.setDebounceFn(debounce, [500, { leading: true, trailing: false, maxWait: 1000 }], [500, { leading: false, trailing: true, maxWait: 1000 }]);
    console.info('Optional Dependency lodash.debounce was loaded successfully.')
} catch (err) {
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