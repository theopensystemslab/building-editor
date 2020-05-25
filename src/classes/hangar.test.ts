import Hangar from "./Hangar";

describe("hangar", () => {
  let hangar: Hangar;

  beforeEach(() => {
    hangar = new Hangar(
      [
        { x: 0, z: 0 },
        { x: 0, z: 2 },
        { x: 2, z: 2 },
        { x: 2, z: 0 },
      ],
      5
    );
  });

  it("has six faces", () => {
    expect(hangar.surfaces.length).toBe(6);
  });

  it("calculates floor area", () => {
    expect(hangar.footprint).toBe(4);
    hangar.groundPoints.splice(-1, 1);
    expect(hangar.footprint).toBe(2);
  });

  it("calculates volume", () => {
    expect(hangar.volume).toBe(20);
  });

  // it("can apply transformations", () => {
  //   expect(
  //     hangar
  //       .transform(
  //         operations.add.single.expand(10),
  //         operations.add.single.expand(-10)
  //       )
  //       .footprint.toBe(100)
  //   );
  // });
});
