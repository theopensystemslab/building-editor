import { Parser } from "expr-eval";
import zipObject from "lodash/zipObject";
const parser = new Parser();

// this does all the calculations found in the following spreadsheet, locally
// https://docs.google.com/spreadsheets/d/1aqtQjOjc3rRSgORzr-dsqRiP9KFoJOj9wr9nlM5N_6o/edit#gid=819770045

export const calculateEnergyFigures = (data, floorArea: number) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const ob = data.values.reduce((acc, curr, i) => {
    curr.map((col, j) => {
      acc[`${alphabet[j]}${i + 1}`] = col;
    });
    return acc;
  }, {});

  // overwrite this cell with the floorArea value... it's cheating but it works!
  ob["D2"] = floorArea;

  const [headings, ...rows] = data.values;

  const ob2 = rows.reduce((acc, curr, i) => {
    if (curr.length > 0) {
      const o = {
        $row: i + 2,
        ...zipObject(headings, curr),
      };
      acc.push(o);
    }
    return acc;
  }, [] as any);

  const ob3 = ob2.map((row) => {
    if (row["Variable calcs"].startsWith("=")) {
      try {
        const expr = parser.parse(row["Variable calcs"].slice(1));
        row.$expr = expr.toString();
        row.$val = ob[`D${row.$row}`] = expr.evaluate(ob);
      } catch (e) {}
    }
    return row;
  });

  return ob3;
};
