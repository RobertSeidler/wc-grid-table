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
