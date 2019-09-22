import {TableComponent, defineCustomElement} from './wc-grid-table.mjs';

defineCustomElement(TableComponent)
// customElements.define('wc-grid-table', TableComponent);

let table = document.createElement('wc-grid-table') 

// table.header = ["Artikelnummer", "Name1", "Einzelpreis", "Rabattsatz"]
let currencyFormatter = (value, rowIndex, orgData) => `${Number.parseFloat(value).toFixed(2)} €`;
let percentFormatter = (value, rowIndex, orgData) => `${Number.parseFloat(value).toFixed(2)} %`;
let undefinedFormatter = (value, rowIndex, orgData) => (value == undefined || value == '') ? 0.00 : value;
table.formatter.Einzelpreis = [undefinedFormatter, currencyFormatter]
table.formatter.Rabattsatz = [undefinedFormatter, percentFormatter]

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

document.querySelector("#con").append(table)