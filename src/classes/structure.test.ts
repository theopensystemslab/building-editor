import Hangar from "./Hangar";

const { structure } = new Hangar([
  { x: 0, z: 0 },
  { x: 0, z: 2 },
  { x: 2, z: 2 },
  { x: 2, z: 0 },
]);

describe("Structure", () => {
  describe("Floors", () => {
    it("has one floor", () => {
      expect(structure.floors.length).toEqual(1);
    });

    it("shares area with its Hangar's footprint", () => {
      expect(structure.floors[0].area).toEqual(structure.hangar.footprint);
    });

    describe("Rooms", () => {
      const floor = structure.floors[0];

      it("can add a room", () => {
        floor.addRoom("Bathroom");
        expect(floor.rooms.map((r) => r.name)).toEqual(["Bathroom"]);
      });
    });
  });
});
