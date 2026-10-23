/*
 * Neonatal jaundice treatment thresholds (total serum bilirubin, micromol/litre).
 * A port of the NICE CG98 implementation tool "Treatment threshold graphs" (Excel, 2010 guideline,
 * file last saved October 2015): the hidden "Data sheet" columns D and E, which the chart plots.
 *
 *   Born under 38 weeks (23-37):   gestation G in completed weeks
 *     phototherapy: 40 at birth, rising in a straight line to (10 x G - 100) at 72 hours, then flat
 *     exchange:     80 at birth, rising in a straight line to (10 x G)       at 72 hours, then flat
 *   Born at 38 weeks or more:       typed table at 6-hourly points, straight lines between them
 *
 * The workbook defines values every 6 hours from 0 to 336 hours (14 days). Nothing is extrapolated.
 * These numbers have NOT been checked against the current NICE CG98 threshold table.
 */
(function (root) {
  'use strict';

  var MAX_HOURS = 336;
  var STEP = 6;

  // >= 38 weeks, exactly as typed in the workbook (columns I and J). Values at 30, 42, 54, 66, 78, 90 h
  // phototherapy appear to be truncated (212, 237, ...) rather than rounded (212.5, 237.5, ...).
  var GE38_PHOTO = [100, 125, 150, 175, 200, 212, 225, 237, 250, 262, 275, 287, 300, 312, 325, 337, 350];
  var GE38_EXCH = [100, 150, 200, 250, 300, 350, 400, 450];

  var GESTATIONS = [];
  for (var g = 23; g <= 37; g++) GESTATIONS.push(g);
  GESTATIONS.push('>=38');

  /** Piecewise-linear lookup in a 6-hourly table; flat after the last point. */
  function fromTable(points, hours) {
    var i = hours / STEP, lo = Math.floor(i);
    if (lo >= points.length - 1) return points[points.length - 1];
    return points[lo] + (points[lo + 1] - points[lo]) * (i - lo);
  }

  function check(gestation, hours) {
    var ok = gestation === '>=38' || (Number.isInteger(gestation) && gestation >= 23 && gestation <= 37);
    if (!ok) throw new RangeError('gestation must be a whole number of weeks from 23 to 37, or ">=38"');
    if (typeof hours !== 'number' || !isFinite(hours) || hours < 0 || hours > MAX_HOURS) {
      throw new RangeError('hours must be between 0 and ' + MAX_HOURS);
    }
  }

  function phototherapy(gestation, hours) {
    check(gestation, hours);
    if (gestation === '>=38') return fromTable(GE38_PHOTO, hours);
    var top = gestation * 10 - 100;
    return hours >= 72 ? top : 40 + (top - 40) * (hours / 72);
  }

  function exchange(gestation, hours) {
    check(gestation, hours);
    if (gestation === '>=38') return fromTable(GE38_EXCH, hours);
    var top = gestation * 10;
    return hours >= 72 ? top : 80 + (top - 80) * (hours / 72);
  }

  /** Where a bilirubin level sits against the two lines at a given age. */
  function assess(gestation, hours, tsb) {
    var p = phototherapy(gestation, hours), e = exchange(gestation, hours);
    var band = tsb >= e ? 'exchange' : tsb >= p ? 'phototherapy' : 'below';
    return { phototherapy: p, exchange: e, band: band };
  }

  /** The 6-hourly points the workbook plots, for one gestation: [{hours, phototherapy, exchange}, ...]. */
  function table(gestation) {
    var rows = [];
    for (var h = 0; h <= MAX_HOURS; h += STEP) rows.push({ hours: h, phototherapy: phototherapy(gestation, h), exchange: exchange(gestation, h) });
    return rows;
  }

  var api = { MAX_HOURS: MAX_HOURS, GESTATIONS: GESTATIONS, phototherapy: phototherapy, exchange: exchange, assess: assess, table: table };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JAUNDICE = api;
})(typeof window !== 'undefined' ? window : globalThis);
