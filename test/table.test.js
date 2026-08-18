const {compareNumbers, compareText, chooseSortsCompareFn, createSortCompareFn, defineCustomElement, TableComponent} = require('../src/wc-grid-table.js');
const {regexFilter, textFilter, compareFilter} = require('../src/filter-utils.js');


jest.mock('../src/wc-grid-table.css')

describe('compareNumbers', () => {
  // compareNumbers returns (b - a), so larger values sort first before applySorting may reverse.
  test('when first arg bigger then second return should be negative', () => {
    expect(compareNumbers(23, 22)).toBeLessThan(0);
    expect(compareNumbers(1.8, 0.9)).toBeLessThan(0);
    expect(compareNumbers(100, -12)).toBeLessThan(0);
    expect(compareNumbers(-32.9, -78)).toBeLessThan(0);
  });

  test('when first arg smaller then second should be positive', () => {
    expect(compareNumbers(22, 23)).toBeGreaterThan(0);
    expect(compareNumbers(0.2, 1)).toBeGreaterThan(0);
    expect(compareNumbers(-12.65, 100.12)).toBeGreaterThan(0);
    expect(compareNumbers(-198, -123)).toBeGreaterThan(0);
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
    expect(compareNumbers(1, '02')).toBeGreaterThan(0);
    expect(compareNumbers('0100', 100)).toEqual(0);
  });

  test('comma decimal separators are parsed as fractional numbers', () => {
    expect(compareNumbers('0,44', '0,16')).toEqual(compareNumbers(0.44, 0.16));
    expect(compareNumbers('0,07', '0,78')).toEqual(compareNumbers(0.07, 0.78));
    expect(compareNumbers('0,12', '0,12')).toEqual(0);
    expect(compareNumbers('1,50', '1.50')).toEqual(0);
    expect(compareNumbers('1.234,56', '1234.56')).toEqual(0);
    expect(compareNumbers('1,234.56', 1234.56)).toEqual(0);
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
    expect(compareText('', '')).toEqual(1);
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

describe('createSortCompareFn', () => {
  const rows = [
    {A: 1, B: 'x'},
    {A: 1, B: 'y'},
    {A: 2, B: 'x'},
  ];

  const table = {
    data: rows,
    customCompareNumbers: compareNumbers,
    customCompareText: compareText,
    customChooseSortsCompareFn: chooseSortsCompareFn,
  };

  const sortBy = (sortedBy) => rows.slice().sort(createSortCompareFn(table, sortedBy)).map(row => `${row.A}${row.B}`);

  test('secondary sorting decides ties of the primary column', () => {
    expect(sortBy([{col: 'A', dir: 'asc'}, {col: 'B', dir: 'asc'}])).toEqual(['2x', '1y', '1x']);
  });

  test('flipping the primary direction keeps the secondary order', () => {
    expect(sortBy([{col: 'A', dir: 'desc'}, {col: 'B', dir: 'asc'}])).toEqual(['1y', '1x', '2x']);
  });

  test('flipping the secondary direction only reorders ties', () => {
    expect(sortBy([{col: 'A', dir: 'asc'}, {col: 'B', dir: 'desc'}])).toEqual(['2x', '1x', '1y']);
  });

  test('empty values stay at the bottom in both directions', () => {
    const withEmpty = [{A: 1}, {A: ''}, {A: 2}];
    const emptyTable = Object.assign({}, table, {data: withEmpty});
    const order = (dir) => withEmpty
      .slice()
      .sort(createSortCompareFn(emptyTable, [{col: 'A', dir: dir}]))
      .map(row => row.A);

    expect(order('asc')).toEqual([2, 1, '']);
    expect(order('desc')).toEqual([1, 2, '']);
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
