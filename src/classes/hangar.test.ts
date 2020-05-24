import Hangar from "./Hangar";

describe("Hanger", () => {
  let hanger: Hangar;

  beforeEach(() => {
    hanger = new Hangar([
      { x: 0, z: 0 },
      { x: 0, z: 2 },
      { x: 2, z: 2 },
      { x: 2, z: 0 },
    ]);
  });

  it("calculates floor area", () => {
    expect(hanger.footprint).toBe(4);
    hanger.groundPoints.splice(-1, 1);
    expect(hanger.footprint).toBe(2);
  });

  it("calculates volume", () => {
    expect(hanger.volume).toBe(14);
  });
});
