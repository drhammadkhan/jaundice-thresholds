# Jaundice treatment thresholds

A tool from the [Evelina Neonatal Data Group](https://drhammadkhan.github.io/evelina-neonatal-data-group/). Live: https://drhammadkhan.github.io/jaundice-thresholds/

Choose a baby's gestational age (23 to 37 weeks, or 38 weeks and over) to see the phototherapy and exchange transfusion lines for neonatal jaundice, then add total serum bilirubin readings (µmol/litre) to see where each one falls: below the phototherapy line, between the two lines, or at or above the exchange transfusion line.

Click or tap the chart (or the Enlarge button) to open it full screen: a larger chart on any screen size, with a tap on any reading showing its exact distance from both lines. Press Esc or Close to return. On a touch phone held upright, the popup lays the chart out sideways (landscape); turn the phone anticlockwise to read it, and turning the phone switches to the normal landscape view.

Static site: no build step, no dependencies, nothing leaves the browser. Open `index.html`. Readings are not stored; refreshing the page clears them. Fonts (Fraunces and DM Mono, SIL Open Font License) are self-hosted in `fonts/`.

## Source of the numbers

The thresholds are a port of the NICE CG98 implementation tool *Treatment threshold graphs* (Excel workbook that accompanies the 2010 guideline *Jaundice in newborn babies under 28 days*; this copy was last saved in October 2015). `thresholds.js` reproduces the hidden "Data sheet" columns the workbook's chart plots:

- **Born at 23 to 37 weeks, gestation G:** phototherapy rises in a straight line from 40 at birth to `10 × G − 100` at 72 hours, then stays flat. Exchange transfusion rises from 80 to `10 × G` at 72 hours, then stays flat.
- **Born at 38 weeks or more:** a typed table at 6-hourly points (phototherapy 100 to 350 at 96 hours; exchange 100 to 450 at 42 hours), straight lines between points, flat after.
- Defined every 6 hours from 0 to 336 hours (14 days). Nothing is extrapolated.

Plotting readings, banding them (at or above a line counts as on that line) and showing how far above or below each line a reading is, in µmol/litre, are additions to the workbook.

### Checked against NICE

The thresholds were checked against the current NICE CG98 threshold table on 23 October 2026 and confirmed correct.

- NICE added a note in 2023 that assays from different manufacturers report different bilirubin values, and has said it will review thresholds for term babies. The tool's "About" section points to the current guideline.
- In the workbook's 38-weeks-and-over phototherapy column the values at 30, 42, 54, 66, 78 and 90 hours (212, 237, 262, 287, 312, 337) look like truncated .5 values. They are reproduced exactly as typed.
- Confirm NICE's terms for reusing its guideline content. This tool uses no NICE or NHS logos.

## Tests

```bash
node tests/test_thresholds.js
```

`tests/spreadsheet_expected.json` holds the workbook recalculated in LibreOffice for every gestational age choice (16 choices × 57 six-hourly rows × 2 lines). The test checks the web version against all 1,824 values, plus interpolation, banding and input validation.

**Disclaimer:** this tool supports, and does not replace, clinical judgement and current guidance. It is a reference aid, not a certified medical device and not a NICE product.
