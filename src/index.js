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
let currencyFormatter = (value, rowIndex, orgData) => (value != undefined && value != '' ? `${Number.parseFloat(value).toFixed(2)} €` : '');
let percentFormatter = (value, rowIndex, orgData) => (value != undefined ? `${Number.parseFloat(value).toFixed(2)} %` : '');
// let undefinedFormatter = (value, rowIndex, orgData) => (value == undefined || value == '') ? 0.00 : value;
table.formatter.Einzelpreis = [currencyFormatter];
table.formatter.Rabattsatz = [percentFormatter];

table.setDebounceFn(debounce, [500, {leading: true, trailing: false, maxWait: 1000}], [500, {leading: false, trailing: true, maxWait: 1000}]);

fetch('./data.json')
  .then(response => response.json())
  .then(data => data.map(row => ({
    Artikelnummer: row["Artikelnummer"], 
    Unternehmen: row["Unternehmen"], 
    Einzelpreis: Number.parseFloat(row["Einzelpreis"]), 
    Rabattsatz: row["Rabattsatz"] ? Number.parseFloat(row["Rabattsatz"]) : undefined
  })))
  .then(data => (console.log(data), data))
  .then(data => setTimeout(() => table.setData(data.map(row => row)), 0));

// table.toggleAttribute('nofooter')
document.addEventListener("DOMContentLoaded", function(event) {
  document.querySelector("#con").append(table);
})
