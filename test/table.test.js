const {compareNumbers, compareText, chooseSortsCompareFn, defineCustomElement, TableComponent} = require('../src/wc-grid-table.js');
const {regexFilter, textFilter, compareFilter} = require('../src/filter-utils.js');


jest.mock('../src/wc-grid-table.css')

describe('compareNumbers', () => {
  test('when first arg bigger then second return should be positive', () => {
    expect(compareNumbers(23, 22)).toBeGreaterThan(0);
    expect(compareNumbers(1.8, 0.9)).toBeGreaterThan(0);
    expect(compareNumbers(100, -12)).toBeGreaterThan(0);
    expect(compareNumbers(-32.9, -78)).toBeGreaterThan(0);
  });

  test('when first arg smaller then second should be negative', () => {
    expect(compareNumbers(22, 23)).toBeLessThan(0);
    expect(compareNumbers(0.2, 1)).toBeLessThan(0);
    expect(compareNumbers(-12.65, 100.12)).toBeLessThan(0);
    expect(compareNumbers(-198, -123)).toBeLessThan(0);
  });

  test('when equal, should return 0', () => {
    expect(compareNumbers(22, 22)).toEqual(0);
    expect(compareNumbers(0, 0)).toEqual(0);
    expect(compareNumbers(-0.3, -0.3)).toEqual(0);
  });

  test('undefined values are supposed to always be "biggest"', () => {
    expect(compareNumbers(undefined, 10.5)).toBeGreaterThan(0);
    expect(compareNumbers(0, undefined)).toBeLessThan(0);
  });

  test('type mismatches should compare as usual, numerical', () => {
    expect(compareNumbers(1, '02')).toBeLessThan(0);
    expect(compareNumbers('0100', 100)).toEqual(0);
  });
});

describe('compareText', () => {
  test('when first arg "earlier" then second return should be positive', () => {
    expect(compareText('001', '234')).toBeGreaterThan(0);
    expect(compareText('test', 'zest')).toBeGreaterThan(0);
    expect(compareText('', ' sa')).toBeGreaterThan(0);
    expect(compareText('0', '78')).toBeGreaterThan(0);
  });

  test('when first arg "later" then second should be negative', () => {
    expect(compareText('234', '001')).toBeLessThan(0);
    expect(compareText('zest', 'test')).toBeLessThan(0);
    expect(compareText('a', 'A')).toBeLessThan(0);
    expect(compareText('198', '0')).toBeLessThan(0);
  });

  test('when equal, should return 0', () => {
    expect(compareText('22', '22')).toEqual(0);
    expect(compareText('test', 'test')).toEqual(0);
    expect(compareText('', '')).toEqual(0);
  });

  test('undefined values are supposed to always be "biggest"', () => {
    expect(compareText(undefined, 'test')).toBeGreaterThan(0);
    expect(compareText(' ', undefined)).toBeLessThan(0);
  });

  test('type mismatches should compare as usual, alphabetic', () => {
    expect(compareText(12, '012')).toBeLessThan(0);
    expect(compareText([1, 2, 3], '1,2,3')).toEqual(0);
  });
});


describe('regexFilter', () => {
  test('basic examples', () => {
    expect(regexFilter(false, '105', '00AA105GH00')).toBe(true);
    expect(regexFilter(false, 'AA0', '00AA105GH00')).toBe(false);
    expect(regexFilter(true, '105', '00AA105GH00')).toBe(false);
    expect(regexFilter(true, 'AA0', '00AA105GH00')).toBe(true);
    expect(regexFilter(false, 'GH00$', '00AA105GH00')).toBe(true);
    expect(regexFilter(true, 'GH00$', '00AA105GH00')).toBe(false);
    expect(regexFilter(false, '^00A', '00AA105GH00')).toBe(true);
    expect(regexFilter(true, '^00A', '00AA105GH00')).toBe(false);
    expect(regexFilter(false, '^0A', '00AA105GH00')).toBe(false);
    expect(regexFilter(true, '^0A', '00AA105GH00')).toBe(true);
    expect(regexFilter(true, '^00AA105GH00$', '00AA105GH00')).toBe(false);
    expect(regexFilter(false, '^00AA105GH00$', '00AA105GH00')).toBe(true);
    expect(regexFilter(true, '^00.*00$', '00AA105GH00')).toBe(false);
    expect(regexFilter(false, '^00.*00$', '00AA105GH00')).toBe(true);
  });

  test('special cases', () => {
    expect(regexFilter(false, '', '')).toBe(true);
    expect(regexFilter(false, ' ', '')).toBe(false);
    expect(regexFilter(false, '12', 12.66)).toBe(true);
    // regex not escaped square bracket -> character class
    expect(regexFilter(false, '[1,2,3,4]', [1, 2, 3, 4])).toBe(true);
    // regex litteral square brackets; dont get rendered on Array.toString(); so it's removed in both args.
    expect(regexFilter(false, '\[1,2,3,4\]', [1, 2, 3, 4])).toBe(true);
    // regex escaped square brackets; dont get rendered on Array.toString()
    expect(regexFilter(false, '\\[1,2,3,4\\]', [1, 2, 3, 4])).toBe(false);
    expect(regexFilter(false, '1,2,3,4', [1, 2, 3, 4])).toBe(true);
  })

  test('RegExp special characters', () => {
    expect(regexFilter(false, '00$', '00$')).toBe(false);
    expect(regexFilter(false, '00\\$', '00$')).toBe(true);
  });
});

describe('textFilter', () => {});

describe('compareFilter', () => {});
