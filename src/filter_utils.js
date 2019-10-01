/**
 * Transform the filter input into a RegExp, to let the user have a powerfull way to filter in the table.
 * Only rows where the tested value matches the RegExp, get displayed. 
 * Additionally you can prepend three exclamation marks ('!!!') to negate the RegExp, so that only rows that
 * don't match the RegExp are displayed. This is the default filter function.
 * This function can be replaced by supplying your own functions to TableComponent.filterOperations.
 * 
 * @param {string} filterInput the value of the filter text input field.
 * @param {string} testValue the table value to validate against.
 */
function regexFilter(negate, filterInput, testValue){
  // let negate = filterInput.substring(0, 3) === '!!!';
  // filterInput = negate ? filterInput.substring(3) : filterInput;
  let result = false;
  if(testValue != undefined){
    let matches = testValue.toString().match(new RegExp(filterInput, 'i'));
    result = Boolean(matches) && matches.length > 0;
  }
  return negate ? !result : result;
}
  
/**
 * Test the filter input string with includes (case is ignored) against the table value.
 * Only rows where the filter input is a substring of the tested value.
 * Additionally you can prepend three exclamation marks ('!!!') to negate the outcome, 
 * so that only rows that are not included in the table value are displayed.
 * This function can replace regexFilter by supplying it to TableComponent.filterOperations or overwriting
 * regexFilter before use.
 * 
 * @param {string} filterInput the value of the filter text input field.
 * @param {string} testValue the table value to validate against.
 */
function textFilter(negate, filterInput, testValue){
  // let negate = filterInput.substring(0, 3) === '!!!';
  // filterInput = negate ? filterInput.substring(3) : filterInput;
  let result = false;
  if(testValue != undefined){
    result = testValue.toString().toUpperCase().includes(filterInput.toUpperCase());
  }
  return negate ? !result : result;
}

function compareFilter(operation, filterInput, testValue){
  let result = false;
  if(testValue != undefined){
    try{
      result = operation(Number.parseFloat(filterInput), Number.parseFloat(testValue));
    } catch (err){
      result = operation(filterInput.toString(), testValue.toString());
    }
  }
  return result;
}

module.exports = {regexFilter, textFilter, compareFilter};