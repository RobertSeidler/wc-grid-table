const testNumberRegex = /^(-{0,1}[0-9]{1,3}(?:[\.|,]{0,1}[0-9]{3})*[\.|\,]{0,1}[0-9]*)\s{0,1}\D*$/i;

/**
 * Parse a numeric string that may use `,` or `.` as decimal separator
 * (and the other as thousands separator). The last separator is treated
 * as the decimal mark, so both "0,07" and "1.234,56" as well as "0.07"
 * and "1,234.56" are handled.
 * @param {String} numStr
 * @returns {Number}
 */
function parseLocalizedNumber(numStr) {
    const lastComma = numStr.lastIndexOf(',');
    const lastDot = numStr.lastIndexOf('.');
    const decimalPos = Math.max(lastComma, lastDot);

    if (decimalPos === -1) {
        return Number.parseFloat(numStr);
    }

    const integerPart = numStr.slice(0, decimalPos).replace(/[.,]/g, '');
    const decimalPart = numStr.slice(decimalPos + 1);
    return Number.parseFloat(integerPart + '.' + decimalPart);
}

/**
 * Tests if a value is a number, by matching against a Regex.
 * On success the parsed number is returned.
 * On undefined an empty String is returned.
 * Otherwise the testStr is returned unparsed.
 * @param {String} testStr
 * @returns {String | Number}
 */
function tryTransformToNumber(testStr) {
    if (testStr == undefined) return "";
    let matches = testNumberRegex.exec(testStr.toString());
    if (matches) {
        return parseLocalizedNumber(matches[1]);
    }
    return testStr;
}

module.exports = { parseLocalizedNumber, tryTransformToNumber };
