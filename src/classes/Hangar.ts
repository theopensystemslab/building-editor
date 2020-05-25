import ClipperLib from "clipper-fpoint";
import { computed, observable } from "mobx";
import * as THREE from "three";

export interface ClipperPoint {
  X: number;
  Y: number;
}

export interface Point {
  x: number;
  y?: number;
  z: number;
}

class Edge {
  public start: Point;
  public end: Point;

  public $start: THREE.Vector3;
  public $end: THREE.Vector3;
}

class Surface {
  public faces: THREE.Face3[];
  public $edges: Edge[];
  // extrude(delta: number) {}
  // shift(delta: number) {}
  // twist(angle: number) {}
  // split(cutPoints: Point[]) {}
}

// interface UserData {
//   surfaces: Surface[];
//   edges: Edge[];
// }
// class H extends THREE.Mesh {
//   public userData:UserData;
//   constructor() {
//     const geometry = new THREE.Geometry()
//     const material = new THREE.MeshBasicMaterial({ color: "red" })
//     super(geometry, material)
//     this.userData = {
//       surfaces: [],
//       edges: []
//     }
//   }
// }

class H {
  public mesh: THREE.Mesh;
  public surfaces: Surface[];

  constructor(public points: Point[]) {
    const geometry = new THREE.Geometry();
    const material = new THREE.MeshStandardMaterial();
    points.forEach((point) => {
      geometry.vertices.push(new THREE.Vector3(point.x, point.y || 0, point.z));
    });
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.userData.hanger = this;
  }
}

export default class Hangar {
  public surfaces: Surface[];

  public $geometry: THREE.Geometry = new THREE.Geometry();

  @observable points: Point[];

  constructor(_groundPoints: Point[], public height: number) {
    _groundPoints.forEach((gp) => {
      this.$geometry.vertices.push(new THREE.Vector3(gp.x, 0, gp.z));
    });
    this.$geometry.computeFaceNormals();
    this.$geometry.computeVertexNormals();
    // _groundPoints.map(({x,z}) => new THREE.Vector3(x,0,z))
    // this.points = [..._groundPoints, _groundPoints.map(({x,z}))];
  }

  private clipperPath(): ClipperPoint[] {
    return this.groundPoints.map(({ x: X, z: Y }) => ({ X, Y })).reverse();
  }

  @computed({ keepAlive: true })
  get groundPoints(): Point[] {
    return this.points.slice(0, this.points.length / 2);
  }

  @computed({ keepAlive: true })
  get footprint(): number {
    return ClipperLib.JS.AreaOfPolygon(this.clipperPath(), 1);
  }

  @computed({ keepAlive: true })
  get volume(): number {
    return this.footprint * this.height;
  }

  // public transform(...operations) {}

  // public move(position) {}
  // public rotate(angle) {}
  // public merge(with:Hangar) {}
}
