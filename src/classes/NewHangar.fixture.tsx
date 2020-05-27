import { OrbitControls } from "drei";
import React from "react";
import { Canvas } from "react-three-fiber";
import * as THREE from "three";
import { pointsToThreeShape } from "../utils";

export interface Point {
  x: number;
  y?: number;
  z: number;
}

// class Face extends THREE.Face3 {
//   constructor(
//     public surfaceIndex: number,
//     public axis: "x" | "y" | "z",
//     a: number,
//     b: number,
//     c: number,
//     normal?: THREE.Vector3,
//     color?: THREE.Color,
//     materialIndex?: number
//   ) {
//     super(a, b, c, normal, color, materialIndex);
//   }
// }

const faceUtils = function () {};
faceUtils.vertexHash = function (geometry) {
  geometry.vertexHash = [];
  var faces = geometry.faces;
  var vLen = geometry.vertices.length;
  for (var i = 0; i < vLen; i++) {
    geometry.vertexHash[i] = [];
    for (var f in faces) {
      if (faces[f].a === i || faces[f].b === i || faces[f].c === i) {
        geometry.vertexHash[i].push(faces[f]);
      }
    }
  }
};

faceUtils.prototype.getCoplanar = function (
  maxAngle,
  geometry,
  face,
  clamp,
  out,
  originFace
) {
  if (clamp === undefined) {
    clamp = true;
  }
  if (this.originFace === undefined) {
    this.originFace = face;
  }
  if (this.pendingRecursive === undefined) {
    this.pendingRecursive = 0;
  }
  this.result = out;
  if (out === undefined) {
    this.result = { count: 0 };
  }
  if (geometry.vertexHash === undefined) {
    faceUtils.vertexHash(geometry);
  }
  this.pendingRecursive++;
  var vertexes = ["a", "b", "c"];
  for (var i in vertexes) {
    var vertexIndex = face[vertexes[i]];
    var adjacentFaces = geometry.vertexHash[vertexIndex];
    for (var a in adjacentFaces) {
      var newface = adjacentFaces[a];
      var testF = this.originFace;
      if (clamp === false) {
        testF = face;
      }
      if (testF.normal.angleTo(newface.normal) * (180 / Math.PI) <= maxAngle) {
        if (
          this.result["f" + newface.a + newface.b + newface.c] === undefined
        ) {
          this.result["f" + newface.a + newface.b + newface.c] = newface;
          this.result.count++;
          this.getCoplanar(
            maxAngle,
            geometry,
            newface,
            clamp,
            this.result,
            this.originFace
          );
        }
      }
    }
  }
  this.pendingRecursive--;

  if (this.pendingRecursive === 0 && this.onCoplanar != undefined) {
    delete this.result.count;
    this.onCoplanar(this.result);
  }
};

class Hangar {
  public mesh: THREE.Mesh;

  public points: Point[] = [
    { x: 0, z: 0 },
    { x: 0, z: 1 },
    { x: 1, z: 1 },
    { x: 1, z: 0 },
  ];

  constructor() {
    const material = new THREE.MeshNormalMaterial({
      side: THREE.FrontSide,
    });

    const gShape = pointsToThreeShape(
      this.points.map(({ x, z }) => [x, z]),
      []
    );

    const height = 1;

    const geometry = new THREE.ExtrudeGeometry(gShape, {
      depth: height,
      bevelEnabled: false,
      steps: 1,
    });

    geometry.faces.forEach((face) => {
      var faceTools = new faceUtils();
      console.log(faceTools.getCoplanar(10, geometry, face));
    });

    geometry.rotateX(Math.PI / 2);
    geometry.translate(-0.5, height, -0.5);

    geometry.computeFlatVertexNormals();
    geometry.computeFaceNormals();

    this.mesh = new THREE.Mesh(geometry, material);
    this.object = this.object.bind(this);
  }

  object() {
    return (
      <primitive
        object={this.mesh}
        onPointerOver={(e) => console.log(e.face.surface)}
        // onPointerMove={() => console.log("move")}
        // onPointerOut={() => console.log("out")}
      />
    );
  }
}

const H = new Hangar();

export default () => (
  <Canvas
    style={{ width: 800, height: 600 }}
    camera={{ fov: 50, position: [5, 5, 5] }}
  >
    <axesHelper args={[10]} />
    <H.object />
    <OrbitControls />
  </Canvas>
);
