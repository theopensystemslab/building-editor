import { calculateEnergyFigures } from "./energyCalculator";

const data = {
  range: "'SWC Energy calculator'!A1:E24",
  majorDimension: "ROWS",
  values: [
    ["Name", "Identifier", "SWC Constants", "Variable calcs", "Units"],
    [
      "Gross internal Area (from dashboard)",
      "=Dashboard!$B$19",
      "",
      "=Dashboard!$D$19",
      "m2",
    ],
    ["DHW Demand ", "", 30, "=D2*C3", "Kwh/m2/a"],
    [],
    ["Space Heating Demand ", "", 15, "=D2*C5", "Kwh/m2/a"],
    [],
    ["Total Heating Demand ", "", 45, "=D2*C7", "Kwh/m2/a"],
    [],
    ["Fresh Air Requirment ", "", 0.3, "=D2*C9*2.5", "m3"],
    [],
    ["Embodied Co2 ", "", 15, "=D2*C11", "Kg/Co2/m2 "],
    [],
    ["Operational Co2 ", "", 20, "=D2*C13", "Kg/Co2/m2 "],
    [],
    ["Primary Energy Demand ", "", 120, "=D2*C15", "Kwh/m2/a"],
    [],
    ["Generation Energy ", "", 60, "=D2*C17", "Kwh/m2/a"],
    [],
    ["Annual running costs", "Identifier", "", "Variable calcs", "Units"],
    ["Estimated DHW Running Costs ", "", "", "=D3*0.16", "€uros"],
    ["Estimated Heating Running Costs ", "", "", "=D5*0.16", "€uros"],
    ["Estimated Electric Running Costs ", "", "", "=D2*0.16", "€uros"],
    ["Total Running Costs ", "", "", "=D21+D22+D20*0.16", "€uros"],
  ],
};

it("runs google sheets logic locally", () => {
  expect(
    calculateEnergyFigures(data, 80).find(
      (r) => r.Name === "Total Running Costs "
    ).$val
  ).toEqual(266.24);

  expect(
    calculateEnergyFigures(data, 123.8).find(
      (r) => r.Name === "Total Running Costs "
    ).$val
  ).toEqual(412.0064);
});
