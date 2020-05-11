const [WIDTH_MM, LENGTH_MM] = [5700, 1200];

type Unit = "mm" | "cm" | "m";

const grid = (units: Unit = "mm") => {
  let divisor = 1;

  switch (units) {
    case "m":
      divisor = 1000.0;
      break;
    case "cm":
      divisor = 10.0;
      break;
  }

  return {
    units,
    x: WIDTH_MM / divisor,
    z: LENGTH_MM / divisor,
  };
};

export default grid;
