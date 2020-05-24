import Hangar, { Point } from "./Hangar";

class Thing {
  position: Point;
}

class Window extends Thing {}
class Door extends Thing {}

class Room {
  public windows: Window[] = [];
  public doors: Door[] = [];

  constructor(public floor: Floor, public name: string) {}
}

class Floor {
  public rooms: Room[] = [];

  constructor(public structure: Structure) {}

  get area(): number {
    return this.structure.hangar.footprint;
  }

  addRoom(name: string) {
    this.rooms.push(new Room(this, name));
  }
}

export default class Structure {
  public floors: Floor[];

  constructor(public hangar: Hangar) {
    this.floors = [new Floor(this)];
  }
}
