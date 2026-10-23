// Checks thresholds.js against the original NICE workbook, recalculated in LibreOffice for every
// gestation choice (23-37 and >=38): 16 choices x 57 six-hourly rows, for both lines.
// Run: node tests/test_thresholds.js
'use strict';
var assert = require('assert');
var T = require('../thresholds.js');
var expected = require('./spreadsheet_expected.json');

var checked = 0;
Object.keys(expected).forEach(function (key) {
  var ga = key === '>=38' ? '>=38' : Number(key), e = expected[key];
  assert.strictEqual(e.hours.length, 57);
  e.hours.forEach(function (h, i) {
    assert.ok(Math.abs(T.phototherapy(ga, h) - e.phototherapy[i]) < 1e-9, 'phototherapy ' + key + ' wk @ ' + h + ' h: ' + T.phototherapy(ga, h) + ' vs ' + e.phototherapy[i]);
    assert.ok(Math.abs(T.exchange(ga, h) - e.exchange[i]) < 1e-9, 'exchange ' + key + ' wk @ ' + h + ' h: ' + T.exchange(ga, h) + ' vs ' + e.exchange[i]);
    checked += 2;
  });
});
assert.strictEqual(Object.keys(expected).length, 16);
assert.deepStrictEqual(T.GESTATIONS.length, 16);

// the spreadsheet only stores 6-hourly points; between them the chart draws straight lines
assert.strictEqual(T.phototherapy(23, 3), (40 + 47.5) / 2);
assert.strictEqual(T.phototherapy('>=38', 33), (212 + 225) / 2);
assert.strictEqual(T.exchange('>=38', 45), 450);
assert.strictEqual(T.exchange(30, 200), 300);       // flat after 72 h
assert.strictEqual(T.phototherapy(37, 336), 270);

// the band a reading falls in (at or above counts as on the line)
assert.strictEqual(T.assess(37, 72, 269.9).band, 'below');
assert.strictEqual(T.assess(37, 72, 270).band, 'phototherapy');
assert.strictEqual(T.assess(37, 72, 369.9).band, 'phototherapy');
assert.strictEqual(T.assess(37, 72, 370).band, 'exchange');
assert.strictEqual(T.assess('>=38', 0, 100).band, 'exchange');   // at birth both lines are 100 in the workbook

// how far above (+) or below (-) each line a reading is, in micromol/litre
var d = T.assess(37, 36, 250);                                 // lines at 155 and 225 (checked against the workbook above)
assert.strictEqual(d.fromPhototherapy, 95);
assert.strictEqual(d.fromExchange, 25);
d = T.assess(37, 36, 150);
assert.strictEqual(d.fromPhototherapy, -5);
assert.strictEqual(d.fromExchange, -75);
d = T.assess(37, 72, 270);
assert.strictEqual(d.fromPhototherapy, 0);                     // exactly on the phototherapy line
assert.strictEqual(d.fromExchange, -100);
d = T.assess('>=38', 96, 380);
assert.strictEqual(d.fromPhototherapy, 30);
assert.strictEqual(d.fromExchange, -70);
// the sign always agrees with the band
[23, 30, 37, '>=38'].forEach(function (ga) {
  [0, 5, 24, 71, 96, 200, 336].forEach(function (h) {
    [0, 60, 150, 250, 400, 600].forEach(function (v) {
      var a = T.assess(ga, h, v);
      assert.strictEqual(a.fromPhototherapy >= 0, a.band !== 'below');
      assert.strictEqual(a.fromExchange >= 0, a.band === 'exchange');
    });
  });
});

// bad input is refused rather than guessed at
assert.throws(function () { T.phototherapy(22, 10); }, RangeError);
assert.throws(function () { T.phototherapy(38, 10); }, RangeError);
assert.throws(function () { T.phototherapy(30.5, 10); }, RangeError);
assert.throws(function () { T.exchange(30, -1); }, RangeError);
assert.throws(function () { T.exchange(30, 337); }, RangeError);
assert.throws(function () { T.exchange(30, NaN); }, RangeError);

console.log('ok - ' + checked + ' spreadsheet values + interpolation, banding and input checks');
