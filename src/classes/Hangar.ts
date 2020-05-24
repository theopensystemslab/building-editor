import ClipperLib from "clipper-fpoint";
import { computed, observable } from "mobx";
import Structure from "./Structure";

export interface ClipperPoint {
  X: number;
  Y: number;
}

export interface Point {
  x: number;
  z: number;
}

export default class Hangar {
  private height: number = 3.5;
  public structure: Structure;

  @observable groundPoints: Point[];

  constructor(_groundPoints: Point[]) {
    this.groundPoints = _groundPoints;
    this.structure = new Structure(this);
  }

  private clipperPath(): ClipperPoint[] {
    return this.groundPoints.map(({ x: X, z: Y }) => ({ X, Y })).reverse();
  }

  @computed({ keepAlive: true })
  get footprint(): number {
    return ClipperLib.JS.AreaOfPolygon(this.clipperPath(), 1);
  }

  @computed({ keepAlive: true })
  get volume(): number {
    return this.footprint * this.height;
  }
}
